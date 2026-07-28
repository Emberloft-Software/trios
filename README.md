# Trio

Group-meetup web app for Colombo. Post a **gig** (badminton, movie, board games, coffee), other people claim **slots**, you meet in real life. Minimum three humans, always. Deliberately **not** a dating app.

> **Trio** is a working codename. Rename before launch — it only appears in `lib/brand.ts` and `lib/copy.ts`.

- **Stack:** Next.js 15 (App Router, TS strict) · Tailwind v4 (CSS-first `@theme`) · Supabase (Postgres, Auth, Storage, Realtime, Edge Functions) · `react-hook-form` + `zod` · `motion` · `date-fns-tz` (app tz `Asia/Colombo`).
- **Specs:** everything is in [`docs/`](docs/00-start-here.md). Read `docs/00-start-here.md` first.

---

## What's built so far

This repo is a working **M0 foundation + the complete database layer + the start of M1**. Concretely:

| Area | Status |
|---|---|
| Project scaffold, TS strict, Tailwind v4 `@theme` design tokens | ✅ |
| Fonts (Gabarito / Instrument Sans / DM Mono) | ✅ |
| `SlotStrip` signature component (blind + crew, springs on fill, wraps at 375px) | ✅ |
| `Button`, `Card` primitives | ✅ |
| Supabase client/server/admin/middleware wiring | ✅ |
| Email-OTP auth + `/auth/callback` + route guards | ✅ |
| Landing page (live pinned board hero), about, safety, terms | ✅ |
| Feed (blind), create-gig flow, gig lobby (preview + crew), realtime chat, leave doors | ✅ (M1 + parts of M2) |
| Admin shell + dashboard (gigs-at-risk list) with the two access gates | ✅ |
| **Full SQL: tables, RLS, functions, triggers, views, storage, cron, seed** | ✅ |
| Edge Function stubs: `purge-verification-media`, `send-emails` | ✅ |
| **M3 — Verification:** `/me/verify` liveness capture (feature-detected mime + 3-still fallback, 12s challenge, 20MB cap), server-side challenge + rate limit, admin review queue with 60s signed URLs and A/R/J/K shortcuts, approve/reject/retake with audit + email | ✅ |
| **M4 — Trust & safety:** reports with priority routing + admin email, blocking with block-aware feed, host removals (rate-limited, logged), moderation ladder (`restrict_posting`/`restrict_joining`/`suspend`/`ban`/`clear` enforced in `claim_slot`/`create_gig`), admin `/reports` `/flags` `/users/[id]` (co-occurrence, blocks-received, friend-request ratio) | ✅ |
| **M5 — Friends:** post-gig `Add` (only entry point, R9-gated), `/me/friends` (accept-only, no decline, vague outgoing, why-no-DMs), friend-hosted gigs in the feed, host `Invite` (no slot held) | ✅ |
| **M6 — Venues & partners:** Places (New) autocomplete + details via session-token proxy, server-side photo proxy w/ attribution, residential rejection, venue picker in create-gig, partner perk in lobby + host redeem, `/spot/[slug]` no-login redemption, `/admin/partners` report + CSV, `/admin/venues` partner toggle | ✅ (needs a Google key — see §6) |
| **M7 — Polish:** banned-patterns audit (clean — no gradients/glassmorphism/soft-shadows/fake social proof), feed page-load stagger, product copy extracted to `lib/copy.ts`, verified landing at 375px, global focus-visible + `prefers-reduced-motion` | ✅ |

**All seven milestones (M0–M7) are built.** Remaining work is post-v1 (self-serve venue billing/PayHere, sponsored gigs, staked deposits) and the seeding *operations*, not build milestones.

`pnpm typecheck` (or `npx tsc --noEmit`) is clean and `next build` succeeds.

---

## Prerequisites

- Node 20.19+ / 22.13+ (repo built on Node 22).
- npm (or pnpm — `CLAUDE.md` uses `pnpm`; both work, scripts are the same).
- A Supabase project (cloud) **or** the Supabase CLI + Docker for local.

## 1. Install & env

```bash
npm install
cp .env.example .env.local
```

