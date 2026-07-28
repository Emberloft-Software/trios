-- 0013 — Friend invites + a richer friend_hosted_gigs view for the feed.
-- Source: docs/01 § Friends, docs/03 § friend requests, docs/06.
-- The friend backend (send/accept, R9, 90-day rule) already lives in 0005.

-- ── invite_friend ────────────────────────────────────────────────────────────
-- Host nudges a friend about a gig they're hosting. It's a notification only —
-- it holds NO slot and gives NO ordering advantage (R10). The friend claims a
-- slot first-come like anyone else, or misses it.
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

  -- must actually be friends
  if not exists (
    select 1 from friendships
    where (user_a = least(v_user, p_friend) and user_b = greatest(v_user, p_friend))
  ) then
    raise exception 'not_friends';
  end if;

  insert into notification_outbox (user_id, kind, gig_id, payload)
  values (p_friend, 'friend_invite', p_gig_id, jsonb_build_object('from', v_user));
end;
$$;
grant execute on function invite_friend(uuid,uuid) to authenticated;

-- ── friend_hosted_gigs: add activity fields so the feed can render it ────────
-- Still joins on host_id ONLY — gigs a friend merely joined are unreachable
-- (the single, deliberate exception to the blind feed, R5).
drop view if exists friend_hosted_gigs;
create view friend_hosted_gigs
with (security_invoker = true) as
  select
    g.id, g.code, g.title, g.place_label, g.lat, g.lng,
    g.starts_at, g.duration_min, g.capacity, g.claimed_count,
    g.min_to_confirm, g.cost_note, g.status, g.locks_at, g.created_at,
    a.slug as activity_slug, a.name as activity_name, a.emoji as activity_emoji,
    a.category as activity_category,
    p.display_name as host_name, p.avatar_path as host_avatar
  from gigs g
  join activities a on a.id = g.activity_id
  join profiles p on p.id = g.host_id
  join friendships f
    on (f.user_a = auth.uid() and f.user_b = g.host_id)
    or (f.user_b = auth.uid() and f.user_a = g.host_id)
  where g.status = 'open';

grant select on friend_hosted_gigs to authenticated;
