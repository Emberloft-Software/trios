-- 0017 — Fix infinite recursion in the gig_crew SELECT policy.
--
-- The 0006 policy "crew reads crew" queried gig_crew from inside a policy ON
-- gig_crew, which Postgres rejects as "infinite recursion detected in policy for
-- relation gig_crew" (SQLSTATE 42P17). The client's crew query then errored, the
-- lobby fell back to the blind preview for everyone, and the chat never opened.
--
-- Fix: do the membership check in a SECURITY DEFINER function so the inner read
-- bypasses RLS (no recursion). Every other policy that reads gig_crew
-- (gig_messages, checkins, perk_redemptions) now goes through this safe policy.

create or replace function is_gig_crew(p_gig_id uuid, p_user uuid default auth.uid())
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from gig_crew
    where gig_id = p_gig_id
      and user_id = p_user
      and state in ('claimed', 'attended', 'no_show')
  );
$$;
grant execute on function is_gig_crew(uuid, uuid) to authenticated;

drop policy if exists "crew reads crew" on gig_crew;
create policy "crew reads crew" on gig_crew for select
  using (is_gig_crew(gig_crew.gig_id));
