# 04 · Competitors

**Phase 1 of the research programme** (`docs/research/PROMPT.md`, item 4). Written 3 November 2026 from the Phase 1 research notes. No new primary research.

| | |
|---|---|
| Scope | Direct competitors (Meetup, Timeleft, Bumble For Friends / BFF, Partiful, Luma, Playo, Hudle, local booking apps, mithuru), indirect alternatives (WhatsApp, Facebook, Instagram, clubs) and doing nothing. Features, pricing, store ratings, 1 to 3 star review themes, gaps. |
| Sources | `research_notes/Trimegos Phase 1 market research/`, mainly `competitors_global.md` and `competitors_local_indirect.md`, plus `demand_and_current_channels.md`, `positioning_category.md`, `liquidity_cold_start.md`, `market_size_inputs.md`, `trust_safety_sri_lanka.md`. All URLs accessed 2026-10-31 unless stated. |
| Store data | Apple: iTunes Lookup API per storefront (us, in, lk, gb) and the review RSS feed (most recent 500 written reviews). Google Play: listing HTML, `gl=US` for global apps, `gl=LK` for local ones. Play availability in Sri Lanka for global apps could not be checked from a non-Sri Lankan IP. |
| Blocked | Reddit was blocked to the research tools; Facebook group member counts could not be read. Manual pass in §6.3. |