Fill `.env.local` from **Supabase → Project Settings → API**:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — safe for the browser.
- `SUPABASE_SERVICE_ROLE_KEY` — **server-only**. Never prefix with `NEXT_PUBLIC_`. It's only ever imported by `lib/supabase/admin.ts` (guarded by `server-only`), route handlers, and Edge Functions.

Then:

```bash
npm run dev
```

---

## 2. Create the database

Two paths. **Local CLI** is the intended dev loop; **Dashboard SQL** is the copy-paste path for a cloud project.

### Path A — Local, with the Supabase CLI (recommended)

```bash
supabase start                 # boots Postgres, Auth, Storage, Studio in Docker
supabase db reset              # runs every migration in supabase/migrations, then seed.sql
```

`db reset` applies the numbered migrations in order and then `supabase/seed.sql` (the activity taxonomy). That single command builds the whole schema. Regenerate the DB types afterwards:

```bash
npm run gen:types              # supabase gen types typescript --local > lib/database.types.ts
```

> `lib/database.types.ts` is currently **hand-authored** so the app typechecks before the stack is up. Once `supabase start` works, regenerate it — the generated output is authoritative.

Local Studio: <http://localhost:54323>. Local API: <http://localhost:54321>.

### Path B — Cloud project, Dashboard SQL editor

If you're not using the CLI, run the migrations **in order** in **Supabase → SQL Editor**. Paste and run each file's contents, one at a time, top to bottom:

```
supabase/migrations/0001_init_extensions_enums.sql
supabase/migrations/0002_core_tables.sql
supabase/migrations/0003_trust_tables.sql
supabase/migrations/0004_social_tables.sql
supabase/migrations/0005_functions.sql
supabase/migrations/0006_rls.sql
supabase/migrations/0007_views.sql
supabase/migrations/0008_storage.sql
supabase/migrations/0009_jobs_and_cron.sql
supabase/seed.sql
```

Order matters — later files reference tables, enums, and functions created by earlier ones.

**Before `0009`**, enable the scheduler extensions in **Database → Extensions**: turn on **`pg_cron`** and **`pg_net`**. `0009` is written to no-op its scheduling block if `pg_cron` isn't present, so it won't error either way — but the cron jobs only get registered once `pg_cron` is on.

### What each migration does

| File | Creates |
|---|---|
| `0001` | `citext` + `pgcrypto` extensions; the 7 enums |
| `0002` | `profiles`, `activities`, `venues`, `gigs`, `gig_crew`, `gig_messages`, `checkins` (+ RLS enabled) |
| `0003` | `crew_removals`, `reports`, `moderation_actions`, `reliability_events`, `verification_requests`, `admin_audit` |
| `0004` | `friend_requests`, `friendships`, `blocks`, `perk_redemptions` |
| `0005` | signup trigger, gig-code gen, `claimed_count` trigger, `gig_is_confirmed`, and the write-path functions: `create_gig`, `claim_slot`, `leave_gig`, `remove_crew_member`, `send_friend_request`, `accept_friend_request`, `block_user`, `redeem_perk`, `recompute_reliability_band` |
| `0006` | every RLS policy (default-deny, grant-narrow) — this is where the **blind feed**, **first-come slots**, and **chat-at-confirmation** rules become structural |
| `0007` | client-facing views: `profiles_public`, `verification_requests_public`, `gig_feed`, `friend_hosted_gigs` (all `security_invoker`) |
| `0008` | storage buckets `avatars` (public), `verification` (**private**), `venues` (public) + policies |
| `0009` | `notification_outbox`, the job functions (`lock_gigs_job`, `complete_gigs_job`, `recompute_bands_job`, expiry jobs), `cancel_gig`, and `pg_cron` scheduling |
| `seed.sql` | the 24 seeded activities |

---

## 3. Make yourself an admin

There is **no UI to grant admin** (by design — `docs/07`). Set it in SQL after you've signed in once (which creates your `profiles` row via the signup trigger):

```sql
update profiles set is_admin = true
where id = (select id from auth.users where email = 'admin@trio.com');
```

Then `/admin` resolves for you and 404s for everyone else.

