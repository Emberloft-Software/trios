# Tremigos

**Plans need people. Find your crew.** A group-meetup web app and installable PWA for Sri Lanka: post a gig (futsal, coffee, a hike, quiz night), people nearby claim the spots, you meet up — in groups of three or more, always somewhere public. Deliberately **not** a dating app.

Stack: Next.js 15 (App Router, TS strict) · Tailwind v4 · Supabase (Postgres, Auth, Storage, Realtime) · on-device MediaPipe face detection · PWA (manifest + service worker).

---

## Features

**For members**
- Email + password sign-up with **name, username, date of birth (18+ only), gender** and Terms/Privacy acceptance.
- **Discover** feed filtered by category, showing only gigs whose **age range and audience** (everyone / women only / men only) include you. Gigs outside your audience are invisible (enforced by row-level security, not just the UI).
- **Post a gig** in four steps: activity, details + Google Places venue, audience (age range + gender), group size and **"bringing people you know?"** (held seats).
- **Invite link** (`/join/<code>`) for the friends you're bringing — they join the gig and its chat even if they're outside the audience filter. Everyone sees "Host +2 — join at your own risk".
- **Group chat** (realtime) that opens once the gig is on, with a permanent "don't share numbers / don't follow links" disclaimer, a warning before you send a phone number or link, and labels on received ones.
- **Vote to remove** someone from the chat for bad behaviour — anonymous to the crew, needs a majority of the other members (min 2 votes), and auto-files a report for admins.
- Report, block, two-door leave ("something came up" / "I didn't feel comfortable"), check-ins, reliability bands, friends, in-app **Activity** notifications.
- **Profile photo** upload with an on-device face check (no face / several faces is refused immediately); photos only appear after an admin approves them.
- **Live video verification** rebuilt for phones and the installed app (see below).
- Delete-my-account, Terms of Service, Privacy Policy (PDPA-aware), Safety page.

**For admins (`/admin`)**
- Dashboard with queue counts, gigs at risk, recent audit log.
- **Face verification** console: recording beside the profile photo, the exact challenge (code + actions), device + face-in-frame ratio, playback speed, approve / reject / retake with keyboard shortcuts, decision history.
- **Profile photos** queue with the face-check score; approve or reject (rejected files are deleted).
- Reports (priority pinned, crew-vote removals tagged), red flags, users (moderation ladder, force-verify, correct age/gender, take down photo, grant admin), gigs (cancel), venues, partners.

### Why verification works on phones now
- Camera starts with progressively simpler constraints (handles iOS/Android quirks and missing mics), the preview element is always mounted with `muted` + `playsInline`, and backgrounding the app mid-recording is detected.
- Records **mp4 first** (iOS Safari + plays everywhere), falls back to webm, then to photo stills.
- Uploads go **straight to storage through a one-shot signed upload URL** with a progress bar — no storage-RLS policy for the browser session to trip over (that was the old failure). Falls back to the Supabase client if the first attempt fails.
- Live "face in frame" guidance via on-device MediaPipe.
- Must be served over **HTTPS** (Vercel, or a tunnel when testing on a phone) — browsers block the camera on plain http except `localhost`.

### Install as an app
`/manifest.webmanifest` + `/sw.js` (network-first pages with an offline page, cache-first static assets; never caches API/auth). Android/desktop get a native install prompt; iPhone users get Share → Add to Home Screen instructions. The service worker only registers in production builds.

---

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

`.env.local` needs (see `.env.example`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only), `GOOGLE_MAPS_SERVER_KEY` (Places API New, server-only), `NEXT_PUBLIC_SITE_URL`.

Database: migrations in `supabase/migrations/0001–0018` + `supabase/seed.sql` are already applied to the hosted project. See [`supabase/README-ops.md`](supabase/README-ops.md) for applying new ones, the admin allowlist, auth/SMTP settings and scheduled jobs.

Before shipping changes: `npm run typecheck` and `npm run build`.

## Deploying (Vercel)

1. Import the repo, add the env vars above (set `NEXT_PUBLIC_SITE_URL` to your domain).
2. In Supabase → Authentication → URL Configuration, set the Site URL and add `https://<domain>/auth/callback`.
3. Sign up with an allow-listed admin email, then open `/admin`.
