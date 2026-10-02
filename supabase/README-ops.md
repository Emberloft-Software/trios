# Tremigos — database & ops notes

## Applying migrations

The hosted project is `swvbgmoljmvkvihxtakp` (ap-south-1). The direct `db.<ref>.supabase.co` host is IPv6-only, so use the session pooler:

```bash
psql "host=aws-1-ap-south-1.pooler.supabase.com port=5432 user=postgres.swvbgmoljmvkvihxtakp dbname=postgres sslmode=require" -v ON_ERROR_STOP=1 -f supabase/migrations/00XX_name.sql
```

`0001`–`0021` + `seed.sql` are applied (the big schema/function files are split into `_partN` files; same content, same order). The old Trio migrations are archived in `supabase/_legacy/` and are **not** used.

## First admin

`seed.sql` puts emails in `admin_allowlist`; anyone signing up with one of those emails becomes an admin automatically. To add another admin later, use **Admin → Users → (person) → Make admin**, or insert into `admin_allowlist` before they sign up.

## Auth settings (Supabase dashboard → Authentication)

- **Confirm email is OFF** right now, so sign-ups get a session immediately. The app also handles it being ON (shows "check your email", `/auth/callback` finishes the link).
- Supabase's built-in email sender is for testing only (a couple of emails an hour, and only to your own team's addresses), so **email confirmation and password-reset emails won't reach real users until you add custom SMTP** (Authentication → Emails → SMTP). Resend's free tier (3,000/month, 100/day) or Brevo (300/day) both work. After that you can switch "Confirm email" on.
- Add your production URL to **URL Configuration** (Site URL + Redirect URLs: `https://<domain>/auth/callback`).

## Scheduled jobs

`0005_cron.sql` schedules lock/complete/recompute/expire/purge-chat jobs in pg_cron. Verification-media retention is enforced by the admin review action (it sweeps anything reviewed >7 days ago on each decision). For a fully automatic daily purge you can additionally deploy `functions/purge-verification-media`:

```bash
supabase secrets set CRON_SECRET=<random string>
supabase functions deploy purge-verification-media
```

then schedule it with `pg_net` (`select net.http_post(url := 'https://<ref>.functions.supabase.co/purge-verification-media', headers := jsonb_build_object('Authorization','Bearer <CRON_SECRET>'));`).

`functions/send-emails` drains `notification_outbox` to email via Resend (needs `RESEND_API_KEY`); it isn't scheduled. Notifications already show in-app on the Activity page.
