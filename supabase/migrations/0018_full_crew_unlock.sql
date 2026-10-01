-- ═════════════════════════════════════════════════════════════════════════════
-- Tremigos — 0009 chat + faces unlock only when the crew is complete.
-- Before: chat opened as soon as 3 people (incl. the host's held seats) were in.
-- Now: chat AND profile photos unlock when every spot is taken by someone who
-- has actually joined (held guest seats only count once their link is used),
-- or when the gig locks 2h before start with its final crew. Once unlocked it
-- stays unlocked (chat_opened_at), so one person leaving doesn't slam it shut.
-- ═════════════════════════════════════════════════════════════════════════════

alter table gigs add column if not exists chat_opened_at timestamptz;

-- gigs that already qualify
update gigs set chat_opened_at = now()
where chat_opened_at is null
  and (claimed_count >= capacity or (status in ('locked','completed') and claimed_count >= 2));

create or replace function gig_is_confirmed(p_gig_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select chat_opened_at is not null from gigs where id = p_gig_id), false);
$$;

-- Called after every join. Opens chat the moment the last spot is filled.
create or replace function _maybe_confirm(p_gig_id uuid, p_was_confirmed boolean)
returns void language plpgsql security definer set search_path = public as $$
declare m record;
begin
  update gigs set chat_opened_at = now()
  where id = p_gig_id and chat_opened_at is null and claimed_count >= capacity;
  if not found then return; end if;
  insert into gig_messages (gig_id, user_id, body, system_kind) values (p_gig_id, null, 'confirmed', 'confirmed');
  for m in select user_id from gig_crew where gig_id = p_gig_id and state = 'claimed' loop
    perform enqueue_notification(m.user_id, 'gig_confirmed', p_gig_id, '{}');
  end loop;
end;
$$;

-- Locking finalises the crew → chat opens even if spots are still empty.
create or replace function lock_gigs_job()
returns void language plpgsql security definer set search_path = public as $$
declare r record; m record;
begin
  for r in select * from gigs where status = 'open' and now() >= locks_at for update loop
    if r.claimed_count + r.reserved_slots < r.min_to_confirm or r.claimed_count < 2 then
      update gigs set status = 'cancelled', cancelled_reason = 'under_filled' where id = r.id;
      for m in select user_id from gig_crew where gig_id = r.id and state = 'claimed' loop
        perform enqueue_notification(m.user_id, 'gig_cancelled', r.id, jsonb_build_object('reason', 'under_filled'));
      end loop;
    else
      update gigs set status = 'locked', chat_opened_at = coalesce(chat_opened_at, now()) where id = r.id;
      insert into gig_messages (gig_id, user_id, body, system_kind) values (r.id, null, 'locked', 'locked');
      for m in select user_id from gig_crew where gig_id = r.id and state = 'claimed' loop
        perform enqueue_notification(m.user_id, 'gig_locked', r.id, '{}');
      end loop;
    end if;
  end loop;
  update gigs set status = 'expired' where status = 'open' and now() >= starts_at;
end;
$$;

-- Host penalty for cancelling: once the gig had reached its minimum.
create or replace function cancel_gig(p_gig_id uuid, p_reason text default null)
returns void language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_gig gigs; m record;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  select * into v_gig from gigs where id = p_gig_id for update;
  if not found then raise exception 'gig_not_found'; end if;
  if v_gig.host_id <> v_user then raise exception 'not_host'; end if;
  if v_gig.status not in ('open','locked') then raise exception 'gig_not_open'; end if;

  update gigs set status = 'cancelled', cancelled_reason = coalesce(nullif(trim(p_reason), ''), 'host_cancelled') where id = p_gig_id;
  if v_gig.claimed_count + v_gig.reserved_slots >= v_gig.min_to_confirm then
    insert into reliability_events (user_id, gig_id, kind, weight) values (v_user, p_gig_id, 'host_cancel', 2);
  end if;
  insert into gig_messages (gig_id, user_id, body, system_kind) values (p_gig_id, null, 'cancelled', 'cancelled');
  for m in select user_id from gig_crew where gig_id = p_gig_id and state = 'claimed' and user_id <> v_user loop
    perform enqueue_notification(m.user_id, 'gig_cancelled', p_gig_id, jsonb_build_object('reason', 'host_cancelled'));
  end loop;
end;
$$;

-- Guest joins are announced to the crew (visible once chat opens).
create or replace function join_by_invite(p_code text)
returns gigs
language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_inv gig_invites; v_gig gigs;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  perform _assert_can_join(v_user);

  select * into v_inv from gig_invites where code = lower(trim(p_code)) for update;
  if not found or v_inv.revoked_at is not null then raise exception 'invite_not_found'; end if;
  if v_inv.used_at is not null then
    if v_inv.used_by = v_user then raise exception 'already_in_crew'; end if;
    raise exception 'invite_used';
  end if;

  select * into v_gig from gigs where id = v_inv.gig_id for update;
  if v_gig.host_id = v_user then raise exception 'already_in_crew'; end if;
  if v_gig.status <> 'open' then raise exception 'gig_not_open'; end if;
  if now() >= v_gig.locks_at then raise exception 'gig_locked'; end if;
  if is_blocked_pair(v_user, v_gig.host_id) or _blocked_with_crew(v_gig.id, v_user) then raise exception 'gig_full'; end if;
  if v_gig.reserved_slots <= 0 then raise exception 'invite_used'; end if;

  perform _crew_join(v_gig.id, v_user, 'invite');
  update gigs set reserved_slots = reserved_slots - 1 where id = v_gig.id;
  update gig_invites set used_by = v_user, used_at = now() where id = v_inv.id;
  insert into gig_messages (gig_id, user_id, body, system_kind) values (v_gig.id, null, 'guest_joined', 'guest_joined');
  perform _maybe_confirm(v_gig.id, false);

  select * into v_gig from gigs where id = v_gig.id;
  return v_gig;
end;
$$;

-- ── faces ────────────────────────────────────────────────────────────────────
-- You see someone's photo only if it's you, an admin, a friend, or you're both
-- in a gig whose crew has unlocked. Everywhere else they're an initial.
create or replace function can_see_face(p_target uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select p_target = auth.uid()
      or is_admin()
      or exists (select 1 from friendships
                 where user_a = least(auth.uid(), p_target) and user_b = greatest(auth.uid(), p_target))
      or exists (
        select 1 from gig_crew a
        join gig_crew b on b.gig_id = a.gig_id
        join gigs g on g.id = a.gig_id
        where a.user_id = auth.uid() and b.user_id = p_target
          and a.state in ('claimed','attended','no_show')
          and b.state in ('claimed','attended','no_show')
          and g.chat_opened_at is not null
      );
$$;
revoke execute on function can_see_face(uuid) from public, anon;
grant execute on function can_see_face(uuid) to authenticated;

create or replace view profiles_public as
  select
    id, handle, display_name, bio,
    case when can_see_face(id) then avatar_path end as avatar_path,
    city, interests,
    age_years(birth_date) as age,
    gender, verification_status, verified_at, reliability_band, created_at
  from profiles;
revoke all on profiles_public from anon;
grant select on profiles_public to authenticated;

revoke execute on function _maybe_confirm(uuid, boolean), lock_gigs_job() from public, anon, authenticated;
