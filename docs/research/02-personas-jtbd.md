# 02 · Personas and jobs to be done

**Phase 1 of the research programme** (`docs/research/PROMPT.md`, item 2). Written from the Phase 1 research notes. No new primary research.

| | |
|---|---|
| Scope | Player personas (students, young professionals, people new to Colombo, returning diaspora, expats, women looking for safe group plans), the host, and venue personas (courts, cafes, board-game spots, gyms and studios). |
| Sources | `research_notes/Trimegos Phase 1 market research/`, mainly `personas_and_venues.md`, plus `market_size_inputs.md`, `competitors_local_indirect.md`, `liquidity_cold_start.md`, `trust_safety_sri_lanka.md`, `demand_and_current_channels.md`. All URLs accessed 2026-10-31. USD at LKR 331 (FRED DEXSLUS, 16 Oct 2026). |
| Consistent with | `01-problem-demand.md`: problem A (short of numbers), B (no one to go with), C (no circle at all). |

Claim labels: **F** = Fact (sourced), **E** = Estimate (maths shown), **A** = Assumption (with how to test it). "(search summary)" means the notes took it from a search-result summary: verify before quoting publicly.

**These personas are hypotheses, not people.** No named individuals and no quotes, because nobody has been interviewed yet. Each card is a bet for `35-field-kits.md` to confirm or kill; its §3 quotas already match these segments.

---

## 1. Summary

Money shapes which gigs work; phones mostly don't. The scarce persona is the host, not the joiner. Women are a launch gate across every segment. Courts have booking tools but nothing that fills quiet hours with people. Findings are numbered at the end.

---

## 2. Shared baseline: phone, data and channels

