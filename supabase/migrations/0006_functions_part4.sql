-- ── invite link ──────────────────────────────────────────────────────────────
-- What someone sees when they open a host's share link. Callable signed-out
-- so the link preview works before they make an account.
create or replace function invite_preview(p_code text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'id', g.id,
    'title', g.title,
    'status', g.status,
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
  from gigs g
  join activities a on a.id = g.activity_id
  join profiles p on p.id = g.host_id
  where g.invite_code = lower(trim(p_code));
$$;

-- Join through the host's link. Skips the audience filter (the host is
-- vouching for this person) and takes one of the host's reserved seats if any
-- are left, otherwise an open slot. Every other rule still applies.
create or replace function join_by_invite(p_code text)
returns gigs
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_gig gigs;
  v_was boolean;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  perform _assert_can_join(v_user);

  select * into v_gig from gigs where invite_code = lower(trim(p_code)) for update;
  if not found then raise exception 'invite_not_found'; end if;
  if v_gig.host_id = v_user then raise exception 'already_in_crew'; end if;
  if v_gig.status <> 'open' then raise exception 'gig_not_open'; end if;
  if now() >= v_gig.locks_at then raise exception 'gig_locked'; end if;
  if is_blocked_pair(v_user, v_gig.host_id) or _blocked_with_crew(v_gig.id, v_user) then
    raise exception 'gig_full';
  end if;

  v_was := gig_is_confirmed(v_gig.id);
  if v_gig.reserved_slots > 0 then
    perform _crew_join(v_gig.id, v_user, 'invite');
    update gigs set reserved_slots = reserved_slots - 1 where id = v_gig.id;
  elsif v_gig.claimed_count + v_gig.reserved_slots < v_gig.capacity then
    perform _crew_join(v_gig.id, v_user, 'invite');
  else
    raise exception 'gig_full';
  end if;
  perform _maybe_confirm(v_gig.id, v_was);

  select * into v_gig from gigs where id = v_gig.id;
  return v_gig;
end;
$$;

-- Host can release reserved seats they no longer need (back to the public).
create or replace function release_reserved_slot(p_gig_id uuid)
returns gigs language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_gig gigs;
begin
  select * into v_gig from gigs where id = p_gig_id for update;
  if not found then raise exception 'gig_not_found'; end if;
  if v_gig.host_id <> v_user then raise exception 'not_host'; end if;
  if v_gig.status <> 'open' then raise exception 'gig_not_open'; end if;
  if v_gig.reserved_slots <= 0 then raise exception 'nothing_reserved'; end if;
  update gigs set reserved_slots = reserved_slots - 1,
                  host_guests = greatest(host_guests - 1, 0)
  where id = p_gig_id returning * into v_gig;
  return v_gig;
end;
$$;

-- ── leave_gig ────────────────────────────────────────────────────────────────
-- Two doors. p_uncomfortable = true never costs anything. A post-lock ordinary
-- leave records a late_leave.
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

  -- their open votes no longer count
  delete from kick_votes where gig_id = p_gig_id and voter_id = v_user;

  if not p_uncomfortable and v_gig.status = 'locked' then
    insert into reliability_events (user_id, gig_id, kind, weight)
    values (v_user, p_gig_id, 'late_leave', 1);
  end if;

  insert into gig_messages (gig_id, user_id, body, system_kind)
  values (p_gig_id, null, 'left', 'left');
end;
$$;

-- ── remove_crew_member (host power) ──────────────────────────────────────────
-- Rate-limited: 1 per gig, 3 per host per rolling 30 days. Logged permanently.
create or replace function remove_crew_member(p_gig_id uuid, p_target uuid, p_reason text)
returns void
language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_gig gigs;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  if char_length(coalesce(p_reason, '')) < 10 then raise exception 'reason_too_short'; end if;

  select * into v_gig from gigs where id = p_gig_id for update;
  if not found then raise exception 'gig_not_found'; end if;
  if v_gig.host_id <> v_user then raise exception 'not_host'; end if;
  if p_target = v_user then raise exception 'cannot_remove_self'; end if;
  if v_gig.status not in ('open','locked') then raise exception 'gig_not_active'; end if;

  if exists (select 1 from crew_removals where gig_id = p_gig_id and actor_id = v_user and kind = 'host') then
    raise exception 'already_removed_from_gig';
  end if;
  if (select count(*) from crew_removals
      where actor_id = v_user and kind = 'host' and created_at > now() - interval '30 days') >= 3 then
    raise exception 'removal_limit_reached';
  end if;

  update gig_crew set state = 'removed', left_at = now()
  where gig_id = p_gig_id and user_id = p_target and state = 'claimed';
  if not found then raise exception 'target_not_in_crew'; end if;

  insert into crew_removals (gig_id, actor_id, target_id, kind, reason)
  values (p_gig_id, v_user, p_target, 'host', p_reason);

  delete from kick_votes where gig_id = p_gig_id and (target_id = p_target or voter_id = p_target);

  insert into gig_messages (gig_id, user_id, body, system_kind)
  values (p_gig_id, null, 'removed', 'removed');

  perform enqueue_notification(p_target, 'removed', p_gig_id, '{}');
end;
$$;

