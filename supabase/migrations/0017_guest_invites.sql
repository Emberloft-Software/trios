-- ═════════════════════════════════════════════════════════════════════════════
-- Tremigos — 0008 one-time guest invites.
-- Replaces the single reusable gig link. When a host says they're bringing N
-- people, the gig gets N invites, one per held seat. Each link works exactly
-- once: it's consumed when that person joins, and the host can revoke any
-- unused one (which also releases the seat to the public). No guests → no
-- links at all.
-- ═════════════════════════════════════════════════════════════════════════════

create table gig_invites (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references gigs on delete cascade,
  code text unique not null,
  label int not null,                         -- "Guest 1", "Guest 2", …
  used_by uuid references profiles on delete set null,
  used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (gig_id, label)
);
create index on gig_invites (gig_id);
alter table gig_invites enable row level security;

-- Only the host sees their gig's links (codes are secrets).
create policy "host reads own invites" on gig_invites for select
  using (exists (select 1 from gigs g where g.id = gig_invites.gig_id and g.host_id = auth.uid()));
grant select on gig_invites to authenticated;
grant all on gig_invites to service_role;

-- Unguessable 12-char codes, unique across old gig codes and invites.
create or replace function gen_invite_code()
returns text language plpgsql security definer set search_path = public as $$
declare
  v_alpha text := 'abcdefghjkmnpqrstuvwxyz23456789';
  v_code text;
  v_i int;
begin
  loop
    v_code := '';
    for v_i in 1..12 loop
      v_code := v_code || substr(v_alpha, 1 + floor(random() * length(v_alpha))::int, 1);
    end loop;
    exit when not exists (select 1 from gigs where invite_code = v_code)
          and not exists (select 1 from gig_invites where code = v_code);
  end loop;
  return v_code;
end;
$$;

-- One invite per declared guest, created with the gig.
create or replace function _create_guest_invites()
returns trigger language plpgsql security definer set search_path = public as $$
declare i int;
begin
  for i in 1..coalesce(new.host_guests, 0) loop
    insert into gig_invites (gig_id, code, label) values (new.id, gen_invite_code(), i);
  end loop;
  return new;
end;
$$;
drop trigger if exists trg_create_guest_invites on gigs;
create trigger trg_create_guest_invites after insert on gigs
  for each row execute function _create_guest_invites();

-- Preview for the person holding a link (works signed-out).
create or replace function invite_preview(p_code text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'id', g.id,
    'title', g.title,
    'status', case when i.used_at is not null or i.revoked_at is not null then 'used' else g.status::text end,
    'starts_at', g.starts_at,
    'duration_min', g.duration_min,
    'place_label', g.place_label,
    'capacity', g.capacity,
    'claimed_count', g.claimed_count,
    'reserved_slots', g.reserved_slots,
    'host_guests', g.host_guests,
    'activity_name', a.name,
    'activity_emoji', a.emoji,
    'host_name', split_part(p.display_name, ' ', 1),
    'locks_at', g.locks_at
  )
  from gig_invites i
  join gigs g on g.id = i.gig_id
  join activities a on a.id = g.activity_id
  join profiles p on p.id = g.host_id
  where i.code = lower(trim(p_code));
$$;

