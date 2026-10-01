-- 0006 — Row Level Security policies.
-- CLAUDE.md hard rule #1: RLS on every table, no exceptions.
-- Default deny, grant narrowly. RLS was ENABLED in 0002–0004; this file adds
-- the policies. Source: docs/02-data-model.md § RLS policies.

-- ── profiles ─────────────────────────────────────────────────────────────────
-- Everyone authenticated can read the public shape; field-level hiding
-- (is_admin, suspended_until, verification writes) is via the profiles_public
-- view (0007) + server-side writes. The client never updates privileged cols.
create policy "read own" on profiles for select using (id = auth.uid());
create policy "read others" on profiles for select using (auth.uid() is not null);
create policy "update own" on profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- ── activities ───────────────────────────────────────────────────────────────
create policy "read active activities" on activities for select
  using (active = true and auth.uid() is not null);

-- ── venues ───────────────────────────────────────────────────────────────────
create policy "read active venues" on venues for select
  using (active = true and auth.uid() is not null);
-- Writes: admin only, via service role (no anon/authenticated write policy).

-- ── gigs ─────────────────────────────────────────────────────────────────────
-- Open/locked/completed gigs are readable by any authenticated user. Safe:
-- gigs carry no crew identity (R5, the blind feed).
create policy "read visible gigs" on gigs for select
  using (auth.uid() is not null and status in ('open','locked','completed'));
-- Host reads own gig in any status (e.g. to see a cancellation)
create policy "host reads own gig" on gigs for select
  using (host_id = auth.uid());
-- create_gig() is security definer, but the insert lands as the host — allow it.
create policy "host creates" on gigs for insert with check (host_id = auth.uid());
-- Host may edit details / cancel while OPEN only.
create policy "host updates own open gig" on gigs for update
  using (host_id = auth.uid() and status = 'open')
  with check (host_id = auth.uid());

-- ── gig_crew ─────────────────────────────────────────────────────────────────
-- The policy that implements the blind feed. Crew identity is visible ONLY to
-- crew. A non-crew user querying gig_crew with the anon key gets zero rows.
create policy "crew reads crew" on gig_crew for select
  using (
    exists (
      select 1 from gig_crew me
      where me.gig_id = gig_crew.gig_id
        and me.user_id = auth.uid()
        and me.state in ('claimed','attended','no_show')
    )
  );
-- Leaving is done through leave_gig(); a narrow self-update is also allowed for
-- check-in-adjacent state the user owns. NO insert policy — slots come only
-- from claim_slot()/create_gig() (security definer). This makes R2 structural.
create policy "leave own slot" on gig_crew for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── gig_messages (R8: chat opens at confirmation) ────────────────────────────
create policy "crew reads messages" on gig_messages for select
  using (
    gig_is_confirmed(gig_messages.gig_id)
    and exists (
      select 1 from gig_crew c
      where c.gig_id = gig_messages.gig_id
        and c.user_id = auth.uid()
        and c.state in ('claimed','attended','no_show')
    )
  );
create policy "crew writes messages" on gig_messages for insert
  with check (
    user_id = auth.uid()
    and gig_is_confirmed(gig_messages.gig_id)
    and exists (
      select 1 from gig_crew c
      where c.gig_id = gig_messages.gig_id
        and c.user_id = auth.uid()
        and c.state = 'claimed'
    )
    -- read-only after completion
    and exists (select 1 from gigs g where g.id = gig_messages.gig_id
                and g.status in ('open','locked'))
  );

-- ── checkins ─────────────────────────────────────────────────────────────────
create policy "crew reads checkins" on checkins for select
  using (
    exists (select 1 from gig_crew c
            where c.gig_id = checkins.gig_id and c.user_id = auth.uid()
              and c.state in ('claimed','attended','no_show'))
  );
create policy "crew inserts own checkin" on checkins for insert
  with check (
    confirmer_id = auth.uid()
    and exists (select 1 from gig_crew c
                where c.gig_id = checkins.gig_id and c.user_id = auth.uid()
                  and c.state in ('claimed','attended','no_show'))
    and exists (select 1 from gig_crew c
                where c.gig_id = checkins.gig_id and c.user_id = checkins.subject_id
                  and c.state in ('claimed','attended','no_show'))
  );

-- ── crew_removals / reports / moderation / reliability / admin_audit ─────────
-- Insert-only where relevant; NO client read at all. All reads are admin,
-- server-side, via the service role (which bypasses RLS).
create policy "file own report" on reports for insert
  with check (reporter_id = auth.uid());
-- (no select/update/delete policies → clients cannot read these tables)

-- ── verification_requests ────────────────────────────────────────────────────
-- User inserts and reads their own row; a view (0007) hides media_path.
-- Nobody but an admin (service role) reads media_path.
create policy "insert own request" on verification_requests for insert
  with check (user_id = auth.uid());
create policy "read own request" on verification_requests for select
  using (user_id = auth.uid());

-- ── friend_requests / friendships / blocks ───────────────────────────────────
create policy "see own requests" on friend_requests for select
  using (sender_id = auth.uid() or recipient_id = auth.uid());
create policy "respond to own incoming" on friend_requests for update
  using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());
-- NO insert policy — send_friend_request() enforces R9 + the 90-day rule.

create policy "see own friendships" on friendships for select
  using (user_a = auth.uid() or user_b = auth.uid());
create policy "unfriend own" on friendships for delete
  using (user_a = auth.uid() or user_b = auth.uid());
-- NO insert policy — accept_friend_request() creates friendships.

create policy "manage own blocks" on blocks for all
  using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());

-- ── perk_redemptions ─────────────────────────────────────────────────────────
-- Written by redeem_perk() (security definer) and by the /spot page (service
-- role). No client read.  (No select policy → clients cannot read.)
