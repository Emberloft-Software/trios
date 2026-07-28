# 03 — Lifecycle and flows

## Gig state machine

```
                 ┌──────────────────────────────┐
                 │                              │
   create ──▶ OPEN ──(locks_at, crew ≥ 3)──▶ LOCKED ──(after end)──▶ COMPLETED
                 │                              │
                 │ (locks_at, crew < 3)         │ host cancels
                 ▼                              ▼
             CANCELLED ◀───────────────────  CANCELLED
              reason:                          reason:
              under_filled                     host_cancelled

   OPEN ──(starts_at passed, never locked)──▶ EXPIRED   [shouldn't happen; safety net]
```

**OPEN** — visible in feed, slots claimable, crew can leave freely, host can edit details and cancel.

**LOCKED** — crew is final. No joining. Leaving is still *possible* (never trap someone into meeting strangers) but is recorded as a `late_leave` reliability event. Venue address is revealed. Default `locks_at` is `starts_at - 2 hours`.

**Confirmation is a separate moment from locking.** A gig confirms the instant `claimed_count` reaches `min_to_confirm` — which may be days before it locks. Confirmation is what opens the chat and reveals crew faces (R8). Locking is what freezes the crew. Don't conflate them: a gig can be confirmed and still open for two more slots.

**COMPLETED** — check-in window closed, attendance resolved, reliability events written. Lobby becomes read-only and chat is archived, then deleted after 30 days.

**CANCELLED** — terminal. Crew notified with the reason. A gig cancelled as `under_filled` produces no negative reliability event for anyone; that's the platform failing to find people, not a user failing.

### The two rules people get wrong

1. **Under-filled cancels at lock time, not at start time.** Cancelling at the start time means people have already travelled. Two hours' notice is the minimum decency.
2. **A locked gig with 3 crew that drops to 2 still runs.** Do not add a check that re-cancels below minimum after locking. The minimum is a *formation* gate, not an ongoing condition. If you find yourself writing `if (crew.length < 3) cancel()` in a post-lock path, that's the bug.

## Flow: create a gig

1. **Pick an activity.** Grid of activity tiles. This sets `default_capacity`.
2. **When.** Date + time picker, `Asia/Colombo`. Must be ≥ 3 hours from now (so `locks_at` is meaningful) and ≤ 60 days out.
3. **Where.** A real place search, not a text field. Detailed below.
4. **How many.** Capacity stepper, defaults from activity, min 3, max 12. The stepper renders a live `SlotStrip` so the host sees the shape of the crew they're building.
5. **Details.** Title, optional notes, optional cost note.
6. **Confirm.** Show the platonic-intent reminder (see `09-copy-and-legal.md`), require an explicit tick on first-ever gig only.

On submit: create the gig, insert the host as `position = 1` (inside the same transaction as gig creation, via a `create_gig()` function — the host must never be able to exist as a gig with no host), generate the `code`.

## Flow: picking a place

The venue picker is a real search with pictures, because "Havelock City Badminton Courts" with a photo and an address is a completely different proposition from a typed string someone might have made up.

1. **Search** — Places Autocomplete, `locationBias` to Colombo, radius 25km. Use a **session token** across keystrokes and terminate it with the Details call; without it you're billed per keystroke and the bill gets ugly fast.
2. **Results** — name, address, and thumbnail. Partner venues are pinned to the top of matching results with a `--color-line` flag (not a badge pill — see `04-design-system.md`).
3. **Select** → Place Details call requesting only the fields you need (`id, displayName, formattedAddress, location, types, photos, googleMapsUri, regularOpeningHours`). Requesting everything costs more per call for data you'll throw away.
4. **Residential check** — reject if `types` includes `premise`, `subpremise`, `street_address`, or `route` with no business type. Copy is in `09-copy-and-legal.md`; explain the rule, don't just fail.
5. **Upsert into `venues`** keyed on `google_place_id`, storing photo *references* and attribution rather than image bytes — see the licensing note in `02-data-model.md`.
6. **Confirm card** — photo, name, address, map preview, and the partner perk if there is one.

Rendering photos: proxy through a route handler (`/api/place-photo?ref=...`) so the Maps key stays server-side, and always render the attribution string Google returns alongside the image. Cache the proxied response for at most 30 days.

Cost control: Autocomplete session tokens, field masks on Details, debounce at 300ms, and never call Details for a place already in `venues` with a fresh `photos_refreshed_at`.

## Flow: friend requests

Available only from a **completed** gig where both people were marked `attended` (R9). The entry point is the gig's post-completion summary — "you did this with these people" — with an Add button on each crew card. There is no "add friend" button anywhere else in the app: not on a lobby crew card, not on a profile, not in search.

