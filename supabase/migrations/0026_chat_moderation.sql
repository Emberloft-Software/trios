-- ═════════════════════════════════════════════════════════════════════════════
-- Tremigos 0026: chat moderation + acceptable-use agreement.
-- Every human chat message is checked against moderation_terms (seeded in
-- 0027). Matches are NOT blocked: they land in chat_flags for a person to
-- review, and admins get an Activity notification (and push). Admins can
-- remove the message (soft delete, original kept in the flag) and/or remove
-- the sender from the gig. Users can never read the flags or the term list.
-- ═════════════════════════════════════════════════════════════════════════════

create table if not exists moderation_terms (
  term text primary key check (term ~ '^[a-z]+( [a-z]+)*$'),
  category text not null check (category in ('profanity', 'slur', 'sexual', 'threat', 'drugs', 'scam')),
  severity int not null default 1 check (severity between 1 and 3)
);
alter table moderation_terms enable row level security;
revoke all on moderation_terms from public, anon, authenticated;

create table if not exists chat_flags (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references gig_messages(id) on delete set null,
  gig_id uuid not null references gigs(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  body text not null,                       -- snapshot, survives message removal
  matched text[] not null,
  categories text[] not null,
  severity int not null,
  status text not null default 'open' check (status in ('open', 'actioned', 'dismissed')),
  action text,
  reviewed_by uuid references profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists chat_flags_open on chat_flags (created_at desc) where status = 'open';
create index if not exists chat_flags_user on chat_flags (user_id);
alter table chat_flags enable row level security;
revoke all on chat_flags from public, anon, authenticated;

-- soft delete: moderators replace the text; the row (and its order) stays
alter table gig_messages add column if not exists deleted_at timestamptz;
alter table gig_messages add column if not exists deleted_by uuid references profiles(id) on delete set null;

-- Lowercase, undo common character swaps (0→o, 1→i, 3→e, 4→a, 5→s, 7→t, @→a,
-- $→s, !→i), turn everything else into spaces, and shrink stretched letters
-- ("fuuuuck" → "fuck").
create or replace function mod_normalize(p text)
returns text language sql immutable set search_path = public as $$
  select trim(regexp_replace(
           regexp_replace(translate(lower(coalesce(p, '')), '013457@$!', 'oieastasi'), '[^a-z]+', ' ', 'g'),
           '([a-z])\1{2,}', '\1', 'g'));
$$;

-- Whole-word match (plus simple endings: s, es, ing, er, ers, ed), and for
-- longer terms also a squashed match so "f.u.c.k.e.r" or "f u c k e r" is caught.
create or replace function mod_matches(p_body text)
returns table (term text, category text, severity int)
language sql stable security definer set search_path = public as $$
  with n as (select mod_normalize(p_body) as t)
  select m.term, m.category, m.severity
  from moderation_terms m, n
  where n.t ~ ('(^| )' || m.term || '(s|es|ing|er|ers|ed)?( |$)')
     or (length(replace(m.term, ' ', '')) >= 6 and replace(n.t, ' ', '') like '%' || replace(m.term, ' ', '') || '%');
$$;

create or replace function gig_message_moderate()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_terms text[]; v_cats text[]; v_sev int; a record;
begin
  if new.user_id is null or new.system_kind is not null then return null; end if;
  select array_agg(term), array_agg(distinct category), max(severity)
    into v_terms, v_cats, v_sev
  from mod_matches(new.body);
  if v_terms is null then return null; end if;

  insert into chat_flags (message_id, gig_id, user_id, body, matched, categories, severity)
  values (new.id, new.gig_id, new.user_id, new.body, v_terms, v_cats, v_sev);

  -- one admin ping per gig per 10 minutes, however many messages trip it
  if not exists (select 1 from chat_flags
                 where gig_id = new.gig_id and status = 'open' and message_id <> new.id
                   and created_at > now() - interval '10 minutes') then
    for a in select id from profiles where is_admin loop
      perform enqueue_notification(a.id, 'chat_flagged', new.gig_id, jsonb_build_object('severity', v_sev));
    end loop;
  end if;
  return null;
exception when others then
  raise warning 'chat moderation failed: %', sqlerrm; -- never block a message on a moderation bug
  return null;
end;
$$;

drop trigger if exists moderate_chat on gig_messages;
create trigger moderate_chat after insert on gig_messages
  for each row execute function gig_message_moderate();

-- Admin removal (called with the service role after the app's admin check).
create or replace function admin_remove_crew_member(p_gig_id uuid, p_target uuid, p_reason text, p_admin uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_gig gigs;
begin
  if not is_admin(p_admin) then raise exception 'not_admin'; end if;
  if char_length(coalesce(p_reason, '')) < 3 then raise exception 'reason_too_short'; end if;
  select * into v_gig from gigs where id = p_gig_id for update;
  if not found then raise exception 'gig_not_found'; end if;
  if v_gig.status not in ('open', 'locked') then raise exception 'gig_not_active'; end if;
  if p_target = v_gig.host_id then raise exception 'cannot_remove_host'; end if;

  update gig_crew set state = 'removed', left_at = now()
  where gig_id = p_gig_id and user_id = p_target and state = 'claimed';
  if not found then raise exception 'target_not_in_crew'; end if;

  insert into crew_removals (gig_id, actor_id, target_id, kind, reason)
  values (p_gig_id, p_admin, p_target, 'admin', p_reason);
  delete from kick_votes where gig_id = p_gig_id and (target_id = p_target or voter_id = p_target);
  insert into gig_messages (gig_id, user_id, body, system_kind) values (p_gig_id, null, 'admin_removed', 'admin_removed');
  perform enqueue_notification(p_target, 'removed_by_admin', p_gig_id, '{}');
end;
$$;

create or replace function admin_delete_message(p_message_id uuid, p_admin uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_admin(p_admin) then raise exception 'not_admin'; end if;
  update gig_messages set body = 'removed', deleted_at = now(), deleted_by = p_admin
  where id = p_message_id and system_kind is null and deleted_at is null;
end;
$$;

-- ── acceptable-use agreement ─────────────────────────────────────────────────
alter table profiles add column if not exists aup_accepted_at timestamptz;

create or replace function accept_acceptable_use()
returns void language sql security definer set search_path = public as $$
  update profiles set aup_accepted_at = coalesce(aup_accepted_at, now()) where id = auth.uid();
$$;

-- ── privileges ───────────────────────────────────────────────────────────────
revoke execute on function mod_normalize(text), mod_matches(text), gig_message_moderate(),
  admin_remove_crew_member(uuid, uuid, text, uuid), admin_delete_message(uuid, uuid), accept_acceptable_use()
  from public, anon, authenticated;
grant execute on function accept_acceptable_use() to authenticated;
grant execute on function admin_remove_crew_member(uuid, uuid, text, uuid), admin_delete_message(uuid, uuid), mod_matches(text) to service_role;
grant select, insert, update, delete on moderation_terms, chat_flags to service_role;
