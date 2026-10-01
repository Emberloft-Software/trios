-- ═════════════════════════════════════════════════════════════════════════════
-- Tremigos — 0003 row level security, client views, and privileges.
-- Default deny. Clients read through narrow policies/views and write through
-- security-definer functions; column-level grants stop privilege escalation
-- (e.g. nobody can `update profiles set is_admin = true` on themselves).
-- ═════════════════════════════════════════════════════════════════════════════

-- ── profiles ─────────────────────────────────────────────────────────────────
-- Base table: only your own row. Everyone else's public shape comes from the
-- profiles_public view below.
create policy "read own profile" on profiles for select using (id = auth.uid());
create policy "update own profile" on profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- ── activities / venues ──────────────────────────────────────────────────────
create policy "read active activities" on activities for select using (active);
create policy "read active venues" on venues for select using (active and auth.uid() is not null);

-- ── gigs ─────────────────────────────────────────────────────────────────────
-- Visible to: the host, the crew, and anyone whose age/gender matches the
-- gig's audience (while it's open or locked), minus block relationships.
-- A gig outside your audience simply doesn't exist for you.
create policy "read visible gigs" on gigs for select using (
  host_id = auth.uid()
  or is_gig_crew(id)
  or (
    auth.uid() is not null
    and status in ('open','locked')
    and viewer_matches(age_min, age_max, gender_pref)
    and not is_blocked_pair(auth.uid(), host_id)
  )
);
-- Host can tweak copy fields while open (column grants below limit WHICH fields).
create policy "host edits open gig" on gigs for update
  using (host_id = auth.uid() and status = 'open')
  with check (host_id = auth.uid());

-- ── gig_crew ─────────────────────────────────────────────────────────────────
-- Crew identity is visible ONLY to crew (the blind feed).
create policy "crew reads crew" on gig_crew for select using (is_gig_crew(gig_id));

-- ── gig_messages (chat opens at confirmation) ────────────────────────────────
create policy "crew reads messages" on gig_messages for select
  using (gig_is_confirmed(gig_id) and is_gig_crew(gig_id));
create policy "crew writes messages" on gig_messages for insert
  with check (
    user_id = auth.uid()
    and system_kind is null
    and gig_is_confirmed(gig_id)
    and exists (select 1 from gig_crew c where c.gig_id = gig_messages.gig_id
                and c.user_id = auth.uid() and c.state = 'claimed')
    and exists (select 1 from gigs g where g.id = gig_messages.gig_id and g.status in ('open','locked'))
  );

-- ── checkins ─────────────────────────────────────────────────────────────────
create policy "crew reads checkins" on checkins for select using (is_gig_crew(gig_id));

-- ── verification ─────────────────────────────────────────────────────────────
create policy "read own verification" on verification_requests for select using (user_id = auth.uid());

-- ── social ───────────────────────────────────────────────────────────────────
create policy "see own requests" on friend_requests for select
  using (sender_id = auth.uid() or recipient_id = auth.uid());
create policy "see own friendships" on friendships for select
  using (user_a = auth.uid() or user_b = auth.uid());
create policy "unfriend own" on friendships for delete
  using (user_a = auth.uid() or user_b = auth.uid());
create policy "see own blocks" on blocks for select using (blocker_id = auth.uid());
create policy "unblock own" on blocks for delete using (blocker_id = auth.uid());

create policy "crew reads perk redemption" on perk_redemptions for select using (is_gig_crew(gig_id));

create policy "read own notifications" on notification_outbox for select using (user_id = auth.uid());

-- No client policies at all (service role / definer functions only):
--   admin_allowlist, kick_votes, crew_removals, reports, moderation_actions,
--   reliability_events, admin_audit

-- ═════════════════════════════════════════════════════════════════════════════
-- Views
-- ═════════════════════════════════════════════════════════════════════════════

-- The only shape of OTHER people a client can read. Runs as the view owner
-- (security definer view) so it can expose these safe columns of any profile
-- while the base table stays own-row-only. Never add private columns here.
create view profiles_public as
  select
    id,
    handle,
    display_name,
    bio,
    case when avatar_status = 'approved' then avatar_path end as avatar_path,
    city,
    interests,
    age_years(birth_date) as age,
    gender,
    verification_status,
    verified_at,
    reliability_band,
    created_at
  from profiles;

-- Blind feed: gig + activity + venue + headcount. NOTHING about crew identity.
-- security_invoker so the gigs policy (audience + blocks) applies per viewer.
create view gig_feed with (security_invoker = true) as
  select
    g.id, g.code, g.title, g.place_label, g.lat, g.lng,
    g.starts_at, g.duration_min, g.capacity, g.claimed_count, g.reserved_slots,
    g.host_guests, (g.claimed_count + g.reserved_slots) as headcount,
    g.min_to_confirm, g.cost_note, g.status, g.locks_at, g.created_at,
    g.age_min, g.age_max, g.gender_pref,
    a.slug as activity_slug, a.name as activity_name, a.emoji as activity_emoji,
    a.category as activity_category,
    v.name as venue_name, v.photo_refs[1] as venue_photo_ref,
    v.photo_attribution[1] as venue_photo_attribution,
    v.rating as venue_rating, v.user_rating_count as venue_rating_count,
    v.maps_url as venue_maps_url
  from gigs g
  join activities a on a.id = g.activity_id
  left join venues v on v.id = g.venue_id
  where g.status in ('open','locked');

-- Gigs your friends host — the single, deliberate exception to the blind feed.
create view friend_hosted_gigs with (security_invoker = true) as
  select
    f.*, p.display_name as host_name, p.avatar_path as host_avatar
  from gig_feed f
  join gigs g on g.id = f.id
  join profiles_public p on p.id = g.host_id
  join friendships fr
    on (fr.user_a = auth.uid() and fr.user_b = g.host_id)
    or (fr.user_b = auth.uid() and fr.user_a = g.host_id)
  where f.status = 'open';

-- Your verification history WITHOUT media paths.
create view verification_requests_public with (security_invoker = true) as
  select id, status, review_note, reviewed_at, submitted_at, created_at
  from verification_requests;

-- Behavioural red flags for admins (service role only).
create view admin_flags with (security_invoker = true) as
  select 'host_removals'::text as kind, actor_id as subject_id, count(*)::int as count,
         'Removed ' || count(*) || ' people in the last 30 days' as detail, max(created_at) as last_at
  from crew_removals
  where kind = 'host' and created_at > now() - interval '30 days'
  group by actor_id having count(*) >= 3
  union all
  select 'vote_removed', target_id, count(*)::int,
         'Voted out of ' || count(*) || ' chats', max(created_at)
  from crew_removals where kind = 'vote'
  group by target_id having count(*) >= 2
  union all
  select 'blocks_received', blocked_id, count(*)::int, 'Blocked by ' || count(*) || ' people', max(created_at)
  from blocks group by blocked_id having count(*) >= 3
  union all
  select 'friend_spam', sender_id, count(*)::int,
         'Sent ' || count(*) || ' friend requests, few accepted', max(created_at)
  from friend_requests group by sender_id
  having count(*) >= 5 and (count(*) filter (where status = 'accepted'))::numeric / count(*) < 0.3;

-- ═════════════════════════════════════════════════════════════════════════════
-- Privileges
