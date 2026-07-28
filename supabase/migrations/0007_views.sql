-- 0007 — Client-facing views.
-- Views are declared security_invoker so they run with the QUERYING user's
-- privileges and RLS still applies. They exist to hide privileged columns the
-- base-table policies can't hide at field level.
-- Source: docs/02-data-model.md.

-- ── profiles_public ──────────────────────────────────────────────────────────
-- The only profile shape the client should read. Deliberately omits is_admin,
-- suspended_until, birth_year, and raw verification internals.
create view profiles_public
with (security_invoker = true) as
  select
    id,
    handle,
    display_name,
    bio,
    -- face is hidden from the public/feed surface when face_visible is off;
    -- crew-level face reveal is handled at the gig layer, not here.
    case when face_visible then avatar_path else null end as avatar_path,
    face_visible,
    city,
    interests,
    verification_status,
    verified_at,
    reliability_band,
    created_at
  from profiles;

grant select on profiles_public to authenticated;

-- ── verification_requests_public ─────────────────────────────────────────────
-- The client must NEVER receive media_path or media_mime. Expose status only.
create view verification_requests_public
with (security_invoker = true) as
  select id, status, review_note, reviewed_at, created_at
  from verification_requests;

grant select on verification_requests_public to authenticated;

-- ── friend_hosted_gigs (the one exception to the blind feed, R5) ─────────────
-- Gigs a friend HOSTS surface in your feed with their name. Joins on host_id
-- ONLY — gigs a friend merely joined are unreachable through this view.
create view friend_hosted_gigs
with (security_invoker = true) as
  select g.*, p.display_name as host_name, p.avatar_path as host_avatar
  from gigs g
  join profiles p on p.id = g.host_id
  join friendships f
    on (f.user_a = auth.uid() and f.user_b = g.host_id)
    or (f.user_b = auth.uid() and f.user_a = g.host_id)
  where g.status = 'open';

grant select on friend_hosted_gigs to authenticated;

-- ── gig_feed ─────────────────────────────────────────────────────────────────
-- Convenience view for the blind feed: gig fields + activity display + slots
-- filled, and NOTHING about crew identity. Anonymous by construction.
create view gig_feed
with (security_invoker = true) as
  select
    g.id, g.code, g.title, g.place_label, g.lat, g.lng,
    g.starts_at, g.duration_min, g.capacity, g.claimed_count,
    g.min_to_confirm, g.cost_note, g.status, g.locks_at, g.created_at,
    a.slug as activity_slug, a.name as activity_name, a.emoji as activity_emoji,
    a.category as activity_category
  from gigs g
  join activities a on a.id = g.activity_id
  where g.status in ('open','locked');

grant select on gig_feed to authenticated;
