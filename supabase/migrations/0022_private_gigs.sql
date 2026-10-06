-- ═════════════════════════════════════════════════════════════════════════════
-- Tremigos 0022: private gigs.
-- A private gig never appears in any feed. Every spot except the host's is a
-- held seat with its own single-use invite link; there is no public joining
-- (enforced here, not just hidden in the UI). Cancelling an unused link on a
-- private gig issues a replacement instead of opening the seat to the public.
-- ═════════════════════════════════════════════════════════════════════════════

alter table gigs add column if not exists is_private boolean not null default false;
alter table gigs drop constraint if exists guests_leave_room;
alter table gigs add constraint guests_leave_room check (is_private or host_guests <= capacity - 2);

-- outsiders can only ever see PUBLIC gigs
drop policy if exists "read visible gigs" on gigs;
create policy "read visible gigs" on gigs for select using (
  host_id = auth.uid()
  or am_gig_crew(id)
  or (
    auth.uid() is not null
    and not is_private
    and status in ('open','locked')
    and viewer_matches(age_min, age_max, gender_pref)
    and not blocked_with_me(host_id)
  )
);

-- the feed never lists private gigs, even to their own crew
create or replace view gig_feed with (security_invoker = true) as
SELECT g.id,
    g.code,
    g.title,
    g.place_label,
    g.lat,
    g.lng,
    g.starts_at,
    g.duration_min,
    g.capacity,
    g.claimed_count,
    g.reserved_slots,
    g.host_guests,
    g.claimed_count + g.reserved_slots AS headcount,
    g.min_to_confirm,
    g.cost_note,
    g.status,
    g.locks_at,
    g.created_at,
    g.age_min,
    g.age_max,
    g.gender_pref,
    a.slug AS activity_slug,
    a.name AS activity_name,
    a.emoji AS activity_emoji,
    a.category AS activity_category,
    v.name AS venue_name,
    v.photo_refs[1] AS venue_photo_ref,
    v.photo_attribution[1] AS venue_photo_attribution,
    v.rating AS venue_rating,
    v.user_rating_count AS venue_rating_count,
    v.maps_url AS venue_maps_url,
    g.is_private
   FROM gigs g
     JOIN activities a ON a.id = g.activity_id
     LEFT JOIN venues v ON v.id = g.venue_id
  WHERE NOT g.is_private AND g.status = ANY (ARRAY['open'::gig_status, 'locked'::gig_status]);
