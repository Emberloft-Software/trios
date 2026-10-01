-- 0005 — Functions and triggers.
-- Source: docs/02-data-model.md, docs/03, docs/06.
-- All mutating helpers are `security definer` with a pinned search_path.
-- This is where the product's hard rules become structurally true:
--   R1 min-3, R2 first-come-first-served, R8 chat-at-confirmation, blocks.

-- ── auth helper ──────────────────────────────────────────────────────────────
create or replace function is_admin(p_user uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from profiles where id = p_user), false);
$$;

-- ── profiles: create on signup ───────────────────────────────────────────────
-- A profiles row must exist for every auth.users row. Handle defaults to a
-- slug of the email local-part plus a short random suffix to guarantee unique.
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_base text;
  v_handle citext;
  v_name text;
  v_try int := 0;
begin
  v_base := regexp_replace(
    lower(coalesce(split_part(new.email, '@', 1), 'trio')),
    '[^a-z0-9_]', '', 'g'
  );
  if char_length(v_base) < 3 then v_base := v_base || 'user'; end if;
  v_name := coalesce(new.raw_user_meta_data->>'display_name', initcap(v_base));

  loop
    v_handle := (v_base || '_' || substr(md5(gen_random_uuid()::text), 1, 4))::citext;
    exit when not exists (select 1 from profiles where handle = v_handle);
    v_try := v_try + 1;
    if v_try > 5 then
      v_handle := ('trio_' || substr(gen_random_uuid()::text, 1, 8))::citext;
      exit;
    end if;
  end loop;

  insert into profiles (id, handle, display_name)
  values (new.id, v_handle, v_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── gig code generator ───────────────────────────────────────────────────────
-- e.g. 'BDM-4KQ2'. Prefix from the activity slug, 4 random base-32 chars.
create or replace function gen_gig_code(p_activity_id uuid)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_prefix text;
  v_code text;
  v_alpha text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; -- no I,L,O,0,1
  v_i int;
begin
  select upper(substr(regexp_replace(slug, '[^a-z]', '', 'g'), 1, 3))
    into v_prefix from activities where id = p_activity_id;
  v_prefix := coalesce(nullif(v_prefix, ''), 'GIG');

  loop
    v_code := v_prefix || '-';
    for v_i in 1..4 loop
      v_code := v_code || substr(v_alpha, 1 + floor(random() * length(v_alpha))::int, 1);
    end loop;
    exit when not exists (select 1 from gigs where code = v_code);
  end loop;
  return v_code;
end;
$$;

-- ── claimed_count maintenance ────────────────────────────────────────────────
-- claimed_count is NEVER written by application code. This trigger keeps it in
-- sync as rows are inserted/updated/deleted, counting state = 'claimed'.
create or replace function sync_claimed_count()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_gig uuid;
begin
  v_gig := coalesce(new.gig_id, old.gig_id);
  update gigs g
    set claimed_count = (
      select count(*) from gig_crew c
      where c.gig_id = v_gig and c.state = 'claimed'
    )
  where g.id = v_gig;
  return null;
end;
$$;

create trigger trg_sync_claimed_count
  after insert or update or delete on gig_crew
  for each row execute function sync_claimed_count();

-- ── confirmation predicate (used by RLS on gig_messages, R8) ─────────────────
create or replace function gig_is_confirmed(p_gig_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select claimed_count >= min_to_confirm from gigs where id = p_gig_id;
$$;

-- ── create_gig ───────────────────────────────────────────────────────────────
-- Creates the gig AND inserts the host as position 1 in ONE transaction, so a
-- gig can never exist without a host (docs/03). Returns the new gig.
create or replace function create_gig(
  p_activity_id  uuid,
  p_title        text,
  p_venue_id     uuid,
  p_place_label  text,
  p_lat          double precision,
  p_lng          double precision,
  p_starts_at    timestamptz,
  p_capacity     int,
  p_duration_min int  default 90,
  p_notes        text default null,
  p_cost_note    text default null,
  p_locks_at     timestamptz default null
)
returns gigs
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_profile profiles;
  v_gig gigs;
  v_locks_at timestamptz;
begin
  if v_user is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  select * into v_profile from profiles where id = v_user;
  if v_profile.suspended_until is not null and v_profile.suspended_until > now() then
    raise exception 'account_restricted' using errcode = 'P0001';
  end if;

  if p_capacity < 3 then
    raise exception 'capacity_too_low' using errcode = 'P0001';   -- R1
  end if;
  if p_starts_at < now() + interval '3 hours' then
    raise exception 'starts_too_soon' using errcode = 'P0001';
  end if;
  if p_starts_at > now() + interval '60 days' then
    raise exception 'starts_too_far' using errcode = 'P0001';
  end if;

  v_locks_at := coalesce(p_locks_at, p_starts_at - interval '2 hours');

  insert into gigs (
    code, host_id, activity_id, title, notes, venue_id, place_label,
    lat, lng, starts_at, duration_min, capacity, cost_note, locks_at
  ) values (
    gen_gig_code(p_activity_id), v_user, p_activity_id, p_title, p_notes,
    p_venue_id, p_place_label, p_lat, p_lng, p_starts_at, p_duration_min,
    p_capacity, p_cost_note, v_locks_at
  )
  returning * into v_gig;

  insert into gig_crew (gig_id, user_id, position, state)
  values (v_gig.id, v_user, 1, 'claimed');

  return v_gig;
end;
$$;

-- ── claim_slot ───────────────────────────────────────────────────────────────
-- Atomic, row-locked. Two people tapping join on the last slot: exactly one
-- succeeds. Never call this as a read-then-write, never from the client
-- directly. Source: docs/02-data-model.md § Claiming a slot.
create or replace function claim_slot(p_gig_id uuid)
returns gig_crew
language plpgsql security definer set search_path = public as $$
declare
  v_gig gigs;
  v_user uuid := auth.uid();
  v_pos int;
  v_row gig_crew;
  v_profile profiles;
begin
  if v_user is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  select * into v_profile from profiles where id = v_user;
  if v_profile.suspended_until is not null and v_profile.suspended_until > now() then
    raise exception 'account_restricted' using errcode = 'P0001';
  end if;
  if v_profile.reliability_band = 'restricted' then
    raise exception 'account_restricted' using errcode = 'P0001';
  end if;

  -- lock the gig row for the duration of the transaction
  select * into v_gig from gigs where id = p_gig_id for update;

  if not found then raise exception 'gig_not_found'; end if;
  if v_gig.status <> 'open' then raise exception 'gig_not_open'; end if;
  if now() >= v_gig.locks_at then raise exception 'gig_locked'; end if;
  if v_gig.claimed_count >= v_gig.capacity then raise exception 'gig_full'; end if;
  if v_gig.host_id = v_user then raise exception 'already_in_crew'; end if;
  if exists (select 1 from gig_crew where gig_id = p_gig_id and user_id = v_user and state = 'claimed') then
    raise exception 'already_in_crew';
  end if;

  -- refuse if anyone already in the crew is on a block list either way.
  -- Deliberately indistinguishable from a full gig: never confirm a block.
  if exists (
    select 1 from gig_crew c
    join blocks b
      on (b.blocker_id = v_user and b.blocked_id = c.user_id)
      or (b.blocker_id = c.user_id and b.blocked_id = v_user)
    where c.gig_id = p_gig_id and c.state = 'claimed'
  ) then
    raise exception 'gig_full';
  end if;

  select coalesce(max(position), 0) + 1 into v_pos from gig_crew where gig_id = p_gig_id;

  insert into gig_crew (gig_id, user_id, position)
  values (p_gig_id, v_user, v_pos)
  returning * into v_row;

  return v_row;
end;
$$;

-- ── leave_gig ────────────────────────────────────────────────────────────────
-- Two doors (docs/03). p_uncomfortable=true → no reliability penalty at any
-- timing, and the caller opens a report form afterwards. A pre-lock leave costs
-- nothing regardless. A post-lock ordinary leave records a late_leave event.
create or replace function leave_gig(p_gig_id uuid, p_uncomfortable boolean default false)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_gig gigs;
  v_state crew_state;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;

  select * into v_gig from gigs where id = p_gig_id for update;
  if not found then raise exception 'gig_not_found'; end if;
  if v_gig.host_id = v_user then raise exception 'host_cannot_leave'; end if;

  select state into v_state from gig_crew where gig_id = p_gig_id and user_id = v_user;
  if v_state is null or v_state <> 'claimed' then raise exception 'not_in_crew'; end if;

  update gig_crew set state = 'left', left_at = now()
  where gig_id = p_gig_id and user_id = v_user;

  -- Reliability: nothing for a pre-lock leave, nothing for an uncomfortable
  -- leave ever, a lighter late_leave for a post-lock ordinary leave.
  if not p_uncomfortable and v_gig.status = 'locked' then
    insert into reliability_events (user_id, gig_id, kind, weight)
    values (v_user, p_gig_id, 'late_leave', 1);
  end if;

  insert into gig_messages (gig_id, user_id, body, system_kind)
  values (p_gig_id, null, 'left', 'left');
end;
$$;

-- ── remove_crew_member (host power, docs/06) ─────────────────────────────────
-- Rate-limited: 1 per gig, 3 per host per rolling 30 days. Logged permanently.
-- The freed slot reopens if the gig is still open.
create or replace function remove_crew_member(p_gig_id uuid, p_target uuid, p_reason text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_gig gigs;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  if char_length(coalesce(p_reason, '')) < 10 then raise exception 'reason_too_short'; end if;

  select * into v_gig from gigs where id = p_gig_id for update;
  if not found then raise exception 'gig_not_found'; end if;
  if v_gig.host_id <> v_user then raise exception 'not_host'; end if;
  if p_target = v_user then raise exception 'cannot_remove_self'; end if;

  if exists (select 1 from crew_removals where gig_id = p_gig_id and actor_id = v_user) then
    raise exception 'already_removed_from_gig';           -- 1 per gig
  end if;
  if (select count(*) from crew_removals
      where actor_id = v_user and created_at > now() - interval '30 days') >= 3 then
    raise exception 'removal_limit_reached';              -- 3 per 30 days
  end if;

  update gig_crew set state = 'removed', left_at = now()
  where gig_id = p_gig_id and user_id = p_target and state = 'claimed';
  if not found then raise exception 'target_not_in_crew'; end if;

  insert into crew_removals (gig_id, actor_id, target_id, reason)
  values (p_gig_id, v_user, p_target, p_reason);

  insert into gig_messages (gig_id, user_id, body, system_kind)
  values (p_gig_id, null, 'removed', 'removed');
end;
$$;

-- ── send_friend_request (R9, docs/02) ────────────────────────────────────────
create or replace function send_friend_request(p_recipient uuid, p_gig_id uuid)
returns friend_requests
language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_row friend_requests;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;

  -- R9: both must have ATTENDED the same completed gig
  if not exists (
    select 1 from gig_crew a join gig_crew b on a.gig_id = b.gig_id
    join gigs g on g.id = a.gig_id
    where a.gig_id = p_gig_id and g.status = 'completed'
      and a.user_id = v_user   and a.state = 'attended'
      and b.user_id = p_recipient and b.state = 'attended'
  ) then
    raise exception 'no_shared_attendance';
  end if;

  if exists (select 1 from blocks
             where (blocker_id = v_user and blocked_id = p_recipient)
                or (blocker_id = p_recipient and blocked_id = v_user)) then
    raise exception 'not_available';
  end if;

  -- already friends?
  if exists (select 1 from friendships
             where (user_a = least(v_user, p_recipient) and user_b = greatest(v_user, p_recipient))) then
    raise exception 'not_available';
  end if;

  -- 90-day cool-off after any terminal state
  if exists (select 1 from friend_requests
             where sender_id = v_user and recipient_id = p_recipient
               and created_at > now() - interval '90 days'
               and status in ('declined','expired')) then
    raise exception 'recently_asked';
  end if;

  if (select count(*) from friend_requests
      where sender_id = v_user and status = 'pending') >= 20 then
    raise exception 'too_many_pending';
  end if;

  insert into friend_requests (sender_id, recipient_id, gig_id)
  values (v_user, p_recipient, p_gig_id)
  returning * into v_row;
  return v_row;
end;
$$;

-- ── accept_friend_request ────────────────────────────────────────────────────
create or replace function accept_friend_request(p_request_id uuid)
returns friendships
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_req friend_requests;
  v_fr friendships;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;

  select * into v_req from friend_requests where id = p_request_id for update;
  if not found then raise exception 'request_not_found'; end if;
  if v_req.recipient_id <> v_user then raise exception 'not_recipient'; end if;
  if v_req.status <> 'pending' then raise exception 'not_pending'; end if;

  update friend_requests set status = 'accepted', responded_at = now()
  where id = p_request_id;

  insert into friendships (user_a, user_b)
  values (least(v_req.sender_id, v_req.recipient_id),
          greatest(v_req.sender_id, v_req.recipient_id))
  on conflict do nothing
  returning * into v_fr;

  if v_fr.id is null then
    select * into v_fr from friendships
    where user_a = least(v_req.sender_id, v_req.recipient_id)
      and user_b = greatest(v_req.sender_id, v_req.recipient_id);
  end if;
  return v_fr;
end;
$$;

-- ── block_user (docs/06) ─────────────────────────────────────────────────────
-- One transaction: drop friendship, cancel pending requests both ways, insert
-- block, and remove the LATER joiner from any shared upcoming gig.
create or replace function block_user(p_blocked uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  r record;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  if p_blocked = v_user then raise exception 'cannot_block_self'; end if;

  delete from friendships
  where (user_a = least(v_user, p_blocked) and user_b = greatest(v_user, p_blocked));

  update friend_requests set status = 'declined', responded_at = now()
  where status = 'pending'
    and ((sender_id = v_user and recipient_id = p_blocked)
      or (sender_id = p_blocked and recipient_id = v_user));

  insert into blocks (blocker_id, blocked_id)
  values (v_user, p_blocked)
  on conflict do nothing;

  -- Retroactive: for every shared upcoming (open/locked) gig, remove the later
  -- joiner. If that is the host, remove the OTHER party instead (removing a
  -- host would destroy the gig for everyone else).
  for r in
    select ca.gig_id, ca.user_id as a_user, cb.user_id as b_user,
           ca.claimed_at as a_at, cb.claimed_at as b_at, g.host_id
    from gig_crew ca
    join gig_crew cb on ca.gig_id = cb.gig_id
    join gigs g on g.id = ca.gig_id
    where ca.user_id = v_user and cb.user_id = p_blocked
      and ca.state = 'claimed' and cb.state = 'claimed'
      and g.status in ('open','locked')
  loop
    if r.host_id = r.a_user then
      update gig_crew set state = 'removed', left_at = now()
        where gig_id = r.gig_id and user_id = r.b_user;
    elsif r.host_id = r.b_user then
      update gig_crew set state = 'removed', left_at = now()
        where gig_id = r.gig_id and user_id = r.a_user;
    elsif r.a_at <= r.b_at then
      update gig_crew set state = 'removed', left_at = now()
        where gig_id = r.gig_id and user_id = r.b_user;
    else
      update gig_crew set state = 'removed', left_at = now()
        where gig_id = r.gig_id and user_id = r.a_user;
    end if;
  end loop;
end;
$$;

-- ── recompute_reliability_band (docs/06) ─────────────────────────────────────
-- From the last 10 gig-outcome events only. Never exposes a number.
-- Called by the daily recompute-bands job. A separate moderation action can
-- force 'restricted' independently.
create or replace function recompute_reliability_band(p_user uuid)
returns reliability_band
language plpgsql security definer set search_path = public as $$
declare
  v_total int;
  v_noshow int;
  v_rate numeric;
  v_band reliability_band;
  v_suspended boolean;
begin
  select (suspended_until is not null and suspended_until > now())
    into v_suspended from profiles where id = p_user;

  with last10 as (
    select kind from reliability_events
    where user_id = p_user and kind in ('attended','no_show','late_leave')
    order by created_at desc limit 10
  )
  select count(*), count(*) filter (where kind = 'no_show') into v_total, v_noshow from last10;

  if v_suspended then
    v_band := 'restricted';
  elsif v_total < 3 then
    v_band := 'new';
  else
    v_rate := v_noshow::numeric / v_total;
    if v_rate > 0.35 then v_band := 'restricted';
    elsif v_rate >= 0.10 then v_band := 'mixed';
    else v_band := 'reliable';
    end if;
  end if;

  update profiles set reliability_band = v_band where id = p_user;
  return v_band;
end;
$$;

-- ── redeem_perk (docs/08) ────────────────────────────────────────────────────
-- Called from the host lobby or the /spot/[slug] page. Exactly one row per gig.
create or replace function redeem_perk(p_gig_id uuid, p_venue_id uuid)
returns perk_redemptions
language plpgsql security definer set search_path = public as $$
declare v_row perk_redemptions; v_size int;
begin
  select count(*) into v_size from gig_crew where gig_id = p_gig_id and state in ('claimed','attended');
  insert into perk_redemptions (venue_id, gig_id, crew_size)
  values (p_venue_id, p_gig_id, greatest(v_size, 1))
  on conflict (gig_id) do nothing
  returning * into v_row;
  if v_row.id is null then raise exception 'already_redeemed'; end if;
  return v_row;
end;
$$;

-- ── function grants ──────────────────────────────────────────────────────────
-- These are the only write paths for authenticated users. Table-level insert
-- policies are absent by design; execute is granted here.
grant execute on function create_gig(uuid,text,uuid,text,double precision,double precision,timestamptz,int,int,text,text,timestamptz) to authenticated;
grant execute on function claim_slot(uuid) to authenticated;
grant execute on function leave_gig(uuid,boolean) to authenticated;
grant execute on function remove_crew_member(uuid,uuid,text) to authenticated;
grant execute on function send_friend_request(uuid,uuid) to authenticated;
grant execute on function accept_friend_request(uuid) to authenticated;
grant execute on function block_user(uuid) to authenticated;
grant execute on function redeem_perk(uuid,uuid) to authenticated;
grant execute on function gig_is_confirmed(uuid) to authenticated;
grant execute on function is_admin(uuid) to authenticated;
