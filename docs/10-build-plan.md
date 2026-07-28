# 10 — Build plan

Seven milestones. Each is demoable. Don't start one before the previous one's acceptance criteria pass.

---

## M0 — Foundation

Next.js 15 + Supabase local, auth via email OTP, `profiles` with signup trigger, app shell, design tokens, and the SlotStrip.

**Acceptance**
- Sign up, get a `profiles` row, sign out, sign in.
- `globals.css` has the full `@theme` token block from `04-design-system.md`; the three fonts load.
- `<SlotStrip />` renders in both `blind` and `crew` variants at capacities 3–12, wraps at 375px, and springs on fill.
- `pnpm typecheck` clean.

---

## M1 — Gigs core

The heart of the product. Nothing else matters if this is wrong.

Create a gig (with `create_gig()` inserting host as position 1 in one transaction), the feed, gig preview, `claim_slot()`, lobby, leave.

**Acceptance**
- A gig cannot be created with capacity < 3 — rejected by the DB, not just the form.
- **Concurrency test, required:** fire 10 simultaneous `claim_slot()` calls at a gig with 1 free slot. Exactly one succeeds; nine get `gig_full`. Write this as a test and keep it.
- Feed shows no crew identity anywhere — verify by inspecting the network response, not just the UI. If crew names appear in the JSON, the RLS policy is wrong.
- A non-crew user querying `gig_crew` directly with an anon key gets zero rows.
- Joining reveals crew and opens the lobby.
- `claimed_count` is never written by application code.

---

## M2 — Lifecycle and chat

State machine, `lock-gigs` and `complete-gigs` jobs, realtime lobby chat, check-in, cancellation, the two leave doors, email notifications.

**Acceptance**
- A gig with 2 crew at `locks_at` cancels with reason `under_filled`, notifies both, and creates no reliability events.
- A gig with 3 crew locks; joining is refused after; the address and faces reveal.
- A locked gig that drops to 2 **still runs**. There is no code path that re-cancels after locking.
- Check-in resolves attendance by the 2-of-N rule.
- A gig where nobody checks in completes with zero reliability events.
- Leaving via "I didn't feel comfortable" produces no penalty at any timing and files a report.
- **Chat is unreachable below minimum crew.** With 2 people in a lobby, a direct insert into `gig_messages` with that user's own token is rejected by RLS — not just hidden in the UI. Test this with the client key, not the service role.
- Chat opens for all crew simultaneously at confirmation, with a system message, and Realtime delivers to every connected member.
- Confirmation and locking are separate events: a gig can be confirmed with chat open and still accepting slots.
- Chat is read-only after completion.

---

## M3 — Verification

Liveness capture, submission, admin queue, badge, purge job.

**Acceptance**
- Capture works in Chrome and Safari, desktop and iOS. The mime type is feature-detected, not hardcoded.
- Fallback to three stills fires when `MediaRecorder` is unavailable.
- Challenge is server-generated, expires in 10 minutes, and is displayed to the reviewer.
- **Media is unreachable without a signed URL.** Test with the anon key against the bucket directly; expect failure.
- Signed URLs expire in 60 seconds.
- Purge job deletes media 7 days post-review and stamps `media_purged_at`.
- Rate limit holds at 3 attempts per 24h, enforced server-side.

---

## M4 — Trust

Reliability bands, host removals with audit and rate limits, reports with priority routing, the moderation ladder, the flags view.

**Acceptance**
- Bands compute from the last 10 gigs only.
- No numeric score is exposed anywhere in the API response or the UI.
- Removals require a reason, reopen the slot, log permanently, and stop at 3 per 30 days.
- A host hitting 3 removals in 30 days appears in `/admin/flags` automatically.
- Priority report categories jump the queue and send an admin email.
- A suspended user is blocked at `claim_slot()` and `create_gig()`, not just in the UI.
- Blocking deletes the friendship, cancels requests both ways, and hides gigs in both directions.
- **A blocked user attempting to join a gig containing their blocker receives `gig_full`** — byte-identical to a genuinely full gig. No distinguishable error, no timing difference worth noticing.

---

## M5 — Friends

Post-gig requests via `send_friend_request()`, acceptance, friend-hosted gigs in the feed, invites, unfriend.

**Acceptance**
- A friend request to someone you shared a *lobby* with but were not both marked `attended` alongside is rejected by the DB function.
- There is no Add button anywhere except the post-completion gig summary. Grep the codebase to confirm.
- There is **no decline action**. Ignoring expires the request at 14 days, and the sender's view of expired and declined is identical.
- Re-requesting the same person inside 90 days is rejected.
- `friend_hosted_gigs` returns gigs a friend **hosts** and never gigs a friend has **joined**. Test with a friend who joined someone else's gig; expect zero rows.
- An invited friend gets no slot advantage — a concurrency test with an invitee and a stranger claiming the last slot simultaneously has no bias toward the invitee.
- **No endpoint anywhere accepts a message with a recipient user id.** There is no 1:1 messaging surface. If one appears, the feature has drifted.

---

## M6 — Venues and partners

Places search with photos, session-token autocomplete, residential rejection, partner highlighting, perk display, `/spot/[slug]` redemption, partner report.

**Acceptance**
- Residential place types are rejected at creation with the explanatory copy.
- Partner perk appears in the lobby after lock, with the gig code.
- Redemption writes exactly one `perk_redemptions` row per gig — the unique constraint holds under a double submit.
- `/admin/partners` shows crews sent, people sent, perks redeemed, 8-week trend, CSV export.
- Autocomplete uses a session token terminated by the Details call. Verify in the billing console that a 10-keystroke search bills as one session, not ten requests.
- Details calls use a field mask; no unused fields requested.
- Place photos are served through the proxy route with the Maps key server-side, and Google's attribution renders alongside every photo.
- No Google photo bytes are stored in our database or buckets — only `photo_refs` and attribution.

---

## M7 — Polish

Landing page, empty states, motion pass, mobile pass, accessibility pass, copy pass.

**Acceptance**
- Landing hero is the live pinned board with an animating SlotStrip — not a headline-and-two-buttons block.
- Zero banned patterns from `04-design-system.md`. Re-read that list and audit the built pages against it, one by one.
- Every page usable at 375px.
- Full keyboard traversal with visible focus.
- `prefers-reduced-motion` kills all motion including the slot spring.
- No user-facing string outside `lib/copy.ts`.
- No fabricated social proof anywhere.

---

## Seeding, not a milestone but the actual make-or-break

The app can be perfect and still die because three people are never free in the same place at the same time. Plan for this as work, not as growth:

- One city. Colombo only.
- Two activities to start — pick the two with the most existing informal demand (badminton and board games are the likely candidates; check before committing).
- Manually host the first ~20 gigs yourself. The `/admin` "gigs at risk" list is the daily operational tool for this.
- Don't open a third activity until the first two fill reliably without intervention.
