-- ═════════════════════════════════════════════════════════════════════════════
-- Tremigos — 0005 scheduled jobs (pg_cron). Guarded so a local stack without
-- pg_cron still migrates. Re-running replaces jobs of the same name.
--
--   lock-gigs                every 5 min
--   complete-gigs            every 15 min
--   recompute-bands          daily 02:00 UTC
--   expire-verifications     daily 02:15 UTC
--   expire-friend-requests   daily 02:30 UTC
--   purge-old-chats          daily 02:45 UTC
--   purge-verification-media daily 03:00 UTC → Edge Function (scheduled
--                            separately once the function + CRON_SECRET exist,
--                            see supabase/README-ops.md)
-- ═════════════════════════════════════════════════════════════════════════════
do $$
declare j text;
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then return; end if;

  foreach j in array array['lock-gigs','complete-gigs','recompute-bands','expire-verifications',
                           'expire-friend-requests','purge-old-chats','send-emails'] loop
    if exists (select 1 from cron.job where jobname = j) then perform cron.unschedule(j); end if;
  end loop;

  perform cron.schedule('lock-gigs',              '*/5 * * * *',  'select public.lock_gigs_job();');
  perform cron.schedule('complete-gigs',          '*/15 * * * *', 'select public.complete_gigs_job();');
  perform cron.schedule('recompute-bands',        '0 2 * * *',    'select public.recompute_bands_job();');
  perform cron.schedule('expire-verifications',   '15 2 * * *',   'select public.expire_stale_verifications_job();');
  perform cron.schedule('expire-friend-requests', '30 2 * * *',   'select public.expire_friend_requests_job();');
  perform cron.schedule('purge-old-chats',        '45 2 * * *',   'select public.purge_old_chats_job();');
end $$;
