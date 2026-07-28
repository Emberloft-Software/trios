# CLAUDE.md — Trio

> **Trio** is a working codename. Rename before launch; it appears only in `lib/brand.ts` and copy files.

Group-meetup web app for Sri Lanka. People post a "gig" (badminton, movie, board games, coffee), other people claim slots, they meet in real life. Minimum three humans, always. It is deliberately **not** a dating app.

This file is the entry point. Read `docs/00-start-here.md` next — it gives the build order and tells you which doc to open for each task.

---

## Stack (fixed — do not substitute)

| Layer | Choice |
|---|---|
| Framework | Next.js 15, App Router, TypeScript `strict` |
| Styling | Tailwind CSS v4 (CSS-first config, `@theme` in `globals.css`) |
| Backend | Supabase — Postgres, Auth, Storage, Realtime, Edge Functions |
| Forms/validation | `react-hook-form` + `zod` |
| Motion | `motion` (Framer Motion v11+), used sparingly — see `docs/04-design-system.md` |
| Maps | Google Maps JS API + Places Autocomplete (venue picking only) |
| Dates | `date-fns` + `date-fns-tz`. App timezone is `Asia/Colombo` |
| Deploy | Vercel |

Do not add a component library (no shadcn, no MUI, no Chakra). The visual identity in `docs/04-design-system.md` is the point of this build and generic components will destroy it. Build primitives by hand in `components/ui/`.

---

## Hard rules

These are non-negotiable. If a task seems to require breaking one, stop and flag it instead.

1. **RLS on every table. No exceptions.** A table without an enabled policy set is a bug, including join tables and log tables.
2. **The service role key never reaches the browser.** It lives in server-only code (`lib/supabase/admin.ts`, route handlers, Edge Functions). Never in a `NEXT_PUBLIC_` var, never in a client component, never in a server action that is reachable without an admin check.
3. **Every admin action re-checks admin status server-side.** Hiding the nav link is not access control.
4. **Capacity is enforced in the database, not the UI.** Slot claiming goes through a Postgres function with row locking. See `docs/02-data-model.md` § Claiming a slot. A client-side "is it full?" check is a race condition, and this app's core promise is that slots are honest.
5. **Verification media is never publicly readable.** Private bucket, short-lived signed URLs, admin-only, auto-purged. See `docs/05-verification.md`.
6. **No `any`.** Generate DB types with `supabase gen types typescript --local > lib/database.types.ts` and use them.
7. **Mutations are server actions or route handlers.** No direct table writes from client components.
8. **Every user-facing string lives in `lib/copy.ts`**, not inline in JSX. The voice is a product feature and it needs to be editable in one place. See `docs/09-copy-and-legal.md`.

---

## Project structure

```
app/
  (marketing)/            landing, about, safety, terms
  (app)/                  authenticated shell
    feed/                 browse open gigs
    gigs/[id]/            lobby view
    gigs/new/             create a gig
    me/                   profile, my gigs, verification status
  admin/                  admin-only; layout guards on role
  api/                    route handlers (webhooks, signed URLs)
components/
  ui/                     hand-built primitives (Button, Card, SlotStrip, ...)
  gig/                    gig-specific composites
lib/
  supabase/               server.ts, client.ts, admin.ts, middleware.ts
  copy.ts                 all user-facing strings
  brand.ts                name, taglines, colors as TS constants
supabase/
  migrations/             numbered SQL migrations
  functions/              edge functions (purge-media, lock-gigs, ...)
docs/                     the specs — read before building
```

---

## Conventions

- Server Components by default. `"use client"` only where there is real interactivity.
- Mutations: server actions in `_actions.ts` colocated with the route. Always `zod`-parse input at the top of the action.
- Naming: DB is `snake_case`, TypeScript is `camelCase`, components are `PascalCase`, routes are `kebab-case`.
- Times are stored `timestamptz` (UTC) and rendered in `Asia/Colombo`. Never store naive timestamps.
- Money is stored in **LKR cents** as `bigint`. Never floats.
- Migrations are additive and numbered. Never edit an applied migration.

## Commands

```bash
pnpm dev                # local dev
pnpm typecheck          # tsc --noEmit — must pass before you call a task done
pnpm lint
supabase start          # local stack
supabase db reset       # re-run all migrations + seed
supabase gen types typescript --local > lib/database.types.ts
```

## Before you call any task done

- `pnpm typecheck` passes.
- New tables have RLS policies and you have stated in your summary what they are.
- New UI works at 375px wide, has visible keyboard focus, and respects `prefers-reduced-motion`.
- No new hardcoded user-facing strings outside `lib/copy.ts`.
