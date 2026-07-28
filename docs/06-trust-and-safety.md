# 06 — Trust and safety

The product removed host gatekeeping on purpose (see `00-start-here.md`). Everything in this doc exists to compensate for that. It is not a "nice to have" tier of the app; it is the load-bearing half.

## Reliability bands

Replaces the public star rating, which was rejected for good reasons: it punishes people who leave because they felt unsafe, it becomes a retaliation weapon, and it gets gamed the moment it matters.

Four bands, computed daily from `reliability_events`, shown as a word and a small mark — never a number, never a percentage, never a history list.

| Band | Meaning | Rough rule |
|---|---|---|
| `new` | Hasn't finished enough gigs to say | < 3 completed gigs |
| `reliable` | Shows up | ≥ 3 completed, no-show rate ≤ 10% over last 10 |
| `mixed` | Has flaked recently | no-show rate 10–35% over last 10 |
| `restricted` | Can't join gigs right now | no-show rate > 35%, or moderation action |

Rules that make this humane:

- **Only the last 10 gigs count.** People change. An indefinite record is a punishment, not a signal.
- **Leaving before lock costs nothing.** Ever. Changing your mind with notice is the behaviour we want.
- **Leaving via the "I didn't feel comfortable" door costs nothing**, at any time, including a walkout mid-gig. This is the whole point.
- **`under_filled` cancellations cost nobody anything.** That's our failure.
- **A host cancelling their own gig after it confirmed** costs the host a `host_cancel` event, weighted double. Hosts breaking confirmed plans hurts more people.
- `restricted` is recoverable. It expires; it isn't a scarlet letter.

Display: band shown on crew cards and gig previews. `reliable` is a small `--color-net` tick. `new` is neutral, not a warning — most users will be `new` at launch and treating that as suspicious kills the cold start. `mixed` shows only to the host and to admins, not to the whole crew. `restricted` users can't join at all, so it never renders.

## Host removals

The single power a host retains, and the one most open to abuse. Design accordingly.

- Requires a written reason, minimum 10 characters, from a fixed category plus free text.
- Writes to `crew_removals` permanently. Never deletable.
- The removed person is told they were removed and given the category — not the free text, which can be abusive.
- The freed slot **reopens** if the gig is still `open`, so a removal can't be used to quietly shrink a crew.
- **Rate limited:** 1 removal per gig, 3 per host per rolling 30 days. Hitting the limit requires admin help. Say so plainly.
- **Auto-flag:** a host with ≥ 3 removals in 30 days, or whose removals disproportionately target one demographic pattern, lands in the admin queue automatically. The audit trail is the deterrent — make sure hosts know removals are logged and reviewed. Put that sentence in the removal dialog.

Categories: `no_show_pattern`, `abusive_in_chat`, `pushing_for_one_on_one`, `misrepresented_themselves`, `safety_concern`, `other`.

## Reports

Reportable from a lobby, a crew card, or a completed gig, up to 30 days after.

Categories: `harassment`, `sexual_advance`, `pressured_private_meeting`, `venue_changed_to_private`, `no_show`, `impersonation`, `underage`, `spam_or_promo`, `threat_or_violence`, `other`.

Priority routing — `threat_or_violence`, `underage`, and `sexual_advance` jump the admin queue and trigger an admin email immediately. Everything else is FIFO.

Reports are never visible to the reported person, never attributed, and never shown to other crew.

## Behavioural red flags to surface to admins

Single events are noise. These are the cross-gig patterns worth flagging, and they're what an agent could eventually automate (see the competition idea):

- A user who joins multiple gigs that all contain one particular other user.
- Chat messages pushing to move a group meetup to a one-on-one, or to change the venue somewhere private or unlisted. Keyword heuristics are fine for v1 and should be tuned to be over-inclusive; a human reads the flag, so false positives are cheap and misses are expensive.
- A host who repeatedly creates gigs, waits for a specific person to join, then cancels.
- A user with several `left_uncomfortable` exits recorded against gigs they shared with the same person.
- A user who sends a friend request after nearly every gig, especially skewed toward one demographic. Friending everyone is a numbers game, and a numbers game here is what dating behaviour looks like.
- A user with a high friend-request send rate and a very low acceptance rate.
- Someone repeatedly hosting gigs and inviting the same friend who never claims a slot.
- Rapid account creation from one device fingerprint.

