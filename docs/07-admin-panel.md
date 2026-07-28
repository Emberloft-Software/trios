# 07 — Admin panel

Lives at `/admin` inside the same Next.js app. No separate deployment.

## Access control

Two independent gates, both required:

1. `middleware.ts` redirects unauthenticated requests away from `/admin/*`.
2. `app/admin/layout.tsx` fetches the profile server-side and 404s (not 403 — don't confirm the route exists) if `is_admin` is false.

Additionally, **every admin server action re-checks `is_admin` itself**. Layout guards are not authorisation; a server action is directly invocable.

Admin data access goes through `lib/supabase/admin.ts` using the service role key, server-side only. `is_admin` is set manually in SQL. There is no UI for granting admin, and there shouldn't be.

## Routes

| Route | Purpose |
|---|---|
| `/admin` | Dashboard — queue counts, today's gigs, open flags |
| `/admin/verifications` | Liveness review queue |
| `/admin/reports` | Report queue, priority-sorted |
| `/admin/flags` | Auto-flagged behaviour patterns |
| `/admin/users` | Search, inspect, apply moderation actions |
| `/admin/users/[id]` | Full user view |
| `/admin/gigs` | All gigs, filter by status; cancel or edit any |
| `/admin/venues` | Venue CRUD, partner flags, perk text |
| `/admin/partners` | Partner performance — crews sent, perks redeemed |

## Dashboard

Five numbers, big, mono: pending verifications · open reports · unresolved flags · gigs today · gigs at risk (open, locking within 6h, below minimum). The last one is the operationally useful one — it's the list a human should work every day during the seeding phase, manually nudging people into under-filled gigs. Make it a linked list, not just a count.

## Verification queue

Covered in `05-verification.md`. Key requirements repeated because they're easy to miss:

- Video plays from a 60-second signed URL minted per view by a server route handler. Not stored in page props, not cached.
- The issued challenge is displayed beside the video. Without it the reviewer cannot do the check.
- Approve / Reject (with reason) / Request retake.
- Keyboard shortcuts: `A` approve, `R` reject, `J`/`K` next/previous. This queue is repetitive and volume matters.

## Reports queue

Priority items (`threat_or_violence`, `underage`, `sexual_advance`) pinned to the top with a `--color-tape` marker. Each report shows the reporter, target, gig context, the lobby chat transcript if a gig is attached, and both users' recent history.

Resolution: `actioned` (opens the moderation action form) or `dismissed` (requires a note). Both write to `reports.resolution` and are permanent.

## User view

One page, everything: profile, verification history, gigs hosted and joined, reliability events, removals given and received, reports filed and against, moderation history.

The two panels that actually catch problems:

- **Co-occurrence** — other users this person has shared gigs with, ranked by count. Repeated overlap with one person is the clearest signal of someone using the app to get near a specific individual.
- **Removals given** — for hosts. Three removals in a month is a pattern, not bad luck.
- **Friend request ratio** — sent, accepted, ignored. A high send rate with a low acceptance rate is the clearest tell that someone is working the room rather than making friends.
- **Blocks received** — the quietest and most reliable signal in the app. People block far more readily than they report, so a rising block count usually precedes the first report by weeks.

Actions: apply any step of the moderation ladder, force-verify, revoke verification, reset reliability band (with a note).

## Venues and partners

Venue CRUD with Google Places lookup to fill address and coordinates. Toggle `is_partner`, set `partner_perk` text and `partner_since`.

The partners page is the one you show to a venue owner when renewing. Per venue: gigs hosted there, total people sent, perks redeemed, trend over the last 8 weeks. This report is the product being sold — see `08-monetization.md`. Make it exportable as CSV.

## Everything an admin does is logged

Any state change from `/admin` writes a row identifying the admin, the target, the action, and the reason. `moderation_actions` covers user actions; add an `admin_audit` table for the rest (verification decisions, gig cancellations, venue edits). Admin power over a safety product needs its own audit trail.