- Send → `send_friend_request()`. Errors map to copy: `no_shared_attendance`, `recently_asked`, `too_many_pending`, `not_available`.
- Recipient gets one notification. Accept or ignore. **There is no decline button** — ignoring lets it expire in 14 days, and the sender cannot distinguish that from a decline. Making rejection an explicit act people have to perform is how you get resentment and re-asking.
- Accept → `friendships` row, both notified.
- After acceptance: friend-hosted gigs surface in the feed via `friend_hosted_gigs`, and the friend becomes invitable when hosting.

**Inviting a friend to a gig you host:** pick from your friend list, they get a notification with a link. It does not hold a slot (R10). If the gig fills before they act, they miss it, same as anyone. Say that plainly in the invite so nobody thinks a place is being kept.

**Unfriend** is silent and immediate. **Block** is stronger — see `06-trust-and-safety.md`.

## Flow: browse and join

**Feed** — chronological, soonest first. Filters: activity category, date range, distance. Each row is a gig card showing activity, title, time, place label, cost note, and the `SlotStrip` with **anonymous filled sockets** — filled sockets are solid shapes, not avatars.

**Gig preview** (before joining) — full details, map pin, host's *first name and reliability band only*. No photo, no full profile, no crew list. This is R5 and it is the thing that stops people joining because of who's in it.

**Join** — one tap, calls `claim_slot()`. On success: navigate to the lobby, reveal crew, post a system message. On failure, map the exception to copy:

| Exception | What the user sees |
|---|---|
| `gig_full` | "Someone got the last slot a second before you. There are other gigs on." |
| `gig_locked` | "Joining closed two hours before start. Catch the next one." |
| `already_in_crew` | "You're already in this one." |
| `account_restricted` | "Your account can't join gigs right now. Check your email." |

## Flow: the lobby

Sections, in order:

1. **Header** — activity emoji, title, `SlotStrip` (now with faces), gig code.
2. **When & where** — time, countdown to lock, map, address (full address only shown once locked or if the venue is public and named).
3. **Crew** — cards with face, first name, reliability band, verified badge. Tap for a limited profile.
4. **Chat** — realtime group chat, open only once the gig has confirmed (R8).

   - Supabase Realtime `postgres_changes` on `gig_messages`, filtered by `gig_id`. Realtime honours RLS, so an unconfirmed lobby genuinely receives nothing.
   - **Before confirmation:** the chat panel is visible but inert, showing how many more people are needed. Copy in `09-copy-and-legal.md`. Don't hide the panel entirely — seeing the locked chat is part of what makes people want the gig to fill.
   - **At confirmation:** chat opens for everyone at once with a system message. Faces reveal at the same moment. This is the app's best moment; give it the SlotStrip's confirm animation and a distinct notification.
   - Optimistic send with rollback on failure. Group by sender for consecutive messages. Show a small realtime presence row ("3 here now") — presence channel, not stored.
   - System messages (`system_kind`) for: confirmed, joined, left, removed, locked, venue changed.
   - Contact-detail soft-block applies until the gig locks — see `06-trust-and-safety.md`.
   - Chat is read-only once the gig completes, and deleted 30 days later.
5. **Actions** — Leave gig · Report someone · (host only) Edit, Cancel, Remove someone.

## Flow: check-in

Window opens at `starts_at - 15min` and closes at `starts_at + duration + 3h`.

The prompt is deliberately framed as **"who's here?"**, not "did anyone flake?" — you confirm presence, you don't accuse absence. Each crew member sees the crew list and taps everyone they can see. That writes `checkins` rows.

At resolution (`complete-gigs` job):

- Confirmed by ≥ 2 others → `attended`, `reliability_events(kind='attended')`.
- Not confirmed by ≥ 2 others, and didn't leave before lock → `no_show`, `reliability_events(kind='no_show')`.
- Left after lock but before start → `late_leave`, lighter weight.
- Left before lock → nothing recorded. Changing your mind early is fine and should cost nothing.

**Nobody checks in at all** → the gig resolves as `completed` with zero events. Do not punish a crew for not using the feature. Silence is not evidence.

## Flow: leaving and the "I felt unsafe" path

Leaving always offers two doors:

- **"Something came up"** → normal leave. Recorded per the rules above.
- **"I didn't feel comfortable"** → leave with no reliability penalty regardless of timing, and it opens a report form. This is routed to admin as a safety signal, and it is never surfaced to the host or crew as a reason.

This distinction is the entire reason there is no public rating. A person who leaves because they felt unsafe must never take a visible hit for it.

## Notifications (v1: email only)

Transactional email via Supabase Auth's provider or Resend. Send on: gig confirmed (hit minimum), gig locked with final crew and address, gig cancelled, someone removed you, check-in window open, verification approved/rejected.

Do not send: "someone new joined your gig" for every join. That is noise and it also encourages hosts to watch who's joining, which is the dynamic we're designing away from.
