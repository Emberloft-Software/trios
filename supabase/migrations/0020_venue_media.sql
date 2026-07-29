-- 0020 — Venue rating + richer gig_feed/friend_hosted_gigs views.
-- Feed and lobby cards showed only place_label text; this adds the Google
-- rating and joins venues in so cards can show a photo, name, rating, and a
-- map thumbnail that opens Google Maps. Columns are appended at the end of
-- each view's select list — CREATE OR REPLACE VIEW can only append, never
-- reorder or drop (see 0013's fix for the same trap).

alter table venues add column if not exists rating numeric;
alter table venues add column if not exists user_rating_count int;

-- ── gig_feed: append venue media fields ───────────────────────────────────────
create or replace view gig_feed
with (security_invoker = true) as
  select
    g.id, g.code, g.title, g.place_label, g.lat, g.lng,
    g.starts_at, g.duration_min, g.capacity, g.claimed_count,
    g.min_to_confirm, g.cost_note, g.status, g.locks_at, g.created_at,
    a.slug as activity_slug, a.name as activity_name, a.emoji as activity_emoji,
    a.category as activity_category,
    v.name as venue_name, v.photo_refs[1] as venue_photo_ref,
    v.photo_attribution[1] as venue_photo_attribution,
    v.rating as venue_rating, v.user_rating_count as venue_rating_count,
    v.maps_url as venue_maps_url
  from gigs g
  join activities a on a.id = g.activity_id
  left join venues v on v.id = g.venue_id
  where g.status in ('open','locked')
    and not exists (
      select 1 from blocks b
      where (b.blocker_id = auth.uid() and b.blocked_id = g.host_id)
         or (b.blocker_id = g.host_id and b.blocked_id = auth.uid())
    );

grant select on gig_feed to authenticated;

-- ── friend_hosted_gigs: append venue media fields ─────────────────────────────
create or replace view friend_hosted_gigs
with (security_invoker = true) as
  select
    g.id, g.code, g.title, g.place_label, g.lat, g.lng,
    g.starts_at, g.duration_min, g.capacity, g.claimed_count,
    g.min_to_confirm, g.cost_note, g.status, g.locks_at, g.created_at,
    a.slug as activity_slug, a.name as activity_name, a.emoji as activity_emoji,
    a.category as activity_category,
    p.display_name as host_name, p.avatar_path as host_avatar,
    v.name as venue_name, v.photo_refs[1] as venue_photo_ref,
    v.photo_attribution[1] as venue_photo_attribution,
    v.rating as venue_rating, v.user_rating_count as venue_rating_count,
    v.maps_url as venue_maps_url
  from gigs g
  join activities a on a.id = g.activity_id
  join profiles p on p.id = g.host_id
  left join venues v on v.id = g.venue_id
  join friendships f
    on (f.user_a = auth.uid() and f.user_b = g.host_id)
    or (f.user_b = auth.uid() and f.user_a = g.host_id)
  where g.status = 'open';

grant select on friend_hosted_gigs to authenticated;
