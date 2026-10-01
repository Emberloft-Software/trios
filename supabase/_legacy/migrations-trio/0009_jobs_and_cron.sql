-- 0009 — Scheduled job functions + host cancel + pg_cron scheduling.
-- Source: docs/02 § Scheduled jobs, docs/03 § lifecycle, docs/06 § reliability.
--
-- The state-machine transitions run as SQL functions (fast, transactional).
-- Side effects that must leave the database — transactional email and deleting
-- storage objects — are done by Edge Functions (see supabase/functions/*), which
-- these jobs flag work for. Email dispatch reads the notification outbox.

-- ── notification outbox ──────────────────────────────────────────────────────
-- Jobs enqueue emails here; the send-emails Edge Function drains it. Keeps SQL
-- jobs pure and lets email delivery retry independently.
create table if not exists notification_outbox (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  kind text not null,             -- 'gig_confirmed','gig_locked','gig_cancelled',...
  gig_id uuid references gigs on delete set null,
  payload jsonb not null default '{}',
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notification_outbox_unsent
  on notification_outbox (created_at) where sent_at is null;
alter table notification_outbox enable row level security;
-- No client policies: enqueued by security-definer jobs, drained by service role.

create or replace function enqueue_notification(p_user uuid, p_kind text, p_gig uuid, p_payload jsonb default '{}')
returns void language sql security definer set search_path = public as $$
  insert into notification_outbox (user_id, kind, gig_id, payload)
  values (p_user, p_kind, p_gig, p_payload);
$$;

-- ── lock-gigs (every 5 min) ──────────────────────────────────────────────────
-- open → locked at locks_at. If under minimum, open → cancelled(under_filled).
-- under_filled produces NO reliability event for anyone (docs/03).
create or replace function lock_gigs_job()
returns void language plpgsql security definer set search_path = public as $$
declare r record; m record;
begin
  for r in
    select * from gigs where status = 'open' and now() >= locks_at for update
  loop
    if r.claimed_count < r.min_to_confirm then
      update gigs set status = 'cancelled', cancelled_reason = 'under_filled' where id = r.id;
      for m in select user_id from gig_crew where gig_id = r.id and state = 'claimed' loop
        perform enqueue_notification(m.user_id, 'gig_cancelled', r.id,
          jsonb_build_object('reason', 'under_filled'));
      end loop;
    else
      update gigs set status = 'locked' where id = r.id;
      insert into gig_messages (gig_id, user_id, body, system_kind)
      values (r.id, null, 'locked', 'locked');
      for m in select user_id from gig_crew where gig_id = r.id and state = 'claimed' loop
        perform enqueue_notification(m.user_id, 'gig_locked', r.id, '{}');
      end loop;
    end if;
  end loop;

  -- Safety net: an open gig whose start passed without ever locking → expired.
  update gigs set status = 'expired'
  where status = 'open' and now() >= starts_at;
end;
$$;

-- ── complete-gigs (every 15 min) ─────────────────────────────────────────────
-- After starts_at + duration + 3h: resolve check-ins by the 2-of-N rule, write
-- reliability_events, set completed. A locked gig that dropped to 2 STILL
-- completes — there is no re-cancel path below minimum after locking (R4).
-- If NOBODY checked in, complete with ZERO events (docs/03).
create or replace function complete_gigs_job()
returns void language plpgsql security definer set search_path = public as $$
declare r record; m record; v_conf int; v_any boolean;
begin
  for r in
    select * from gigs
    where status = 'locked'
      and now() >= starts_at + (duration_min || ' minutes')::interval + interval '3 hours'
    for update
  loop
    v_any := exists (select 1 from checkins where gig_id = r.id);

    if v_any then
      for m in select user_id from gig_crew where gig_id = r.id and state = 'claimed' loop
        select count(distinct confirmer_id) into v_conf
        from checkins where gig_id = r.id and subject_id = m.user_id;

        if v_conf >= 2 then
          update gig_crew set state = 'attended' where gig_id = r.id and user_id = m.user_id;
          insert into reliability_events (user_id, gig_id, kind) values (m.user_id, r.id, 'attended');
        else
          update gig_crew set state = 'no_show' where gig_id = r.id and user_id = m.user_id;
          insert into reliability_events (user_id, gig_id, kind) values (m.user_id, r.id, 'no_show');
        end if;
      end loop;
    end if;

    update gigs set status = 'completed' where id = r.id;
  end loop;
end;
$$;

-- ── host cancels a confirmed gig ─────────────────────────────────────────────
-- Costs the host a host_cancel event, weighted double (docs/06). Only the host,
-- only before completion.
create or replace function cancel_gig(p_gig_id uuid, p_reason text default null)
returns void language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_gig gigs; m record;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  select * into v_gig from gigs where id = p_gig_id for update;
  if not found then raise exception 'gig_not_found'; end if;
  if v_gig.host_id <> v_user then raise exception 'not_host'; end if;
  if v_gig.status not in ('open','locked') then raise exception 'gig_not_open'; end if;

  update gigs set status = 'cancelled', cancelled_reason = coalesce(p_reason, 'host_cancelled')
  where id = p_gig_id;

  -- Penalise the host only if the gig had already confirmed.
  if v_gig.claimed_count >= v_gig.min_to_confirm then
    insert into reliability_events (user_id, gig_id, kind, weight)
    values (v_user, p_gig_id, 'host_cancel', 2);
  end if;

  for m in select user_id from gig_crew where gig_id = p_gig_id and state = 'claimed' and user_id <> v_user loop
    perform enqueue_notification(m.user_id, 'gig_cancelled', p_gig_id,
      jsonb_build_object('reason', 'host_cancelled'));
  end loop;
end;
$$;
grant execute on function cancel_gig(uuid,text) to authenticated;

-- ── recompute-bands (daily) ──────────────────────────────────────────────────
create or replace function recompute_bands_job()
returns void language plpgsql security definer set search_path = public as $$
declare u record;
begin
  for u in
    select distinct user_id from reliability_events
    where created_at > now() - interval '120 days'
    union
    select id from profiles where suspended_until is not null
  loop
    perform recompute_reliability_band(u.user_id);
  end loop;
end;
$$;

-- ── auto-reject stale verification requests (docs/05) ────────────────────────
-- Unreviewed requests older than 30 days are auto-rejected (media purge handled
-- by the Edge Function).
create or replace function expire_stale_verifications_job()
returns void language plpgsql security definer set search_path = public as $$
begin
  update verification_requests
  set status = 'rejected', review_note = 'Auto-rejected: not reviewed within 30 days.'
  where status = 'pending' and created_at < now() - interval '30 days';
end;
$$;

-- ── expire stale friend requests (docs/02: 14 days) ──────────────────────────
create or replace function expire_friend_requests_job()
returns void language plpgsql security definer set search_path = public as $$
begin
  update friend_requests set status = 'expired', responded_at = now()
  where status = 'pending' and created_at < now() - interval '14 days';
end;
$$;

-- ── pg_cron scheduling ───────────────────────────────────────────────────────
-- Requires the pg_cron extension (enable in Dashboard → Database → Extensions).
-- On Supabase, cron.schedule lives in the `cron` schema.
--
--   lock-gigs                every 5 min
--   complete-gigs            every 15 min
--   recompute-bands          daily 02:00 UTC
--   expire-verifications     daily 02:15 UTC
--   expire-friend-requests   daily 02:30 UTC
--   purge-verification-media daily 03:00 UTC  → Edge Function (see below)
--   send-emails              every 2 min      → Edge Function (drains outbox)
--
-- Guarded so `supabase db reset` doesn't fail if pg_cron isn't installed locally.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('lock-gigs',       '*/5 * * * *',  $cron$ select lock_gigs_job(); $cron$);
    perform cron.schedule('complete-gigs',   '*/15 * * * *', $cron$ select complete_gigs_job(); $cron$);
    perform cron.schedule('recompute-bands', '0 2 * * *',    $cron$ select recompute_bands_job(); $cron$);
    perform cron.schedule('expire-verifications', '15 2 * * *', $cron$ select expire_stale_verifications_job(); $cron$);
    perform cron.schedule('expire-friend-requests', '30 2 * * *', $cron$ select expire_friend_requests_job(); $cron$);
    -- purge-verification-media and send-emails are scheduled to hit Edge
    -- Functions via pg_net once deployed; see supabase/functions/README.
  end if;
end;
$$;
