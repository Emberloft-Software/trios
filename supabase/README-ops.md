# Trimegos — database & ops notes

## Applying migrations

The hosted project is `swvbgmoljmvkvihxtakp` (ap-south-1). The direct `db.<ref>.supabase.co` host is IPv6-only, so use the session pooler:

```bash
psql "host=aws-1-ap-south-1.pooler.supabase.com port=5432 user=postgres.swvbgmoljmvkvihxtakp dbname=postgres sslmode=require" -v ON_ERROR_STOP=1 -f supabase/migrations/00XX_name.sql
```

`0001`–`0025` + `seed.sql` are applied (the big schema/function files are split into `_partN` files; same content, same order). The old Trio migrations are archived in `supabase/_legacy/` and are **not** used.

## First admin

`seed.sql` puts emails in `admin_allowlist`; anyone signing up with one of those emails becomes an admin automatically. To add another admin later, use **Admin → Users → (person) → Make admin**, or insert into `admin_allowlist` before they sign up.

## Auth settings (Supabase dashboard → Authentication)

- **Confirm email is OFF** right now, so sign-ups get a session immediately. The app also handles it being ON (shows "check your email", `/auth/callback` finishes the link).
- Supabase's built-in email sender is for testing only (a couple of emails an hour, and only to your own team's addresses), so **email confirmation and password-reset emails won't reach real users until you add custom SMTP** (Authentication → Emails → SMTP). Resend's free tier (3,000/month, 100/day) or Brevo (300/day) both work. After that you can switch "Confirm email" on.
- Add your production URL to **URL Configuration** (Site URL + Redirect URLs: `https://<domain>/auth/callback`).

## Push notifications (Web Push)

Every row in `notification_outbox` is also pushed to the user's subscribed devices:

1. An insert trigger calls `ping_push_dispatch()`, which uses `pg_net` to POST to `/api/push/dispatch` with a shared secret. A `push-sweep` cron job (every minute) re-pings while anything from the last 24h is unsent.
   Chat messages (0025) count up in `chat_push_state` instead and ping the same route; they're claimed with `claim_chat_push_batch()` (skips people reading the chat, max one push per gig per 2 minutes).
2. The route checks the secret, claims a batch with `claim_push_batch()` and sends via `web-push` (VAPID). Subscriptions that return 404/410 are deleted.

Config:

- **Vercel env:** `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `PUSH_DISPATCH_SECRET`. The generated values are in the gitignored `push-keys.local.env`; copy them into `.env.local` for local use too. The public key is baked in at build time, so redeploy after setting it.
- **Supabase Vault:** `push_dispatch_url` (currently `https://trios-smoky.vercel.app/api/push/dispatch`) and `push_dispatch_secret` (must equal `PUSH_DISPATCH_SECRET`). If the domain changes:
  ```sql
  update vault.secrets set secret = 'https://<domain>/api/push/dispatch' where name = 'push_dispatch_url';
  ```
  (use `vault.update_secret(id, new_secret)` if a direct update is refused).
- Ping results land in `net._http_response` (status_code 401 means the secret doesn't match; 503 means the VAPID env is missing).
- iPhones only get Web Push from the installed Home Screen app (iOS 16.4+). The Activity page explains this.

## Scheduled jobs

`0005_cron.sql` schedules lock/complete/recompute/expire/purge-chat jobs in pg_cron. Verification-media retention is enforced by the admin review action (it sweeps anything reviewed >7 days ago on each decision). For a fully automatic daily purge you can additionally deploy `functions/purge-verification-media`:

```bash
supabase secrets set CRON_SECRET=<random string>
supabase functions deploy purge-verification-media
```

then schedule it with `pg_net` (`select net.http_post(url := 'https://<ref>.functions.supabase.co/purge-verification-media', headers := jsonb_build_object('Authorization','Bearer <CRON_SECRET>'));`).

`functions/send-emails` drains `notification_outbox` to email via Resend (needs `RESEND_API_KEY`); it isn't scheduled. Notifications already show in-app on the Activity page.
