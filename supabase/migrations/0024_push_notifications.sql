-- ═════════════════════════════════════════════════════════════════════════════
-- Tremigos 0024: Web Push.
-- Every notification already lands in notification_outbox (the Activity page).
-- Each new row now also pings the app's /api/push/dispatch route through
-- pg_net; the route claims unsent rows and delivers them to the user's
-- devices with Web Push (VAPID). A 1-minute cron sweep covers missed pings.
--
-- The dispatch URL and shared secret live in Supabase Vault:
--   select vault.create_secret('https://<domain>/api/push/dispatch', 'push_dispatch_url');
--   select vault.create_secret('<same as PUSH_DISPATCH_SECRET>', 'push_dispatch_secret');
-- Without them the ping is a no-op, so local stacks and fresh projects are fine.
-- ═════════════════════════════════════════════════════════════════════════════

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  endpoint text not null unique check (endpoint like 'https://%' and length(endpoint) <= 1000),
  p256dh text not null check (length(p256dh) <= 200),
  auth text not null check (length(auth) <= 100),
  user_agent text check (length(user_agent) <= 300),
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);
create index if not exists push_subscriptions_user on push_subscriptions (user_id);
alter table push_subscriptions enable row level security;
revoke all on push_subscriptions from public, anon, authenticated;
grant select (id, endpoint, created_at) on push_subscriptions to authenticated;
drop policy if exists "read own push subscriptions" on push_subscriptions;
create policy "read own push subscriptions" on push_subscriptions for select using (user_id = auth.uid());

-- A device (endpoint) belongs to whoever subscribed on it last: signing in as
-- someone else on a shared phone moves the subscription instead of leaking.
create or replace function save_push_subscription(p_endpoint text, p_p256dh text, p_auth text, p_user_agent text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if (select count(*) from push_subscriptions where user_id = auth.uid()) >= 10
     and not exists (select 1 from push_subscriptions where endpoint = p_endpoint) then
    delete from push_subscriptions where id = (
      select id from push_subscriptions where user_id = auth.uid() order by coalesce(last_used_at, created_at) limit 1);
  end if;
  insert into push_subscriptions (user_id, endpoint, p256dh, auth, user_agent)
  values (auth.uid(), p_endpoint, p_p256dh, p_auth, left(p_user_agent, 300))
  on conflict (endpoint) do update
    set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth,
        user_agent = excluded.user_agent, created_at = now();
end;
$$;

create or replace function delete_push_subscription(p_endpoint text)
returns void language sql security definer set search_path = public as $$
  delete from push_subscriptions where endpoint = p_endpoint and user_id = auth.uid();
$$;

-- ── outbox delivery state ────────────────────────────────────────────────────
alter table notification_outbox add column if not exists pushed_at timestamptz;
update notification_outbox set pushed_at = now() where pushed_at is null; -- no backlog blast
create index if not exists notification_outbox_unpushed on notification_outbox (created_at) where pushed_at is null;

-- Atomically claims a batch for the dispatcher (service role only).
create or replace function claim_push_batch(p_limit int default 100)
returns setof notification_outbox language sql security definer set search_path = public as $$
  update notification_outbox o set pushed_at = now()
  where o.id in (
    select id from notification_outbox
    where pushed_at is null and created_at > now() - interval '1 day'
    order by created_at
    limit greatest(1, least(p_limit, 500))
    for update skip locked
  )
  returning o.*;
$$;

-- Fire-and-forget ping to the app. Never raises: a push problem must not
-- roll back the action that created the notification.
create or replace function ping_push_dispatch()
returns void language plpgsql security definer set search_path = public as $$
declare v_url text; v_secret text;
begin
  select decrypted_secret into v_url from vault.decrypted_secrets where name = 'push_dispatch_url';
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'push_dispatch_secret';
  if v_url is null or v_secret is null then return; end if;
  perform net.http_post(
    url := v_url,
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_secret),
    body := '{}'::jsonb,
    timeout_milliseconds := 5000);
exception when others then
  raise warning 'push ping failed: %', sqlerrm;
end;
$$;

create or replace function notification_outbox_push_trigger()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform ping_push_dispatch();
  return null;
end;
$$;

drop trigger if exists push_on_notification on notification_outbox;
create trigger push_on_notification after insert on notification_outbox
  for each statement execute function notification_outbox_push_trigger();

create or replace function push_sweep_job()
returns void language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from notification_outbox where pushed_at is null and created_at > now() - interval '1 day') then
    perform ping_push_dispatch();
  end if;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then return; end if;
  if exists (select 1 from cron.job where jobname = 'push-sweep') then perform cron.unschedule('push-sweep'); end if;
  perform cron.schedule('push-sweep', '* * * * *', 'select public.push_sweep_job();');
end $$;

-- ── privileges (nothing is callable unless granted) ──────────────────────────
revoke execute on function save_push_subscription(text, text, text, text), delete_push_subscription(text),
  claim_push_batch(int), ping_push_dispatch(), notification_outbox_push_trigger(), push_sweep_job()
  from public, anon, authenticated;
grant execute on function save_push_subscription(text, text, text, text), delete_push_subscription(text) to authenticated;
grant execute on function claim_push_batch(int) to service_role;
grant select, delete, update (last_used_at) on push_subscriptions to service_role;
