-- ── crew votes ───────────────────────────────────────────────────────────────
-- Once chat is open, any member can vote to remove another member (not the
-- host — report the host instead). A strict majority of the OTHER members,
-- and never fewer than 2 votes, removes them. Votes are anonymous to the crew;
-- the outcome becomes an admin report with every reason attached.
create or replace function cast_kick_vote(p_gig_id uuid, p_target uuid, p_reason text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_gig gigs;
  v_eligible int;
  v_votes int;
  v_needed int;
  v_reasons text;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  if char_length(trim(coalesce(p_reason, ''))) < 3 then raise exception 'reason_too_short'; end if;

  select * into v_gig from gigs where id = p_gig_id for update;
  if not found then raise exception 'gig_not_found'; end if;
  if v_gig.status not in ('open','locked') then raise exception 'gig_not_active'; end if;
  if not gig_is_confirmed(p_gig_id) then raise exception 'chat_not_open'; end if;
  if p_target = v_user then raise exception 'cannot_vote_self'; end if;
  if p_target = v_gig.host_id then raise exception 'cannot_kick_host'; end if;
  if not exists (select 1 from gig_crew where gig_id = p_gig_id and user_id = v_user and state = 'claimed') then
    raise exception 'not_in_crew';
  end if;
  if not exists (select 1 from gig_crew where gig_id = p_gig_id and user_id = p_target and state = 'claimed') then
    raise exception 'target_not_in_crew';
  end if;

  select count(*) into v_eligible from gig_crew
  where gig_id = p_gig_id and state = 'claimed' and user_id <> p_target;
  if v_eligible < 2 then raise exception 'not_enough_voters'; end if;

  insert into kick_votes (gig_id, target_id, voter_id, reason)
  values (p_gig_id, p_target, v_user, left(trim(p_reason), 300))
  on conflict (gig_id, target_id, voter_id) do update set reason = excluded.reason, created_at = now();

  select count(*) into v_votes
  from kick_votes k
  join gig_crew c on c.gig_id = k.gig_id and c.user_id = k.voter_id and c.state = 'claimed'
  where k.gig_id = p_gig_id and k.target_id = p_target;

  v_needed := greatest(2, (v_eligible / 2) + 1);

  if v_votes >= v_needed then
    select string_agg(reason, ' | ') into v_reasons
    from kick_votes where gig_id = p_gig_id and target_id = p_target;

    update gig_crew set state = 'removed', left_at = now()
    where gig_id = p_gig_id and user_id = p_target;

    insert into crew_removals (gig_id, actor_id, target_id, kind, reason)
    values (p_gig_id, null, p_target, 'vote', coalesce(v_reasons, 'crew vote'));

    delete from kick_votes where gig_id = p_gig_id and voter_id = p_target;

    insert into gig_messages (gig_id, user_id, body, system_kind)
    values (p_gig_id, null, 'vote_removed', 'vote_removed');

    insert into reports (reporter_id, target_id, gig_id, category, details)
    values (v_user, p_target, p_gig_id, 'crew_vote_removal',
            'Removed from the chat by a crew vote (' || v_votes || ' of ' || v_eligible || '). Reasons: ' || coalesce(v_reasons, '—'));

    perform enqueue_notification(p_target, 'removed_by_vote', p_gig_id, '{}');
    return jsonb_build_object('votes', v_votes, 'needed', v_needed, 'removed', true);
  end if;

  return jsonb_build_object('votes', v_votes, 'needed', v_needed, 'removed', false);
end;
$$;

create or replace function retract_kick_vote(p_gig_id uuid, p_target uuid)
returns void language sql security definer set search_path = public as $$
  delete from kick_votes where gig_id = p_gig_id and target_id = p_target and voter_id = auth.uid();
$$;

-- Anonymous tallies for the lobby: per member, how many votes and how many are
-- needed, plus whether *I* voted. Never who voted.
create or replace function kick_vote_tallies(p_gig_id uuid)
returns table (target_id uuid, votes int, needed int, i_voted boolean)
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_gig_crew(p_gig_id) then return; end if;
  return query
  select c.user_id,
         (select count(*)::int from kick_votes k
            join gig_crew v on v.gig_id = k.gig_id and v.user_id = k.voter_id and v.state = 'claimed'
           where k.gig_id = p_gig_id and k.target_id = c.user_id),
         greatest(2, ((select count(*)::int from gig_crew o
                        where o.gig_id = p_gig_id and o.state = 'claimed' and o.user_id <> c.user_id) / 2) + 1),
         exists (select 1 from kick_votes k where k.gig_id = p_gig_id and k.target_id = c.user_id and k.voter_id = auth.uid())
  from gig_crew c
  where c.gig_id = p_gig_id and c.state = 'claimed';
end;
$$;

-- ── check-ins ────────────────────────────────────────────────────────────────
create or replace function check_in(p_gig_id uuid, p_subject uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_gig gigs;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  select * into v_gig from gigs where id = p_gig_id;
  if not found then raise exception 'gig_not_found'; end if;
  if v_gig.status <> 'locked' then raise exception 'checkin_closed'; end if;
  if now() < v_gig.starts_at - interval '30 minutes'
     or now() > v_gig.starts_at + (v_gig.duration_min || ' minutes')::interval + interval '3 hours' then
    raise exception 'checkin_closed';
  end if;
  if not exists (select 1 from gig_crew where gig_id = p_gig_id and user_id = v_user and state = 'claimed') then
    raise exception 'not_in_crew';
  end if;
  if not exists (select 1 from gig_crew where gig_id = p_gig_id and user_id = p_subject and state = 'claimed') then
    raise exception 'target_not_in_crew';
  end if;
  insert into checkins (gig_id, confirmer_id, subject_id)
  values (p_gig_id, v_user, p_subject)
  on conflict do nothing;
end;
$$;

-- ── reports ──────────────────────────────────────────────────────────────────
create or replace function file_report(
  p_target uuid, p_category text, p_details text, p_gig_id uuid default null
)
returns reports
language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_row reports; a record;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  if p_target = v_user then raise exception 'cannot_report_self'; end if;
  if char_length(trim(coalesce(p_details, ''))) < 1 then raise exception 'details_required'; end if;
  if (select count(*) from reports where reporter_id = v_user and created_at > now() - interval '1 day') >= 15 then
    raise exception 'too_many_reports';
  end if;

  insert into reports (reporter_id, target_id, gig_id, category, details)
  values (v_user, p_target, p_gig_id, p_category, left(p_details, 2000))
  returning * into v_row;

  if p_category in ('threat_or_violence','underage','sexual_advance') then
    for a in select id from profiles where is_admin loop
      perform enqueue_notification(a.id, 'admin_priority_report', p_gig_id,
        jsonb_build_object('report_id', v_row.id, 'category', p_category));
    end loop;
  end if;
  return v_row;
end;
$$;

