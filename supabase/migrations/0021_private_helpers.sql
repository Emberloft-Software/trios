-- ═════════════════════════════════════════════════════════════════════════════
-- Tremigos 0021: close an information leak in the RLS helpers.
-- is_gig_crew(gig, user), is_blocked_pair(a, b) and is_admin(user) accepted
-- ANY user id and were executable by clients, so a signed-in user could ask
-- "is X in gig Y?" (defeating the blind feed), "has A blocked B?" (blocks are
-- secret) or "is X an admin?". Policies now use "me only" wrappers that read
-- auth.uid() themselves, and the general helpers are internal-only.
-- ═════════════════════════════════════════════════════════════════════════════

create or replace function am_gig_crew(p_gig_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select is_gig_crew(p_gig_id, auth.uid());
$$;

create or replace function blocked_with_me(p_other uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and is_blocked_pair(auth.uid(), p_other);
$$;

drop policy if exists "read visible gigs" on gigs;
create policy "read visible gigs" on gigs for select using (
  host_id = auth.uid()
  or am_gig_crew(id)
  or (
    auth.uid() is not null
    and status in ('open','locked')
    and viewer_matches(age_min, age_max, gender_pref)
    and not blocked_with_me(host_id)
  )
);

drop policy if exists "crew reads crew" on gig_crew;
create policy "crew reads crew" on gig_crew for select using (am_gig_crew(gig_id));

drop policy if exists "crew reads messages" on gig_messages;
create policy "crew reads messages" on gig_messages for select
  using (gig_is_confirmed(gig_id) and am_gig_crew(gig_id));

drop policy if exists "crew reads checkins" on checkins;
create policy "crew reads checkins" on checkins for select using (am_gig_crew(gig_id));

drop policy if exists "crew reads perk redemption" on perk_redemptions;
create policy "crew reads perk redemption" on perk_redemptions for select using (am_gig_crew(gig_id));

revoke execute on function is_gig_crew(uuid, uuid), is_blocked_pair(uuid, uuid), is_admin(uuid) from public, anon, authenticated;
revoke execute on function gig_is_confirmed(uuid), viewer_matches(int, int, gig_gender), age_years(date) from public, anon;
revoke execute on function am_gig_crew(uuid), blocked_with_me(uuid) from public, anon;
grant execute on function am_gig_crew(uuid), blocked_with_me(uuid) to authenticated;
