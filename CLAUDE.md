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
9. **User-facing strings live in `lib/copy/`** (one file per area, merged in `lib/copy/index.ts`; legal text in `lib/legal/`). Admin-only screens may inline strings.
10. **No source file over 200 lines** (TS/TSX/CSS/SQL). Split by responsibility. Exempt: the generated `lib/database.types.ts`.
11. **Never call `router.refresh()` after a server action that already `revalidatePath`s the current page** — it doubles the round trip. For realtime/background refreshes use `useCalmRefresh()` (`lib/useCalmRefresh.ts`), never raw bursts of `router.refresh()`.

---

## Product rules worth knowing

- **Audience:** gigs carry `age_min/age_max/gender_pref`. RLS hides gigs whose audience doesn't include the viewer; `claim_slot` re-checks. Hosts must fit their own audience.
- **Bringing friends:** `host_guests` (declared) + `reserved_slots` (seats still held). `headcount = claimed_count + reserved_slots`. Each held seat has its own **single-use** link in `gig_invites` (`/join/<code>`); no guests → no links. Redeeming skips the audience filter, consumes the seat, and posts a `guest_joined` system message. The host can cancel unused links (seat goes public). Feed/lobby warn "join at your own risk".
- **Chat AND photos unlock** only when every spot is filled by people who actually joined (`claimed_count >= capacity`), or when the gig locks 2h before start. Sticky via `gigs.chat_opened_at`. Photos are hidden structurally by `can_see_face()` inside `profiles_public` (self, admin, friends, or a shared unlocked gig). Lobbies listen to their `gigs` row over realtime to flip open instantly.
- Client warns before sending phone numbers/links in chat and labels received ones.
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

Migrations (`0001`–`0019`, big ones split into `_partN` files) were applied to the hosted project with `psql` (see `supabase/README-ops.md`). Never edit an applied migration — add a new numbered one.

## Before you call any task done

- `npm run typecheck` passes (and `npm run build` for anything structural).
- New tables have RLS + explicit grants; new functions have explicit `grant execute`.
- UI works at 375px, has visible focus, respects `prefers-reduced-motion`.
- No hardcoded user-facing strings outside `lib/copy.ts`.
