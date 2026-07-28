# 08 — Monetization

## The recommendation: sell to venues, not to users

**Charge the supply side. Every gig needs somewhere to happen, and a confirmed crew of 3–6 people arriving on a slow weekday is exactly the foot traffic a Colombo cafe, badminton court, or board-game place is failing to get.** They already spend money on Facebook ads that can't prove anyone walked in. You can prove it.

Why this and not the obvious alternatives:

- **User subscriptions** hurt you at exactly the wrong moment. The app's existential problem is liquidity — not enough people in one place at one time to fill a gig. Any paywall between a user and joining makes that worse. You cannot charge your way out of a cold start.
- **Booking commissions** (the cinema idea) require a partner with an API and a signed deal before you've proven a single gig fills organically. That's building the slow, hard, low-leverage part first.
- **Ads** need scale you won't have for a year.

The venue model has zero user friction, which protects liquidity, and it's implementable from day one because it needs almost no new infrastructure — the venue table already exists because gigs need locations.

## What a venue actually buys

Three tiers, priced for Colombo. These are starting points, not researched numbers — validate with 5 venue conversations before setting them.

| Tier | Roughly | They get |
|---|---|---|
| **Listed** | Free | In the venue picker like anyone else. Gets them into the data. |
| **Spot** | ~LKR 5,000/mo | Highlighted in the picker for matching activities, logo and photos, a perk shown to crews, monthly report |
| **Home Spot** | ~LKR 15,000/mo | Everything above, plus featured placement on the activity page, and Trio runs one seeded gig a week at their venue |

The free tier matters. It gets every venue into your database and lets you show a prospect their own numbers before they've paid you anything.

## The thing that makes it sellable: the redemption loop

A venue will not renew on vibes. The reason `perk_redemptions` exists in the schema is to close the loop from "we sent you people" to "here's proof, signed by the crew."

How it works:

1. Partner venue has a `partner_perk` string — e.g. "15% off for Trio crews of 3+".
2. Crews at that venue see the perk in their lobby once the gig locks, with the gig `code` displayed large.
3. At the venue, the crew shows the code. Staff enter it on a simple `/spot` page (no login — just the venue's slug and the code) or the host taps **Redeem** in the lobby.
4. That writes a `perk_redemptions` row with the crew size.
5. The venue's monthly report: gigs hosted, people sent, perks redeemed, 8-week trend.

That report is the actual product you're selling. Build it in `/admin/partners` and make it exportable.

## Build it in this order

**Now (M5, with the venue picker):**
- `venues.is_partner`, `partner_perk`, `partner_since` — already in the schema.
- Partner venues visually distinct in the picker (a `--color-line` flag, not a badge pill).
- Perk shown in the lobby after lock, with the gig code.
- The `/spot/[slug]` redemption page and the `perk_redemptions` write.
- The partner report in admin.

**Later, once there are gigs happening:**
- Self-serve venue signup and billing via PayHere.
- Sponsored gigs — a venue funds a gig, Trio hosts it, slots are free.

**Later still, and only if the numbers justify it:**
- Optional staked gigs — a small refundable deposit on RSVP, returned on check-in, platform takes a fee. This solves flaking and earns revenue at the same time, but it adds payment friction to joining, which is the one place you can least afford friction right now. Do not build this in v1.

## What not to sell, ever

- **Verification.** Charging for a safety feature makes safety a premium tier. It's also a bad look on a product whose entire pitch is safety.
- **Priority access to slots.** Paid queue-jumping breaks first-come-first-served, which is the rule the whole anti-cherry-picking design rests on. Nothing paid may ever touch slot ordering.
- **Visibility boosts for individual users.** That's a dating-app mechanic and it drags the product back toward what it's deliberately not.

Cosmetic-only supporter perks (profile flair, lobby themes, more concurrent hosted gigs) are acceptable later. They must never touch who gets in.
