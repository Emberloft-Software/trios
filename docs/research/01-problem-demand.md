# 01 · Problem and demand

**Phase 1 of the research programme** (`docs/research/PROMPT.md`, item 1). Written 31 October 2026 from the Phase 1 research notes. No new primary research.

| | |
|---|---|
| Scope | The problem Trimegos solves, how often it happens and how badly it hurts; how people in Colombo find activity partners today; signals of social isolation and migration among 18 to 35 year-olds in Sri Lanka. |
| Sources | `research_notes/Trimegos Phase 1 market research/` (mainly `demand_and_current_channels.md`, plus `competitors_local_indirect.md`, `competitors_global.md`, `personas_and_venues.md`, `liquidity_cold_start.md`, `market_size_inputs.md`). All URLs accessed 2026-10-31 unless stated. |
| Blocked | Reddit was blocked to the research tools. Facebook group member counts could not be read. Both need a manual pass (§6). |

Claim labels: **Fact** (sourced), **Estimate** (maths shown), **Assumption** (with how to test it). Items the notes took from a search-result summary carry "(from search summary, verify before quoting publicly)".

---

## 1. Summary

The core problem (adults in Colombo wanting company for an activity and not finding it) has never been measured in Sri Lanka. Isolation data is adolescent only; global figures are context. The strongest local signals are migration churn (census and SLBFE) and coordination pain (the WhatsApp scrum, flaking). Colombo has many single-activity, fixed-schedule communities and no live channel for "any activity, any day, with new people". Details and sources below; the numbered findings are at the end.

---

## 2. The problem, stated plainly

