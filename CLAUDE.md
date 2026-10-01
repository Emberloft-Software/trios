# CLAUDE.md — Tremigos

**Tremigos** (formerly the "Trio" codename) is a group-meetup web app + installable PWA for Sri Lanka. People post a "gig" (futsal, coffee, a hike), others claim spots, they meet in real life. Minimum three humans, always, in public places. It is deliberately **not** a dating app.

`docs/` holds the original Trio-era spec pack. It is background reading only — where it disagrees with this file or the code (branding, design system, glassmorphism ban, schema), **this file and the code win**.

---

## Stack (fixed)

| Layer | Choice |
|---|---|
| Framework | Next.js 15 App Router, TypeScript `strict` |
| Styling | Tailwind CSS v4, CSS-first tokens in `app/globals.css` `@theme` |
| Icons | `lucide-react` (icons only — still no component library) |
| Backend | Supabase — Postgres, Auth (email+password), Storage, Realtime |
| Face detection | `@mediapipe/tasks-vision` BlazeFace, on-device (model in `public/models`) |
| PWA | `app/manifest.ts`, `public/sw.js`, `components/pwa/*` |
| Dates | `date-fns` + `date-fns-tz`, app timezone `Asia/Colombo` |
| Deploy | Vercel (HTTPS is required for the camera) |

## Design system

Palette comes from the logo: coral `#FF3450` (primary), sunshine `#FFBA30`, plum `#360253` (text/dark surfaces), cream `#FBF8F3`. Font: Plus Jakarta Sans. Surfaces are frosted glass (`glass`, `glass-strong`, `glass-dark` utilities) floating over the fixed `.ambient` colour blobs in `app/layout.tsx`; hero/dark panels use `bg-hero`. Primitives live in `components/ui/` (Button, Card, Field, Badge, Avatar, Notice, Sheet, SlotStrip, Logo, EmptyState). Base element styles are inside `@layer base` so Tailwind utilities can override them — keep it that way.

Brand assets: `public/brand/` (mark, wordmarks, og.png), `public/icons/` (PWA + maskable), `app/icon.png`, `app/apple-icon.png`, `app/favicon.ico`. They were cut from the supplied logo artwork.

---

## Hard rules

1. **RLS on every table.** Base `profiles` is own-row only; other people are read through the `profiles_public` view. New tables need policies.
2. **Service role key never reaches the browser.** Only `lib/supabase/admin.ts` (server-only), route handlers, server actions after an admin check.
3. **Every admin action re-checks admin server-side** (`adminContext()` in `app/admin/_lib.ts`, `requireAdminId()` in `lib/auth.ts`).
4. **Capacity, audience filters, invite seats, votes are enforced in Postgres** (security-definer functions in `supabase/migrations/0002_functions.sql`), never only in the UI.
5. **Verification media is private.** Uploads go through one-shot signed upload URLs; admins watch via 60-second signed URLs; media is purged 7 days after review.
6. **Privileges are explicit.** `0003` revokes table/function access and grants back narrowly (column-level `update` grants on `profiles`/`gigs`). Any new function must be granted explicitly — nothing is callable by default.
7. **No `any`.** Types come from `npm run gen:types` (`scripts/gen-types.mjs`, which also tightens view nullability).
8. **Mutations are server actions or route handlers.**
9. **User-facing strings live in `lib/copy.ts`** (legal text in `lib/legal.ts`). Admin-only screens may inline strings.

---

## Product rules worth knowing

- **Audience:** gigs carry `age_min/age_max/gender_pref`. RLS hides gigs whose audience doesn't include the viewer; `claim_slot` re-checks. Hosts must fit their own audience.
- **Bringing friends:** `host_guests` (what the host declared) + `reserved_slots` (seats still held). `headcount = claimed_count + reserved_slots`. The host's `/join/<invite_code>` link lets friends join (skipping the audience filter, consuming a held seat). Feed/lobby warn "join at your own risk".
- **Chat opens** when headcount ≥ `min_to_confirm` **and** ≥ 2 app members. Client warns before sending phone numbers/links and labels received ones.
- **Crew vote:** `cast_kick_vote` — majority of other claimed members, min 2 votes, host can't be voted out. Removal files a `crew_vote_removal` report for admins.
- **Photos:** uploaded as pending after on-device face check; shown only after admin approval (`avatar_path` is only ever set on approval).
- **Age/gender** are write-once for users (`complete_profile`), editable by admins with an audit row.

## Commands

```bash
npm run dev            # local dev
npm run typecheck      # must pass before calling work done
npm run build
npm run gen:types      # regenerate lib/database.types.ts from the linked project
```

Migrations were applied to the hosted project with `psql` (see `supabase/README-ops.md`). Never edit an applied migration — add a new numbered one.

## Before you call any task done

- `npm run typecheck` passes (and `npm run build` for anything structural).
- New tables have RLS + explicit grants; new functions have explicit `grant execute`.
- UI works at 375px, has visible focus, respects `prefers-reduced-motion`.
- No hardcoded user-facing strings outside `lib/copy.ts`.