Build these as a `flags` view over existing tables feeding the admin dashboard. Don't auto-punish on heuristics — surface, don't sentence.

## Blocking

The user-controlled safety tool, and the one that needs the least friction. One tap from a crew card, a completed gig, or a friend list. No reason required — demanding a justification to avoid someone is its own small harm.

A block does all of this in one transaction:

- Deletes any friendship between the pair.
- Cancels pending friend requests in both directions.
- Hides each user's gigs from the other's feed, in both directions.
- Makes `claim_slot()` refuse if the other is already crew — **returning `gig_full`, not a block-specific error.** Never confirm to either party that a block exists. A distinguishable error message turns blocking into an information leak and, worse, into something the blocked person can probe for.
- Applies retroactively to any shared upcoming gig: the *later* joiner is removed, refunded nothing (there are no payments), and told only that the gig is no longer available. If they were the host, the blocker is the one moved out, since removing a host destroys the gig for everyone else.

Blocks are invisible to the blocked person, permanent until lifted, and visible to admins. A user with a high number of blocks *against* them is a strong signal and should surface in `/admin/flags` — people block quietly far more often than they report.

Because the feed is blind (R5), a gig disappearing leaks nothing about who's in it.

## Friend system abuse controls

Recapping the guardrails from `01-product-spec.md` in enforcement terms, since these are the bits that stop the friend graph becoming a dating layer:

- Shared `attended` status required (R9), enforced in `send_friend_request()`, not the UI.
- One request per pair per 90 days after any terminal state.
- Max 20 pending outgoing.
- Silent expiry rather than an explicit decline.
- No 1:1 messaging, so an accepted request grants no private channel — the worst case of a bad friend request is a name in a list, not an inbox.
- Friend-hosted gigs surface only for gigs the friend **hosts**, never ones they join.

If the friend graph ever does get 1:1 messaging, every one of these controls becomes load-bearing in a way it isn't today, and the whole feature needs re-reviewing before that ships.

## Moderation ladder

Graduated, recorded in `moderation_actions`, always with a reason:

1. **Warn** — notice in-app and by email. No functional change.
2. **Restrict posting** — can join, can't host. For hosts abusing removals or cancelling repeatedly.
3. **Restrict joining** — the `restricted` band. Time-boxed.
4. **Suspend** — `suspended_until` set; blocked at `claim_slot()` and `create_gig()`.
5. **Ban** — permanent. Requires a second admin's sign-off recorded in the reason field.

Every action is appealable by email; put the address in the notification.

## Safety features to build into the product surface

- **Public place only** (R7). Venue must resolve to a business or public landmark. Residential Google Places types are rejected at creation.
- **"Share your plan"** — one tap on a locked gig generates a message with activity, venue, time, and crew first names, to send to someone outside the app. Cheap to build, disproportionately reassuring.
- **In-lobby safety note** — before every gig locks, a short reminder: meet at the venue, arrange your own transport, tell someone where you're going, leave if it feels off and you won't be penalised.
- **No contact details in chat.** Soft-block phone numbers and social handles in `gig_messages` for gigs that haven't locked yet, with an explanation rather than a silent strip. After locking, allow it — crews need to coordinate.
- **Report is always one tap from the lobby.** Never buried in a settings submenu.

## What we are not claiming

Write this in the safety page in the app's own voice: Trio does not run background checks, does not verify identity documents, and cannot guarantee anyone's behaviour. It checks that a face is real and matches a photo, requires groups of three or more in public places, and acts on reports. Anything stronger would be a lie, and a safety page that lies is worse than no safety page.
