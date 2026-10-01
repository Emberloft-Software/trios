-- ═════════════════════════════════════════════════════════════════════════════
grant usage on schema public to anon, authenticated, service_role;

revoke all on all tables in schema public from anon, authenticated;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

-- reads (RLS still decides which rows)
grant select on
  profiles, activities, venues, gigs, gig_crew, gig_messages, checkins,
  verification_requests, friend_requests, friendships, blocks,
  perk_redemptions, notification_outbox
to authenticated;
grant select on activities to anon;
grant select on profiles_public, gig_feed, friend_hosted_gigs, verification_requests_public to authenticated;

-- the handful of direct writes
grant insert (gig_id, user_id, body) on gig_messages to authenticated;
grant delete on friendships, blocks to authenticated;
grant update (display_name, bio, interests, city) on profiles to authenticated;
grant update (title, notes, cost_note) on gigs to authenticated;

-- functions: nothing is callable unless granted here
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on all functions in schema public to service_role;

-- used inside RLS policies / views
grant execute on function
  age_years(date), is_admin(uuid), is_gig_crew(uuid, uuid), is_blocked_pair(uuid, uuid),
  viewer_matches(int, int, gig_gender), gig_is_confirmed(uuid)
to anon, authenticated;

-- user-facing RPCs
grant execute on function check_handle(text) to anon, authenticated;
grant execute on function invite_preview(text) to anon, authenticated;
grant execute on function
  complete_profile(date, gender_identity, boolean),
  create_gig(uuid, text, uuid, text, double precision, double precision, timestamptz, int, int, text, text, int, int, gig_gender, int),
  claim_slot(uuid),
  join_by_invite(text),
  release_reserved_slot(uuid),
  leave_gig(uuid, boolean),
  remove_crew_member(uuid, uuid, text),
  cast_kick_vote(uuid, uuid, text),
  retract_kick_vote(uuid, uuid),
  kick_vote_tallies(uuid),
  check_in(uuid, uuid),
  file_report(uuid, text, text, uuid),
  send_friend_request(uuid, uuid),
  accept_friend_request(uuid),
  invite_friend(uuid, uuid),
  block_user(uuid),
  redeem_perk(uuid, uuid),
  cancel_gig(uuid, text),
  start_verification(),
  submit_verification(uuid, text, text, int, text),
  mark_notifications_read()
to authenticated;

-- ── realtime: lobby chat ─────────────────────────────────────────────────────
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables
                     where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'gig_messages') then
    alter publication supabase_realtime add table gig_messages;
  end if;
end $$;
