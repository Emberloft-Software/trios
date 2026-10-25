-- ═════════════════════════════════════════════════════════════════════════════
-- Tremigos 0029: safe password reset + admin two-factor.
--
-- Password reset: the emailed link no longer signs anyone in. /auth/reset
-- verifies it, throws the Supabase session away and issues a single-use,
-- 15-minute ticket (only its SHA-256 is stored here). The new-password form
-- redeems the ticket; the password is set with the service role and every
-- session for the account is revoked.
--
-- Admin 2FA: admin powers require an authenticator-app (TOTP) session, aal2.
-- The app checks the JWT; is_admin() for the signed-in user now does too, so
-- RLS paths that trust admins (can_see_face) need the second factor as well.
-- ═════════════════════════════════════════════════════════════════════════════

create table if not exists password_reset_tickets (
  token_hash text primary key check (length(token_hash) = 64),
  user_id uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists password_reset_tickets_user on password_reset_tickets (user_id);
alter table password_reset_tickets enable row level security;
revoke all on password_reset_tickets from public, anon, authenticated;
grant select, insert, update, delete on password_reset_tickets to service_role;

-- Claims a ticket exactly once; returns the user it belongs to (or nothing).
create or replace function redeem_password_reset_ticket(p_token_hash text)
returns uuid language sql security definer set search_path = public as $$
  update password_reset_tickets set used_at = now()
  where token_hash = p_token_hash and used_at is null and expires_at > now()
  returning user_id;
$$;

-- Signs the account out everywhere (refresh tokens go with their sessions).
create or replace function revoke_all_sessions(p_user uuid)
returns void language sql security definer set search_path = public, auth as $$
  delete from auth.sessions where user_id = p_user;
$$;

-- tidy expired tickets daily
do $$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then return; end if;
  if exists (select 1 from cron.job where jobname = 'purge-reset-tickets') then perform cron.unschedule('purge-reset-tickets'); end if;
  perform cron.schedule('purge-reset-tickets', '20 3 * * *',
    $q$delete from public.password_reset_tickets where expires_at < now() - interval '1 day'$q$);
end $$;

-- Admin checks about the signed-in user require a two-factor session.
-- Checks about someone else (service-role callers passing an admin id) are unchanged.
create or replace function is_admin(p_user uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from profiles where id = p_user), false)
     and (p_user is distinct from auth.uid() or coalesce(auth.jwt() ->> 'aal', '') = 'aal2');
$$;

revoke execute on function redeem_password_reset_ticket(text), revoke_all_sessions(uuid) from public, anon, authenticated;
grant execute on function redeem_password_reset_ticket(text), revoke_all_sessions(uuid) to service_role;
