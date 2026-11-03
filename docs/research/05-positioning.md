# 05 · Positioning

**Phase 1 of the research programme** (`docs/research/PROMPT.md`, item 5). Written 3 November 2026 from the Phase 1 research notes plus one targeted search (Meta's dating-ads policy). No new primary research.

| | |
|---|---|
| Inputs | `positioning_category.md` (main), `competitors_global.md`, `competitors_local_indirect.md`, `trust_safety_sri_lanka.md`; `00-current-state.md`; `01` to `03` in this folder; `lib/copy/marketing.ts`; `components/marketing/Hero.tsx` |
| Framework | April Dunford's five components, then a Moore-style statement. Both from secondary summaries; the books were not read (`positioning_category.md` §5) |
| Labels | **Fact** (sourced), **Estimate** (maths shown), **Assumption** (with a test). URLs accessed 2026-10-31 unless stated |

---

## 1. Summary

Position Trimegos as **the group-plans app for Colombo**: you bring the plan, it brings the people, and the format (three or more, in public, faces hidden until the group fills) makes it obviously not a date. Category word: "group plans". Outcome word: "crew". "Not a dating app" should be **shown in the rules and imagery, and said once, lower on the page**. Never in the headline.

The current copy is close: "Plans need people. Find your crew." does most of the work. The problem is the picture. On desktop the hero crops to two people with drinks at sunset, which reads as a date (Fact, `00-current-state.md` §1 item 2). Fixing the image matters more than rewriting the words.

Against WhatsApp and sport apps (Volt, Playo), Trimegos wins on "any activity, with strangers you can trust". Against mithuru, a pre-launch local friend app with a dating mode, it wins on "never a date, by design".

---

## 2. Competitive alternatives (Dunford 1)

What would a 25-year-old in Nugegoda do this Saturday without Trimegos?

| Alternative | Where it fails | Evidence |
|---|---|---|
| Personal WhatsApp groups, friends of friends | Closed to outsiders; the scramble to fill last slots; dies when friends move or emigrate | **Fact:** Volt's tagline "End the WhatsApp scrum"; CricBook: "One person is calling three venues" ([volt.lk](https://www.volt.lk/), [cricbook.lk](https://www.cricbook.lk/)) |
| Instagram and Facebook communities (run clubs, board-game nights, hiking pages) | Big-crowd format, so you still arrive alone; organiser-dependent | **Fact:** board-game nights at Cafe Meeples and Third Place Hub ([Happening Colombo](https://www.happeningcolombo.com/)); Colombo Night Run about 4,039 Instagram followers (search summary, verify before quoting publicly) |
| Sport apps that fill slots | Sport only; tiny user bases; fee friction | **Fact:** Volt "Post a game, see who's in, and fill the last slots" (launching 2026); Play.Book 5K+ installs, 3.41 stars; Playo in Colombo since April 2026 ([Business News This Week](https://businessnewsthisweek.com/business/playo-expands-global-footprint-with-sri-lanka-launch/)) with 5 Colombo venues listed, not confirmed from Playo's own site by the local notes |
| Global friend apps | Absent locally | **Fact:** Timeleft (about 200 cities: 196 on [its locations page](https://timeleft.com/locations/), "200 to 220" elsewhere) has no Colombo city |
| mithuru.lk (announced, not launched) | Bundles **dates** in the same app | **Fact:** trilingual, Hangouts, campus circles, Sports Connect ([mithuru.lk](https://mithuru.lk/)) |
| Dating apps used "for friends" | Stigma, trust problems, scams | **Fact (qualitative, old):** "a stigma surrounding these apps" ([Pulse.lk](https://pulse.lk/everythingelse/dating-apps-through-the-eyes-of-a-hopeless-romantic-in-lanka/), search summary, verify before quoting publicly); police warning on fake dating-app APKs, 25 Oct 2026 ([Newswire](https://www.newswire.lk/2026/10/25/police-warn-public-of-scams-involving-fake-dating-apps/)) |
| Doing nothing | Default for newcomers and people whose friends left | **Fact:** Colombo +191,524 and Gampaha +357,528 net lifetime in-migrants (2024 Census press note) |

**Blunt read:** the alternative to beat is WhatsApp plus doing nothing. Positioning against Timeleft or Bumble is pointless locally; almost nobody in Colombo has used them.

---

## 3. Unique attributes and value (Dunford 2 and 3)

All attributes are **Fact (product)**, from `CLAUDE.md` and the code.

| Attribute | Unique against | Value to the player |
|---|---|---|
| Any activity in one feed | Volt, Playo, Play.Book (sport only); run clubs (one activity) | One place for "I want to do something this weekend" |
| Open seats on a real person's plan, first-come | Instagram pages (a crowd); Timeleft (an algorithm picks your table) | Join something already happening, at a time you chose |
| Minimum three, public places only | Dating apps, mithuru's dates | Easy to explain to parents; feels safer to try |
| Blind feed: photos and chat unlock only when every spot fills (or 2h before) | Everyone found. Meetup and Timeleft **charge** to see who's coming, which users read as dating-adjacent (`competitors_global.md` §3) | Nobody browses faces and picks |
| No private DMs, ever | Bumble BFF, mithuru ("say hi"), Timeleft (1:1 "Connect" after) | No inbox, no one-on-one pressure |
| Audience filters (age, women-only, men-only), enforced in Postgres | WhatsApp, Instagram, Volt | Women can choose a women-only plan |
| Reviewed photos, optional video verification, crew vote, chat moderation | Facebook groups; Playo (a reviewer: "There is no way to report scammers on this app") | Real people, no NIC upload |
| Held seats with single-use invite links | Solo-only friend apps | Bring a friend; hosts keep regulars |
| No payments, free, PWA | Play.Book's 3.5% fee ("extortion" in a 1-star review) | Nothing to pay or download from a store |

**Value in one line:** *turn a plan into a full group without asking around, with safety built into the format.*

Caveat: **"any activity"** only helps if the feed has several categories; today it shows 2 gigs (Fact, `00` §1). **Assumption:** lead with futsal, badminton and board games in the first zone (`02-personas-jtbd.md`).

---

## 4. Best-fit customers (Dunford 4)

Consistent with `02-personas-jtbd.md` §6. **Assumption** until the field kit reports.

1. **Supply: organisers who already run a weekly game.** The "fill my last spots" job; held seats already serve them.
2. **Demand: young professionals and newcomers in one corridor** (Rajagiriya, Kotte, Nugegoda, Maharagama), who have a plan and nobody to do it with, or no circle at all.
3. **Women looking for safe group plans, as a launch gate.** If women don't average 3 or more on Q10, the beachhead fails.

---

## 5. Market category (Dunford 5)

### 5.1 Options compared

Scores are **Assumptions** unless marked. Google Trends and keyword tools weren't accessible (`positioning_category.md` §3), so "search language" is judgement; checks are in §5.3.

| Option | Clarity | Dating risk | Crowding | Search language | Sri Lankan fit | Verdict |
|---|---|---|---|---|---|---|
| **Group plans** | High: the job plus the format | Low: "group" counters the 1:1 read | Low locally; Bumble calls a feature "Plans" ([Bumble support](https://support.bumble.com/hc/en-us/articles/36732626897437-Meet-people-IRL-using-Plans)) but isn't here | Low as a phrase; people search the activity | **A:** "What's the plan?" is everyday spoken English locally | **Recommend** |
| Activity crews | Medium | Low | Low | Very low | **A:** "crew" is neutral urban English; unclear for Sinhala- and Tamil-first users | Use "crew" as the outcome word |
| IRL social | Low outside tech-literate users | Medium: neighbouring "social discovery" is a dating-industry term | High globally (Timeleft, Pie, 222, **Fact**) | Real store keyword ("Make New Friends IRL", **Fact**) | **A:** "IRL" is internet slang | App Store keyword only |
| Pickup sports + more | High for sport, low for "more" | **Medium to high. A:** "pickup" evokes "pickup lines"; locally people say "a match" | **High:** about 12 booking products plus Volt and Playo (**Fact**) | Strong for sport terms ("futsal Colombo") | Fights Volt and Playo on their ground | Reject; use futsal as a wedge in ads |
| Social clubs | Medium | Low to medium | Low | Low | **A:** "club" may suggest members' clubs, nightclubs or a fee | Reject |

### 5.2 Recommendation

**Category: "group plans"**, said as "the app for group plans" or "group plans in Colombo". "Crew" names the people you end up with; the activity name is the ad hook. It describes the job and the safety format in two words, has no dating overtone, nobody local owns it, and it matches existing copy ("Post a plan", "Your next plan is three people away"). It also keeps non-sport activities in, the main difference from Volt and Playo.

The cost is low search demand for the phrase. Acceptable: discovery comes from organisers, shares and activity-led ads (`03-market-size.md` finding 3).

Watch the word **"gig"**. **Assumption:** in Sri Lankan English it may read as a music show or paid casual work. It's not in the headline, which is right. Test it (Q21, §11).

### 5.3 Manual checks (gaps in the notes)

- **Google Trends**, geo Sri Lanka, 5 years: "futsal", "futsal Colombo", "things to do in Colombo", "friends app", "meetup", "Timeleft", "Bumble BFF", "make friends", "group plans", "find players".
- **Reddit** was blocked to the research tools. Search r/srilanka and r/colombo by hand: `make friends colombo`, `lonely colombo`, `futsal players`, `"looking for people" hike`, `dating app sri lanka`, `meetup colombo`. Record the words people use for their friend group.
- **Facebook group member counts** couldn't be read. Logged in, record members and last post date for the main Colombo futsal, hiking, expat and board-game groups.

---

## 6. Positioning statement (Moore style)

> **For** young adults in Colombo who want to do something this week but can't get enough people together,
> **Trimegos is** a group-plans app
> **that** fills the open spots on real plans with nearby people, in groups of three or more, always in a public place.
> **Unlike** WhatsApp groups, booking apps or friend apps that double as dating apps,
> **Trimegos** works for any activity, hides faces and chat until the whole group is in, and has no private messages, so it's never a date.

Internal short form: **"You bring the plan. We bring the crew. Never a date."**

This assumes problems B and C (company, a circle) matter more than A (short of players), which `01-problem-demand.md` says is unproven. If Q4 and the Reddit pass show mostly A, narrow to "the fastest way to fill your game" and take on Volt and Playo deliberately.

---

## 7. Staying clearly not a dating app

### 7.1 Why it matters more here

- **Fact (qualitative):** dating apps carry stigma and "a lot of trust issues" in Sri Lanka ([Roar Media archive](https://archive.roar.media/english/life/srilanka-life/tinder-in-sri-lanka-swipe-left-or-right), search summary, verify before quoting publicly); parental approval stays "very, very important" ([The Juggernaut](https://www.thejuggernaut.com/dating-in-sri-lanka), search summary).
- **Fact:** local coverage of meeting strangers via apps is dominated by scams, sextortion and a Grindr extortion ring (`trust_safety_sri_lanka.md` §3), plus the 25 Oct 2026 police warning on fake dating-app APKs.
- **Fact:** Meta allows ads for online dating services only with prior written permission ([Meta Transparency Center](https://transparency.meta.com/policies/ad-standards/restricted-goods-services/dating-ads/), accessed 2026-11-03, from search summary, verify before relying on it). **Assumption:** romantic-looking ads risk being treated as dating ads. A practical reason, beyond brand, to keep date imagery out.

### 7.2 Structural signals (the proof)

All **Fact (product)**.

| Signal | What it blocks |
|---|---|
| Minimum three people | The 1:1 meeting, by definition |
| Public places only | "Come over to mine" |
| Blind feed until the group fills; first-come spots | Browsing and picking by looks |
| No private DMs; moderated group chat | Flirting and pressure on the side |
| Audience filters (women-only, men-only, age) in Postgres | Unwanted mixed groups |
| Reviewed photos, optional live video verification | Catfish and fake profiles |
| Crew vote; "I didn't feel comfortable" exit; rule "Don't hit on the crew" | Someone treating a gig as a pickup |

**Competitors (Fact):** Timeleft relies on curation and matching and allows 1:1 "Connect" afterwards; Bumble For Friends uses swipe-and-match from a dating company; 222 sells a "blind date" format beside its friend formats; Meetup's paid attendee-gender counts drew "Stop trying to turn Meetup into a trashy dating site" (1-star, 2026-10-28) (`competitors_global.md` §3, `positioning_category.md` §2). **No product found goes as far structurally as Trimegos.**

### 7.3 Communication signals

| Signal | Do | Don't |
|---|---|---|
| People in visuals | 4 or more, clearly a group; mixed and women-only groups; people who look Sri Lankan | Two people in any hero or ad |
| Subject | An activity: futsal, a board-game table, a trailhead | Drinks, candles, sunsets |
| Time of day | Daylight, early evening | Night bar scenes |
| Venue photos | Curated courts, cafe tables, trails | Uncurated Google photos (the feed's top image today is a bartender with a blue cocktail, `00` §3) |
| Copy | "Crew", "plan", "spots", "three or more" | "Match", "meet someone", "connect", "spark" |

### 7.4 Say it or show it?

**Show it first, say it once.**
- **Fact:** no comparable product puts "dating" in its homepage headline. Timeleft defines itself with "No bios. No swiping." and keeps the denial in an FAQ post ([timeleft.com](https://timeleft.com/), [Timeleft blog](https://timeleft.com/blog/is-timeleft-a-dating-app/)).
- **Assumption:** a "not a dating app" headline puts "dating" into the first three seconds and seeds the association.
- **Fact (product):** Trimegos already says it in the right place: "Three-person minimum and no private DMs. It's for crews, not dates." (`lib/copy/marketing.ts`).

Keep the explicit line in features, About and an FAQ; let the hero say it through format words and art. Borrow Timeleft's honesty: don't claim romance never happens. Suggested FAQ: *"Is it a dating app? No. Every plan is three or more people in a public place, and there are no private messages. If two people get on, that's their business. It just isn't what Trimegos is for."* Option C (§8) tests the opposite.

### 7.5 mithuru's dating mode

mithuru is the closest local rival in spirit (trilingual, Hangouts, campus circles, Sports Connect) and includes dates (Fact). It hasn't launched.

**Recommendation:** never name it publicly (it's pre-launch; naming it gives it attention). Own the claim it can't make, **"Never a date. By design."**, in pitches to women's groups, campuses and parents, and in the FAQ. If mithuru launches with campus circles, Trimegos won't win quickly on community hooks; it can win on "the one your parents are fine with". **Assumption**, tested by Q11, Q12 and probe 25d (§11).

---

## 8. Three messaging options to test

| | **A. Fill your last spots** | **B. Got a plan? Find your crew.** (default) | **C. Never a date, by design** |
|---|---|---|---|
| Headline | Short a few players? Fill the spots tonight. | Got a plan? Find your crew. | Three or more. Always in public. Never a date. |
| Subhead | Post your futsal, badminton or board-game night. People nearby claim the open spots. Groups of three or more, always somewhere public. | Futsal, a hike, a quiz night or coffee. Post a plan or join one, and meet in a group of three or more, always somewhere public. | Group plans for futsal, hikes, board games and coffee. No swiping, no private messages, and nobody sees faces until the whole group is in. |
| Proof points | Held seats and invite links for regulars; add spots up to 16; crew vote; free | Any activity; reviewed photos and video verification; faces and chat unlock when full; women-only plans | Every signal in §7.2; the honest "what we don't do" safety page |
| Target persona | Regular-game organisers (supply) | Young professionals and newcomers; women as the gate | Women seeking safe plans; people worried about family |
| Risk | Reads as a sports utility, head-on with Volt and Playo; "tonight" promises liquidity that isn't there | Abstract if the feed is thin; "find your crew" can drift to "make friends", which may feel needy (A) | Defensive; "date" in the first line; may trigger Meta dating-ad review (A); sells safety, not fun |
| Cheap test | Pitch 10 organisers face to face, count who posts within a week; ad variant measured on gigs posted | Landing A/B control; 10-second test | Landing A/B only, plus women-only group posts via a woman recruiter (`35-field-kits.md` §5.3) |

### 8.1 How to run the tests

1. **10-second first-page test (free, now).** In `35-field-kits.md` §7 G, rotate the variants as phone mock-ups and ask items 24 and 25. Pass bar: 7 of 10 describe group activities without mentioning dating. At 5 to 7 people per variant this is directional only.
2. **Landing A/B.** There is **zero instrumentation** today (Fact, `00` §5.8). Add page-view, "Get started" click and sign-up events, split by cookie, strings in `lib/copy/marketing.ts`.
3. **Ad split.** Facebook reaches 9.0M and Instagram 2.25M in Sri Lanka (Fact, DataReportal Digital 2026). Same image, three headlines. **Assumption:** LKR 5,000 per variant (≈ USD 15; 5,000 ÷ 331 = 15.1) gives a click-through read, not a conversion read. Run one test ad first to check Meta doesn't flag it as dating.

**Prediction (Assumption):** B wins overall, A on hosts, C with women. If C wins clearly with women, fold its line into B's subhead.

---

## 9. Value propositions

### 9.1 Players

| For | Value proposition | Proof |
|---|---|---|
| Joiners | Do what you wanted this week, with a group, without asking around | Any-activity feed, first-come spots, area filter, new-gig push |
| Hosts | Your plan happens: fill the last spots without a WhatsApp scramble | Held seats, invite links, add spots, crew vote, check-in |
| Women | Plans you'd be comfortable telling your family about | Women-only audience, public places, no DMs, reviewed photos |

Gaps (already raised in `02`, → candidates for `15-feature-opportunities.md`): host notes before unlock, repeat this gig, journey safety (the documented harm for women is the bus or train, not the venue, `trust_safety_sri_lanka.md` §1).

### 9.2 Venues

**What comparable programmes promise:**
- **ClassPass:** monetise unbooked inventory; the average studio fills only 37% of capacity directly; "94% of ClassPass users are brand new to the venues they visit" (self-reported); free to join. A critic says it "cannot build the kind of client loyalty that drives recurring revenue" (search summaries, verify before quoting publicly: [ClassPass](https://classpass.com/blog/how-classpass-supports-partners/), [Athletech News](https://athletechnews.com/is-classpass-good-for-fitness-studios/)).
- **Timeleft:** no fee either way; venues earn from orders. Its help centre says venues ask to stop when groups don't order (search summary; page returned 403: [Timeleft help](https://help.timeleft.com/hc/en-150/articles/14236028247836-Partnering-with-Timeleft-Restaurants-Bars)).
- **Volt:** "Founding 50" venues free for 12 months (Fact, [volt.lk](https://www.volt.lk/)), which sets local year-one price expectations at zero (`03` finding 5).

**What Trimegos has (Fact, product):** an admin-only partner flag and perk text (`/admin/venues`); a `PerkCard` in the lobby; `/spot/[slug]` where staff type the gig code with no login (partner-only, no rate limit, `00` §2.1, §5.6); and an admin-only partner report at `/admin/partners` (crews sent, people sent, perks redeemed, CSV still named `trio-partners-…`). No billing, no venue onboarding.

**Proposition:**

> **Groups of three or more who've already committed to a time, sent to your quiet hours, and counted. Free to start.**

Proof: a pre-formed group with a time is closer to a booking than a walk-in; a monthly count; a one-box code page; cash at the venue as usual. For courts, one extra off-peak hour a week is worth about LKR 13,000 a month (USD 39), 2.6 times the proposed LKR 5,000 Spot fee (**Estimate**, `02` §7.1: 3,000 × 52 ÷ 12). For cafes, 4 people at LKR 1,000 to 2,000 is LKR 4,000 to 8,000 a visit (**Estimate**, `02` §7.2).

**Honest gaps:**
1. **Nothing steers gigs to quiet hours.** Hosts pick the time. → *Venue quiet-slot gigs* (already in `02`).
2. **Venues can't see their report.** → candidate for `15-feature-opportunities.md`: **Venue report page**, a read-only monthly view at the venue's `/spot/[slug]` behind a venue PIN (crews, people, perks, 3-month trend). Answers the ClassPass "we show you what we sent" promise.
3. **No onboarding.** → *Venue self-onboarding* (already in `02`).
4. **Timeleft's no-spend problem applies to cafes.** → candidate for `15-feature-opportunities.md`: **Venue house rules on the gig**, a partner-set minimum spend or "one order each" line shown before joining.
5. **New faces, not loyalty.** Don't promise regulars until repeat-gig data exists.
6. **No density.** With 2 gigs in the feed any promise is empty. Hold venue sales until one zone reaches the 50-participations-a-week floor (`03` decisions), except venues that run their own nights and can host.

---

## 10. Current hero and copy: critique and replacements

| Element | Today (Fact) | Problem | Replace with |
|---|---|---|---|
| Hero image | Rooftop sunset art; desktop crop shows two people with drinks (`00` §1); alt text "Three friends sharing drinks on a rooftop at sunset" (`Hero.tsx`) | Reads as a date; drinks are the subject; characters don't look Sri Lankan (`00` §3); alt promises three people the crop hides | Commission art of **4 to 6 people doing an activity** in daylight (futsal huddle, board-game table, trailhead), Sri Lankan faces, mixed and women-only groups across a set. Now: set `object-position` so all three figures show at every width, and make the alt match what's visible |
| Headline | "Plans need people. Find your crew." | Good: plan-first, group outcome | Keep as control; test "Got a plan? Find your crew." |
| Subhead | 37 words: two questions, then the process | Long for a phone hero | "Futsal, a hike, a quiz night or coffee. Post a plan or join one, and meet in a group of three or more, always somewhere public." (26 words) |
| Hero chips | "3+ per gig", "public places only", "photos reviewed" | Right idea; "gig" untested | "3+ people", "public places", "no private DMs". The sharpest anti-dating signal isn't in the hero today |
| Primary CTA | "Get started for free" | Generic | "See plans near you" (**Assumption**, A/B it) |
| Eyebrow | "Now in Colombo" (defined, unused in `Hero.tsx`) | Promises a city; launch is one corridor | Name the zone once chosen ("Now in Rajagiriya, Kotte and Nugegoda") |
| Features title | "Built for meeting people safely" | "Meeting people" is the dating frame | "Built for groups, not dates" |
| Install feature | "Add Trimegos to your home screen" | After the fake dating-APK warning, "install" can look like a scam | Add "No APK, no store download, and we never ask for OTPs or bank details." (`trust_safety_sri_lanka.md` §2) |

---

## 11. Proposed additions to 35-field-kits.md

Numbering follows `02-personas-jtbd.md` (Q16 to Q19); renumber if other docs claim these.

**Survey (after Q19):**

| # | Question (exact wording) | Type | Options |
|---|---|---|---|
| Q20 | Which word sounds most natural for a group of friends you do things with? | Multiple choice | Crew / Gang / Batch / Squad / Machan group / Friends / Other… |
| Q21 | If an app called a plan a "gig" (for example "Futsal gig, Friday 7pm"), what would you think it means? | Multiple choice | An activity plan with people / A music show / A paid job / Not sure |
| Q22 | Which of these would you most likely click? | Multiple choice, rotate order | Short a few players? Fill the spots tonight. / Got a plan? Find your crew. / Three or more. Always in public. Never a date. |

**Player interview §7 G, after item 25:**
- 25a. "If you told your parents you were going to this, how would you describe it to them?" *(Write their exact words: that's the category language.)*
- 25b. "Some people say 'machan', 'gang', 'batch' or 'crew' for their friends. Which would you use? Would any feel odd in an app?" *(Ask in Sinhala and Tamil interviews too; note whether "machan" reads as male.)*
- 25c. "What does the word 'meetup' make you think of? And 'hookup'?"
- 25d. *(Only if they mention another friend app.)* "That app also lets people find dates. Does that change whether you'd use it, or tell anyone you use it?"

**Item 24 rule:** rotate Options A, B and C as phone mock-ups instead of the live site; pass bar 7 of 10 as in §8.1.

---

## Key findings

1. **Trimegos is structurally the least date-like product in the category.** Min three, public places, blind feed, no DMs and enforced audience filters go further than Timeleft, Bumble For Friends, 222 or mithuru (Fact).
2. **The picture undoes the words.** The hero crops to two people with drinks at sunset (Fact, `00` §1); the copy is nearly right. New art is the highest-value positioning fix.
3. **"Group plans" is the category, "crew" the outcome word.** Clear, no dating overtone, unowned locally, matches existing copy. "Pickup sports" and "IRL social" are rejected (Assumption on local connotations).
4. **Show "not a dating app", say it once.** No comparable product puts "dating" in a headline; the line belongs in features and FAQ (Fact for competitors, Assumption for effect).
5. **The real competitor is WhatsApp plus doing nothing.** Volt and Playo own "short of players"; mithuru will be the "local friends app with dates". Trimegos's space is "any activity, never a date".
6. **Option B is the default, A is for hosts, C is for women's channels.** All three can be tested this month for almost nothing via the 10-second test.
7. **The venue promise outruns the product.** Trimegos can count crews but can't steer them to quiet hours, can't show venues their report, and has no density yet (Fact for the code).

## Decisions this informs

- **Category and tagline** (`40-strategy.md`, `43-decisions.md`): adopt "group plans" + "crew"; keep "gig" out of headlines until Q21 reports.
- **Hero art** (`43-decisions.md`): commission group-activity art with Sri Lankan faces; fix crop and alt text now.
- **Copy** (`lib/copy/marketing.ts`): §10 replacements, especially "no private DMs" in the hero chips and the no-APK line.
- **Test plan** (`31-channels.md`, `41-metrics-plan.md`): analytics events before any A/B; 10-second test in the first interviews.
- **Venue offer** (`10-monetization.md`, `34-venue-sales-kit.md`): free pilots sold as "filled quiet hours, counted"; build quiet-slot gigs and a venue-visible report before charging.
- **mithuru** (`04-competitors.md`): don't name it publicly; own "never a date, by design".

## Open questions

1. Do Sri Lankans read a meet-strangers app as dating at all (H5, Q12), and does it differ by gender and community?
2. Which friend-group word works locally, and in Sinhala and Tamil (Q20, 25b)?
3. Does "gig" confuse people (Q21)?
4. Is there any search demand for the category, or only for activities (§5.3)?
5. Will Meta treat friend-app ads as dating ads?
6. When mithuru launches, how prominent is its dating mode?
7. Will venues value a count of crews sent without a paid booking (venue §8 E, H10)?

## Confidence

| Area | Level | Why |
|---|---|---|
| Structural "not dating" advantage | **High** | Rules are in the code; competitor mechanics from their own pages |
| Hero reads as a date | **Medium to high** | Phase 0 observation; not yet tested with users (item 25) |
| Category choice | **Medium** | Strong logic and copy fit; no search data or local language testing |
| Local word connotations ("machan", "gang", "gig", "pickup") | **Low** | Only "machan" is sourced |
| Messaging ranking | **Low** | A prediction for §8.1 to settle |
| Venue proposition | **Medium** for its shape, **low** for willingness to pay | ClassPass, Timeleft, Volt evidence; no Sri Lankan venue interviews; Volt sets price at zero |
| Say-it-or-show-it | **Medium** | Consistent competitor pattern; no local evidence either way |
