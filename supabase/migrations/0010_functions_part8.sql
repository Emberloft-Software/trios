-- ── scheduled jobs ───────────────────────────────────────────────────────────
-- lock: open → locked at locks_at, or cancelled(under_filled) below minimum.
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
      update gigs set status = 'locked' where id = r.id;
      insert into gig_messages (gig_id, user_id, body, system_kind) values (r.id, null, 'locked', 'locked');
      for m in select user_id from gig_crew where gig_id = r.id and state = 'claimed' loop
        perform enqueue_notification(m.user_id, 'gig_locked', r.id, '{}');
      end loop;
    end if;
  end loop;
  update gigs set status = 'expired' where status = 'open' and now() >= starts_at;
end;
$$;

-- complete: after start + duration + 3h. Attendance needs confirmations from
-- min(2, other app members) — a crew of 2 app members + the host's offline
-- friends can still mark each other attended.
create or replace function complete_gigs_job()
returns void language plpgsql security definer set search_path = public as $$
declare r record; m record; v_conf int; v_needed int; v_members int;
begin
  for r in
    select * from gigs
    where status = 'locked'
      and now() >= starts_at + (duration_min || ' minutes')::interval + interval '3 hours'
    for update
  loop
    if exists (select 1 from checkins where gig_id = r.id) then
      select count(*) into v_members from gig_crew where gig_id = r.id and state = 'claimed';
      v_needed := least(2, greatest(v_members - 1, 1));
      for m in select user_id from gig_crew where gig_id = r.id and state = 'claimed' loop
        select count(distinct confirmer_id) into v_conf from checkins where gig_id = r.id and subject_id = m.user_id;
        if v_conf >= v_needed then
          update gig_crew set state = 'attended' where gig_id = r.id and user_id = m.user_id;
          insert into reliability_events (user_id, gig_id, kind) values (m.user_id, r.id, 'attended');
        else
          update gig_crew set state = 'no_show' where gig_id = r.id and user_id = m.user_id;
          insert into reliability_events (user_id, gig_id, kind) values (m.user_id, r.id, 'no_show');
        end if;
      end loop;
    end if;
    update gigs set status = 'completed' where id = r.id;
  end loop;
end;
$$;

create or replace function cancel_gig(p_gig_id uuid, p_reason text default null)
returns void language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_gig gigs; m record;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  select * into v_gig from gigs where id = p_gig_id for update;
  if not found then raise exception 'gig_not_found'; end if;
  if v_gig.host_id <> v_user then raise exception 'not_host'; end if;
  if v_gig.status not in ('open','locked') then raise exception 'gig_not_open'; end if;

  update gigs set status = 'cancelled', cancelled_reason = coalesce(nullif(trim(p_reason), ''), 'host_cancelled')
  where id = p_gig_id;
  if gig_is_confirmed(p_gig_id) then
    insert into reliability_events (user_id, gig_id, kind, weight) values (v_user, p_gig_id, 'host_cancel', 2);
  end if;
  insert into gig_messages (gig_id, user_id, body, system_kind) values (p_gig_id, null, 'cancelled', 'cancelled');
  for m in select user_id from gig_crew where gig_id = p_gig_id and state = 'claimed' and user_id <> v_user loop
    perform enqueue_notification(m.user_id, 'gig_cancelled', p_gig_id, jsonb_build_object('reason', 'host_cancelled'));
  end loop;
end;
$$;

create or replace function recompute_bands_job()
returns void language plpgsql security definer set search_path = public as $$
declare u record;
begin
  for u in
    select distinct user_id from reliability_events where created_at > now() - interval '120 days'
    union select id from profiles where suspended_until is not null
  loop
    perform recompute_reliability_band(u.user_id);
  end loop;
end;
$$;

create or replace function expire_stale_verifications_job()
returns void language sql security definer set search_path = public as $$
  update verification_requests
  set status = 'rejected', review_note = 'Auto-rejected: not reviewed within 30 days.', reviewed_at = now()
  where status = 'pending' and created_at < now() - interval '30 days';
  -- abandoned, never-submitted challenges
  delete from verification_requests
  where media_path is null and status = 'pending' and created_at < now() - interval '2 days';
$$;

create or replace function expire_friend_requests_job()
returns void language sql security definer set search_path = public as $$
  update friend_requests set status = 'expired', responded_at = now()
  where status = 'pending' and created_at < now() - interval '14 days';
$$;

-- Lobby chat is deleted 30 days after a gig completes (privacy policy).
create or replace function purge_old_chats_job()
returns void language sql security definer set search_path = public as $$
  delete from gig_messages m using gigs g
  where m.gig_id = g.id
    and g.status in ('completed','cancelled','expired')
    and g.starts_at < now() - interval '30 days';
$$;