**Assumption (the product's core bet, H1):** adults aged 18 to 35 in Colombo regularly want to do something that needs other people (a game, an outing, a hobby) and can't easily assemble a group, so they skip it, go alone, or pay more to make it happen.

There are really three different problems inside that sentence. They have different evidence and different competitors, and the product should know which one it is solving first.

| Problem | Who has it | Evidence for Sri Lanka | Who else solves it |
|---|---|---|---|
| **A. Short of numbers.** "We have 7, need 10 for futsal tonight." | People who already have a circle and a regular game | **Fact:** Volt's whole pitch is "fill the last slots" and "Never play a man short" ([volt.lk](https://www.volt.lk/)). CricBook pitches "One person is calling three venues" ([cricbook.lk](https://www.cricbook.lk/)). | Volt (launching 2026), Playo (Colombo since April 2026), personal WhatsApp groups |
| **B. No one to go with.** "I want to hike / try board games but none of my friends will." | People whose friends have other interests, schedules or have left | **None measured.** Proxy only: communities exist and frame themselves as places to meet strangers (Tabletop SL, Lightning run club). | Run clubs, Hash, hobby nights, but you arrive alone |
| **C. No circle at all.** "I moved to Colombo / my friends emigrated." | In-migrants, boarders, returning diaspora, expats | **Fact (indirect):** census in-migration, SLBFE departures, migration intention surveys (§4). No measure of how many lack a circle. | Nobody directly; mithuru (pre-launch) aims here |

**Assumption:** the current product is built for B and C; Volt and Playo are built for A. A has the clearest pain and the most competition; B and C have strong structural signals and no proof of demand. Test with Q4, Q5 and §7 B, split by proposed Q4b (§8).

---

## 3. How often it happens and how badly it hurts

### 3.1 Frequency: unknown for adults in Colombo

- **Fact:** No DCS publication, UNFPA, LIRNEasia or CPA output, and no national youth survey found, asks Sri Lankan adults about "wanting company for an activity" or "lacking people to do things with". Searches returned only school-age GSHS analyses and a loneliness-scale validation study whose authors note there are no validated, culturally appropriate loneliness instruments even for Sri Lankan adolescents (from search summary, verify before quoting publicly) ([ResearchGate, DJGLS-11 validation](https://www.researchgate.net/publication/405100917_VALIDATION_OF_A_SCALE_DJGLS-11_FOR_ASSESSING_LONELINESS_AMONG_SCHOOL-GOING_ADOLESCENTS_IN_SRI_LANKA)).
- **Assumption:** frequency is high enough to support a product. This is H1. It is the single most important unmeasured number in the whole programme.

How we'll measure it (already in `35-field-kits.md`):

| Question | Instrument | What it gives us |
|---|---|---|
| Q4: "In the last 3 months, how many times did you want to do something ... but didn't, because you had nobody to go with?" | Survey | The frequency distribution. The key number for H1. |
| Q5: activities they'd do more often | Survey | Which gig types to seed first |
| Q6: how they find people today | Survey | Channel share (H2) |
| Q7: how well that works, 1 to 5 | Survey | Severity of channel failure (H2) |
| §7 B items 3 to 6 | Interview | The last real instance, what happened, how often, in their words |
| §7 C items 7 to 10 | Interview | How they assemble groups today and where it breaks |

**Suggested pass bar (Assumption, for the team to agree before data comes in):** H1 is supported if at least 40% of 18 to 35 respondents in Colombo and Gampaha answer "2–3 times" or more on Q4, and Q7 averages 3 or below among them. Set the bar now so the result can't be rationalised afterwards.

### 3.2 Severity: what people do when they can't find company

The brief asked for a severity view. Three outcomes are possible. None has Sri Lankan prevalence data. The table rates what evidence does exist.

| Outcome | What it looks like | Evidence | Strength |
|---|---|---|---|
| **Skip it** | The game, hike or hobby doesn't happen. | **No SL data.** Volt's "Never play a man short" implies games run short or get cancelled (Fact that the pitch exists; no measure of how often). Free events lose a median 28% of sign-ups, small free events (10 to 49) about 37% (Fact, [PheedLoop Event Data Lab #05, Apr 2026](https://pheedloop.com/blog/event-data-lab-report-5), from search summary, verify before quoting publicly). | **Weak** for SL; medium as global context |
| **Go alone** | Turn up solo to a run club, board-game day or hobby night. | **Fact:** Lightning run club's founder names not feeling you "belong" among athletes as the main barrier ([The Sun.lk, 7 May 2026](https://www.thesun.lk/solar_hq/Why-is-everyone-Running-Now-Inside-Colombo-s-Super-Fun-Run-Club/557-305220)). **Fact:** Tabletop SL is framed as a way past discomfort talking to strangers, and lets first-timers walk in ([Sunday Times, 10 Sep 2023](https://www.sundaytimes.lk/230910/magazine/board-games-going-back-in-time-but-with-a-twist-531640.html)). People do go alone, and it is uncomfortable; how many give up instead is unknown. | **Medium** that it happens and is a barrier; no prevalence |
| **Pay more** | Book a paid tour or operator, take a ride-hail instead of the bus, or cover a no-show's share of the court. | **Fact:** several Colombo hiking "communities" are commercial operators, not peer groups ([Facebook: Travel Sri Lanka - Camping & Hiking](https://www.facebook.com/TeamTravelSriLanka/)). **Fact:** a 5 km ride-hail costs about LKR 500 to 600 (USD 1.50 to 1.80) against about LKR 50 by bus (Estimate in `personas_and_venues.md` from [Numbeo Colombo, Oct 2026](https://www.numbeo.com/cost-of-living/in/Colombo): taxi LKR 120/km plus LKR 130 start; ticket LKR 52.50). **Estimate:** when a 10-person futsal booking loses one player, each remaining player pays about 11% more (10 ÷ 9 = 1.11). | **Weak to medium**; the cost mechanics are real, how often people pay them is unknown |

**Fact (context):** average net salary in Colombo is about LKR 84,404 a month (about USD 255) ([Numbeo, 28 Oct 2026](https://www.numbeo.com/cost-of-living/in/Colombo)); a Mahapola stipend is LKR 10,000 (about USD 30). **Assumption:** for students and junior workers, "pay more" quickly becomes "skip it". Test with proposed Q4a (§8) and interview §7 E.

**Blunt read:** the strongest severity signal we have is about **flaking and filling numbers**, which hits a min-3 product harder than a 50-person run club. One no-show turns a 3-person gig into 2 strangers and a cancelled plan (Estimate: at a 37% no-show rate, a 3-person gig expects about 1.1 no-shows; 3 × 0.37 = 1.11). Severity for problems B and C (no one to go with, no circle) is plausible and unproven.

---

## 4. Signals of social isolation and migration among 18 to 35 year-olds

### 4.1 Evidence ladder

| Tier | What it is | Use it for |
|---|---|---|
| **Sri Lanka, measured** | Census 2024 migration, SLBFE departures, GSHS adolescent loneliness, migration-intention surveys | Claims about Sri Lanka, with the age caveat |
| **Global, borrowed** | WHO 2025, Gallup/Meta 2023, Timeleft's experience | Context and design lessons only. Never as a Sri Lankan number. |
| **Unknown** | Adult loneliness in SL, activity-company frequency, how many newcomers lack a circle, age profile of migrants | Field kit and the questions in §8 |

### 4.2 Sri Lanka, measured

**Internal migration (the strongest local signal)**
- **Fact:** Census 2024 (final-report press note): population 21,781,800; lifetime migrants 13% of the population; net lifetime in-migration highest in **Gampaha (+357,528)** and **Colombo (+191,524)**; by previous district of residence, Gampaha and Colombo each have over 0.5 million in-migrants, and Colombo also has high out-migration. Kandy, Matara, Nuwara Eliya and Galle lose the most. Unemployment is highest among 20 to 24 year-olds ([DCS Census 2024 press note](https://www.statistics.gov.lk/qlink/PressReleases/press_note_CPH_2024_En)).
- **Estimate:** Colombo plus Gampaha hold over 1 million in-migrants by previous residence (two districts × "over 0.5 million" each). The census note gives no age breakdown, so the 18 to 35 share is **unknown**.
- **Fact:** Colombo District population 2,375,415; about 599k aged 18 to 34 (Estimate, `market_size_inputs.md`). The city core (Colombo and Thimbirigasyaya DS divisions) has 509k people, about 128k aged 18 to 34 (Estimate, same source).
- **Fact:** the IT/BPM workforce is about 175,000 (Daily FT, July 2026) or 150,000 direct (Sunday Observer, March 2025), mostly Colombo-based (from search summary, verify before quoting publicly) ([Daily FT](https://www.ft.lk/it-telecom-tech/SLASSCOM-reflects-on-a-year-of-creating-opportunities-strengthening-Sri-Lanka-s-knowledge-and-innovation-industry/50-794672); [Sunday Observer](https://www.sundayobserver.lk/2025/03/17/business/47627/slasscom-targets-us5b-revenue)).
- **Fact:** boarding rooms near campuses and work hubs are a visible market: shared rooms in Malabe, Dehiwala and Kesbewa at about LKR 15,000 to 16,000 a month, plus "girls only" and "ladies" boarding listings (from search summary, verify before quoting publicly) ([ikman.lk](https://ikman.lk/en/ads/s/09/sri-lanka/room-annex-rentals/10-bedrooms)). Indirect evidence that a "living away from home" segment exists. No count found.

**Emigration (friend groups hollowed out)**
- **Fact:** SLBFE foreign-employment departures were 314,672 in 2024 (a record) and 310,915 in 2025; the 2026 target is 350,000 (310,000 in another report) ([Daily Mirror, 6 Jan 2026](https://www.dailymirror.lk/breaking-news/Sri-Lanka-eyes-350-000-foreign-employment-departures-in-2026/108-329575); [Ada Derana](https://www.adaderana.lk/news.php?nid=117681)). Other reports give slightly different totals for both years.
- **Fact:** about 48% of 18 to 29 year-olds wanted to migrate in 2021 (IHP Sri Lanka Opinion Tracker; pre-dates the 2022 crisis peak) ([Daily Mirror](https://www.dailymirror.lk/print/business-news/Increased-migration-of-educated-youth/273-285284)); 67% of a 2023 sample of undergraduates and fresh graduates had strong intention to migrate ([University of Moratuwa repository](https://dl.lib.uom.lk/items/88ebaae4-1637-445c-970f-fa1285e3f821)). Both from search summary, verify before quoting publicly.
- **Fact (counterpoint):** one source notes departures among 15 to 29 year-olds relative to their population had not risen noticeably; intention is not departure (from search summary, verify before quoting publicly) ([Asia Research News](https://www.asiaresearchnews.com/content/youth-migration-challenges-and-opportunities-sri-lanka-0)).
- **Assumption:** people who stay lose friends to emigration and need to rebuild circles. Plausible, not measured. Test with the proposed question in §8.

**Loneliness and mental health (adolescents only)**
- **Fact:** GSHS 2024 (ages 13 to 17): "more than one in five" lonely, almost 18% persistent depression, 15% seriously considered suicide in the past year ([WHO Sri Lanka, 10 Sep 2025](https://www.who.int/srilanka/news/detail/10-09-2025-world-suicide-prevention-day-2025--changing-the-narrative-on-suicide-in-sri-lanka)).
- **Assumption:** some of that loneliness carries into early adulthood. No longitudinal Sri Lankan data. **Do not quote adolescent figures as adult figures** in pitch decks or marketing.

### 4.3 Global, borrowed (context only)

- **Fact:** WHO Commission on Social Connection (30 Jun 2025): 1 in 6 people affected by loneliness; 17 to 21% of 13 to 29 year-olds; about 24% in low-income countries against about 11% in high-income ([WHO](https://www.who.int/news/item/30-06-2025-social-connection-linked-to-improved-heath-and-reduced-risk-of-early-death)). WHO recommends joining local groups.
- **Fact:** Gallup/Meta 2023, 142 countries: nearly 1 in 4 people feel very or fairly lonely ([Gallup](https://news.gallup.com/opinion/gallup/512618/almost-quarter-world-feels-lonely.aspx)). Sri Lanka's row was not extracted.
- **Fact:** Timeleft (dinners with strangers) runs in about 200 cities (196 on its cities page, [timeleft.com/cities](https://timeleft.com/cities/); "200+" after cutting back from 325 opened in a year, [Tim Frin Substack](https://timfrin.substack.com/p/inside-timelefts-journey-to-connecting)), with about 150k monthly participants in August 2025. Many smaller cities fizzled for lack of density. Its founder's first idea, strangers doing shared activities like skydiving, didn't take off; low-stakes group meals did ([Alta](https://www.altaonline.com/dispatches/a63924701/strangers-in-the-night/)). Timeleft is not in Sri Lanka.

**Use:** context only. Timeleft's activity-first failure is a direct warning for Trimegos's "the wedge is the activity" thesis.

---

## 5. How people in Colombo find activity partners today

### 5.1 Two kinds of community

The clearest pattern in the notes is a split between two shapes of community.

| Shape | Examples in Colombo | Strength | Gap |
|---|---|---|---|
| **One activity, fixed schedule** | Colombo Night Run (Thu 7:15 pm), Colombo City Running (Sun 5:45 am), 6ish @ 6ish (Fri 6:15 am), Lightning (Sun 7 am), Hash (Sat 5 pm), Tabletop SL (every other Sunday), Mercantile leagues, campus teams | Free, regular, culturally accepted, newcomer-friendly norms already exist | You must like that activity, at that time, and you still arrive alone into a crowd |
| **Any activity, any day, with new people** | Nothing active found. Colombo Social on Meetup (690 members) last met May 2024. Colombo outdoor adventures Meetup group (378 members) shows 0 events. | | This is the empty space |

**Fact:** Colombo Night Run has met weekly since June 2016 with members from 43 countries ([CNR About](https://www.colombonightrun.com/about)). Tabletop SL grew from 10 people (2019) to 400+ members (2023) ([Sunday Times, 2023](https://www.sundaytimes.lk/230910/magazine/board-games-going-back-in-time-but-with-a-twist-531640.html)), but its Meetup URLs now return "group not found". Colombo Social (690 members) last met on 24 May 2024 ([Meetup](https://www.meetup.com/colombo-social/)).

**Assumption:** the "any activity" shape is empty because it's hard to sustain, not because nobody wants it. Volunteer organisers burn out (Colombo Social dormant, Tabletop's Meetup gone). A product where any member can host spreads that load. This is H6 (enough people will host): test with Q8 and §7 E.

### 5.2 Channel map

Who each channel serves and where it fails. Strengths and weaknesses are inferences from the notes unless marked Fact.

| Channel | Who it serves | Where it fails | Key evidence |
|---|---|---|---|
| **Existing friends** | Anyone with a local circle | Interests and schedules don't line up; friends move or emigrate | **Fact:** 310,915 foreign-job departures in 2025 (§4.2). Share who lost a friend: unknown. |
| **Personal WhatsApp groups** | Regular players inside a circle; organisers | Closed to outsiders; "scrum" to fill last slots; no discovery, no safety layer; chats go dead | **Fact:** Volt depicts a venue owner juggling "3 WhatsApp groups, 1 notebook" and pitches "End the WhatsApp scrum" ([volt.lk](https://www.volt.lk/)). |
| **Open WhatsApp "make friends" groups** | Nobody well | Link directories are unvetted and mixed with adult and spam content | **Fact:** such directories exist and are spam-heavy (see `demand_and_current_channels.md` Q2). Not a demand measure; a trust warning. |
| **Facebook groups and pages** | Hikers, bikers, expats, venue followers; older-skewing mass reach | Noisy, no headcount or confirmation, scams and spam, no verification | **Fact:** page likes only, e.g. Bike Hikers Club Sri Lanka about 6,392, Ceylon Ramblers' Club about 6,083, Compass Crew about 809 (from search summary). **Group member counts could not be read.** |
| **Instagram communities** | Urban, trend-aware youth; run clubs, café nights | Big-crowd format; organiser-dependent; discovery only through follows | **Fact:** Instagram ad reach is 2.25M in Sri Lanka, against 9.0M for Facebook (DataReportal Digital 2026, per `personas_and_venues.md`). |
| **Run clubs** | Runners of all levels, early risers, Thursday-nighters | One activity, one time slot; you arrive alone into a large group | **Fact:** at least 5 recurring Colombo-area runs on CNR's calendar ([colombonightrun.com/events](https://www.colombonightrun.com/events)). |
| **Hash House Harriers** | Social walkers/runners who like drinks after; long-standing expat and local mix | Weekly, Saturday 5 pm only; separate men's and women's groups; drinking culture won't suit everyone | **Fact:** Colombo Hash House Harriers (men) and Harriettes (women, since 1984) ([colombohash.org](https://www.colombohash.org/); [hashcolombo.com](https://www.hashcolombo.com/)). |
| **Meetup** | Tech and professional networking | Dead for social use in Colombo | **Fact:** 12 of 14 Colombo groups are tech or professional (AWS User Group Colombo 4,839 members); the only non-tech one is Sahaja Yoga Meditation (871) ([Meetup Colombo](https://www.meetup.com/find/?location=lk--Colombo&source=GROUPS)). |
| **Corporate (Mercantile) leagues** | Employees of member firms, team sports | Team-level entry, not individual; competitive; only if your employer plays | **Fact:** Mercantile Football 2024, 27 teams; Mercantile Cricket T10 2026, 26 teams (both from search summary) ([Sunday Observer](https://sundayobserver.lk/2024/06/23/sport/25784/27-teams-to-contest-mercantile-football); [Daily FT](https://www.ft.lk/sports/CDB-powers-MCA-T10-Cricket-Tournament-2026/23-793667)). |
| **Campus societies and teams** | Students | Ends at graduation; campus-bounded | **Fact:** e.g. SLIIT futsal, "no specific qualifications required to join" ([SLIIT](https://www.sliit.lk/life-at-sliit/sports-and-fitness/futsal)). |
| **Booking apps** | People who already have a group and need a court | Sport-only, tiny user bases, fee friction | **Fact:** about 12 local booking products, most 2024 to 2026; only Play.Book has traction (5K+ installs, 3.41 stars from 21 ratings); reviews complain of a 3.5% fee ([Google Play](https://play.google.com/store/apps/details?id=com.lkdev.playbook.prod&gl=LK&hl=en)). **Fact:** Playo began operating in Colombo in April 2026 ([Business News This Week, 29 Apr 2026](https://businessnewsthisweek.com/business/playo-expands-global-footprint-with-sri-lanka-launch/)) and lists 5 Colombo venues ([playo.co](https://playo.co/venues/colombo/sports/all)); not confirmed from Playo's own site. |
| **Volt** | Sports players short of numbers | Sport-only, venue-led, no non-sport plans, no minimum group or safety framing; no Play Store listing found | **Fact:** "Post a game, see who's in, and fill the last slots from players nearby", launching 2026 ([volt.lk](https://www.volt.lk/)). The closest local overlap with Trimegos's futsal use case. |
| **mithuru (pre-launch)** | Same audience as Trimegos | Not launched; bundles a dating mode | **Fact:** announces Hangouts, campus and work circles, Sports Connect, trilingual UI, and "dates" ([mithuru.lk](https://mithuru.lk/)). The biggest local direct-competition risk. |
| **Doing nothing** | Nobody, but it's the default for newcomers and people whose friends left | Loneliness; skipped activities | **No data.** This is the number Q4 and Q6 ("I usually don't find anyone") measure. |

### 5.3 What the map says

- **Fact:** Colombo has no incumbent platform for "join strangers for an activity". Meetup is tech-only here and Timeleft's locations page doesn't list Colombo ([timeleft.com/locations](https://timeleft.com/locations/)).
- **Assumption:** the gap is unserved demand, not absent demand. The alternative is that family, school and work circles already cover it. Q6 and Q7 decide.
- **Opinion, from the evidence:** the best wedge may not be competing with communities at all, but **feeding them**. "Go to Colombo Night Run with 3 others this Thursday" uses an existing, free, trusted event and solves the "arrive alone" problem. It needs no venue deal and fills a gig with a known start time and place.

---

## 6. Manual search pass (Reddit and Facebook)

Reddit was blocked to the research tools and Facebook group sizes couldn't be read. One person, about 2 hours, logged in, read only, before the survey launches. Recruitment posts come later (`35-field-kits.md` §5.4).

### 6.1 Reddit

Search inside each subreddit (search box, "limit to r/srilanka" or "r/colombo"), sort by **Relevance**, then repeat with **New**:

| # | Search string |
|---|---|
| 1 | `make friends` |
| 2 | `"new to Colombo"` |
| 3 | `"moved to Colombo"` |
| 4 | `lonely` |
| 5 | `"no friends"` |
| 6 | `"friends left" OR "friends migrated" OR "everyone left"` |
| 7 | `futsal players` |
| 8 | `badminton partner` |
| 9 | `"hiking buddies" OR "hiking group"` |
| 10 | `"board games"` |
| 11 | `"run club"` |
| 12 | `"anyone want to" Colombo` |
| 13 | `meetup Colombo` |
| 14 | `"looking for people"` |

Also run these in Google, which often finds older threads Reddit's own search misses:
- `site:reddit.com/r/srilanka "make friends" Colombo`
- `site:reddit.com/r/srilanka "new to Colombo"`
- `site:reddit.com/r/srilanka lonely`
- `site:reddit.com/r/colombo friends`

Log per thread: title, date, URL, upvotes, comments, which problem it shows (A, B or C), any safety worry. Paraphrase. Stop at 30. If most threads are about filling sports numbers, problem A dominates and Volt/Playo are the real competition; if friend requests dominate, problem C does.

### 6.2 Facebook

Search Facebook, filter to **Groups**:

| # | Search string |
|---|---|
| 1 | `futsal Colombo` |
| 2 | `badminton Colombo` |
| 3 | `hiking Sri Lanka` |
| 4 | `hikers Sri Lanka` |
| 5 | `Colombo expats` |
| 6 | `board games Sri Lanka` |
| 7 | `running Colombo` |
| 8 | `cycling Colombo` |
| 9 | `women hiking Sri Lanka` (and `girls who travel Sri Lanka`) |
| 10 | `make friends Sri Lanka` |
| 11 | `boarding Colombo` (shows the newcomer audience) |
| 12 | `Colombo foodies` |

Log for the top 5 per search: name, public or private, **member count**, posts per day, number of "need players / anyone joining?" posts in the last 30 days, admin approval, visible spam. Also record follower counts for @colombonightrun, @tabletop_sl and @thefunboardgames.

---

## 7. Gaps that become feature ideas

Each answers a specific finding above. Not scored; doc 15 does that.

1. **Arrive together.** A gig type attached to an existing public event (a run club night, a board-game day, a quiz): "3 of us are going to Colombo Night Run on Thursday, meet at the statue at 7:05." Answers §3.2 "go alone" and §5.3. Needs no venue partner. → candidate for `15-feature-opportunities.md`
2. **Fill my last spots.** A host with an existing group posts only the open seats ("we're 7, need 3"), with the existing held-seat links for their friends. Already half-built (held seats plus public seats); this is mostly framing, copy and a feed label. Answers problem A and the WhatsApp scrum. → candidate for `15-feature-opportunities.md`
3. **Repeat this gig.** One tap to repost a gig weekly with the same place, time and size, and invite last time's crew first. Answers organiser burnout (Colombo Social, Tabletop's Meetup) and the fixed-schedule habit people already have. → candidate for `15-feature-opportunities.md`
4. **"Want this" demand signal.** On an empty feed or category, let people tap "I'd join a hike this weekend in my area"; tell hosts how many are waiting. Answers the unmeasured frequency (§3.1) with live data and the cold-start feed (`00-current-state.md` §1). → candidate for `15-feature-opportunities.md`
5. **New-to-Colombo starter gigs.** A badge or filter for gigs a host marks as "newcomers welcome", plus a short onboarding question ("new to Colombo?") that feeds an anonymous count. Answers problem C and the census in-migration signal (§4.2). → candidate for `15-feature-opportunities.md`
6. **Per-head cost shown up front.** Hosts enter the total (court hire, entry) and the card shows LKR per person at full capacity and at minimum. No payments handled. Answers "pay more" and local fee resistance (Play.Book reviews). → candidate for `15-feature-opportunities.md`
7. **Still coming? check plus backfill.** A T-24h and T-2h confirm push; unconfirmed seats open to a waitlist. Answers the 37% small-free-event no-show figure and the min-3 fragility (§3.2). → candidate for `15-feature-opportunities.md`

---

## 8. Proposed additions to 35-field-kits.md

The current survey measures frequency (Q4) but not what people did instead, or whether they're newcomers. Add to Section 2 of the form, after Q4:

| # | Question (exact wording) | Type | Options |
|---|---|---|---|
| Q4a | The last time that happened, what did you do instead? | Multiple choice | Didn't do it at all / Went alone / Paid for a tour, class or service to do it / Did something else with people I know / Can't remember |
| Q4b | Have you moved to the Colombo area from another district in the last 5 years? | Multiple choice | Yes, in the last year / Yes, 1 to 5 years ago / No / Prefer not to say |
| Q4c | In the last 3 years, have any of your close friends moved abroad? | Multiple choice | None / 1 or 2 / 3 or more / Prefer not to say |

Q4a gives the severity split in §3.2. Q4b and Q4c test problems C and the migration signals in §4.2. This takes the survey to 18 questions; keep it under 4 minutes.

Add to interview §7 B, after item 4: "Have you ever gone to a club or event on your own because nobody would come? What was it like walking in?" This tests the "arrive together" idea without naming it.

---

## Key findings

1. **Adult demand frequency in Colombo is unmeasured.** No Sri Lankan source asks adults how often they want company for an activity and can't find it. H1 rests entirely on Q4 and §7 B (Fact that no data exists).
2. **Sri Lankan isolation data is adolescent only** ("more than one in five" lonely at 13 to 17, GSHS 2024). Global young-adult figures (17 to 21%, higher in poorer countries) are context, not evidence for Colombo (Fact).
3. **Migration churn is the strongest local signal.** Colombo and Gampaha gain +191,524 and +357,528 net lifetime in-migrants, with over 1 million in-migrants between them; about 311,000 foreign-job departures in 2025 (Fact; the 18 to 35 share is unknown).
4. **Colombo has many "one activity, fixed schedule" communities and no live "any activity, any day" channel.** Meetup is tech-only, Timeleft is absent, and volunteer social groups have gone dormant (Fact).
5. **The best-evidenced pain is coordination and flaking**: the WhatsApp scrum, filling the last slots, and a 37% median no-show for small free events. A min-3 product is more exposed to this than a run club (Fact for the signals; Estimate for the min-3 impact).
6. **Problem A (short of numbers) is now contested** by Volt and Playo; problems B and C (no one to go with, no circle) are open but unproven. mithuru is pre-launch and aims at the same space with a dating mode (Fact).
7. **Severity is unknown.** "Go alone" has medium evidence as a barrier; "skip it" and "pay more" are mechanically real but unmeasured (labelled in §3.2).

## Decisions this informs

- **Which problem to lead with** (`16-direction-options.md`, `43-decisions.md`): A (fill numbers, against Volt and Playo), B (company for a chosen activity), or C (a circle for newcomers). Recommendation: lead with B and C in positioning, and use A as a supply tactic (organisers who need spots are the easiest hosts).
- **Seeding strategy** (`07-liquidity-cold-start.md`): piggyback on existing fixed-schedule communities ("arrive together") before trying to create demand from scratch.
- **Target segments** (`04-personas.md`): in-migrants and boarders, IT/BPM workers, students, people whose friends emigrated. Test each with Q4b, Q4c and Q3.
- **Survey priority** (`35-field-kits.md`): run Q4 to Q7 first and agree the H1 pass bar (§3.1) before results arrive.
- **Positioning against mithuru and Volt** (`02-competitors.md`, `05-positioning.md`): "not dating, min 3, public, any activity" versus mithuru's dating mode and Volt's sport-only scope.
- **No-show controls as core, not later** (`15-feature-opportunities.md`): the min-3 rule makes reliability a launch feature.

## Open questions

1. How often do 18 to 35 year-olds in Colombo actually skip activities for lack of company (Q4)? This is the number the whole product rests on.
2. What do they do instead: skip, go alone or pay (proposed Q4a)?
3. What share of the target group are recent in-migrants or have lost friends to emigration (Q4b, Q4c; the census migration tables by age)?
4. What do r/srilanka, r/colombo and Colombo Facebook groups show about "need people" posts: volume, type (A, B or C), and responses (§6)?
5. Has Volt launched to players, and how many Colombo venues does Playo now list?
6. When does mithuru launch, and will its dating mode taint or help the category?
7. Is the "any activity" space empty because of low demand or because volunteers burn out? Interviews with former organisers (Colombo Social, Tabletop SL) would answer this cheaply.

## Confidence

- **Internal and international migration figures: high.** Official census and SLBFE data, though totals vary slightly between reports and there is no age breakdown.
- **Channel map and community inventory: medium.** Built from public pages and listings. Member counts for Facebook groups, Reddit activity and current attendance are missing, and some figures come from search summaries.
- **Global loneliness context: high as context, low as a proxy for Colombo.** WHO and Gallup are solid; transferring them to Colombo adults is not.
- **Sri Lankan loneliness: medium for adolescents, none for adults.** GSHS is credible but loneliness figures vary by survey round and threshold.
- **Severity view: low.** Mechanisms are evidenced; prevalence of skipping, going alone or paying more is not.
- **Demand frequency (H1): no evidence yet.** Confidence will only exist after the survey and interviews.
