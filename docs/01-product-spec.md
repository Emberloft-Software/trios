# 01 — Product spec

## The product in one line

Post a thing you want to do with people. Three or more claim slots. You meet in real life.

## Who it's for

Adults in Colombo who want platonic company for a specific activity — not a friendship app in the abstract, but "I want to play badminton on Saturday and I need three more people." The wedge is the activity, not the friendship. Friendship is the byproduct.

## Glossary

Use these words in code, UI, and conversation. Consistency here is what makes the product legible.

| Term | Meaning |
|---|---|
| **Gig** | One planned meetup: activity + time + place + capacity. The core object. |
| **Slot** | One place in a gig. Claimed, not requested. |
| **Host** | The person who posted the gig. Occupies slot 1 automatically. |
| **Crew** | Everyone who holds a slot in a gig, host included. |
| **Lobby** | The gig's page once you're in it — crew list, chat, details, check-in. |
| **Locked** | Past the join deadline; crew is final. |
| **Check-in** | Confirming at the venue that you and the others actually showed. |
| **Verified** | Passed the liveness check and admin review. |
| **Spot** | A venue. "Partner Spot" if it's a paying partner. |
| **Friend** | Someone you attended a gig with and then mutually added. Not a follower, not a chat contact. |
| **Block** | A one-way wall. Blocked pairs never appear in each other's gigs. |

Never use: "match", "swipe", "date", "connect" as a noun. Those are dating words and they leak the wrong model into the product.

## The rules that define the product

These are product rules, not implementation details. They must hold at the database level, not just in the UI.

**R1 — Minimum crew is 3.** A gig cannot be created with capacity below 3. A gig cannot confirm with fewer than 3 claimed slots. Enforced by a `CHECK` constraint and by the lock job.

**R2 — Slots are first-come-first-served.** No approval, no queue, no host discretion over who claims. The claim is atomic and ordered by `claimed_at`.

**R3 — A host cannot filter people in advance.** The host has exactly one power over crew: `remove_for_cause` after someone has joined, which is logged, reasoned, rate-limited, and reviewable. See `06-trust-and-safety.md`.

**R4 — Once locked, the gig runs.** Even if the crew drops to 2 through no-shows or late leaves. It only auto-cancels if fewer than 3 slots are claimed *at lock time*, or if the host cancels.

**R5 — The feed is blind.** Feed and gig-preview show activity, time, place, and how many slots are filled. They do not show crew names or faces. Identity is revealed on joining.

**R6 — Reliability is never a public number.** It is one of four coarse bands, and only ever shown as a band.

**R7 — Every gig is public-place by default.** Venue must be a public location. Private residences are blocked at creation for v1. This is the main safety compensation for having removed host gatekeeping.

**R8 — Chat opens at confirmation, never before.** The lobby chat is dead until `claimed_count >= min_to_confirm`. With one or two people in a lobby, an open chat is a private one-to-one thread between strangers — a DM with extra steps, and the exact dynamic the minimum-crew rule exists to prevent. Enforced in the RLS policy on `gig_messages`, not in the UI.

**R9 — Friendship requires shared attendance.** You may only send a friend request to someone you were marked `attended` alongside on the same completed gig. Not someone you merely shared a lobby with. This makes friending a consequence of having actually met, not a browsing mechanism.

**R10 — Nothing social may touch slot ordering.** Friends get notified about each other's gigs and can be invited to them. They never get a held slot, an early window, or queue priority. Any feature that lets a host reserve a place for a specific person is a backdoor to the cherry-picking problem R2 and R3 exist to close.

## The face rule

This one is subtle and people get it wrong, so it's spelled out.

There are two separate things:

1. **Profile photo visibility** — a user setting (`face_visible`). Some people don't want their face on a browsable profile. That's allowed.
2. **Crew visibility** — once a gig confirms, every crew member sees every other crew member's face. Not optional. Not a setting.

Rationale: you are about to meet strangers in person. You need to be able to recognise them and they need to recognise you. Hiding your face from people you have agreed to meet is not privacy, it's a safety hole.

So: `face_visible = false` hides your face from the feed and public profile. It does **not** hide it from your crew. This must be stated plainly at signup and again at the moment a user toggles it off — see `09-copy-and-legal.md`.

Verification is separate again: a **Verified** user has passed liveness review, regardless of `face_visible`.

## Friends

The payoff of the product. You went bouldering with four strangers, two of them were great, and you want to do it again without starting from zero. Without this, every gig is a cold start and nothing the user builds here compounds.

It is also the most dangerous feature in the app, because a friend request is a one-to-one selection mechanism — the exact thing removed everywhere else. It is scoped tightly for that reason.

**What being friends does:**
- You see gigs your friend **hosts**, surfaced in your feed with their name attached.
- You get notified when a friend posts a gig.
- You can invite a friend to a gig you're hosting. The invite is a notification with a link. They claim the slot first-come-first-served like anyone else.
- Their name shows on a gig preview if they're hosting it — the one deliberate exception to the blind feed (R5), and only for hosts.

**What being friends does not do:**
- **No one-to-one messages.** All conversation stays in a gig lobby with three or more people. This is a deliberate v1 restriction, not an unbuilt feature. Users will ask for DMs. The moment private threads exist, the product has a dating-app inbox and the entire min-3 structure becomes decorative.
- No seeing gigs a friend has *joined*. Hosting is a public act of invitation; joining is private. Surfacing joins would let someone befriend a person and then follow them around the app.
- No slot priority, ever. See R10.

**Rules:**
- Request requires shared `attended` status on a completed gig (R9).
- Mutual. Nothing happens until accepted.
- A declined request is silent — the sender sees it expire as "no response", never "declined".
- One request per person per 90 days. No re-asking.
- Max 20 pending outgoing requests.
- Either side can unfriend at any time, silently.
- Blocking is separate and stronger — see `06-trust-and-safety.md`.

## Activity taxonomy (seed data)

Seeded, not user-created, for v1. User-created activity types produce a long tail of one-off gigs that never fill.

Sports: Badminton · Pickleball · Cricket · Football · Tennis · Swimming · Running · Cycling · Gym
Chill: Coffee · Brunch · Board games · Video games · Karaoke · Movie
Outdoors: Hike · Beach · Park walk · Photo walk
Making: Study group · Language exchange · Book club · Jam session · Co-working

Each has: `slug`, `name`, `emoji`, `default_capacity`, `category`, `is_sport`. Default capacities matter — badminton doubles defaults to 4, board games to 5, movie to 4, hike to 6.

## Non-goals for v1

Do not build these, and push back if asked to:

- Cinema seat booking or any ticketing integration. The app coordinates *who*; venues handle *seats*.
- **One-to-one messaging of any kind.** Friends exist (see above) but chat is only ever inside a gig lobby of three or more, and it dies with the gig.
- Following, public friend lists, friend counts, or any social-graph display. Your friends are yours; nobody browses them.
- Recurring gigs / clubs / groups.
- Any city outside Colombo in the feed. Density beats coverage.
- Native apps.
- Interest-based matching or recommendation algorithms. The feed is chronological + filtered.
- Anything Pearmo. Different product, different repo.
