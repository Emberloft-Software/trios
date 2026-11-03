# 03 · Market size

**Phase 1 of the research programme** (`docs/research/PROMPT.md`, item 3). Written 3 November 2026 from the Phase 1 research notes plus one targeted search (English literacy). No new primary research.

| | |
|---|---|
| Scope | TAM, SAM and SOM for Colombo, then Sri Lanka, then expansion markets. Players and venues. All maths shown. |
| Sources | `research_notes/Trimegos Phase 1 market research/` (mainly `market_size_inputs.md`, plus `competitors_global.md`, `competitors_local_indirect.md`, `personas_and_venues.md`, `liquidity_cold_start.md`). Old spec `docs/08-monetization.md` for venue price placeholders. All URLs accessed 2026-10-31 unless stated. |
| Exchange rate | LKR 331 per USD (FRED DEXSLUS, 16 Oct 2026, https://alfred.stlouisfed.org/series?seid=DEXSLUS, accessed 2026-10-30). |

Claim labels: **Fact** (sourced), **Estimate** (maths shown), **Assumption** (with how to test it). Items the notes took from a search-result summary carry "(from search summary, verify before quoting publicly)".

---

## 1. Summary

Trimegos's market is not limited by population. It is limited by density and by what a 3-person team can run. Colombo District has about 503k internet users aged 18 to 34. Even after harsh filters for English, smartphone and interest, the base case leaves about 111k reachable people in the district and about 28k in the first launch zone. A realistic 12-month outcome is about 350 monthly active participants in one zone (low 145, high 680). That is about 1% of the zone's serviceable market. It also matches the depth Timeleft needs to keep a city alive.

The venue side is smaller than the spec implies. At the spec's untested prices, the base case gives about LKR 56,000 a month (USD 169) at month 12 and about LKR 189,000 a month (USD 571) at month 24. Venue revenue is a validation signal, not a business, inside 24 months. The limit is not the number of venues. It is how many crews Trimegos can send each one.

The numbered findings are at the end.

---

## 2. Definitions used in this document

The unit is **people**, not money. For a free-to-join social product, people are what limit everything else. Money is shown separately (§6, §7).

| Term | Definition for Trimegos | Unit |
|---|---|---|
| **TAM** | People aged 18 to 34 in the area who used the internet in the past year | People |
| **SAM** | TAM × comfortable with an English UI × has a smartphone that runs a PWA × in the target segment (wants company for activities often enough to act). For Colombo it is computed for the launch zone and for the whole district. | People |
| **SOM** | **Monthly active participants (MAP)**: distinct people who attend at least one gig in a calendar month. Measured at 12 and 24 months, with a 3-person team and no paid staff. | People per month |
| **Venue universe** | Every F&B and sports or fitness location in the area | Venues |
| **Serviceable venues** | Group-friendly, youth-priced, public venues in the launch zones that fit a gig activity | Venues |
| **Obtainable venues** | Venues that could be paying partners, given how many crews Trimegos can send | Venues |

**18 to 34, not 18 to 35:** the canonical census estimates stop at 34. Adding age 35 raises Colombo District from 599,225 to 630,460, about 5% (Estimate, `market_size_inputs.md` Q1), which changes no conclusion.

**MAP, not registered users:** accounts that never attend add nothing to liquidity, and MAP feeds the planned north star (gigs that ran with 3 or more checked in). The app cannot measure it yet: there are no analytics (`00-current-state.md` §1, item 5).

---

## 3. Population base

### 3.1 People aged 18 to 34

| Area | Total population | 18 to 34 | Source |
|---|---|---|---|
| Sri Lanka | 21,781,800 | ≈ 5,113,139 | Fact (total) and Estimate (age), Census 2024 Table A2 |
| Western Province (Colombo + Gampaha + Kalutara) | 6,117,341 | ≈ 1,484,965 | Same |
| Colombo District | 2,375,415 | ≈ 599,225 | Same |
| Colombo city core (Colombo + Thimbirigasyaya DS divisions) | 509,207 | ≈ 128k | Estimate, district age share applied |
| Kandy District | 1,461,895 | ≈ 329,089 | Census 2024 Table A2 |
| Galle District | 1,097,372 | ≈ 248,607 | Same |

Source: [DCS CPH 2024 Population Tables, Table A2 (PDF)](https://www.statistics.gov.lk/Resource/en/Population/CPH_2024/CPH_2024_Population_Tables.pdf). Method: 18 to 34 = 0.4 × (15 to 19) + (20 to 34), which assumes the 15 to 19 band is spread evenly. Table A5 (single years of age) would replace this.

**Caveats.** The CMC area has no official age table, and its total (394,533) is unverified (`market_size_inputs.md` Q1), so this document uses DS divisions. The inner city is shrinking (Colombo DS 323,257 in 2012, 292,089 in 2024) while Kaduwela, Homagama and Kesbewa grow ([citypopulation.de](https://citypopulation.de/en/srilanka/admin/11__colombo/)). Young adults are spread across the suburbs.

### 3.2 Launch zone

`liquidity_cold_start.md` §5 points to a south-east corridor (Rajagiriya, Kotte, Nugegoda, Maharagama): near Sri Jayewardenepura, the biggest state campus, and the main futsal cluster. This document sizes a slightly wider **Zone A** that adds the Colombo 5/7/8 cafe belt and the Dehiwala coast: Thimbirigasyaya 217,118 + Maharagama 196,500 + Kotte 96,189 + Dehiwala 93,815 = **603,622 people** (Fact, Census 2024 DS totals via citypopulation.de).

**Estimate:** Zone A aged 18 to 34 = 603,622 × (599,225 ÷ 2,375,415 = 25.2%) = **152,270**, assuming the district's age mix. The zone itself is an **Assumption**; `07-liquidity-cold-start.md` picks the real neighbourhoods.

---

## 4. Player TAM: internet users aged 18 to 34

**Fact:** past-year internet use by age, 2024: 15 to 19: 79.2%; 20 to 24: 88.4%; 25 to 29: 84.9%; 30 to 34: 79.6% ([DCS Computer Literacy Statistics 2024 (PDF)](https://www.statistics.gov.lk/Resource/en/ComputerLiteracy/Bulletins/AnnualBuletinComputerLiteracy-2024.pdf)). Urban use is 67.1%, against 54.6% for all ages.

**Estimate:** applying each band's rate to that band's population:

| Area | 18 to 34 | Internet users 18 to 34 (TAM) | Weighted rate |
|---|---|---|---|
| Sri Lanka | 5,113,139 | **4,281,484** | 83.7% |
| Western Province | 1,484,965 | **1,245,891** | 83.9% |
| Colombo District | 599,225 | **503,274** | 84.0% |
| Zone A | 152,270 | **127,892** | 84.0% (district rate) |
| Kandy District | 329,089 | **275,835** | 83.8% |
| Galle District | 248,607 | **208,052** | 83.7% |

Worked example, Colombo District: (0.4 × 179,866 × 0.792) + (200,897 × 0.884) + (167,913 × 0.849) + (158,469 × 0.796) = 56,981 + 177,593 + 142,558 + 126,141 = 503,274.

**Caveat.** These are national age rates. Colombo is more urban, so its true rate is probably higher. That makes the TAM conservative. DCS gives no district-level rate (`market_size_inputs.md` Q2 Gaps).

**Cross-check (Fact):** DataReportal counts 13.9M internet users in all of Sri Lanka, all ages ([DataReportal Digital 2026](https://datareportal.com/reports/digital-2026-sri-lanka)). The 4.28M people aged 18 to 34 are about 31% of them. That is plausible for the age group with the highest use.

---

## 5. Player SAM and SOM

### 5.1 SAM multipliers

| Multiplier | Low | Base | High | Basis | Label |
|---|---|---|---|---|---|
| **English UI is comfortable** | 0.57 | 0.65 | 0.75 | National English literacy (all ages) was 57.3% in Census 2024, up from 30.8% in 2012 ([Daily FT, Apr 2026](https://www.ft.lk/front-page/Burgher-English-literacy-falls-from-97-4-in-2012-to-79-3-in-2024/44-791090), from search summary, verify before quoting publicly). Young urban adults are very likely above the national rate, so the base and high values are higher. "Literate" is also not the same as "would use an app in English". | Low is Fact-based; base and high are **Assumption**. Test with Q14 and the census English table by age and district. |
| **Smartphone that runs a PWA** | 0.76 | 0.85 | 0.95 | **Fact:** 80.3% of internet users connect by smartphone; ages 20 to 24, 76.4% (DCS 2024). Device used is not the same as ownership, and no ownership rate by age exists (`market_size_inputs.md` Q2 Gaps). Android is about 80 to 85% ([StatCounter](https://gs.statcounter.com/os-market-share/mobile/sri-lanka)). | Low is Fact-based; base and high are **Assumption**. Test with Q13 and in interviews (§7 F). |
| **Target segment** (wants company for activities often enough to act) | 0.25 | 0.40 | 0.55 | No Sri Lankan data (`01-problem-demand.md` §3.1). Base = the H1 pass bar set in `01` §3.1 (40% answer "2 to 3 times" or more on Q4). | **Assumption**. Test with Q4, Q8 and Q10. |

The three multipliers combine to 0.11 (low), 0.22 (base) and 0.39 (high). The segment multiplier carries the most uncertainty, and it is the one only the survey can fix.

### 5.2 SAM results

**Estimate** (TAM × English × smartphone × segment):

| Area | TAM | SAM low | SAM base | SAM high |
|---|---|---|---|---|
| Zone A | 127,892 | 13,851 | **28,264** | 50,118 |
| Colombo District | 503,274 | 54,505 | **111,224** | 197,220 |
| Western Province | 1,245,891 | 134,930 | **275,342** | 488,234 |

Worked example, Zone A base: 127,892 × 0.65 × 0.85 × 0.40 = 28,264.

### 5.3 SOM: monthly active participants

SOM is built from the supply side, because a gig-based product is limited by gigs that actually run, not by sign-ups.

**Calibration benchmarks** (labelled as calibration, not forecasts):
- **Fact:** Timeleft has about 150,000 monthly diners across about 200 cities (196 on its cities page; "200 to 220" after cutting back from 320+). **Estimate:** 150,000 ÷ 220 ≈ **680 participants per city per month**. Sources: [Tim Frin Substack](https://timfrin.substack.com/p/inside-timelefts-journey-to-connecting); [timeleft.com/cities](https://timeleft.com/cities/). Timeleft has about 100 staff, paid ads and a mature brand, so for Trimegos this is a ceiling, not a target.
- **Fact:** Timeleft's depth benchmark is **50+ weekly participants per city**. Below that, cities "fizzled" because people kept meeting the same roughly 10 others (same Substack source). This is the floor for a zone that stays alive.
- **Fact:** Timeleft members average 1.4 to 2.2 experiences a month (same source).

**Working assumptions** (each to be replaced by real data once analytics exist):
- Attended gig size averages **5 people**. **Assumption**: the minimum is 3, the cap is 16, and `liquidity_cold_start.md` uses 6. Test with real gig data.
- Each active participant attends **1.5 gigs a month**. **Assumption**: this is the low end of Timeleft's range, because Trimegos is free and gigs are casual.
- About **25% of registered accounts** are active in a given month. **Assumption** with no source. It is used only to turn MAP into sign-ups.

**Month 12: Zone A only**

| | Low | Base | High |
|---|---|---|---|
| MAP | **145** | **350** | **680** |
| Basis | Just reaches Timeleft's 50/week depth floor | About half the Timeleft city average | Timeleft city average |
| Participations a month (MAP × 1.5) | 218 | 525 | 1,020 |
| Participations a week (÷ 4.33) | 50 | 121 | 236 |
| Gigs that run each week (÷ 5) | 10 | 24 | 47 |
| Share of Zone A SAM (same scenario) | 1.0% | 1.2% | 1.4% |
| Registered accounts (MAP ÷ 0.25) | 580 | 1,400 | 2,720 |

**Month 24: Colombo District, 3 to 4 zones**

| | Low | Base | High |
|---|---|---|---|
| MAP | **500** | **1,200** | **2,700** |
| Basis | Zone A plus one weak zone | About 3 zones at Zone A's base | About 4 zones at the Timeleft average |
| Gigs that run each week (MAP × 1.5 ÷ 5 ÷ 4.33) | 35 | 83 | 187 |
| Share of district SAM | 0.9% | 1.1% | 1.4% |
| Share of district TAM | 0.10% | 0.24% | 0.54% |
| Registered accounts | 2,000 | 4,800 | 10,800 |

**Why these numbers and not bigger ones.** `market_size_inputs.md` Q7 gives an illustrative 0.5 to 2% of Colombo's 18 to 34s, which is 3k to 12k a month. Our 24-month high (2,700) sits just below the bottom of that range, on purpose:
- **Fact:** the feed shows 2 upcoming gigs today (`00-current-state.md` §1). The base case at month 12 needs 24 gigs running every week, a 12-fold increase.
- **Assumption:** if active hosts post about one gig every two weeks, 24 gigs a week needs about 48 active hosts. The team can seed perhaps 6 to 10 house gigs a week alongside everything else. Most supply has to come from users. This is H6; test with Q8.
- **Fact:** small free events lose a median of about 37% of sign-ups ([PheedLoop via LeadsNow](https://leadsnow.ai/event-no-show-rate/), from search summary, verify before quoting publicly). A gig needs more sign-ups than the 5 who attend, so feed demand has to run ahead of these figures.

**Blunt read.** The base case is roughly "one Timeleft city's worth of people, half as active, in one zone, after a year". That is achievable. It is also small. Anything above the high case needs either more people or a self-running host community that does not exist yet.

### 5.4 Sri Lanka as a whole

- **Estimate, national SAM:** 4,281,484 × 0.573 (national English literacy, used as the national value) × 0.85 × 0.40 = **834,119**.
- This number has little practical use. Outside the Western Province, Kandy and Galle, almost nobody lives inside a dense urban area: Kandy District is 11.7% urban and Galle 12.3% (Fact, Census 2024 Table A1, `market_size_inputs.md` Q1). Gigs need a pool of people within one bus ride. **Assumption:** the national SOM is the sum of a few city SOMs (§8), not a share of 834k.

---

## 6. Venue market

### 6.1 Venue universe (proxies, with caveats)

No official venue census exists. xMap aggregates Google-Maps-style listings (aggregated 19 Mar 2025). Its totals are internally inconsistent (68,717 vs 65,504; 7,833 vs 8,388), its definitions are opaque, and it flags many listings as closed.

| Area | F&B locations | Of which flagged closed | Sports and fitness | Source |
|---|---|---|---|---|
| Sri Lanka | 68,717 (coffee/tea shops 6,378) | 9,319 | 7,833 (gyms/studios 2,654) | Fact, [xMap Dining](https://www.xmap.ai/location-intelligence-reports/dining--drinking-locations-in-sri-lanka); [xMap Sports](https://www.xmap.ai/location-intelligence-reports/sports--fitness-locations-in-sri-lanka) |
| Colombo District | 15,547 | 2,162 | 1,855 | Same |
| Colombo + Thimbirigasyaya (xMap "cities") | 4,344 | n/a | 585 | Same |
| Kandy / Galle districts | 4,075 / 3,143 | n/a | 503 / 445 | Same |

**Estimate:** open venues in Colombo District = (15,547 − 2,162) + 1,855 = **15,240**.

Hand-countable subsets (Fact): Turfify lists 9 Colombo futsal venues ([Turfify](https://turfify.theatom.lk/sports/futsal/colombo)); Playo lists 5 ([Playo](https://playo.co/venues/colombo/sports/all)), and has operated in Colombo since April 2026 ([Business News This Week, 29 Apr 2026](https://businessnewsthisweek.com/business/playo-expands-global-footprint-with-sri-lanka-launch/)), though the local notes could not confirm this from Playo's own site; a list vendor counts 143 Colombo gyms ([Rentech Digital](https://rentechdigital.com/smartscraper/business-report-details/sri-lanka/western-province/list-of-gyms-in-colombo)). **No board-game cafe in Colombo could be verified** (`personas_and_venues.md` §6). Online-bookable futsal and badminton venues number about 10 to 30 (Estimate, `market_size_inputs.md` Q4).

### 6.2 Serviceable venues in Zone A

**Estimate, F&B in Zone A:**
- xMap "cities" overlapping Zone A: Thimbirigasyaya 2,166 + Dehiwala-Mt Lavinia 1,709 + Maharagama 1,459 = 5,334. Kotte is not listed separately, so this undercounts.
- Removing the district's closed share (2,162 ÷ 15,547 = 13.9%) leaves about **4,592 open**.

| Venue type | Low | Base | High | Method |
|---|---|---|---|---|
| Group-friendly, youth-priced cafes and eateries (seats 4 to 6, public, fits coffee/brunch/board-game gigs) | 230 | 459 | 689 | 5% / 10% / 15% of 4,592. **Assumption**; test by sampling 50 Zone A listings on Google Maps. |
| Courts (futsal, badminton, indoor cricket, pickleball, padel) | 10 | 20 | 30 | Directory range for Colombo (Estimate above). Most sit in the south-east suburbs ([CricBook](https://www.cricbook.lk/blog/best-futsal-courts-colombo), from search summary). |
| Gyms and studios with drop-in or group classes | 10 | 20 | 40 | **Assumption**, a small slice of 143 gyms. Studio counts are unknown. |
| **Serviceable total** | **250** | **~500** | **~760** | |

The 4,592 open F&B listings are about 1 to 2 orders of magnitude above the serviceable set. That matches the inference in `market_size_inputs.md` Q4.

### 6.3 Obtainable paying venues

How many venues can pay is set by how many crews Trimegos sends, not by how many venues exist. A venue will not renew "on vibes" (`docs/08-monetization.md`).

**Assumptions** (each needs testing):
- 60% of gigs happen at a venue. The rest are runs, beaches, parks and hikes. Test against real gig data.
- 50% of venue gigs go to partner venues. The venue picker can steer crews there, but hosts choose.
- A venue needs at least **4 crews a month** before it would pay. Test in the venue interview (`35-field-kits.md` §8 E, items 12 to 16), plus the new question in §9.2.

**Estimate:** paying venues = gigs a month × 0.6 × 0.5 ÷ 4.

| | Gigs a month | Venue gigs going to partners | Supportable paying venues |
|---|---|---|---|
| Month 12 low / base / high | 44 / 105 / 204 | 13 / 32 / 61 | **3 / 8 / 15** |
| Month 24 low / base / high | 150 / 360 / 810 | 45 / 108 / 243 | **11 / 27 / 61** |

Gigs a month = MAP × 1.5 ÷ 5. Month 12 base: 350 × 1.5 ÷ 5 = 105.

Base case at month 24: **27 paying venues across 3 to 4 zones, under 2% of a serviceable set of roughly 1,500 to 2,000 (3 to 4 zones × ~500, Assumption), and about 0.2% of the district's 15,240 open venues.**

### 6.4 Venue money (H11 prices, untested)

**Prices.** The spec suggests Spot at about LKR 5,000 a month (USD 15.1) and Home Spot at about LKR 15,000 a month (USD 45.3). The spec itself says these are "starting points, not researched numbers" (`docs/08-monetization.md`). They are **H11 and untested** (`35-field-kits.md` §1).

**Mix (Assumption).** 80% Spot and 20% Home Spot gives a blended LKR 7,000 a month (0.8 × 5,000 + 0.2 × 15,000).

**Home Spot cap.** Home Spot includes "Trio runs one seeded gig a week at their venue". With 3 people, **Assumption:** about 5 Home Spots at most. Above that, extra venues are Spot only.

| Scenario | Paying venues | Monthly revenue (LKR) | USD | Annualised (LKR) |
|---|---|---|---|---|
| Month 12 low | 3 | 21,000 | 63 | 252,000 |
| Month 12 base | 8 | 56,000 | 169 | 672,000 |
| Month 12 high | 15 | 105,000 | 317 | 1,260,000 |
| Month 24 low | 11 | 77,000 | 233 | 924,000 |
| Month 24 base | 27 | 189,000 | 571 | 2,268,000 (USD 6,852) |
| Month 24 high | 61, capped to 56 Spot + 5 Home Spot | 355,000 | 1,073 | 4,260,000 (USD 12,870) |

**Ceilings (Estimate, not forecasts):**
- Serviceable set, every venue paying: 500 × 7,000 × 12 = LKR 42.0M a year (USD 126,888).
- Whole Colombo District universe at Spot price: 15,240 × 5,000 × 12 = LKR 914.4M (USD 2.76M).
- National universe ((68,717 − 9,319) + 7,833 = 67,231) at Spot price: LKR 4.03B (USD 12.2M).

The two bigger ceilings are only there to show how far they are from anything obtainable. Don't put them in a pitch deck.

**Price pressure (Fact).** Volt offers its "Founding 50" venues 12 months free if they onboarded before 31 July 2026, and publishes no later price ([volt.lk](https://www.volt.lk/)). Local booking tools also compete on "no booking fee" ([cricbook.lk](https://www.cricbook.lk/)). A venue that already gets free software from Volt will compare. Year-one venue revenue could realistically be zero by design.

### 6.5 Player-side money (hypothetical only)

The notes do not support a player revenue model. Two hypotheticals show the scale:

- **Service fee on paid gigs (hypothetical).** Luma takes 5% on paid tickets ([Luma Help](https://help.luma.com/p/luma-vs-meetup)). Futsal costs about LKR 250 to 350 per player, from 2022 prices of LKR 2,500 to 3,500 per court hour ([Yamu, 2022](https://www.yamu.lk/highlights/8-indoor-sports-outlets-in-colombo/)). **Estimate:** month 24 base of 1,800 participations a month × 30% paid gigs (Assumption) × LKR 300 × 5% = **LKR 8,100 a month (USD 24)**. Payment-gateway costs and the backlash against Play.Book's 3.5% fee would wipe it out ([Play.Book reviews](https://play.google.com/store/apps/details?id=com.lkdev.playbook.prod&gl=LK&hl=en)).
- **Forfeited no-show deposits (hypothetical).** The survey tests a LKR 300 refundable deposit (Q15, H13). **Estimate:** if deposits cut no-shows to about 10% (one Basecamp case went from 45% to 91% show-up, an anecdote, [Skift Meetings](https://meetings.skift.com/2026/09/02/the-100-experiment-that-slashed-no-show-rates-to-just-10/)), then 1,800 × 10% × LKR 300 = **LKR 54,000 a month (USD 163)**. That is revenue from punishing users. Its real value is reliability, not income.

Conclusion: within 24 months, no player-side model is worth the friction it adds at the join step. This agrees with `docs/08`'s logic that you "cannot charge your way out of a cold start".

---

## 7. Putting the two sides together

| | Month 12 base | Month 24 base |
|---|---|---|
| Monthly active participants | 350 | 1,200 |
| Gigs that run each week | 24 | 83 |
| Paying venues | 8 | 27 |
| Venue revenue a month | LKR 56,000 (USD 169) | LKR 189,000 (USD 571) |
| Revenue per MAP a month | LKR 160 | LKR 158 |

Revenue per MAP = venue revenue ÷ MAP. At about LKR 160 (USD 0.48) per active person a month, revenue scales almost exactly with active participants. **The money lever is liquidity.** Unit costs belong to `12-unit-economics.md`. A month-24 run rate of about USD 7k a year will not pay one salary. Funding, grants or the team's own time have to carry the first two years.

---

## 8. Expansion markets

### 8.1 Sri Lanka beyond Colombo

| Market | TAM (internet users 18 to 34) | SAM base | Mature SOM guess (MAP) | Competitors present or announced |
|---|---|---|---|---|
| Gampaha District (Negombo, Kiribathgoda, Kelaniya) | ≈ 490k (Estimate: 584,296 × 0.839) | ≈ 108k (English 0.65 Assumption) | Part of the metro: grow from Colombo, not as a "new city" | **Fact:** Gampaha has the highest net in-migration (+357,528, [DCS Census 2024 press note](https://www.statistics.gov.lk/qlink/PressReleases/press_note_CPH_2024_En)). Volt lists Negombo and Gampaha; Playo plans Negombo |
| Kandy District | 275,835 | ≈ 46,900 (English 0.50 Assumption) | 150 to 400 | Playo plans Kandy (Fact, Business News This Week). Volt and Sportizza list Kandy ([volt.lk](https://www.volt.lk/); [sportizza.com](https://sportizza.com/)). Timeleft: none in Sri Lanka |
| Galle District | 208,052 | ≈ 35,400 (English 0.50 Assumption) | 100 to 300 | Playo plans Galle; Volt and Sportizza list Galle |
| Jaffna, Matara, Kurunegala, others | Not extracted (Table A2 has them) | n/a | n/a | Playo plans Jaffna; Volt lists Matara |

**Notes on the table.**
- The Gampaha figures are an Estimate: TAM 584,296 × 0.839 = 490,224; SAM 490,224 × 0.65 × 0.85 × 0.40 = 108,340.
- Kandy and Galle SAMs use district totals, but only about 12% of each district is urban. The usable pool is the city plus nearby towns, which is probably well under half the district. That is why the SOM guesses sit below Timeleft's 680 average. They are **Assumptions**.
- **Fact:** Kandy, Matara, Nuwara Eliya and Galle lose the most people to migration. Some of Kandy's and Galle's young adults have already moved to Colombo, which shrinks those markets but feeds the Colombo "newcomer" segment.

**Opinion, from the evidence.** Gampaha is the real second market, not Kandy. It is almost as large as Colombo District at ages 18 to 34 (584k vs 599k), commutes into Colombo, and leads the country on in-migration. Kandy and Galle are third-wave cities, and Playo has already named both.

### 8.2 Diaspora markets

**Fact:** about 1.49M Sri Lankan emigrants (UN DESA 2024, via [Wikipedia](https://en.wikipedia.org/wiki/Sri_Lankan_diaspora)). Largest communities: UAE 320,000 (2023, same source); Australia 172,800 Sri Lanka-born (June 2024, [Home Affairs](https://www.homeaffairs.gov.au/research-and-statistics/statistics/country-profiles/profiles/sri-lanka)); UK 147,195 born (2021/22, via [Wikipedia](https://en.wikipedia.org/wiki/British_Sri_Lankans)); Canada 136,240 born (2021, via [Wikipedia](https://en.wikipedia.org/wiki/Sri_Lankan_Canadians)); Italy 108,069 (2022).

**Assumption:** no age breakdown was found. Even if a third are aged 18 to 34, a Melbourne or Toronto pool is spread across a metro of millions: too thin for a Sri Lankans-only gig feed.

**Competitor presence (Fact):** Meetup is global (60M+ registered, [Built In NYC](https://builtinnyc.com/articles/meetup-bending-spoons-acquisition-20240131)). Timeleft runs in Dubai and Abu Dhabi ([timeleft.com/cities](https://timeleft.com/cities/)); Western cities were not checked one by one. Bumble's friend apps are in the US and UK stores only (`competitors_global.md` §1). Playo operates in the UAE, Qatar and Saudi Arabia, with the UAE its biggest international market (Business News This Week).

**Read.** The Gulf communities are large but mostly temporary, male workers (inference, `market_size_inputs.md` Q6), which is a poor fit for a mixed social product. They are also exactly where Playo and Timeleft already are. The diaspora is a **channel, not a market**: returning visitors in December and April, and student societies abroad that send newcomers to Colombo. **SOM for diaspora cities within 24 months: zero by plan.**

### 8.3 South Asian cities

| City | Size | Playo | Hudle | Timeleft |
|---|---|---|---|---|
| Bengaluru, Mumbai, New Delhi, Hyderabad | Very large | Yes (India-first, 150+ cities claimed) | Yes (110+ cities) | **Yes**, all four |
| Chennai | Large | Likely (not verified city by city) | Likely (not verified) | Not listed |
| Dhaka | 36.6M agglomeration (UN WUP 2025) | Not in Playo's stated countries (India, Sri Lanka, UAE, Qatar, Saudi) | No evidence | Not listed |
| Karachi | 21.4M (UN WUP 2025) | Not in stated countries | No evidence | Not listed |
| Kathmandu | Not retrieved | Not in stated countries | No evidence | Not listed |
| Malé | Small; Maldives internet 85% (ADB via Daily Star) | Not in stated countries | No evidence | Not listed |

Sources: [UN DESA WUP 2025](https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2025_press_release_wup25.pdf); [Visual Capitalist](https://www.visualcapitalist.com/ranked-the-worlds-30-largest-cities-by-population/); [Business News This Week](https://businessnewsthisweek.com/business/playo-expands-global-footprint-with-sri-lanka-launch/); [Indian Startup Times](https://www.indianstartuptimes.com/interviews/from-booking-courts-to-building-a-sports-ecosystem-how-hudle-is-scaling-the-way-india-plays/); [timeleft.com/cities](https://timeleft.com/cities/); [Daily Star](https://www.thedailystar.net/news/bangladesh-trails-regional-peers-53-internet-penetration-4087271). No 18 to 35 counts were retrieved for these cities, so **don't size them yet**.

**Read.** Indian metros already have funded incumbents for both halves of the product: Playo and Hudle for sport, Timeleft for meeting strangers. Dhaka, Kathmandu and Malé look lower-competition, but expanding there means new payments, new law and new languages, and nothing in the data supports a 3-person team going there within 24 months. The useful lesson runs the other way: **Playo and Timeleft can enter Colombo far more easily than Trimegos can enter India.**

---

## 9. What would change these numbers

| Input | Current value | If it moves | Who settles it |
|---|---|---|---|
| Target-segment share (Q4) | 0.40 (H1 pass bar) | At 0.25, every SAM falls 38%. At 0.55, it rises 38%. | Survey Q4, Q8, Q10 |
| English comfort | 0.65 | A large Sinhala/Tamil-first result (Q14) would cut SAM and pull i18n forward (`09-localization.md`) | Q14; census English table by age |
| Gig size and frequency | 5 people, 1.5 a month | Bigger gigs or more frequent attendance mean fewer gigs needed per MAP, so SOM is easier to reach | First 8 weeks of analytics |
| Active hosts | ~48 needed for the base case | Fewer willing hosts (Q8 "No") caps SOM directly, whatever the SAM | Q8, interview §7 E |
| No-show rate | 37% assumed for free small events | Higher means more sign-ups per gig and more demand needed | Check-in data |
| Crews a month a venue needs before paying | 4 | At 8, paying venues halve. At 2, they double. | Venue interviews §8 E, new item 12a (§9.2) |
| Venue price | LKR 5,000 / 15,000 (H11) | Van Westendorp ranges could move it either way. Volt's free offer pushes it down. | Venue interviews §8 E items 13 to 17 |
| Competitor entry | Playo in Colombo; Volt launching; mithuru pre-launch | Any of them adding non-sport group plans splits the same small pool | Monthly competitor check (`04-competitors.md`) |

### 9.1 Primary research that would tighten the numbers

1. **Census Table A5 and the English literacy table** by age and district, from the same DCS files. Replaces two assumptions with facts. Half a day of desk work.
2. **Zone A venue sampling.** Pick 50 random F&B listings in Zone A on Google Maps. Record: open or closed, seats for 4+, price of a coffee or main, and whether a group gig would fit. Gives the real serviceable share in place of the 10% assumption. About 3 hours.
3. **Court census.** Phone or message every futsal, badminton and pickleball venue in Colombo District (about 10 to 30). Record courts, off-peak hours and hourly price. Small enough to count completely.
4. **Survey Q4, Q8, Q13 and Q14**, run to the sample in `35-field-kits.md` §2. Fixes the three SAM multipliers.
5. **Venue interviews §8 E**, plus the new question below.
6. **After launch:** weekly MAP, gigs run, average attended size and participations per MAP. These replace every SOM assumption within 8 weeks. They need analytics, which do not exist yet (`00-current-state.md` §1, item 5).

### 9.2 Proposed additions to 35-field-kits.md

- **Survey, after Q8, as Q8a:** "If there were good plans near you every week, how many would you go to in a typical month?" Multiple choice: None / 1 / 2 to 3 / 4 or more. *This gives the frequency (participations per MAP) used in §5.3.*
- **Venue interview §8 E, after item 12, as 12a:** "How many groups like that would we need to send you each month before you'd pay anything for it?" Record a number. *This gives the threshold used in §6.3.*

### 9.3 Feature proposals

- **Zone waitlist gate.** Before a new zone opens, people join a waitlist for "Nugegoda" or "Colombo 7", and the zone opens when sign-ups pass a set number. Timeleft reportedly used a 151 sign-up gate per city ([Startup Spells](https://startupspells.com/p/how-timeleft-solved-the-chicken-and-egg-problem), third-party). The waitlist also gives live SAM data by zone. It answers §5.3 (density beats breadth) and §8.1 (which zone next). → candidate for `15-feature-opportunities.md`
- **Venue "your numbers" preview for Listed venues.** The free Listed tier shows any venue the crews that chose it last month, before it pays. `docs/08` already proposes showing a prospect their own numbers. It answers §6.3: venues pay for proof of volume, and volume is what limits revenue. → candidate for `15-feature-opportunities.md`

---

## Key findings

1. **Colombo District has about 503k internet users aged 18 to 34 (Estimate, census bands × DCS age-specific internet use). After English, smartphone and interest filters, the base SAM is about 111k, and about 28k in the first launch zone.** Population is not the constraint.
2. **The base SOM is about 350 monthly active participants in one zone at 12 months (low 145, high 680), and about 1,200 across 3 to 4 Colombo zones at 24 months.** That is roughly 1% of SAM. It is calibrated so the low case equals Timeleft's 50-a-week depth floor and the high case equals Timeleft's per-city average of about 680 (Estimate).
3. **SOM is set by supply.** The base case needs about 24 gigs running every week at month 12, from 2 visible today, which means about 48 active hosts (Assumption). Hosting (H6) is the binding constraint, not demand.
4. **The venue universe is large (about 15,240 open venues in Colombo District, from xMap proxies), but the serviceable set in Zone A is only about 500. Only 8 (month 12) to 27 (month 24) venues could be paying partners in the base case**, because each needs enough crews to justify paying.
5. **At the spec's untested H11 prices, venue revenue is about LKR 56,000 a month (USD 169) at month 12 and LKR 189,000 a month (USD 571) at month 24, base case.** That is about LKR 160 per active participant. Venue fees are a validation signal, not a business, within 24 months. Volt's free year for venues may push the price to zero.
6. **No player-side revenue model is supported by the notes.** The hypotheticals (a 5% fee on paid gigs, forfeited deposits) come to LKR 8,000 to 54,000 a month and add friction where liquidity is weakest.
7. **The next market is Gampaha, not Kandy.** It has about 584k people aged 18 to 34, commutes into Colombo, and leads on in-migration. Kandy (≈ 47k SAM) and Galle (≈ 35k) are small, mostly rural districts, and Playo has already named both.
8. **The diaspora and South Asian cities are not markets for 24 months.** The diaspora is a channel. Indian metros already have Playo, Hudle and Timeleft. Dhaka, Kathmandu and Malé have no visible incumbents, but they would need new payments, law and language.

## Decisions this informs

- **Launch footprint** (`07-liquidity-cold-start.md`, `32-launch-plan.md`): open one zone and hold it to the 50 participations a week floor before opening a second. Don't launch "Colombo".
- **Revenue timing** (`10-monetization.md`, `43-decisions.md`): treat year-one venue fees as optional proof of value. Consider free pilots that match Volt's offer, and don't plan finances around venue revenue.
- **Home Spot tier** (`10-monetization.md`): the "one seeded gig a week" promise caps Home Spots at about 5 for a 3-person team. Reprice it, or drop the seeded-gig promise.
- **Host acquisition over user acquisition** (`31-channels.md`, `15-feature-opportunities.md`): the SOM depends on about 48 active hosts, so marketing should target organisers first.
- **Expansion order** (`13-expansion.md`): Colombo zones, then Gampaha, then Kandy and Galle. No diaspora or overseas city within 24 months.
- **Analytics first** (`41-metrics-plan.md`): MAP, gigs run, attended size and participations per MAP are needed to replace the SOM assumptions.

## Open questions

1. What share of 18 to 34s in Colombo want company for activities often enough to act (Q4)? This moves every SAM by up to about 38%.
2. How comfortable is the target group with an English-only UI (Q14), and what does the census say about English literacy by age in Colombo?
3. How many people will host (Q8)? Is 48 active hosts by month 12 realistic?
4. How many crews a month would make a venue pay, and what does Van Westendorp say about price (§8 E plus the new 12a)?
5. What share of Zone A's 4,592 open F&B listings are actually group-friendly (venue sampling)?
6. Will Playo or Volt add non-sport group plans in Colombo, and when does mithuru launch?
7. Should Gampaha, which is nearly as large as Colombo District at ages 18 to 34, be treated as part of Zone B rather than as a separate market?

## Confidence

- **Population and internet TAM: high.** Census 2024 bands and DCS age-specific internet rates are official. The only assumptions are the even 15 to 19 split and applying national internet rates to Colombo, which is conservative.
- **SAM multipliers: low.** English (one census figure from a news summary, all ages), smartphone (device used, not ownership) and the target segment (no data at all) are mostly assumptions. The segment share alone moves SAM by about 38% either way.
- **SOM: low to medium.** The Timeleft calibration is solid as a benchmark. Gig size, frequency and host supply are assumptions until analytics exist. The order of magnitude (hundreds, not thousands, in year one) is medium confidence.
- **Venue universe: medium.** xMap is a usable proxy, but its totals are inconsistent and it lists closures. Court counts are small enough to verify by hand.
- **Serviceable and obtainable venues: low.** They rest on an assumed 10% group-friendly share and a 4-crews-a-month threshold, both untested.
- **Venue revenue: low.** H11 prices are the spec's own placeholders, and Volt's free offer adds downward pressure.
- **Expansion: medium for Sri Lankan districts** (census-based), **low for diaspora and South Asian cities** (no age data, competitor presence not checked city by city).
