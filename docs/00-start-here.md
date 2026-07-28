# 00 — Start here

## What these docs are

A scoped spec pack for building Trio. Each doc is self-contained and owns one area. Read the one that covers your task; don't read all of them for every task.

| Doc | Owns | Open it when |
|---|---|---|
| `01-product-spec.md` | What the product is, the rules that define it, non-goals, glossary | Any time you're unsure whether a feature belongs |
| `02-data-model.md` | Postgres schema, RLS, storage buckets, the slot-claiming function | Writing migrations or any DB access |
| `03-lifecycle-and-flows.md` | Gig state machine, join flow, check-in, cancellation | Building gig logic or a user flow |
| `04-design-system.md` | Palette, type, tokens, the signature component, banned patterns | Building any UI |
| `05-verification.md` | Browser liveness capture, review queue, media handling | Building verification |
| `06-trust-and-safety.md` | Reliability bands, removals, reports, moderation ladder | Building trust features |
| `07-admin-panel.md` | Admin routes, permissions, queues | Building `/admin` |
| `08-monetization.md` | Venue partner model and what to build now vs later | Building venues or partner features |
| `09-copy-and-legal.md` | Voice, microcopy, terms, community rules | Writing any user-facing text |
| `10-build-plan.md` | Milestones and acceptance criteria | Deciding what to build next |

## Build order

Build in this order. Each milestone should be demoable on its own.

1. **M0 — Foundation.** Next.js + Supabase wired, auth (email OTP), `profiles` table, empty app shell, design tokens in `globals.css`, the `SlotStrip` primitive.
2. **M1 — Gigs core.** Create a gig, browse the feed, claim a slot via the DB function, lobby page, leave a gig. This is the heart; get it right before anything else.
3. **M2 — Lifecycle & chat.** State machine, lock-at-T-minus, auto-cancel under-filled gigs, realtime lobby chat gated on confirmation, check-in, completion.
4. **M3 — Verification.** Liveness capture, submission, admin review queue, verified badge, media purge job.
5. **M4 — Trust.** Reliability bands, host removals with audit log, reports, blocking, moderation ladder.
6. **M5 — Friends.** Post-gig friend requests, friendships, friend-hosted gigs in the feed, invites.
7. **M6 — Venues & partners.** Places search with photos, partner venues, perk redemption tracking.
8. **M7 — Polish.** Landing page, empty states, motion pass, mobile pass, accessibility pass.

Full acceptance criteria per milestone are in `10-build-plan.md`.

## Decisions already made — do not relitigate

These were settled deliberately. Each has a reason, given here so you don't "improve" them back into the problems they solve.

- **No host approval of individuals.** Slots are first-come-first-served. Hosts cannot see or choose from a queue of applicants. *Reason: any per-person approval power lets a host cherry-pick who they find attractive and reject everyone else, which reintroduces dating dynamics into a platonic product.*
- **Minimum 3 people to form a gig.** *Reason: three people cannot be a romantic pair, and the third person is a witness. It also makes the 2-of-N check-in rule work.*
- **A gig still runs if it drops to 2 after locking.** *Reason: auto-cancelling on one no-show punishes the people who actually showed up.*
- **No public rating number.** Reliability is a coarse private band. *Reason: public scores punish people who leave a meetup because they felt unsafe, and become a retaliation tool.*
- **Browsing the feed does not show who has joined.** *Reason: stops people joining a gig because of who's in it rather than what it is.* Faces are revealed to co-members once a gig confirms — see `01-product-spec.md` § The face rule.
- **No ID/NIC verification.** *Reason: legal uncertainty around collecting national ID data. Liveness only.*
- **Lobby chat opens at confirmation (3 people), not at join.** *Reason: a chat with two people in it is a private one-to-one thread between strangers, which is the thing the minimum-crew rule exists to prevent.*
- **Friends exist, but there is no one-to-one messaging.** Friendship means their gigs surface in your feed and you can invite them to yours. *Reason: private threads turn a friendship app into a dating app, and would make the min-3 structure decorative.*
- **A friend request requires having attended a gig together.** *Reason: it makes friending a consequence of meeting, not a browsing or selection mechanism.*
- **Nothing social touches slot ordering.** Invites don't hold slots. *Reason: same reason there's no host approval — any way to reserve a place for a chosen person reopens cherry-picking.*
- **Not integrated with Pearmo.** Separate app, separate database, separate brand.

## Open questions for the human

Flag these rather than deciding alone:

- Final product name and domain.
- Which city to seed first (Colombo assumed throughout).
- Whether to require phone auth in addition to email.