---

## 4. Storage

`0008` creates the buckets and policies. Nothing else to click. Key rule: the **`verification`** bucket is private — no client read policy at all. Admins read recordings only through **60-second signed URLs** minted server-side, and the `purge-verification-media` job deletes the media 7 days after review.

---

## 5. Edge Functions & scheduled jobs

The state-machine transitions run as SQL job functions scheduled by `pg_cron` (see `0009`). Two side-effecting jobs are Edge Functions:

```bash
supabase functions deploy purge-verification-media
supabase functions deploy send-emails
```

Set their secrets (server-side):

```bash
supabase secrets set CRON_SECRET=<random-string> RESEND_API_KEY=<optional>
```

Then schedule them to be hit by `pg_cron` via `pg_net` (run in SQL editor, once, replacing the URL/secret):

```sql
select cron.schedule('purge-verification-media', '0 3 * * *', $$
  select net.http_post(
    url := 'https://YOUR-REF.functions.supabase.co/purge-verification-media',
    headers := jsonb_build_object('Authorization', 'Bearer YOUR_CRON_SECRET')
  );
$$);

select cron.schedule('send-emails', '*/2 * * * *', $$
  select net.http_post(
    url := 'https://YOUR-REF.functions.supabase.co/send-emails',
    headers := jsonb_build_object('Authorization', 'Bearer YOUR_CRON_SECRET')
  );
$$);
```

The purely-SQL jobs (`lock-gigs`, `complete-gigs`, `recompute-bands`, the expiry jobs) are already registered by `0009` when `pg_cron` is enabled — verify with `select * from cron.job;`.

---

## 6. Google Places (M6 — venue picking)

The venue picker uses **Places API (New)**, fully proxied server-side so the key never reaches the browser.

1. In [Google Cloud Console](https://console.cloud.google.com/): create a project, enable **Places API (New)**, and create an API key.
2. Restrict the key to **Places API (New)** (API restriction). It's a server key — no HTTP-referrer restriction needed.
3. Put it in `.env.local` as `GOOGLE_MAPS_SERVER_KEY`. That single key powers autocomplete, place details, and the photo proxy.
4. Billing must be enabled on the project (Places has a free tier but requires a billing account).

How the cost controls work (all already implemented):
- **Session tokens** span the autocomplete keystrokes and are terminated by the Details call, so a whole search bills as **one session** (verify in the billing console: a 10-keystroke search = one session, not ten requests).
- **Field masks** on Details request only `id, displayName, formattedAddress, location, types, photos, googleMapsUri, regularOpeningHours`.
- Photos are served through `/api/place-photo` (key server-side); we store only photo **references** + attribution, never image bytes, and Google's attribution renders alongside every photo.
- A venue already in `venues` with fresh `photos_refreshed_at` (< 30 days) is reused **without** a new Details call.

Residential addresses are rejected at creation (R7). Without the key, the picker's search returns nothing — the rest of the app still runs.

## Commands

```bash
npm run dev            # local dev
npm run typecheck      # tsc --noEmit — must pass before a task is "done"
npm run lint
npm run build          # production build
npm run gen:types      # regenerate lib/database.types.ts from the local DB
```

## The hard rules (from `CLAUDE.md`, enforced here)

1. **RLS on every table.** No exceptions — see `0006`.
2. **Service role key never reaches the browser.** `lib/supabase/admin.ts` is `server-only`.
3. **Every admin action re-checks `is_admin` server-side.** The layout guard is not authorisation.
4. **Capacity is enforced in the DB, not the UI.** `claim_slot()` row-locks the gig.
5. **Verification media is never publicly readable.** Private bucket, 60s signed URLs, auto-purged.
6. **No `any`.** DB types are generated (or the hand-authored stand-in) and used everywhere.
7. **Mutations are server actions / route handlers**, going through the security-definer functions.
8. **Every user-facing string lives in `lib/copy.ts`.**

## Open questions for the human (from `docs/00`)

- Final product name and domain (rename `lib/brand.ts`).
- Which city to seed first (Colombo assumed).
- Whether to require phone auth in addition to email.