| Item | Value | Source |
|---|---|---|
| Mobile OS | **F:** Android 84.92%, iOS 15.06% (Sep 2026); other 2026 months about 79 to 80% Android (search summary) | [StatCounter](https://gs.statcounter.com/os-market-share/mobile/sri-lanka) |
| Data price | **F:** Hutch Rs 1,099 for 50 GB (about Rs 22/GB); youth plan Rs 909 for 30 GB plus 9 social apps (Nov 2024) | [Daily Mirror](https://www.dailymirror.lk/print/business-news/Hutch-offers-value-plans-tailored-to-every-segment/273-295226) |
| Social-only bundles | **F:** SLT-Mobitel Rs 988 for 30 days, unlimited social-app data (search summary) | [mobitel.lk](https://www.mobitel.lk/node/7877) |
| Reach | **F:** Facebook 9.0M, YouTube 8.82M, TikTok 6.79M adults, LinkedIn 2.9M, Instagram 2.25M; no WhatsApp figure | [DataReportal 2026](https://datareportal.com/reports/digital-2026-sri-lanka) |

**E:** the cold landing is 676 KB (`00-current-state.md` §6), about Rs 0.015 at Rs 22/GB. Data price is not a barrier.

**A (data type):** many young users are on social-only bundles, so a link opened from WhatsApp may land on empty "anytime" data. Test with proposed Q16 (§9) and interview §7 F item 21.

**A (install trust):** on 25 Oct 2026 police warned of fake "dating apps" pushed as malicious APKs (**F**, [Newswire](https://www.newswire.lk/2026/10/25/police-warn-public-of-scams-involving-fake-dating-apps/)). A PWA install prompt may read as that scam. Test with Q13.

---

## 3. Budget maths

### 3.1 Income anchors

| Anchor | LKR a month | USD | Source |
|---|---|---|---|
| Mahapola scholarship | 10,000 | 30 | **F** (search summary), [Ada Derana](https://www.adaderana.lk/news/119494/increased-mahapola-scholarship-allowance-to-be-credited-from-tomorrow) |
| Average net salary, Colombo | 84,404 | 255 | **F**, [Numbeo, 28 Oct 2026](https://www.numbeo.com/cost-of-living/in/Colombo) |
| Junior IT | 80,000 to 180,000 gross | 240 to 545 | **E**: [ITPro.lk](https://itpro.lk/salary-sri-lanka-it-jobs/) bands read as monthly (the page doesn't say) |
| Shared boarding room | 15,000 to 16,000 | 45 to 48 | **F** (search summary, undated asking prices), [ikman.lk](https://ikman.lk/en/ads/s/09/sri-lanka/room-annex-rentals/10-bedrooms) |
| 1-bedroom flat outside centre | 90,542 | 274 | **F**, Numbeo |

**E:** a flat outside the centre costs more than the average net salary, so average earners living away from family board or share, and have no room to host. That favours public-venue gigs.

### 3.2 What a gig costs per head

| Gig | Inputs | Per head (LKR) | USD | % Mahapola | % net salary |
|---|---|---|---|---|---|
| Futsal off-peak, 10 players | about LKR 3,000/hour off-peak (search summary, [CricBook](https://www.cricbook.lk/blog/best-futsal-courts-colombo)) ÷ 10 | 300 | 0.91 | 3.0% | 0.4% |
| Futsal peak, 10 players | about 500 more from 6 pm: 3,500 ÷ 10 | 350 | 1.06 | 3.5% | 0.4% |
| Same, three no-shows | 3,500 ÷ 7 | 500 | 1.51 | 5.0% | 0.6% |
| Badminton doubles, member club | SSC Rs 400 to 450/hour, likely 2022 (search summary, [ssc.lk](https://ssc.lk/facilities/badminton-courts)) ÷ 4 | 100 to 113 | 0.30 to 0.34 | 1.0 to 1.1% | 0.1% |
| Pickleball doubles | Rs 4,000/hour (search summary, [Pickleheads](https://www.pickleheads.com/courts/lk/western-province/colombo/the-pickle-island-arcade)) ÷ 4 | 1,000 | 3.02 | 10% | 1.2% |
| Cafe, one drink | cappuccino 832 (Numbeo) to 1,080 ([Java Lounge](https://www.javalounge.lk/)) | 832 to 1,080 | 2.51 to 3.26 | 8 to 11% | 1.0 to 1.3% |
| Cafe, drink plus cake | Java cappuccino 1,080 + Vanilla Bento Cake 1,800 | 2,880 | 8.70 | 29% | 3.4% |

Transport (**E**, Numbeo): bus LKR 52.50 each way, 105 return. Ride-hail: the notes' working figure is about LKR 500 to 600 for 5 km; Numbeo's taxi rate gives 730 (130 + 5 × 120). Call it 1,000 to 1,460 return.

**Worked examples (E):**
- Student, weekly off-peak futsal by bus: (300 + 105) × 4 = LKR 1,620 a month, **16% of Mahapola**.
- Student, weekly one-drink cafe gig by bus: (832 + 105) × 4 = LKR 3,748, **37% of Mahapola**.
- Young professional, weekly peak futsal by ride-hail: (350 + 1,200) × 4 = LKR 6,200, **7.3% of net salary**. The ride is 77% of it.
- Young professional, weekly cafe with cake by ride-hail: (2,880 + 1,200) × 4 = LKR 16,320, **19% of net salary**.

**What this means:** split-cost sport is the natural student gig. For workers transport dominates, so **area matters more than price**: area filters (`lib/geo.ts`) and a tight launch zone. No-shows raise everyone's share: three drop-outs push futsal from 350 to 500 a head (+43%), usually absorbed by whoever booked (A; interview §7 E item 19).

→ candidate for `15-feature-opportunities.md`: **Budget tag on gigs.** Hosts pick Free / under LKR 500 / under LKR 1,500 / more; shown on cards and filterable. Answers the Mahapola gap above and complements per-head cost display (`01-problem-demand.md` §7 idea 6).

---

## 4. Player persona cards

Segments overlap: a newcomer is usually also a student or a professional, and women run through all of them.

### 4.1 Students

| Field | Content |
|---|---|
| Who | **F:** 147,760 internal undergraduates in 2024, plus about 202,500 external and distance learners ([UGC 2024](https://www.ugc.ac.lk/downloads/statistics/stat_2024/Chapter%203.pdf)). Near Colombo (2022, incl. backlog): Sri Jayewardenepura 15,247, Kelaniya 14,430, Colombo 11,672, Moratuwa 8,151 ([UGC 2022](https://www.ugc.ac.lk/downloads/statistics/stat_2022/Chapter%203.pdf); verify table layout). SLIIT 18,454 to 25,000 (sources conflict, search summary). **E:** about 49,500 at the four state campuses. |
| Routine | **A:** weekday lectures, free afternoons and weekends, exam-season dips. Many board near campus (indirect **F**: boarding listings in Malabe, Nugegoda, Dehiwala). |
| Budget | **F:** Mahapola LKR 10,000. Private-university allowances unknown. **E:** sport and walks fit; cafes strain it (§3.2). |
| Phone and data | **A:** most likely on social-only bundles and low-end Android. |
| Triggers | **A:** new term, moving into a boarding place, a society game short of players, friends gone home for holidays. |
| Objections | **A:** travel cost; "my campus WhatsApp group does this"; parents (**F:** parental approval is still "very, very important", [Life.lk](https://www.life.lk/article/interviews/dating-and-youth/52/12422)). |
| JTBD | When my campus friends are busy or gone home, I want a cheap game or walk with people my age nearby, so I can use a free afternoon without spending my allowance. |
| Host or joiner | **A:** mostly joiners; society captains host. |
| Reach | Campus societies and pages, `35-field-kits.md` §5.5. |
| Evidence | **Medium** on size and budget; **none** on demand. |

**F:** state undergraduates were 65% female in 2022 (95,254 of 146,380, same UGC table; verify against the PDF). Students are a majority-women segment, which ties them to §4.6.

### 4.2 Young professionals (23 to 35)

| Field | Content |
|---|---|
| Who | **F:** IT/BPM workforce about 175,000 ([Daily FT, Jul 2026](https://www.ft.lk/it-telecom-tech/SLASSCOM-reflects-on-a-year-of-creating-opportunities-strengthening-Sri-Lanka-s-knowledge-and-innovation-industry/50-794672)) or 150,000 direct (Sunday Observer, Mar 2025), mostly Colombo-based (search summary). Colombo District jobs are 71.8% services ([DCS LFS 2025](https://www.statistics.gov.lk/Resource/en/LabourForce/Bulletins/LFS_Annual%20Bulletin_2025.pdf)). |
| Routine | **F (OLD, 2012):** outbound traffic peaks 5 to 8 pm (search summary). **A:** weeknight gigs only near home or office; weekends for longer plans; some shift work for US/UK clients (unsourced). |
| Budget | **F:** net LKR 84,404. **E:** weekly futsal plus a fortnightly cafe gig is 7 to 17% of net pay. |
| Phone and data | **A:** mid-range Android with anytime data; more iOS than average. |
| Triggers | **A:** a regular game short of players; a new job; friends emigrating (**F:** 310,915 foreign-employment departures in 2025, `01-problem-demand.md` §4.2). |
| Objections | **A:** no time; "my office plays Mercantile" (**F:** 27 teams in Mercantile Football 2024, search summary); apps that look like dating. |
| JTBD | When my Thursday game is two short or my friends have moved abroad, I want reliable people near work or home, so I can keep playing and meet people outside the office. |
| Host or joiner | **A:** likeliest hosts: they can front a court booking. |
| Reach | LinkedIn, office sports clubs, futsal venues at peak hour, employees' work chats. |
| Evidence | **Medium** on size and income; **low** on routine. |

### 4.3 People new to Colombo

| Field | Content |
|---|---|
| Who | **F:** net lifetime in-migration Colombo +191,524, Gampaha +357,528; each has over 0.5 million in-migrants by previous residence ([Census 2024 press note](https://www.statistics.gov.lk/qlink/PressReleases/press_note_CPH_2024_En)). The 18 to 35 share is **unknown**. |
| Routine | **A:** weekday work or study; alternate weekends travelling home. Boarding curfews or landlord rules: no data. |
| Budget | **E:** a LKR 15,000 to 16,000 room is 18 to 19% of the average net salary before food and trips home. |
| Triggers | **A:** first months in a boarding place; weekends not going home; festivals alone. |
| Objections | **A:** not knowing the areas; transport cost and night safety; English-only UI (H9). |
| JTBD | When I've just moved to Colombo and know nobody outside work, I want low-pressure plans with a few people nearby, so I can build a circle without walking alone into a big group. |
| Host or joiner | **A:** joiners first; hosts after a few good gigs. |
| Reach | Boarding Facebook groups (`01-problem-demand.md` §6.2 search 11), employer onboarding, first-year intakes. Counted by proposed Q4b (`01-problem-demand.md` §8). |
| Evidence | **Medium** that the pool is large; **none** on whether they lack a circle (problem C). |

### 4.4 Returning diaspora

| Field | Content |
|---|---|
| Who | **F:** more than 17,000 overseas Sri Lankans registered on "Contact Sri Lanka" (undated, search summary, [MFA](https://mfa.gov.lk/tam/?p=33046)). No count of returnees. |
| Routine, budget, phone | **A:** flexible roles, mornings and weekends; high budget; more iPhones, used to Meetup and Strava. |
| Triggers | **A:** coming back to find school friends emigrated or busy with family. |
| Objections | **A:** "it looks like a students' app". |
| JTBD | When I move back and my old circle has scattered, I want regular activities with people who share my interests, so I feel at home again quickly. |
| Host or joiner | **A:** strong hosts. **F:** the Lightning run club's founder moved back from the UK and started a weekly Sunday run ([The Sun.lk, 7 May 2026](https://www.thesun.lk/solar_hq/Why-is-everyone-Running-Now-Inside-Colombo-s-Super-Fun-Run-Club/557-305220)). **F (OLD):** WorkInSriLanka ran volunteer-led meetups for returnees (search summary). |
| Reach and evidence | Run clubs, LinkedIn, alumni groups abroad. **Low** on size. |

### 4.5 Expats and digital nomads

| Field | Content |
|---|---|
| Who | **F (likely OLD):** "more than 25,000 foreign professionals" permitted to work (undated, search summary, [Daily Mirror](https://www.dailymirror.lk/breaking-news/Over-foreign-professionals-working-in-SL/108-143131)). Digital Nomad Visa reactivated 14 Feb 2026, first issued 26 Feb 2026 (search summary, [Daily FT](https://www.ft.lk/front-page/Sri-Lanka-issues-first-Digital-Nomad-Visa/44-788961)). |
| Routine, budget, triggers | **A:** free evenings and weekends; high budget; first weeks in Colombo. |
| Objections | **A:** "is this only for locals?"; unfamiliar safety norms. English UI suits them. |
| JTBD | When I'm in Colombo for a year, I want to join small local plans, so I meet Sri Lankans and not only other foreigners. |
| Host or joiner | **A:** willing hosts, but few. **F:** Colombo Night Run has members from 43 countries ([CNR](https://www.colombonightrun.com/about)); the Hash has run for decades ([colombohash.org](https://www.colombohash.org/)). |
| Reach and evidence | Run clubs, Hash, Colombo Expats Cultural Association (Facebook), co-working. **Low**: the count is old, the nomad visa months old. |

### 4.6 Women looking for safe group plans

| Field | Content |
|---|---|
| Who | **F:** 51.7% of the population ([Census 2024](https://www.statistics.gov.lk/qlink/PressReleases/CPH2024_Press_Release_Eng)); 65% of state undergraduates (§4.1); labour force participation 32.4% vs 69.1% for men ([DCS LFS 2025](https://www.statistics.gov.lk/Resource/en/LabourForce/Bulletins/LFS_Annual%20Bulletin_2025.pdf), search summary of the PDF). |
| Routine | **A:** daytime and early-evening plans, with the journey planned around safe transport. Women outside paid work may have more daytime time but less own income (to test). |
| Phone and channels | **F:** women are 43.4% of social media identities, 40.0% of Facebook reach, 33.8% of TikTok adults ([DataReportal](https://datareportal.com/reports/digital-2026-sri-lanka)). Mass channels under-reach them. |
| Triggers | **A:** wanting a sport or hike friends won't do; a women-only group appearing. |
| Objections | **F:** about 90% of women and girls aged 15 to 35 report sexual harassment on buses or trains; only 4% sought police help (UNFPA, published 2017, OLD, [UNFPA](https://aa.unfpa.org/news/ninety-cent-sri-lankan-women-endure-sexual-harassment-public-transport-unfpa-study-shows)). **F:** 57% feel unsafe online ([UN Women 2025](https://asiapacific.unwomen.org/en/stories/press-release/2025/11/online-abuse-silences-women-and-marginalized-groups-in-sri-lanka)). **A:** being the only woman; the app read as dating (H5); family objection (H4, Q11). |
| JTBD | When I want to play, hike or try something new and my friends won't come, I want a group I can trust, in daylight and in public, so I can go without worrying about the people or the trip home. |
| Host or joiner | **A:** joiners first; women hosts are the key supply for women-only gigs. **F:** the women's Hash (Harriettes) has run since 1984 ([hashcolombo.com](https://www.hashcolombo.com/)), so women-only formats have local precedent. **F (product):** hosts must fit their own audience, so a women-only gig needs a woman host (`CLAUDE.md`). |
| Reach | Women-only groups with a woman recruiter (`35-field-kits.md` §5.3); Instagram over TikTok; campus women's societies. No women-only running or hiking club in Colombo was verified by search. |
| Evidence | **High** that safety constrains them; **none** on whether Trimegos removes it (H3, H4). |

**Blunt read:** the best-documented harm is the journey, and Trimegos has nothing about getting there and home.

→ candidate for `15-feature-opportunities.md`: **Journey safety.** A time-of-day filter on Discover; a gig field for the nearest station or ride-hail drop point; a one-tap "share my plan" sending time, place and crew size (no names or photos) to a contact. Answers the UNFPA journey finding.

---

## 5. The host

Joiners want company. Hosts want **their plan to happen**. That is a different job and deserves its own design.

| Field | Content |
|---|---|
| Who | **A:** the regular-game organiser or club captain who books the court; the community lead (run club, board games); the WhatsApp group admin; the venue running its own night (§7). |
| Scarcity | **F:** Tabletop SL grew from 10 to 400+ members on a team of five ([Sunday Times, 2023](https://www.sundaytimes.lk/230910/magazine/board-games-going-back-in-time-but-with-a-twist-531640.html)); its Meetup group now returns "group not found". Colombo Social (690 members) last met May 2024 ([Meetup](https://www.meetup.com/colombo-social/)). Playo had fewer than a dozen partner facilities and organisers in year one (search summary). |
| Routine | **A:** a fixed weekly slot, a WhatsApp group of regulars, a scramble when people drop. **F:** Volt depicts a venue owner juggling "3 WhatsApp groups, 1 notebook" ([volt.lk](https://www.volt.lk/)). |
| Budget and triggers | **A:** fronts the court (LKR 3,000 to 3,500) and chases shares; triggered by drop-outs on the day. |
| Objections | **A:** strangers who don't show or don't pay, or behave badly in "my" group; extra admin; losing control of who joins. **F (product):** chat unlocks only when every spot is filled or 2 hours before start (`CLAUDE.md`), so a host can't brief joiners until then. |
| JTBD | When people drop out of my regular game, I want to fill the spots with reliable people without another WhatsApp scramble, so the game goes ahead and I'm not paying for empty places. |
| Already built | **F (product):** held seats with single-use links for regulars, public seats for strangers, add spots, crew vote, check-in. That is the "single-player value" supply-first marketplaces rely on (**F:** 14 of 17 marketplaces in Lenny's survey went supply-first, search summary). |
| Reach | Futsal venues at peak hour, run-club leads, Tabletop SL and The Fun Boardgames organisers, society captains. |
| Evidence | **Medium** that hosts are scarce and burn out; **none** on organiser-to-joiner ratios or unpaid-host motives. |

→ candidate for `15-feature-opportunities.md`: **Host notes before unlock.** A one-way host message (meeting point, what to bring, how cost is split) visible to claimed members before chat opens. Keeps the unlock rule, removes the host's briefing problem.

→ candidate for `15-feature-opportunities.md`: **Co-host.** A second person who can manage invites and check-in, so a community isn't one person's job. Answers the Tabletop SL and Colombo Social burnout pattern.

"Fill my last spots" and "Repeat this gig" (`01-problem-demand.md` §7) are the host's top two jobs.

### 5.1 Who hosts and who joins

| Segment | Host likelihood (A) | Test |
|---|---|---|
| Regular-game organisers | High | Proposed Q19, §7 E items 17 to 18 |
| Young professionals | Medium to high | Q8 by Q3 |
| Returning diaspora | Medium to high | Interviews |
| Expats | Medium | Interviews |
| Students | Low to medium (captains host) | Q8 by Q3 |
| New to Colombo | Low at first | Q8 by Q4b |
| Women | Unknown, but needed for women-only supply | Q8 by gender |

---

## 6. Beachhead ranking

Scores 1 to 5, higher is better (safety: 5 = lowest risk). Size scores follow the Facts above; the rest are **Assumptions** until the field kit reports. Reach and host willingness are double-weighted because they decide a cold start.

| Segment | Size | Pain | Reach ×2 | Safety | Host ×2 | Total | Validate with |
|---|---|---|---|---|---|---|---|
| Regular-game organisers (supply) | 2 | 4 | 8 | 4 | 10 | **28** | Q19, §7 E, venue §8 B |
| Young professionals | 4 | 3 | 6 | 4 | 8 | **25** | Q3, Q4, Q8 |
| Students | 4 | 3 | 10 | 3 | 4 | **24** | Q3, Q4, Q8 |
| Expats and nomads | 1 | 4 | 6 | 4 | 8 | **23** | Interviews |
| Returning diaspora | 1 | 4 | 4 | 4 | 8 | **21** | Interviews |
| Women, safe plans | 5 | 5 | 6 | 1 | 4 | **21** | Q9 to Q11 |
| New to Colombo | 5 | 5 | 4 | 3 | 2 | **19** | Q4b, Q4 |

**Recommendation (A, for validation):**
1. **Supply: organisers.** Recruit 10 to 20 people who already run futsal, badminton or board-game nights. Pitch "fill your last spots".
2. **Demand: young professionals and newcomers in one corridor.** The notes' candidate zone is Rajagiriya, Kotte, Nugegoda and Maharagama: futsal clusters there, Sri Jayewardenepura is close, and it sits between the core and the growing suburbs (Inference, `liquidity_cold_start.md` §5). Newcomers score low on reach alone, but most are professionals or students, so they arrive through the same channels.
3. **Students second**, on free or split-cost gigs.
4. **Women as a launch gate.** No beachhead passes unless its women respondents average at least 3 on Q10 (the team should agree this bar before data arrives).
5. **Diaspora and expats as seed hosts**, not volume.

**If the evidence goes the other way:** if Q4 and the Reddit pass show mostly problem A, Trimegos competes head-on with Volt and Playo (in Colombo since April 2026, [Business News This Week](https://businessnewsthisweek.com/business/playo-expands-global-footprint-with-sri-lanka-launch/); not confirmed from Playo's own site). Choose that deliberately.

---

## 7. Venue personas

### 7.1 Futsal and badminton courts

| Field | Content |
|---|---|
| Who | **F:** Playo lists 5 Colombo venues (CR7 Futsal, MBA Badminton, Uni Sports Center, X Sports Arena, Shuttle Power) ([Playo](https://playo.co/venues/colombo/sports/all)); Turfify lists 9 futsal venues ([Turfify](https://turfify.theatom.lk/sports/futsal/colombo)). **E:** 10 to 30 bookable venues in Colombo, few enough to visit all. Clustered in the suburbs (search summary). |
| Prices | **F (OLD, 2022):** futsal from about LKR 2,000 to 3,500 ([Yamu](https://www.yamu.lk/highlights/8-indoor-sports-outlets-in-colombo/)); about 3,000 off-peak in 2026 (search summary). |
| Quiet-slot economics | **A:** weekday daytime is empty. **E:** one extra off-peak hour a week = 3,000 × 52 ÷ 12 = LKR 13,000 a month (USD 39), 2.6 times the LKR 5,000 "Spot" price in H11. |
| Booking and marketing | **F:** phone, WhatsApp, Facebook pages; own apps (Champ Turf, 500+ installs); Play.Book (5K+ installs, 3.41 stars; Provider app 100+); Playo; Volt Manager ("Founding 50" free for 12 months, no Play listing found); CricBook (cash at venue). **A:** marketing is Instagram, Facebook and tournaments; no spend data exists. |
| Objections | **A:** "I already have five booking apps"; fees (**F:** a Play.Book review calls its 3.5% gateway fee "extortion"); groups that don't show. |
| JTBD | When a weekday court sits empty, I want a group to book it and turn up, so the hour earns money instead of nothing. |
| Needs from Trimegos | **A:** groups formed for quiet hours, no calendar to maintain, cash at venue, a count of groups sent. Not another booking engine. |
| Evidence | **Medium** on venues and tools; **none** on occupancy. |

### 7.2 Cafes

| Field | Content |
|---|---|
| Who | **F:** 15,547 dining and drinking locations in Colombo District, about 4,340 in Colombo and Thimbirigasyaya ([xMap, Mar 2025](https://www.xmap.ai/location-intelligence-reports/dining--drinking-locations-in-sri-lanka)). **E:** the group-friendly youth set is in the hundreds (`market_size_inputs.md` Q4). |
| Quiet-slot economics | **E:** 4 people at LKR 1,000 to 2,000 each = LKR 4,000 to 8,000 a visit, so one or two group visits a month match a LKR 5,000 fee in revenue. Margin unknown. |
| Booking and marketing | **F:** Java Lounge is on Uber Eats ([Uber Eats](https://www.ubereats.com/lk/store/java-lounge-fort/9tQVo3xXT-uelVbLd8u2jw)), so commission is familiar. **F:** cafes promote event nights via Instagram and Happening Colombo (board-game and quiz nights at Cafe Meeples, a Death Cafe at Commons, an Uno Brunch at Belle Colombo; [happeningcolombo.com](https://www.happeningcolombo.com/)). |
| Objections | **A:** groups lingering over one coffee; table space; staff time for codes (H12). |
| JTBD | When my tables are empty mid-afternoon, I want groups who'll order, so the slow hours pay for the staff on shift. |
| Needs | **A:** groups at quiet hours, a perk or minimum-spend rule they set, and the `/spot/[slug]` visit count (**F:** exists for partner venues only, with no venue onboarding, `00-current-state.md` §2.1). |
| Evidence | **Medium** on counts and prices; **none** on quiet hours or spend. |

### 7.3 Board-game spots (evidence gap)

| Field | Content |
|---|---|
| Known | **F:** **no dedicated board-game cafe in Colombo was verified** in three searches. Board-game *nights* exist: Cafe Meeples (30 Oct 2026, plus quiz nights) and Third Place Hub ("Midweek Boost") ([Happening Colombo](https://www.happeningcolombo.com/)). Tabletop SL met fortnightly at Brew 1867 by Dilmah, about 75 seats, tables of 10 to 15 (2023). The Fun Boardgames runs on Instagram and WhatsApp (search summary). |
| JTBD (A) | When I run a games night, I want tables of new people who come back, so it grows without me recruiting every week. |
| Why it matters | **A:** best format fit: indoor in the October to November rains (`liquidity_cold_start.md` §6), cheap, small tables, eases talking to strangers. |
| Action | Unknown: whether Cafe Meeples is a games cafe, cover charges, quiet hours. Do a dated Google Maps and Instagram pass before naming any venue, then the board-game interview in `35-field-kits.md` §3, recruited from Cafe Meeples, Third Place Hub or Brew 1867. |
| Evidence | **Low.** |

### 7.4 Gyms and studios

| Field | Content |
|---|---|
| Who | **F:** 2,654 "gyms and studios" nationally (xMap); a vendor list counts 143 gyms in Colombo ([Rentech](https://rentechdigital.com/smartscraper/business-report-details/sri-lanka/western-province/list-of-gyms-in-colombo)). |
| Prices | **F:** fitness club LKR 6,639 a month (Numbeo). Power World and Fitzky launched digital access with a day pass in July 2026, price not stated (search summary, [Sunday Times](https://www.sundaytimes.lk/260726/sports/power-world-gyms-and-fitzky-team-up-to-redefine-fitness-experience-with-digital-first-access-649920.html)). No studio drop-in prices found. |
| Quiet-slot economics | **A:** gyms sell memberships, not hours, so an extra off-peak visitor is worth little unless they convert. Class studios (yoga, dance, climbing) sell seats per session, closer to the court model. |
| JTBD (A) | When my off-peak classes are half empty, I want small groups to try a class together, so some of them sign up. |
| Evidence | **Low.** Lowest-fit venue type for now. |

**Venue gaps that become features:**
- → candidate for `15-feature-opportunities.md`: **Venue quiet-slot gigs.** A partner venue posts an off-peak slot ("Tue 3 pm, court for 10, LKR 2,500") that players claim as a normal gig. Answers H10 and §7.1.
- → candidate for `15-feature-opportunities.md`: **Booking link-out.** A gig field for how the court is booked (phone, WhatsApp, Play.Book, Playo, Volt, CricBook). Keeps Trimegos the "find people" layer.
- → candidate for `15-feature-opportunities.md`: **Venue self-onboarding.** Sign-up that creates the `/spot/[slug]` page, perk and photos without an admin. Answers `00-current-state.md` §2.1.

---

## 8. Other gaps that become features

- → candidate for `15-feature-opportunities.md`: **Language spoken at the gig.** Hosts tag Sinhala, Tamil or English. Serves newcomers and expats (H9) before the UI is translated.
- → candidate for `15-feature-opportunities.md`: **Campus or workplace badge.** Optional work or campus email check, shown as a badge, never a filter. mithuru announces campus circles ([mithuru.lk](https://mithuru.lk/)).
- → candidate for `15-feature-opportunities.md`: **Data-light mode.** Skip venue photos on Discover when Save-Data is on or the connection is slow. Answers the social-bundle assumption (§2).
- → candidate for `15-feature-opportunities.md`: **"Never an APK" trust line** on the install prompt and landing: no APK, no OTP, no bank details, ever. Answers the 25 Oct 2026 police warning.

---

## 9. Proposed additions to 35-field-kits.md

The survey has no budget, time, data-plan or past-hosting question, so these cards can't be confirmed. Add after Q15 (and after Q4a to Q4c from `01-problem-demand.md` §8):

| # | Question (exact wording) | Type | Options |
|---|---|---|---|
| Q16 | What kind of mobile data do you usually have? | Multiple choice | Data for any app or website / Mainly for social apps (WhatsApp, Facebook, TikTok) / Wi-Fi only / I often run out / Not sure |
| Q17 | In a typical month, roughly how much do you spend on going out with other people (food, drinks, sport, tickets, transport)? | Multiple choice | Under LKR 2,000 / 2,000 to 5,000 / 5,000 to 15,000 / 15,000 to 30,000 / Over 30,000 / Prefer not to say |
| Q18 | When could you usually join a plan? (tick all that apply) | Checkboxes | Weekday daytime / Weekday evening before 8 pm / Weekday after 8 pm / Weekend morning / Weekend afternoon / Weekend evening |
| Q19 | In the last 3 months, have you organised a group activity yourself (booked a court, set up a game or outing)? | Multiple choice | Yes, regularly / Yes, once or twice / No |

Q19 separates real hosts from people who say they'd host (Q8). That makes 22 questions; merge elsewhere to stay under 5 minutes.

**Quotas:** raise organiser interviews in §3 from 2 to 4, including at least one woman organiser.

**Venue interview §8 B, after item 3:** "Roughly what share of your court hours (or tables) are empty on a weekday between 10 am and 4 pm?"

---

## Key findings

1. **Split-cost sport is the cheapest social gig.** Futsal is LKR 300 to 350 a head (3 to 3.5% of Mahapola); cafe drink plus cake LKR 2,880 (29%). For workers transport is up to 77% of the cost, so area beats price (Estimate).
2. **Hosts are the scarce persona.** Colombo communities run on tiny volunteer cores and go dormant without them; the best supply is people already running a weekly game (Fact for the pattern; Assumption for uptake).
3. **Women are a launch gate, not a niche.** 65% of state undergraduates, under-reached on social media; the documented harm is the journey, which Trimegos doesn't address (Fact; fix is an Assumption).
4. **Phones and data cost aren't barriers; social-only bundles and APK-scam fear might be** (Fact and Estimate; effects are Assumptions).
5. **Recommended beachhead:** organisers as supply; young professionals and newcomers in the Rajagiriya to Maharagama corridor as demand; students second (Assumption, §6).
6. **Courts have a dozen booking tools and nothing that fills quiet hours with people.** One extra off-peak hour a week is worth about LKR 13,000 a month, 2.6 times the proposed Spot fee (Estimate; occupancy unknown).
7. **Board-game venues fit best and are least evidenced.** Nights exist at Cafe Meeples and Third Place Hub; no dedicated cafe verified (Fact).

## Decisions this informs

- **Who v1 serves** (`16-direction-options.md`, `43-decisions.md`): hosts first; host notes, co-host, fill-my-last-spots and repeat-gig outrank joiner features.
- **Launch zone** (`07-liquidity-cold-start.md`, `13-expansion.md`): one south-east corridor rather than city-wide.
- **Seed gig types** (`07-liquidity-cold-start.md`): futsal, badminton, board-game nights and walks; cafe gigs carry a budget tag.
- **Safety scope** (`06-trust-safety.md`): extend to getting there and home; women-only supply needs women hosts.
- **Venue offer** (`10-monetization.md`, `34-venue-sales-kit.md`): sell filled quiet hours to courts first; gyms last.
- **Field kit** (`35-field-kits.md`): add Q16 to Q19, double the organiser quota, add the quiet-slot venue question.

## Open questions

1. What share of 18 to 35 year-olds in Colombo are recent in-migrants, and do they lack a circle (Q4b; census migration tables by age)?
2. How many "Yes, I'd host" answers (Q8) come from people who have actually organised something (Q19)?
3. What do private-university students receive and spend each month?
4. How much weekday daytime court time is empty, and what would an owner pay to fill it?
5. Is there a dedicated board-game cafe in Colombo, and what are its economics?
6. Do social-only bundles stop people opening a Trimegos link from WhatsApp?
7. Would women join, and host, women-only gigs with strangers?
8. Who fronts the court in a regular game, and what happens when someone doesn't pay?

## Confidence

- **Budget maths: medium.** Mahapola, Numbeo and cafe prices are sourced; 2026 futsal prices come from a booking-site summary and badminton prices are about 2022.
- **Phone and data: medium to high.** Solid OS and reach data; 2024 data prices; bundle behaviour untested.
- **Segment sizes: medium** for students, professionals and newcomers; **low** for diaspora and expats (old counts).
- **Routines, triggers, objections, JTBD: low.** Assumptions until interviews run.
- **Host scarcity: medium.** Consistent pattern, no ratio data.
- **Beachhead ranking: low.** Reasoned, not measured.
- **Venue economics: low.** Counts and prices exist; occupancy, margins and marketing spend don't. Board-game venues lowest.
