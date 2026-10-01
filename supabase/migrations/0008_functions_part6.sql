-- ── friends ──────────────────────────────────────────────────────────────────
create or replace function send_friend_request(p_recipient uuid, p_gig_id uuid)
returns friend_requests
language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_row friend_requests;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;

  if not exists (
    select 1 from gig_crew a join gig_crew b on a.gig_id = b.gig_id
    join gigs g on g.id = a.gig_id
    where a.gig_id = p_gig_id and g.status = 'completed'
      and a.user_id = v_user and a.state = 'attended'
      and b.user_id = p_recipient and b.state = 'attended'
  ) then
    raise exception 'no_shared_attendance';
  end if;

  if is_blocked_pair(v_user, p_recipient) then raise exception 'not_available'; end if;
  if exists (select 1 from friendships
             where user_a = least(v_user, p_recipient) and user_b = greatest(v_user, p_recipient)) then
    raise exception 'not_available';
  end if;
  if exists (select 1 from friend_requests
             where sender_id = v_user and recipient_id = p_recipient
               and created_at > now() - interval '90 days'
               and status in ('declined','expired')) then
    raise exception 'recently_asked';
  end if;
  if (select count(*) from friend_requests where sender_id = v_user and status = 'pending') >= 20 then
    raise exception 'too_many_pending';
  end if;

  insert into friend_requests (sender_id, recipient_id, gig_id)
  values (v_user, p_recipient, p_gig_id)
  returning * into v_row;

  perform enqueue_notification(p_recipient, 'friend_request', p_gig_id, jsonb_build_object('from', v_user));
  return v_row;
end;
$$;

create or replace function accept_friend_request(p_request_id uuid)
returns friendships
language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_req friend_requests; v_fr friendships;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  select * into v_req from friend_requests where id = p_request_id for update;
  if not found then raise exception 'request_not_found'; end if;
  if v_req.recipient_id <> v_user then raise exception 'not_recipient'; end if;
  if v_req.status <> 'pending' then raise exception 'not_pending'; end if;

  update friend_requests set status = 'accepted', responded_at = now() where id = p_request_id;

  insert into friendships (user_a, user_b)
  values (least(v_req.sender_id, v_req.recipient_id), greatest(v_req.sender_id, v_req.recipient_id))
  on conflict do nothing
  returning * into v_fr;
  if v_fr.id is null then
    select * into v_fr from friendships
    where user_a = least(v_req.sender_id, v_req.recipient_id)
      and user_b = greatest(v_req.sender_id, v_req.recipient_id);
  end if;

  perform enqueue_notification(v_req.sender_id, 'friend_accepted', null, jsonb_build_object('from', v_user));
  return v_fr;
end;
$$;

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
  perform enqueue_notification(p_friend, 'friend_invite', p_gig_id,
    jsonb_build_object('from', v_user, 'invite_code', v_gig.invite_code));
end;
$$;

-- ── block_user ───────────────────────────────────────────────────────────────
create or replace function block_user(p_blocked uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); r record;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  if p_blocked = v_user then raise exception 'cannot_block_self'; end if;

  delete from friendships where user_a = least(v_user, p_blocked) and user_b = greatest(v_user, p_blocked);
  update friend_requests set status = 'declined', responded_at = now()
  where status = 'pending'
    and ((sender_id = v_user and recipient_id = p_blocked) or (sender_id = p_blocked and recipient_id = v_user));

  insert into blocks (blocker_id, blocked_id) values (v_user, p_blocked) on conflict do nothing;

  -- shared upcoming gigs: the later joiner leaves (never the host)
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
      update gig_crew set state = 'removed', left_at = now() where gig_id = r.gig_id and user_id = r.b_user;
    elsif r.host_id = r.b_user then
      update gig_crew set state = 'removed', left_at = now() where gig_id = r.gig_id and user_id = r.a_user;
    elsif r.a_at <= r.b_at then
      update gig_crew set state = 'removed', left_at = now() where gig_id = r.gig_id and user_id = r.b_user;
    else
      update gig_crew set state = 'removed', left_at = now() where gig_id = r.gig_id and user_id = r.a_user;
    end if;
  end loop;
end;
$$;

-- ── reliability ──────────────────────────────────────────────────────────────
create or replace function recompute_reliability_band(p_user uuid)
returns reliability_band
language plpgsql security definer set search_path = public as $$
declare v_total int; v_noshow int; v_rate numeric; v_band reliability_band; v_suspended boolean;
begin
  select (suspended_until is not null and suspended_until > now()) into v_suspended from profiles where id = p_user;
  with last10 as (
    select kind from reliability_events
    where user_id = p_user and kind in ('attended','no_show','late_leave')
    order by created_at desc limit 10
  )
  select count(*), count(*) filter (where kind = 'no_show') into v_total, v_noshow from last10;

  if v_suspended then v_band := 'restricted';
  elsif v_total < 3 then v_band := 'new';
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