Claim labels: **Fact** (sourced), **Estimate** (maths shown), **Assumption** (with how to test it). Items from search-result summaries carry "(from search summary, verify before quoting publicly)". Prices convert at **LKR 331 per USD** (FRED DEXSLUS, 16 Oct 2026, https://alfred.stlouisfed.org/series?seid=DEXSLUS, accessed 2026-10-30).

---

## 1. Threat ranking for Colombo, next 12 months

Threat = overlap with Trimegos's job ("find a few new people for a plan this week, safely") × likelihood of being live and used in Colombo × ability to move fast.

| Rank | Competitor | Threat | Why |
|---|---|---|---|
| 1 | **WhatsApp itself** | High | The incumbent behaviour, free, on every phone. Local builders pitch against it: Volt's "End the WhatsApp scrum", CricBook's "One person is calling three venues" ([volt.lk](https://www.volt.lk/); [cricbook.lk](https://www.cricbook.lk/)) (Fact). Most lost sessions go to "I'll ask the group chat". Weakness: closed to strangers, no safety layer. |
| 2 | **Playo** | High for sport, low otherwise | Operating in Colombo since April 2026, Kandy, Jaffna, Galle and Negombo planned; 5M+ users and 5,000+ venues claimed; paid subscription with **profile verification** planned for Q2 FY27 ([Business News This Week, 2026-04-29](https://businessnewsthisweek.com/business/playo-expands-global-footprint-with-sri-lanka-launch/)) (Fact). Only 5 Colombo venues listed ([playo.co/venues/colombo](https://playo.co/venues/colombo/sports/all)), and the local notes could not confirm Sri Lanka from Playo's homepage (Fact). Already has join-a-game, chat, split payments and skill ratings. |
| 3 | **mithuru (mithuru.lk)** | Medium now, high if it launches | The same idea built for Sri Lanka: Hangouts, campus and work circles, Sports Connect, trilingual, free ([mithuru.lk](https://mithuru.lk/)) (Fact). Pre-launch, no team named, not on Google Play. Bundles **dates**. |
| 4 | **Volt (volt.lk)** | Medium for sport | "Post a game, see who's in, and fill the last slots from players nearby", plus booking and venue software (Fact). Sport only. Its free year for "Founding 50" venues undercuts any Trimegos venue fee (`03-market-size.md` finding 5). No store listing found on 2026-10-31. |
| 5 | **Play.Book** | Low to medium | The only local booking app with traction: 5K+ installs, 3.41 stars from 21 ratings ([Google Play](https://play.google.com/store/apps/details?id=com.lkdev.playbook.prod&gl=LK&hl=en)) (Fact). Booking first, light social layer. |
| Watch | Timeleft | Low | In four Indian cities, not Colombo (Fact). It cut back from 320+ cities to about 200 to build depth (§3.2), which makes a small new market less likely (Assumption). |
| Watch | Meetup, Luma | Low | In Sri Lanka, used for tech and professional events (Fact). |
| None | Bumble BFF, Partiful, Hudle, 222, Pie | Very low | Not on the Sri Lankan App Store or no Sri Lankan presence (Fact). |

**Bottom line.** The 12-month fight is in sport, against WhatsApp habits and Playo. Non-sport small-group plans (coffee, walks, board games, hikes) have no live competitor in Colombo; mithuru is the only one aiming there and it hasn't launched (Fact for presence; Assumption that it holds for 12 months).

---

## 2. Feature matrix

"Not found" means searched and not found. Ratings: stars / count, store, country, read 2026-10-31. LKR figures are Estimates at 331.

| Product | Core loop | Group size | Stranger matching | Verification | Anti-dating mechanics | Monetization / price | In Sri Lanka? | Store rating |
|---|---|---|---|---|---|---|---|---|
| **Trimegos** | Post a gig, others claim spots, meet in public | Min 3, max 16 | Open feed of blind cards; age and gender audience filters | Liveness video with random challenge, human review; approved photos | Min 3, public, faces hidden until full, no DMs | Free; venue perks via `/spot` | Yes (18 towns in area list) | PWA, no listing |
| **Meetup** | Join groups, RSVP to events | Any | No | Not found | None; paid male/female attendee counts drew dating complaints | Organiser from USD 29.99/mo (≈ LKR 9,927) (from search summary, verify before quoting publicly); Luma cites USD 44.99 | Yes; groups mostly tech | 4.83 / 136 App Store LK; 4.72 / 272,679 App Store US; 3.8 / 236K Play |
| **Timeleft** | Weekly quiz-matched dinner, venue revealed late | 5 (4 to 6) | Yes | 18+; nothing else found | Profiles hidden until after; group chat only | US est. USD 20 to 26/mo (≈ LKR 6,620 to 8,606), meal extra, no-show fee up to 35%; ~USD 5 to see attendees (user reports) | No | 4.40 / 290 App Store IN; 4.62 / 8,882 US; 4.2 / 11.9K Play; Trustpilot 3.2 / 767 |
| **Bumble BFF** | Swipe and "wave", 1:1 DMs, Groups tab | 1:1 and groups | Yes, 1:1 | Selfie verification on every profile | 18+ rules; dating-company brand | Free core; premium "USD 17 to 80/mo" (competitor-authored); no revenue | No standalone app on LK or IN App Store | 4.20 / 8,820 App Store US; 4.33 / 2,115 UK; 2.7 / 8.1K Play |
| **Partiful** | Text-link party invites | Any | No | Not found | n/a (host's friends) | Free; "Plus" price not found | Not on LK App Store | 4.95 / 280,213 App Store US; 4.9 / 26.9K Play |
| **Luma** | Event pages, ticketing, check-in | Any | No | Not found | None | Free for free events; 5% on paid; Plus USD 59 to 69/mo | Yes; professional events | 4.91 / 22 App Store LK; 4.8 / 4.13K Play |
| **Playo** | Book courts; join or host games; chat | Sport teams | Yes, by skill and distance | Host verifies attendees; profile verification planned (paid) | None | Free app, pay bookings; fee not published | Yes, Colombo, 5 venues | 5.0 / 8 App Store LK; 4.65 / 15,108 IN; Play 4.6 / 57K (gl=US) or 4.86 / 57,032 (gl=LK) |
| **Hudle** | Book courts, community games | Sport teams | Community games | Not found | None | Not disclosed | Listed on LK store, 0 ratings | 4.87 / 11,557 App Store IN |
| **222 / Pie** (US) | Quiz-matched groups at venues | ~6 | Yes | 222 vets applicants | Public groups, but 222 sells a "blind date" format | 222: USD 22.22 per event or month | No | 222: 4.68 / 7,412 App Store US |
| **Volt** | Book courts; fill last slots | Sport teams | Yes, sport, level, area | Not found | None | Players free, pay the court (cash, transfer) | Announced 2026 | No listing found |
| **Play.Book** | Book, split costs, tokens | Sport teams | Light | Not found | None | Users report 3.5% gateway fee, no cash | Yes | 3.41 / 21 Play LK, 5K+ installs |
| **Other local booking** | Book a court | n/a | No | n/a | n/a | CricBook no fee, cash; BookMyCourt PayHere or at venue | Yes, all small | BookMyCourt 100+, Champ Turf 500+ installs, no rating shown |
| **mithuru** | Profiles, Hangouts, circles | Small (example: 6) | Yes | Campus or work email; utility bill | 18+, but includes "dates" | Free, no ads or subscriptions | Pre-launch | Not listed |
| **WhatsApp / Facebook** | Ask the group; post in a group | Any | No / weak | None | None | Free | Universal | n/a |
| **Instagram clubs, leagues** | Turn up at a fixed time | Crowds or teams | Organiser-led | None | Club norms | Free or employer-paid | Yes | n/a |

Sources: §3 and §4; store figures from `competitors_global.md` §2 and `competitors_local_indirect.md` Q1; Trimegos from `00-current-state.md` §2 and `CLAUDE.md`.

**What the matrix says.**

1. **Nobody else in Sri Lanka combines stranger matching, real verification and structural anti-dating.** Timeleft has the structure but isn't here; Bumble has verification but is 1:1, dating-branded and absent; Playo and Volt match strangers only for sport (Fact per attribute).
2. **Trimegos's verification is the strongest in the set.** A reviewed live video beats Bumble's selfie match (`trust_safety_sri_lanka.md`) (Fact). Playo only plans it, behind a paywall.
3. **Paid models are priced for rich countries.** Timeleft's USD 20 to 26 a month is 7.8% to 10.2% of Colombo's average net salary of LKR 84,404 (Numbeo, 28 Oct 2026) and 66% to 86% of a LKR 10,000 Mahapola stipend (Estimate: LKR 6,620 to 8,606 divided by each).

---

## 3. Global direct competitors

### 3.1 Meetup
- **Fact.** Bought by Bending Spoons in January 2024 with 60M+ members and 330,000 groups ([Built In NYC](https://builtinnyc.com/articles/meetup-bending-spoons-acquisition-20240131)); organiser costs reportedly "more than doubled" since ([FTM](https://ftm.eu/articles/wetransfer-owner-buys-up-apps-then-makes-them-more-expensive)).
- **Fact, Colombo.** The big groups are tech (AWS User Group Colombo 4,839 members). Searches for "make friends", "hiking", "board games", "running" and "football" return one social group: Colombo outdoor adventures, 378 members, 0 upcoming events ([Meetup Colombo](https://www.meetup.com/find/?location=lk--Colombo&source=GROUPS)). Colombo Social (690 members) has been dormant since May 2024; Tabletop SL's Meetup group is gone (`demand_and_current_channels.md` Q2).
- **Read.** Not a threat. Its dormant social groups are a pool of former organisers to recruit as hosts (`02-personas-jtbd.md` finding 2).

### 3.2 Timeleft
- **Fact.** Weekly dinner (usually Wednesday, 8 pm in India) for 5 strangers matched on quiz, age and gender; venue revealed the day before ([TechCrunch 2026-04-05](https://techcrunch.com/2026/04/05/as-people-look-for-ways-to-make-new-friends-here-are-the-apps-promising-to-help/)). About 200 cities: 196 on its cities page ([timeleft.com/cities](https://timeleft.com/cities/)), and "200 to 220" after cutting back from 320+ ([Tim Frin Substack](https://timfrin.substack.com/p/inside-timelefts-journey-to-connecting)). €18M ARR and 150k monthly participants in August 2025 (same source).
- **Fact.** Bangalore, Hyderabad, Mumbai and New Delhi; no Colombo, and timeleft.com/colombo returns 404 ([Timeleft locations](https://timeleft.com/locations/)).
- **Read.** Proves strangers will meet in small groups when the meet is reliable. Lessons: density (50+ weekly participants per city, `liquidity_cold_start.md`) and that users accept no-show fees when the meet is good. Weak spot: one weekday, one format.

### 3.3 Bumble For Friends / BFF
- **Fact.** Relaunched September 2025 on Geneva's group-chat tech with a Groups tab, keeping 1:1 swiping ([TechCrunch 2025-09-18](https://techcrunch.com/2025/09/18/bumble-bffs-revamped-app-is-here-focusing-on-friend-groups-and-community-building)); no revenue as of 30 Sep 2025 ([MarketScreener](https://www.marketscreener.com/news/bumble-third-quarter-2025-earnings-fact-sheet-ce7d5cddda8ff526)). Split into a US-only and a UK-only iOS app, **neither on the Sri Lankan or Indian App Store** ([lookup lk](https://itunes.apple.com/lookup?id=1478573199&country=lk)). Main Bumble is on LK Play; whether its BFF mode works here wasn't checked.
- **Read.** Bumble's move to groups supports the group-first thesis. Its dating brand and US focus leave South Asia open.

### 3.4 Partiful and Luma
- **Fact.** Partiful: free text-link invites, not on the LK App Store ([Wikipedia](https://en.wikipedia.org/wiki/Partiful)). Luma: event pages and ticketing, used for Colombo professional meetups ([luma.com/o6tywi5j](https://luma.com/o6tywi5j); [Luma Help](https://help.luma.com/p/luma-vs-meetup)).
- **Read.** No stranger matching or verification. One lesson: Partiful grew through links that work without the app (`liquidity_cold_start.md`). Trimegos's single-use `/join/<code>` links are the same mechanic.

### 3.5 Playo
- **Fact.** Bengaluru, 2014. Real-time court booking; a Play tab to join public games and chat; GameTime hosted games; co-hosting and attendee verification; split payments; Karma points; skill graph ([Playo blog, 2025-10-07](https://blog.playo.co/playo-a-complete-guide-into-how-to-use-it-2020/)). Reported profitable since Nov 2022 (`market_size_inputs.md`).
- **Fact, Colombo.** Five venues: CR7 Futsal (Col 3), MBA Badminton (Col 7), Uni Sports Center (Col 3), X Sports Arena (Col 15), Shuttle Power (Col 6) ([playo.co](https://playo.co/venues/colombo/sports/all)). No LKR pricing or local payment methods found.
- **Read.** Strongest competitor for sport gigs and the likely winner of Colombo court booking. Weak on safety (no scam reporting, per reviewers) and absent outside sport.

### 3.6 Hudle, 222, Pie
- **Fact.** Hudle (Delhi, USD 2.5M Series A July 2025, padel and pickleball focus) mentions no international plans ([Indian Startup Times, 2026-10-19](https://www.indianstartuptimes.com/interviews/from-booking-courts-to-building-a-sports-ecosystem-how-hudle-is-scaling-the-way-india-plays/)). 222 and Pie are US only; 222's venues pay to partner ([Gazetteer SF](https://sf.gazetteer.co/pay-to-play)).
- **Read.** Not threats. 222's venue-pays model is a precedent for a free player side.

---

## 4. Local direct competitors

### 4.1 Volt
- **Fact.** Volt Manager for venues (90-day court calendar, walk-ins, revenue reports) and a player app: courts by sport and neighbourhood, "what's open in the next two hours", one-tap booking, open games shown as "Looking for 2 more players", matching by level and area ([volt.lk](https://www.volt.lk/)). Nine sports; areas include Nugegoda, Dehiwela, Battaramulla, Mount Lavinia, Colombo 5 and Gampaha. "The grid is going live · Sri Lanka · 2026." No Play listing ([Play search](https://play.google.com/store/search?q=volt%20sports%20lanka&c=apps&gl=LK)).
- **Read.** Closest local product to Trimegos's futsal and badminton gigs, and it targets the venues Trimegos wants to charge. No non-sport activities, no minimum group, no safety story. Player numbers unknown.

### 4.2 Play.Book
- **Fact.** Playbook Technologies, Colombo 07: book venues, "split booking costs and amp up the banter", Play.Book Coin tokens ([Google Play](https://play.google.com/store/apps/details?id=com.lkdev.playbook.prod&gl=LK&hl=en)). Pickle Island Arcade (LKR 4,000, about USD 12, an hour) books through it (from search summary, verify before quoting publicly).
- **Read.** Being the local leader at 5K+ installs shows how small local booking is.

### 4.3 mithuru
- **Fact.** "find your people in sri lanka": 18+, English, Sinhala and Tamil; mutual "say hi" before chat; Sidequests (kottu runs, sunset walks); Hangouts (sunset run at Port City, "6 people going"); campus circles by email ("83 campuses and 38 work circles, and counting"); Sports Connect; Apartment Connect by utility bill; reports reviewed within 24 hours; explicitly includes "dates" ([mithuru.lk](https://mithuru.lk/)).
- **Read.** The one competitor that could take Trimegos's whole positioning except "not dating". It is ahead on cultural fit and circle verification. Its dating mode is the opening for families and women wary of dating apps (`trust_safety_sri_lanka.md`). Whether "83 campuses" is real use or a waitlist is unknown (Assumption; test by joining).

### 4.4 The rest of the booking field
- **Fact.** At least 12 booking products, mostly launched 2024 to 2026: BookMyCourt, Champ Turf, CricBook ("Cash at the venue · No booking fee"), Sportizza, MySport, BookMyPlay, GearUP (dev subdomain only), The Arena (down on 2026-10-31); Turfy and Bookin360 may be dead (`competitors_local_indirect.md` Q1). Venues also book through their own Facebook pages.
- **Read.** Pre-consolidation and commoditised. Not Trimegos's fight (§9).

---

## 5. Themes in 1 to 3 star reviews

### 5.1 Negativity bias
Apple averages are inflated by rating-only prompts, and review feeds over-sample angry users. Meetup averages 4.72 in the US, yet 469 of its 500 most recent written reviews are 1 to 3 stars (Fact, [feed](https://itunes.apple.com/us/rss/customerreviews/page=1/id=375990038/sortBy=mostRecent/json)). Counts below show **what goes wrong**, not **how often**.

Share of recent written reviews at 1 to 3 stars (Fact): Meetup US 469/500; BFF US 465/500; Bumble For Friends UK 168/186; Playo India 365/500; Timeleft US 310/500; 222 US 153/500; Partiful US 64/500; Luma US 41/219; Hudle India 41/108. Local apps: only Play.Book and BookMyShow LK had visible reviews, about 3 each. Google Play review text for global apps was not read.

### 5.2 Clusters
The notes don't count reviews per theme, so this counts **products** per theme. Reviews were read verbatim from the Apple feeds and Trustpilot; they are paraphrased here, and the verbatim text, dates and URLs are in `competitors_global.md` §3 and `competitors_local_indirect.md` Q5.

| # | Theme | Products | Examples (paraphrased, date) |
|---|---|---|---|
| 1 | **The meet fails**: cancellations, no-shows, closed venues | Timeleft, 222, Hudle | Events cancelled hours before (Timeleft, 2026-10-20); closed coffee shops or nobody came (2026-10-17); 4 turned up instead of 7 or 8 (2026-10-11); rejected from 21 of 22 events while paying (222, 2026-10-19) |
| 2 | **Pay before value, pay to see people, hard to cancel** | Meetup, Timeleft, 222, Bumble UK, Luma, Play.Book | About USD 5 to see attendees (Timeleft, 2026-10-28); charged after cancelling a trial (Meetup, 2026-10-21); unsubscribe a dark pattern (Timeleft, 2026-09-30); 3.5% fee called extortion (Play.Book) |
| 3 | **Empty cities** | Timeleft, BFF US, Bumble UK | "Hopelessly underpopulated" (Timeleft, 2026-10-11); 0 to 3 profiles a day (BFF, 2026-10-10) |
| 4 | **Dating drift** | Meetup, BFF US | Gender-count paywall seen as turning Meetup into a dating site (2026-10-28); BFF called a hookup app (2026-10-23) |
| 5 | **Scams, no way to report** | BFF US, Playo | Scammers, blocking doesn't stop tagging (BFF, 2026-10-08, 2026-10-17); no way to report scammers (Playo, 2026-06-14) |
| 6 | **Bad matching** | Timeleft | Ages 18 to 65 at one table (2026-10-08); a woman of colour felt singled out (2026-10-17) |
| 7 | **Broken login and verification** | BFF US, Bumble UK, Playo, BookMyShow LK | Selfie check failed 30 times (Bumble UK, 2026-10-19); OTP failed 20+ times (Playo, 2026-10-03) |
| 8 | **Payments and refunds** | Hudle, Playo, Play.Book, BookMyShow LK | Refunds as expiring credits (Hudle, 2026-05-13); no cash, slow deposits (Play.Book); FriMi button stuck (BookMyShow LK) |
| 9 | **Notification spam** | Playo, Partiful, BFF US | A notification every 10 minutes (Playo, 2026-09-15) |
| 10 | **Rating abuse, fixed schedules, AI support** | Playo; Timeleft; Meetup, Hudle | Deliberate low skill ratings (Playo, 2026-06-21); one weekday only (Timeleft, 2026-10-21) |

### 5.3 What it means for Trimegos
- **Reliability is the main product.** Theme 1 leads. Small free events lose a median 37% of registrants (PheedLoop, April 2026); a 4-person gig at that rate averages about 2.5 attendees, below the minimum of 3 (Fact for benchmark; Estimate 4 × 0.63).
- **"Pay to see who's coming" is the most hated monetisation.** Trimegos's "faces hidden until full" makes seeing people a reward for committing. Say it as a promise.
- **Verification must work first time** (theme 7): a check that fails is worse than none. Measure the liveness failure rate.
- **Local users resist card fees and fragile payment rails.** Not touching money is an advantage for now.

---

## 6. Indirect alternatives and doing nothing

### 6.1 Channels

| Channel | Evidence | Weakness against Trimegos's job |
|---|---|---|
| Personal WhatsApp groups | Builders pitch against "the WhatsApp scrum" (Fact) | Closed to strangers; manual slot-filling; no safety |
| Open WhatsApp link directories | Unvetted, mixed with adult and spam content (`demand_and_current_channels.md` Q2) (Fact) | Unsafe; why verification matters |
| Facebook groups, venue pages | Venues take bookings on Facebook; Ceylon Ramblers 6,083 page likes (Fact) | Noisy, older-skewing, no headcount; group sizes unknown |
| Instagram communities | Colombo Night Run about 4,039 followers, free Thursday run; Tabletop SL about 2,441 (both from search summary, verify before quoting publicly) | Big crowds at fixed times; you still arrive alone |
| Event listings | Happening Colombo: board-game nights, book clubs, quizzes (Fact) | Shows the event, not who to go with |
| Corporate leagues | Mercantile Football 27 teams (2024), Cricket T10 26 teams (2026) (from search summary, verify before quoting publicly) | Member firms only; team-level |
| University teams, hashes, clubs | SLIIT futsal open to all; Colombo Hash every Saturday (Fact) | Bounded by campus or a single format |

**Read.** Colombo is rich in "one activity, fixed time" communities and poor in "any activity, this week, a few new people" (`01-problem-demand.md` finding 4). Feed off them with "arrive together" gigs (`01-problem-demand.md` §7, idea 1) rather than compete.

### 6.2 Doing nothing
Free and risk-free. No Sri Lankan adult data measures it; local loneliness data is adolescent only (GSHS 2024, [WHO Sri Lanka](https://www.who.int/srilanka/news/detail/10-09-2025-world-suicide-prevention-day-2025--changing-the-narrative-on-suicide-in-sri-lanka)) (Fact). Futsal costs LKR 300 to 350 a head (`02-personas-jtbd.md` finding 1), so the cost of a first gig is social risk, not money. Beating "doing nothing" means lowering the fear of walking in (Assumption; test with proposed Q4a in `01-problem-demand.md` §8).

### 6.3 Manual checks
- **Reddit:** search r/srilanka and r/colombo for `Playo`, `Volt`, `Play.Book`, `mithuru`, `futsal players`, `make friends Colombo`, `Bumble BFF`. Log title, date, URL, comments.
- **Facebook (logged in):** member counts and last-post dates for Colombo futsal, badminton, hiking and expat groups; count "need 2 players" posts per week as a scrum proxy.
- **Apps:** count Playo's Colombo public games over one week; join mithuru's waitlist; check whether Volt's player app is downloadable.

---

## 7. Trimegos against the field

Every core loop is built and enforced in Postgres; what's missing is people, with 2 upcoming gigs visible to a new account (`00-current-state.md` §1, §2) (Fact).

| Area | Trimegos | Who is ahead | Verdict |
|---|---|---|---|
| Court booking | None | Playo, Volt, Play.Book, a dozen tools | Behind; don't close (§9) |
| Payments, cost splitting | None | Playo, Play.Book | Behind; show per-head cost instead |
| Scale, liquidity | 2 visible gigs | Playo 5M+, Meetup 60M+, Timeleft 150k monthly | Far behind; the binding constraint (`03-market-size.md` finding 3) |
| Native apps | PWA only, no store search or reviews | Everyone except mithuru and Volt (no listing) | Behind; H8 (Q13) tests whether it matters |
| Skill levels, recurring games | None | Playo, Hudle, Volt | Behind for sport |
| Language | English only; mono font lacks Sinhala and Tamil | mithuru | Behind; H9 (Q14) |
| Community circles | None | mithuru | Behind |
| Host edits a gig; share-your-plan | Missing | Event tools | Small, cheap gaps |
| Verification | Reviewed liveness video | Nobody | **Ahead** |
| Anti-dating structure | Min 3, public, faces hidden, no DMs | Timeleft similar, absent | **Ahead** |
| Any activity, any day | Yes | Timeleft one weekday; Playo and Volt sport only | **Ahead** |
| Notification restraint | New-gig pushes capped at 3 a day; chat collapsed | Playo, Partiful draw spam complaints | **Ahead**, unadvertised |
| Measurement | No analytics or error monitoring | Funded competitors (Assumption) | Behind; blocks reliability claims |

**Read.** Trimegos leads on safety and structure and trails on scale and transactions. That is the right way round for a 3-person team, provided liquidity gets solved, but it can't win a sport-features race with Playo.

---

## 8. Gaps Trimegos can own

Not scored; doc 15 does that.

**8.1 Non-sport small-group plans.** No live Colombo competitor (§1); formats exist but are organiser-led (§6.1); Meetup social is dead (§3.1).
- **Category-first launch feed**: lead the feed, landing page and seed gigs with board games, walks, coffee and hikes; sport is one category. → candidate for `15-feature-opportunities.md`

**8.2 Reliability as a feature.** Theme 1 (§5.2); 37% no-show benchmark; Timeleft users accept no-show fees.
- **Show-up record**: private check-in count ("attended 6 of 6") shown to hosts on claim; repeat no-shows pause claiming. Uses existing check-in data. → candidate for `15-feature-opportunities.md`
- **Host late-cancel rule**: a host cancelling inside 6 hours gets a visible late-cancel count, and the crew can keep the gig with a new host. → candidate for `15-feature-opportunities.md`
- Pairs with "Still coming? check plus backfill" (`01-problem-demand.md` §7, idea 7).

**8.3 No paywall on people.** Theme 2; Meetup's gender counts and Timeleft's attendee fee.
- **"Everyone sees the same thing" pledge** on landing and Safety pages: no paying to see who's coming, no gender ratios for sale, no boosted profiles. → candidate for `15-feature-opportunities.md`

**8.4 Anti-dating, shown not claimed.** mithuru bundles dates; Bumble is a dating brand; local media links app meetups with scams and sextortion (`trust_safety_sri_lanka.md`); Trimegos's own hero art reads as a date (`00-current-state.md` finding 2).
- **"Why this isn't a dating app" screen** in onboarding and `/safety`, listing the mechanics, written so a parent can read it. → candidate for `15-feature-opportunities.md`

**8.5 Verification that works and shows.** Strongest in the set (§2); Bumble UK failures (§5.2); Playo will sell it.
- **Verification fallback**: after two failed liveness attempts, offer a different challenge or human retry; log failure rate. → candidate for `15-feature-opportunities.md`
- **"All 4 verified" badge on gig cards**, without faces. → candidate for `15-feature-opportunities.md`

**8.6 Visible reporting.** Playo has no scam reporting per reviewers; BFF blocking fails (§5.2). Trimegos already has report, block, crew vote and moderation.
- **One-tap report from every crew list and preview, with a published response time** (mithuru promises 24 hours). → candidate for `15-feature-opportunities.md`

**8.7 Circles without dating.** mithuru's campus and work circles; students are the second beachhead (`02-personas-jtbd.md` finding 5).
- **Campus and workplace email badge** with a "same campus" filter. → candidate for `15-feature-opportunities.md`

---

## 9. Where not to compete

| Don't build | Evidence | Do instead |
|---|---|---|
| **Court booking** | A dozen local tools, none above 5K installs, plus funded Playo (§3.5, §4.4) | Link out: a **"Court booked?" field** on sport gigs where the host pastes a Playo, Volt, Play.Book or CricBook link or ticks "booked by phone", shown as "Court booked" on the card. → candidate for `15-feature-opportunities.md`. Ask Volt and Play.Book about referral. |
| **Payments, split payments** | Fee and payment-rail complaints (§5.2 themes 2, 8); refund disputes (Hudle) | Per-head cost on the card (`01-problem-demand.md` §7, idea 6); cash at the venue, which CricBook, Volt and BookMyCourt support |
| **Skill ratings, competitive sport** | Playo and Hudle own it; rating abuse (§5.2) | A host-set "casual / regular" tag at most |
| **Paid curated dinners** | Needs payments, venue contracts, 50+ a week density; US prices are 66% to 86% of a Mahapola month (§2) | User-hosted gigs any day; venue perks via `/spot` |
| **Ticketing, big events** | MyTickets.lk since 2014, BookMyShow LK 50K+ installs, 11 ticketing startups (Tracxn) | "Arrive together" gigs attached to others' events |
| **1:1 matching** | Where dating drift starts (§5.2 theme 4) | Keep min 3, no DMs |
| **Native apps, for now** | Liquidity, not distribution, is the bottleneck (`00-current-state.md` finding 1) | Keep the PWA until Q13 (H8) results |

---

## 10. Proposed additions to 35-field-kits.md

Add after Q6 (doc 01 proposed Q4a to Q4c and doc 02 Q16 to Q19; these numbers avoid both):

| # | Question (exact wording) | Type | Options |
|---|---|---|---|
| Q6b | Which of these have you used in the last 6 months to find people or book a game? (tick all that apply) | Checkboxes | Playo / Volt / Play.Book / Another court-booking app or website / Meetup / Bumble (any mode) / Instagram run or social clubs / None of these |
| Q6c | If an app showed you a small group plan this week, which would matter most? (pick one) | Multiple choice | The court or place is already booked / Everyone is verified / It isn't for dating / It's free / I know someone going |

Interview §7 C, add: "Have you used Playo or any booking app to find players? What happened the last time someone didn't turn up?"

---

## Key findings

1. **No competitor in Sri Lanka combines stranger matching, real verification and structural anti-dating** (Fact per attribute).
2. **The 12-month threats are WhatsApp habits and Playo, in sport.** Playo has been in Colombo since April 2026 with 5 venues, join-a-game, split payments and planned paid verification (Fact).
3. **mithuru aims at the whole idea**, trilingual with campus circles, but is pre-launch and bundles dates. Its dating mode is Trimegos's opening (Fact).
4. **Non-sport small-group plans have no live competitor in Colombo** (Fact for presence).
5. **The top complaint across stranger apps is the meet not happening; the second is paying before value or to see people** (Fact, review feeds; frequency not measurable from feeds).
6. **Trimegos leads on safety and structure and trails on booking, payments, scale and native apps** (Fact).
7. **Court booking is a commodity nobody has won; Trimegos should link out, not build it** (Fact for the field; recommendation).
8. **US subscription prices don't transfer**: Timeleft's month is 7.8% to 10.2% of Colombo's average net salary (Estimate).

## Decisions this informs

- **Positioning** (`05-positioning.md`, `16-direction-options.md`): "any activity, a few new people, verified, not dating", against WhatsApp and mithuru, not Playo's sport features.
- **Launch category mix** (`07-liquidity-cold-start.md`): seed non-sport gigs; recruit sport organisers as supply, linked to their booking app.
- **v1 reliability features** (`15-feature-opportunities.md`): show-up record, late-cancel rule, still-coming check.
- **Monetisation** (`10-monetization.md`): no player paywall on people; venue fees face Volt's free year.
- **Partnerships** (`34-venue-sales-kit.md`): approach Volt and Play.Book for link-out or referral.
- **Native app** (`43-decisions.md`): hold until Q13.
- **Monthly watch list**: mithuru launch, Volt player app, Playo's Colombo venue count and verification tier.

## Open questions

1. Has Volt's player app launched, with how many venues and players?
2. How many public games does Playo run in Colombo a week, and when does its verification tier arrive?
3. When does mithuru launch, who runs it, and is "83 campuses" real use?
4. Will Playo or Volt add non-sport plans?
5. Does Bumble's in-app BFF mode work and get used in Sri Lanka?
6. What share of the target group uses Playo, Volt or Play.Book (Q6b)?
7. What do Reddit and Colombo Facebook player groups say about these apps (§6.3)?
8. Would Volt or Play.Book accept a referral partnership?

## Confidence

- **Presence and absence in Sri Lanka: medium to high.** Storefront lookups and company pages are direct. Playo's local depth is uncertain, and Play availability couldn't be checked from Sri Lanka.
- **Features: medium.** Company pages, some self-reported, one competitor-authored; local products are landing pages, not tested apps.
- **Pricing: low to medium.** Few official lists; Meetup's page was blocked; Timeleft prices are third-party US estimates; no LKR prices for global apps.
- **Store ratings: high as numbers, low as signals.** Sri Lankan counts are tiny; averages hide written-review negativity; Playo's two Play figures differ by query parameter.
- **Review themes: medium.** Verbatim recent reviews, but feeds over-sample anger, Play text wasn't read, local apps have about 3 reviews each.
- **Threat ranking: low to medium.** Reasoned from presence and features; no Colombo usage data for any competitor.
- **Gaps and where not to compete: medium.** Consistent across notes; whether users value safety over booking convenience is untested (Q6c).