-- Redeem a link: one person, one time, one held seat. Skips the audience
-- filter (the host is vouching) but every other rule applies.
create or replace function join_by_invite(p_code text)
returns gigs
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_inv gig_invites;
  v_gig gigs;
  v_was boolean;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  perform _assert_can_join(v_user);

  select * into v_inv from gig_invites where code = lower(trim(p_code)) for update;
  if not found then raise exception 'invite_not_found'; end if;
  if v_inv.revoked_at is not null then raise exception 'invite_not_found'; end if;
  if v_inv.used_at is not null then
    if v_inv.used_by = v_user then raise exception 'already_in_crew'; end if;
    raise exception 'invite_used';
  end if;

  select * into v_gig from gigs where id = v_inv.gig_id for update;
  if v_gig.host_id = v_user then raise exception 'already_in_crew'; end if;
  if v_gig.status <> 'open' then raise exception 'gig_not_open'; end if;
  if now() >= v_gig.locks_at then raise exception 'gig_locked'; end if;
  if is_blocked_pair(v_user, v_gig.host_id) or _blocked_with_crew(v_gig.id, v_user) then
    raise exception 'gig_full';
  end if;
  if v_gig.reserved_slots <= 0 then raise exception 'invite_used'; end if;

  v_was := gig_is_confirmed(v_gig.id);
  perform _crew_join(v_gig.id, v_user, 'invite');
  update gigs set reserved_slots = reserved_slots - 1 where id = v_gig.id;
  update gig_invites set used_by = v_user, used_at = now() where id = v_inv.id;
  perform _maybe_confirm(v_gig.id, v_was);

  select * into v_gig from gigs where id = v_gig.id;
  return v_gig;
end;
$$;

-- Host revokes one unused link; its seat goes back to the public.
create or replace function revoke_guest_invite(p_invite_id uuid)
returns gigs language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_inv gig_invites; v_gig gigs;
begin
  select * into v_inv from gig_invites where id = p_invite_id for update;
  if not found then raise exception 'invite_not_found'; end if;
  select * into v_gig from gigs where id = v_inv.gig_id for update;
  if v_gig.host_id <> v_user then raise exception 'not_host'; end if;
  if v_gig.status <> 'open' then raise exception 'gig_not_open'; end if;
  if v_inv.used_at is not null or v_inv.revoked_at is not null then raise exception 'invite_used'; end if;

  update gig_invites set revoked_at = now() where id = p_invite_id;
  update gigs set reserved_slots = greatest(reserved_slots - 1, 0), host_guests = greatest(host_guests - 1, 0)
  where id = v_gig.id returning * into v_gig;
  return v_gig;
end;
$$;

-- The old "release any seat" path would desync invites; retire it.
drop function if exists release_reserved_slot(uuid);

-- Friend nudges point at the gig itself now (normal joining rules), not at a
-- seat-holding link.
create or replace function invite_friend(p_gig_id uuid, p_friend uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_gig gigs;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  select * into v_gig from gigs where id = p_gig_id;
  if not found then raise exception 'gig_not_found'; end if;
  if v_gig.host_id <> v_user then raise exception 'not_host'; end if;
  if v_gig.status <> 'open' then raise exception 'gig_not_open'; end if;
  if not exists (select 1 from friendships
                 where user_a = least(v_user, p_friend) and user_b = greatest(v_user, p_friend)) then
    raise exception 'not_friends';
  end if;
  perform enqueue_notification(p_friend, 'friend_invite', p_gig_id, jsonb_build_object('from', v_user));
end;
$$;

revoke execute on function gen_invite_code(), _create_guest_invites() from public, anon, authenticated;
revoke execute on function join_by_invite(text), revoke_guest_invite(uuid), invite_preview(text), invite_friend(uuid, uuid) from public;
grant execute on function invite_preview(text) to anon, authenticated;
grant execute on function join_by_invite(text), revoke_guest_invite(uuid), invite_friend(uuid, uuid) to authenticated;

-- Backfill: open gigs created before this migration get one link per held seat.
do $$
declare g record; i int; v_next int;
begin
  for g in select id, reserved_slots from gigs where status = 'open' and reserved_slots > 0 loop
    select coalesce(max(label), 0) into v_next from gig_invites where gig_id = g.id;
    for i in 1..(g.reserved_slots - (select count(*) from gig_invites where gig_id = g.id and used_at is null and revoked_at is null)) loop
      v_next := v_next + 1;
      insert into gig_invites (gig_id, code, label) values (g.id, gen_invite_code(), v_next);
    end loop;
  end loop;
end $$;
