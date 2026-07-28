-- 0012 — Moderation ladder enforcement, block-aware feed, admin flags.
-- Source: docs/06-trust-and-safety.md, docs/07-admin-panel.md.
-- Additive: adds two columns and CREATE OR REPLACEs create_gig/claim_slot and
-- the gig_feed view (replacing a function/view in a new migration is allowed;
-- we just never edit the already-applied 0005/0007 files).

-- ── moderation state on profiles ─────────────────────────────────────────────
-- The ladder (docs/06): suspend/ban → suspended_until (already present).
-- restrict_posting → can join, can't host. restrict_joining → can't join.
-- These are time-boxed and independent of reliability_band (which the daily
-- recompute owns), so a manual restriction isn't clobbered by the job.
alter table profiles add column if not exists posting_restricted_until timestamptz;
alter table profiles add column if not exists joining_restricted_until timestamptz;

-- ── create_gig: also block restricted-posting and suspended users ─────────────
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
  if not found then raise exception 'profile_missing' using errcode = 'P0001'; end if;
  if v_profile.suspended_until is not null and v_profile.suspended_until > now() then
    raise exception 'account_restricted' using errcode = 'P0001';
  end if;
  if v_profile.posting_restricted_until is not null and v_profile.posting_restricted_until > now() then
    raise exception 'posting_restricted' using errcode = 'P0001';
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

-- ── claim_slot: also block join-restricted users ─────────────────────────────
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
  if not found then raise exception 'profile_missing' using errcode = 'P0001'; end if;
  if v_profile.suspended_until is not null and v_profile.suspended_until > now() then
    raise exception 'account_restricted' using errcode = 'P0001';
  end if;
  if v_profile.joining_restricted_until is not null and v_profile.joining_restricted_until > now() then
    raise exception 'account_restricted' using errcode = 'P0001';
  end if;
  if v_profile.reliability_band = 'restricted' then
    raise exception 'account_restricted' using errcode = 'P0001';
  end if;

  select * into v_gig from gigs where id = p_gig_id for update;

  if not found then raise exception 'gig_not_found'; end if;
  if v_gig.status <> 'open' then raise exception 'gig_not_open'; end if;
  if now() >= v_gig.locks_at then raise exception 'gig_locked'; end if;
  if v_gig.claimed_count >= v_gig.capacity then raise exception 'gig_full'; end if;
  if v_gig.host_id = v_user then raise exception 'already_in_crew'; end if;
  if exists (select 1 from gig_crew where gig_id = p_gig_id and user_id = v_user and state = 'claimed') then
    raise exception 'already_in_crew';
  end if;

  -- block check — indistinguishable from a full gig
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

-- ── gig_feed: hide gigs hosted by anyone in a block relationship with me ─────
-- Feed stays blind — host_id is used only in the WHERE, never selected. Because
-- the feed is blind, a gig disappearing leaks nothing about who's in it.
create or replace view gig_feed
with (security_invoker = true) as
  select
    g.id, g.code, g.title, g.place_label, g.lat, g.lng,
    g.starts_at, g.duration_min, g.capacity, g.claimed_count,
    g.min_to_confirm, g.cost_note, g.status, g.locks_at, g.created_at,
    a.slug as activity_slug, a.name as activity_name, a.emoji as activity_emoji,
    a.category as activity_category
  from gigs g
  join activities a on a.id = g.activity_id
  where g.status in ('open','locked')
    and not exists (
      select 1 from blocks b
      where (b.blocker_id = auth.uid() and b.blocked_id = g.host_id)
         or (b.blocker_id = g.host_id and b.blocked_id = auth.uid())
    );

grant select on gig_feed to authenticated;

-- ── file_report: priority routing built in ───────────────────────────────────
-- Priority categories jump the admin queue and notify admins immediately.
-- Reportable up to 30 days after a gig completes.
create or replace function file_report(
  p_target uuid, p_category text, p_details text, p_gig_id uuid default null
)
returns reports
language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_row reports; a record;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  if p_target = v_user then raise exception 'cannot_report_self'; end if;
  if char_length(coalesce(p_details, '')) < 1 then raise exception 'details_required'; end if;

  insert into reports (reporter_id, target_id, gig_id, category, details)
  values (v_user, p_target, p_gig_id, p_category, p_details)
  returning * into v_row;

  -- Priority routing (docs/06): notify every admin at once.
  if p_category in ('threat_or_violence','underage','sexual_advance') then
    for a in select id from profiles where is_admin loop
      insert into notification_outbox (user_id, kind, gig_id, payload)
      values (a.id, 'admin_priority_report', p_gig_id,
        jsonb_build_object('report_id', v_row.id, 'category', p_category));
    end loop;
  end if;

  return v_row;
end;
$$;
grant execute on function file_report(uuid,text,text,uuid) to authenticated;

-- ── admin_flags view (docs/06 behavioural red flags) ─────────────────────────
-- Surface, don't sentence. Read admin-side via the service role.
create or replace view admin_flags
with (security_invoker = true) as
  -- a host with >= 3 removals in 30 days
  select 'host_removals'::text as kind,
         actor_id as subject_id,
         count(*)::int as count,
         'Removed ' || count(*) || ' people in the last 30 days' as detail,
         max(created_at) as last_at
  from crew_removals
  where created_at > now() - interval '30 days'
  group by actor_id
  having count(*) >= 3
  union all
  -- a rising block count against a user — the quietest reliable signal
  select 'blocks_received', blocked_id, count(*)::int,
         'Blocked by ' || count(*) || ' people', max(created_at)
  from blocks
  group by blocked_id
  having count(*) >= 3
  union all
  -- high friend-request send rate with low acceptance
  select 'friend_spam', sender_id, count(*)::int,
         'Sent ' || count(*) || ' friend requests, few accepted', max(created_at)
  from friend_requests
  group by sender_id
  having count(*) >= 5
     and (count(*) filter (where status = 'accepted'))::numeric / count(*) < 0.3;

grant select on admin_flags to authenticated;  -- RLS on base tables still applies
