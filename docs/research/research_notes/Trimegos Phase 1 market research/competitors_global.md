# Global direct competitors to Trimegos (group-activity meetup apps)

Scope: Meetup, Timeleft, Bumble For Friends / BFF, Partiful, Luma, Playo, Hudle, plus 222, Pie, Spond, Peanut, Yubo, Heylo, Plura, Plei/OpenSports/GoodRec (lighter coverage). Feeds `04-competitors.md`.

All access dates are 2026-10-31 unless stated. Store data method:
- **Apple App Store**: Apple's public iTunes Lookup/Search API (`https://itunes.apple.com/lookup?id=<id>&country=<cc>`), which returns `averageUserRating` and `userRatingCount` per country storefront. A result count of 0 for a country means the app is not listed in that storefront. Checked us, in (India), lk (Sri Lanka), gb.
- **Google Play**: the public listing page fetched with `hl=en&gl=US`; the rating, review count and install band were read from the page HTML. Play country availability for Sri Lanka **could not** be checked (Play decides by the requester's IP, not the `gl` parameter).
- **1-3 star reviews**: Apple's public customer-review RSS feed (`https://itunes.apple.com/<cc>/rss/customerreviews/page=N/id=<id>/sortBy=mostRecent/json`), most recent up to 500 written reviews, filtered to 1-3 stars. Quotes below are verbatim from that feed (curly apostrophes rendered straight). Trustpilot pages were used where reachable.

---

## 1. Competitor profiles: core loop, group size, matching, safety, dating perception, monetization, South Asia availability, scale

### Takeaway
No global player combines Trimegos' mix of (a) open, user-hosted small-group activities, (b) mandatory verification, (c) faces hidden until a group fills, and (d) Sri Lanka presence. The closest models are Timeleft/222/Pie (curated blind groups of about 5-6, paid, not in Sri Lanka), Bumble's BFF (verified profiles plus groups, US-centric, not on Sri Lankan or Indian App Store), Meetup/Luma/Partiful (event tooling, no blind matching or verification), and Playo/Hudle (sports booking plus "find players", India-first; Playo launched in Colombo in April 2026).

### Cited Findings

**Meetup**
- Founded 2002; RSVP to events, join interest groups, create groups/events, chat and post photos; described as helping "millions of users" — [TechCrunch, 2026-04-05](https://techcrunch.com/2026/04/05/as-people-look-for-ways-to-make-new-friends-here-are-the-apps-promising-to-help/)
- Acquired by Bending Spoons (deal agreed 2024-01-05, completed and announced 2024-01-24). At acquisition: 60M+ registered members, 330,000 groups, 184 countries, 10,000 cities (2024 data) — [Built In NYC](https://builtinnyc.com/articles/meetup-bending-spoons-acquisition-20240131); [Meetup blog](https://meetup.com/blog/a-new-home-for-meetup)
- Reported price changes after takeover: FTM reports Bending Spoons "more than doubled the costs for organisers"; Appfigures says revenue held at about $2M/month while the user base shrank, because of price rises — [FTM](https://ftm.eu/articles/wetransfer-owner-buys-up-apps-then-makes-them-more-expensive); [Appfigures](https://analytics.appfigures.com/resources/insights/the-company-squeezing-money-from-apps-you-used-to-love)
- **Organizer pricing (USD)**: Meetup help center (as summarised by search, page returned HTTP 403 to direct fetch) lists Standard from $29.99/month, $99.99/6 months or $174.99/year; PRO $55 per group/month ($47 on a 6-month plan); prices "may vary depending on location and special offers" — [Meetup Help: Organizer Subscription prices overview](https://help.meetup.com/hc/en-us/articles/28677808413197-Organizer-Subscription-prices-overview) (could not fetch directly, 403). **Conflict**: Luma's comparison page states Meetup organizer pricing as $44.99/month or $299.99/year, "updated June 6, 2024" — [Luma Help: Luma vs Meetup](https://help.luma.com/p/luma-vs-meetup). Meetup also has a help page "Why Meetup Organiser subscription rates may differ" — [Meetup Help](https://help.meetup.com/hc/en-us/articles/38066833130381-Why-Meetup-Organiser-subscription-rates-may-differ)
- **Meetup+ (member subscription)**: no official price found. Third-party tracker lists $14.99/month or $129.99/year (unverified) — [Recurdash](https://recurdash.com/subscription-pricing/meetup). A UK "Member+" was reported at £3.49/month showing attendee age, gender, interests (undated) — [Global Dating Insights](https://www.globaldatinginsights.com/news/subscription-service-changes-coming-to-meetup-members/). App Store reviewers describe a paid tier that shows "how many males vs females are going to events" and a "weekly $10 fee" pop-up (see section 3) — [App Store US review feed](https://itunes.apple.com/us/rss/customerreviews/page=1/id=375990038/sortBy=mostRecent/json)
- Luma's comparison table: Meetup has no free organizer tier, shows ads to guests, paid ticketing since October 2023 — [Luma Help](https://help.luma.com/p/luma-vs-meetup)
- **Sri Lanka**: Meetup app is listed on the Sri Lankan App Store (4.83 stars, 136 ratings) — [iTunes lookup lk](https://itunes.apple.com/lookup?id=375990038&country=lk). Colombo groups exist but are mainly tech/professional (Java Colombo, AI Meetup Sri Lanka, Drupal); Meetup has a Colombo "outdoor activities" find page — [Meetup find lk--colombo](https://www.meetup.com/find/lk--colombo/outdoor-activities/); [Drupal groups](https://groups.drupal.org/sri-lanka)
- Safety/verification: no evidence found of ID or selfie verification. Group-based, not dating, but reviewers accuse the paid gender-ratio feature of turning it toward dating (section 3).

**Timeleft**
- Core loop: weekly dinner (typically Wednesday) with strangers; matched by a personality quiz plus age/gender; diners learn minor details (occupation, zodiac) the night before; optional after-party at a bar. Group = user plus four (5 total) per TechCrunch; Timeleft's own blog says tables of 4 to 6 — [TechCrunch 2026-04-05](https://techcrunch.com/2026/04/05/as-people-look-for-ways-to-make-new-friends-here-are-the-apps-promising-to-help/); [Timeleft blog, published 2026-09-18](https://timeleft.com/blog/timeleft-vs-other-dinner-with-strangers-apps/)
- Safety features per Timeleft: 18+, profiles hidden until after the event, group-only chat before the event (1:1 messaging afterwards via "Connect"), anonymous reporting, venue revealed the day before, vetted venues. Company claims "99% of experiences have no safety incident" and 96% feel compatible (self-reported) — [Timeleft blog](https://timeleft.com/blog/timeleft-vs-other-dinner-with-strangers-apps/)
- Launched Lisbon, May 2023; 20,000 subscribers within months (2023 data) — [Timeleft blog 2023](https://timeleft.com/blog/2023/09/30/dinner-with-strangers-the-new-social-revolution-hits-paris/)
- **Cities**: Timeleft's cities page lists 196 cities in 50 countries (counted from page). **India: Bangalore, Hyderabad, Mumbai, New Delhi.** Also Singapore, Kuala Lumpur, Bangkok, Bali, Jakarta, Makati, Taguig, Dubai, Abu Dhabi, Riyadh. **Not listed: Sri Lanka, Pakistan, Bangladesh** — [timeleft.com/cities](https://timeleft.com/cities/). Other counts conflict: "200+ cities, 52 countries" — [Timeleft blog](https://timeleft.com/blog/timeleft-vs-other-dinner-with-strangers-apps/); "62 countries, 275+ cities" — [Cake company profile](https://www.cake.me/companies/timeleft?locale=vi)
- Help center lists India dinner time as 8:00 pm — [Timeleft Help: Dinner time](https://help.timeleft.com/hc/en-150/articles/14235814215452-Dinner-time)
- **Pricing**: no public price list; varies by region and shown at sign-up. US estimates: subscription about $20-26/month, single ticket about $20-35; meal paid separately; 1/3/6-month terms auto-renew; no-show fee up to 35% of monthly price; charges non-refundable except EU/UK 14-day withdrawal (page published 2026-08-03, updated 2026-10-10) — [Nexspark Timeleft review](https://nexspark.org/journal/timeleft-review). $19.99/month US cited on a Timeleft-related comparison — [search summary of Timeleft blog/FounderFeast](https://founderfeast.com/blog/timeleft-los-angeles). Older market prices: Malaysia RM100/month of dinners (RM55 per dinner reported 2024); Portugal €19.90 subscription / €12.90 trial (older) — [Vulcan Post](https://vulcanpost.com/867937/timeleft-dinner-with-strangers-review-malaysia); [Free Malaysia Today 2024](https://www.freemalaysiatoday.com/category/leisure/2024/08/08/heres-to-chilling-while-dining-with-total-strangers). **India INR price: not found.**
- New paid add-on (2026): US App Store reviewers report a ~$4.99/$5 fee to see who is attending — [App Store US review feed](https://itunes.apple.com/us/rss/customerreviews/page=1/id=6466442949/sortBy=mostRecent/json)
- **Scale**: company says 3M+ members and 80,000+ dinners (per Nexspark, 2026) — [Nexspark](https://nexspark.org/journal/timeleft-review); Cake profile says 1M+ app users — [Cake](https://www.cake.me/companies/timeleft?locale=vi). **Funding conflict**: CB Insights lists a $7M Series A on 2024-07-19 (Kima, FJ Labs, Play Ventures) — [CB Insights](https://www.cbinsights.com/company/timeleft/financials); Dealroom says "No known external funding" — [Dealroom](https://cednc.dealroom.co/companies/timeleft)
- Dating perception: matches by age and gender; offers women-only dinners (mentioned in a review). Help center says age placement cannot be adjusted — [Timeleft Help: age range](https://help.timeleft.com/hc/en-150/articles/21550527521308-What-Age-Range-Can-I-Expect-at-Timeleft-Dinners)

**Bumble For Friends / BFF (Bumble)**
- History: BFF began as a feature in Bumble in 2016; standalone "Bumble For Friends" app in 2023 — [TechCrunch 2026-04-05](https://techcrunch.com/2026/04/05/as-people-look-for-ways-to-make-new-friends-here-are-the-apps-promising-to-help/); 2023 standalone test seen in Australia, New Zealand, Philippines — [TechCrunch 2023-07-26](https://techcrunch.com/2023/07/26/bumble-is-a-launching-a-separate-bff-app-for-friend-friending)
- Bumble acquired Geneva (community/group chat app) in 2024 — [Mobile Marketing Magazine](https://mobilemarketingmagazine.com/geneva-bumble/); [AlternativeTo, May 2024](https://alternativeto.net/news/2024/5/bumble-acquires-geneva-platform-to-bolster-community-connections-and-friendship-features)
- **Relaunch, announced 2025-09-17 (article dated 2025-09-18)**: new BFF app built on Geneva; Geneva app shut down and its members auto-upgraded keeping groups/messages; one-on-one swipe matching and DMs retained; new **Groups tab** (chat rooms, hangout planning, in-app calendar, groups "from small to thousands"); group discovery slated for February 2026; Geneva had generated no revenue as of 2025-06-30 — [TechCrunch 2025-09-18](https://techcrunch.com/2025/09/18/bumble-bffs-revamped-app-is-here-focusing-on-friend-groups-and-community-building)
- Bumble Q3 2025 fact sheet: "BFF app has not generated any revenue" as of 2025-09-30 — [MarketScreener](https://www.marketscreener.com/news/bumble-third-quarter-2025-earnings-fact-sheet-ce7d5cddda8ff526)
- Matching: profile (photos, bio, up to 5 interests), send/receive "waves"; every profile goes through selfie verification; "Plans" tool to formalise invites; free with all features incl. Groups; optional premium "$17-80/month depending on location and demographics" (single, competitor-authored source; treat cautiously); no standalone user numbers disclosed; activity concentrated in New York, LA, London, Toronto — [Timeleft blog "Bumble BFF review", published 2026-10-14](https://timeleft.com/blog/bumble-bff-review/) (note: written by a competitor)
- Older Bumble For Friends Play listing describes optional premium (weekly, monthly, 3-month, 6-month) with "liked you", unlimited rematches, advanced filters, travel mode, 5 SuperSwipes and 1 Spotlight per week — [Google Play: Bumble For Friends](https://play.google.com/store/apps/details?id=com.bumblebff.app)
- **Two different iOS apps by country (finding from store lookups)**: the US App Store's friend app is now "BFF: Make friends & meet up" by Geneva Technologies, Inc. (bundle `com.genevachat.geneva`, id 1478573199), listed in the US only (not in IN, LK or GB storefronts). The UK store still carries "Bumble For Friends: Meet IRL" (id 6444040977, Bumble Holding Ltd), which is not in the US, IN or LK storefronts. **Neither app is in the Sri Lankan or Indian App Store** — [iTunes lookup 1478573199 us](https://itunes.apple.com/lookup?id=1478573199&country=us); [lk](https://itunes.apple.com/lookup?id=1478573199&country=lk); [iTunes lookup 6444040977 gb](https://itunes.apple.com/lookup?id=6444040977&country=gb); [lk](https://itunes.apple.com/lookup?id=6444040977&country=lk). A US reviewer (2026-10-25) titled "Doesn't work outside US": "it's only available in US" — [App Store US review feed](https://itunes.apple.com/us/rss/customerreviews/page=1/id=1478573199/sortBy=mostRecent/json)
- Dating perception: built by a dating company; a US reviewer (2-star, 2026-10-23) called it "Grindr for closet cases" and said profiles use "dating/hookup app poses" — [App Store US review feed](https://itunes.apple.com/us/rss/customerreviews/page=1/id=1478573199/sortBy=mostRecent/json)

**Partiful**
- Party invite maker (event pages, RSVPs, text-message invites); claimed "millions" of active users by end of 2023; used in 100+ countries as of 2025 — [Wikipedia: Partiful](https://en.wikipedia.org/wiki/Partiful)
- Funding conflicting: CB Insights $14.57M over 3 rounds; CGAA says $27.4M incl. $20M Series A (Nov 2022, a16z) — [Wikipedia/aggregators via search](https://en.wikipedia.org/wiki/Partiful); [CGAA](https://www.cgaa.org/article/partiful-a16z-raise). No official valuation found.
- Monetization: core is free; a reviewer references "Partiful plus" (2026-10-18), but **no official Partiful Plus price found** — [App Store US review feed](https://itunes.apple.com/us/rss/customerreviews/page=1/id=1662982304/sortBy=mostRecent/json)
- App now shows public events (reviewer 2026-10-20: "I don't want to see all these public events") — same feed
- Not a stranger-matching product; no verification found. **Not listed on the Sri Lankan App Store**; listed in India (4.92, 325 ratings) — [iTunes lookup lk](https://itunes.apple.com/lookup?id=1662982304&country=lk); [in](https://itunes.apple.com/lookup?id=1662982304&country=in)

**Luma**
- Event pages, invites, ticketing, check-in. Pricing (USD implied): free to create events, no fee on free events; 5% platform fee on paid tickets plus Stripe 2.9% + 30¢; **Luma Plus $59/month billed annually or $69/month monthly**, 0% platform fee, Zapier/API, check-in manager — [Luma Help: Luma vs Meetup](https://help.luma.com/p/luma-vs-meetup); [Tixfox 2026](https://tixfox.co/blog/luma-events-pricing)
- Funding: $3M seed Dec 2020 (Maven Ventures, Venrock); no Series A found (single aggregator; treat as incomplete) — [Clay dossier](https://www.clay.com/dossier/luma-funding)
- **Sri Lanka**: listed on the Sri Lankan App Store (4.91, 22 ratings); there are Colombo events on Luma, e.g. "WorkInSriLanka May Meet-up" — [iTunes lookup lk](https://itunes.apple.com/lookup?id=1546150895&country=lk); [luma.com/o6tywi5j](https://luma.com/o6tywi5j)
- No stranger matching or ID verification found; reviewers note it now requires LinkedIn info in some flows (2026-06-02) — [App Store US review feed](https://itunes.apple.com/us/rss/customerreviews/page=1/id=1546150895/sortBy=mostRecent/json)

**Playo (India; launched Sri Lanka 2026)**
- Bengaluru, founded 2014; CEO Gauravjeet Singh. Features: venue booking with real-time availability and recurring slots; "Play" tab to join public games and chat with players; **GameTime** (Playo-hosted pre-organised games with confirmed players and booked venue, filter by skill/distance); host public/private games, co-host, verify attendees, manage RSVPs; **split payments** with teammates; **Karma** points for discounts; user skill rating graph (Beginner to Pro); verified coaches. "Over 5 million users". Free to download; bookings paid; **no booking-fee amount published** (page dated 2025-10-07) — [Playo blog guide](https://blog.playo.co/playo-a-complete-guide-into-how-to-use-it-2020/)
- **Sri Lanka launch (2026-04-29)**: began operations starting in **Colombo**, plans Kandy, Jaffna, Galle, Negombo; already in UAE, Qatar, Saudi Arabia (UAE biggest international revenue); 150+ cities, 5,000+ venue partners, 5M+ users; FY26: 6M+ "friendships formed", 30M+ chat messages; **subscription planned for Q2 FY27** with perks incl. **profile verification**. No Sri Lanka venue count, sports or LKR pricing given — [Business News This Week, 2026-04-29](https://businessnewsthisweek.com/business/playo-expands-global-footprint-with-sri-lanka-launch/)
- On Sri Lankan App Store: 5.0 stars from 8 ratings — [iTunes lookup lk](https://itunes.apple.com/lookup?id=1018786950&country=lk)
- Funding is small and unclear: estimates $0.5M (CB Insights) to $2.62M (Tracxn); last confirmed round 2021 — [Tracxn](https://tracxn.com/d/companies/playo/__hzGLCwyg7RM5U_ln3BoAntuR13bl2DDLdISrcPE_Nao); [CB Insights](https://www.cbinsights.com/company/playo)
- Local Sri Lankan rival claim: "Bokker" court-booking platform for futsal/badminton (LinkedIn self-claim, unverified) — [LinkedIn](https://lk.linkedin.com/in/abdulali-farook-112bb93aa)

**Hudle (India)**
- Delhi-based; $2.5M Series A July 2025 led by Sky Impact Capital with Physis Capital, Atrium Venture, Mahesh Bhupathi — [FinSMEs 2025-07](https://www.finsmes.com/2025/07/hudle-raises-2-5m-in-series-a-funding.html); [Inc42](https://inc42.com/buzz/sportstech-startup-huddle-bags-2-5-mn/)
- Interview dated 2026-10-19: 4,000+ venue partners, 110+ cities, 40+ sports; claims 90% of India's padel games and 75% of pickleball games; community games (host and invite others), women's participation ~20%; GRIP rating for racket sports; Hudle Vision AI recording; goal 10M active players in two years; **no international or Sri Lanka plans mentioned**; fees not disclosed; split payment not mentioned — [Indian Startup Times](https://www.indianstartuptimes.com/interviews/from-booking-courts-to-building-a-sports-ecosystem-how-hudle-is-scaling-the-way-india-plays/)
- App Store listing claims 20 lakh+ (2M+) players — [App Store](https://apps.apple.com/in/app/hudle-find-sports-activities/id1380053168)
- Listed in Sri Lankan App Store but with 0 ratings — [iTunes lookup lk](https://itunes.apple.com/lookup?id=1380053168&country=lk). Google Play listing could not be located (package ID not found).

**222 (US)**
- Personality test matches strangers into in-person events at public venues (wine bars, comedy clubs); vetting process; told on the day; may bring a plus-one; **$22.22 curation fee or a monthly subscription at the same price**; iOS only — [TechCrunch 2026-04-05](https://techcrunch.com/2026/04/05/as-people-look-for-ways-to-make-new-friends-here-are-the-apps-promising-to-help/)
- Venues pay to partner — [Gazetteer SF](https://sf.gazetteer.co/pay-to-play)
- Listed on Sri Lankan App Store (1 rating) but no Sri Lankan events found — [iTunes lookup lk](https://itunes.apple.com/lookup?id=6450612690&country=lk)

**Pie (US)**
- Founded by Andy Dunn (Bonobos); AI quiz sorts RSVPs into groups of six with a pre-event group chat; cities Austin, Chicago, San Francisco — [TechCrunch 2026-04-05](https://techcrunch.com/2026/04/05/as-people-look-for-ways-to-make-new-friends-here-are-the-apps-promising-to-help/); [TechCrunch 2025-03-04](https://techcrunch.com/2025/03/04/andy-dunns-new-app-pie-uses-ai-to-help-you-make-friends)
- $11.5M Series A Sept 2024 led by Forerunner, total ~$24M (2024 data) — [Fitt Insider](https://insider.fitt.co/pie-raises-11-5m-for-irl-friendships/)
- App Store ID could not be confidently identified via search API.

**Others (lighter coverage)**
- Spond (Norway; sports team management, free): not in Sri Lankan or Indian App Store — [iTunes lookup lk](https://itunes.apple.com/lookup?id=755596884&country=lk)
- Peanut (women/mothers friendship): on LK store with 0 ratings — [iTunes lookup lk](https://itunes.apple.com/lookup?id=1178656034&country=lk)
- Yubo (teen/young adult live-stream friend app): on LK store, 4.73 from 78 ratings — [iTunes lookup lk](https://itunes.apple.com/lookup?id=1038653883&country=lk)
- Heylo (community group tool), Plura (partners & friends), Plei (pickup soccer): not in Sri Lankan App Store. OpenSports and GoodRec are listed in LK with 0 ratings — iTunes lookups for ids [1445966180](https://itunes.apple.com/lookup?id=1445966180&country=lk), [1528252601](https://itunes.apple.com/lookup?id=1528252601&country=lk), [1225575821](https://itunes.apple.com/lookup?id=1225575821&country=lk), [1056940981](https://itunes.apple.com/lookup?id=1056940981&country=lk), [1510554246](https://itunes.apple.com/lookup?id=1510554246&country=lk)
- Industry context: over a dozen US local friendship apps generated ~$16M US consumer spending (Appfigures); ~4.3M downloads (2025 data). Other new entrants: Les Amís ($70 NYC / €55 Amsterdam), Synchrony ($44.99/month, two-step ID verification incl. photo ID), Washed Up (LA small-group "plans"), Clyx, Meet5 — [TechCrunch 2026-04-05](https://techcrunch.com/2026/04/05/as-people-look-for-ways-to-make-new-friends-here-are-the-apps-promising-to-help/)

### Inferences
- In Sri Lanka today, the realistic direct competitors are Meetup (tech-skewed groups), Luma (professional/tech events), Playo (sports, Colombo since April 2026) and informal WhatsApp/Facebook groups. The "dinner with strangers" category (Timeleft, 222, Pie) and Bumble's BFF are absent, though Timeleft is in four Indian cities and could extend south.
- Playo is the most direct near-term threat for the sports half of Trimegos (futsal, badminton): it has "join games", split payments, skill ratings, chat, and is planning profile verification inside a subscription.
- Every curated-stranger model monetises through subscriptions in the $20-30/month (US) range, and add-ons such as paying to see attendees (Timeleft ~$5, Meetup+). Those prices do not translate to Colombo purchasing power.

### Gaps
- Official Meetup+ price and official Meetup help-center pricing page (403 to fetch); Partiful Plus price; BFF premium price (only a competitor-authored range).
- Timeleft INR price for Indian cities; Timeleft funding (sources conflict).
- Playo booking/convenience fee amounts and Sri Lanka venue count/LKR pricing.
- Google Play availability in Sri Lanka for any app (cannot be checked from a non-LK IP).
- Luma, Partiful and Bumble BFF user numbers for 2025-2026.

---

## 2. Store ratings (Google Play and App Store, with count and date)

### Takeaway
Event tools (Partiful, Luma) score 4.8-4.95 on both stores; stranger-matching apps score lower and diverge across stores. Bumble For Friends on Google Play is the outlier at 2.7 stars. Ratings in the Sri Lankan App Store are tiny (Meetup 136 ratings is the largest of the set), confirming little local adoption.

### Cited Findings

**Google Play (fetched 2026-10-31, `hl=en&gl=US`)**

| App (package) | Stars | Reviews | Installs |
|---|---|---|---|
| Meetup (`com.meetup`) | 3.8 | 236K | 10M+ |
| Timeleft (`com.timeleft.app`) | 4.2 | 11.9K | 1M+ |
| Bumble For Friends: Meet IRL (`com.bumblebff.app`) | 2.7 | 8.1K | 1M+ |
| Partiful (`com.partiful.partiful`) | 4.9 | 26.9K | 500K+ |
| Luma: Events & Invites (`com.luma.mobile`) | 4.8 | 4.13K | 500K+ |
| Playo (`com.techmash.playo`) | 4.6 | 57K | 1M+ |
| Spond (`com.spond.spond`) | 4.7 | 14.4K | 1M+ |
| Yubo (`co.yellw.yellowapp`) | 3.9 | 417K | 10M+ |
| Peanut (`com.teampeanut.peanut`) | 3.9 | 11.9K | 1M+ |
| Plura (`community.together.bloom`) | 3.5 | 610 | 50K+ |

Sources: [Meetup](https://play.google.com/store/apps/details?id=com.meetup), [Timeleft](https://play.google.com/store/apps/details?id=com.timeleft.app), [Bumble For Friends](https://play.google.com/store/apps/details?id=com.bumblebff.app), [Partiful](https://play.google.com/store/apps/details?id=com.partiful.partiful), [Luma](https://play.google.com/store/apps/details?id=com.luma.mobile), [Playo](https://play.google.com/store/apps/details?id=com.techmash.playo), [Spond](https://play.google.com/store/apps/details?id=com.spond.spond), [Yubo](https://play.google.com/store/apps/details?id=co.yellw.yellowapp), [Peanut](https://play.google.com/store/apps/details?id=com.teampeanut.peanut), [Plura](https://play.google.com/store/apps/details?id=community.together.bloom)
- Cross-check: Nexspark reported Timeleft at 4.4 with ~11,500 Play ratings as of 2026-10-05, vs 4.2 / 11.9K today — [Nexspark](https://nexspark.org/journal/timeleft-review)
- Hudle, 222, Heylo, OpenSports, Plei: Google Play listing not located (package IDs unknown; 222 appears iOS-only per [TechCrunch](https://techcrunch.com/2026/04/05/as-people-look-for-ways-to-make-new-friends-here-are-the-apps-promising-to-help/)).

**Apple App Store (iTunes Lookup API, 2026-10-31): stars / rating count per storefront ("n/a" = not listed in that country)**

| App (App Store id) | US | India | Sri Lanka | UK |
|---|---|---|---|---|
| Meetup (375990038) | 4.72 / 272,679 | 4.71 / 4,938 | 4.83 / 136 | 4.64 / 33,047 |
| Timeleft (6466442949) | 4.62 / 8,882 | 4.40 / 290 | 5.0 / 1 | 4.53 / 1,024 |
| BFF by Bumble, ex-Geneva (1478573199) | 4.20 / 8,820 | n/a | n/a | n/a |
| Bumble For Friends: Meet IRL (6444040977) | n/a | n/a | n/a | 4.33 / 2,115 |
| Partiful (1662982304) | 4.95 / 280,213 | 4.92 / 325 | n/a | 4.93 / 2,953 |
| Luma (1546150895) | 4.93 / 19,550 | 4.89 / 1,513 | 4.91 / 22 | 4.90 / 2,105 |
| Playo (1018786950) | 4.58 / 158 | 4.65 / 15,108 | 5.0 / 8 | 3.93 / 41 |
| Hudle (1380053168) | 4.80 / 162 | 4.87 / 11,557 | 0 ratings | 4.89 / 18 |
| 222 (6450612690) | 4.68 / 7,412 | 4.43 / 28 | 5.0 / 1 | 4.52 / 365 |
| Spond (755596884) | 4.85 / 3,843 | n/a | n/a | 4.80 / 8,941 |
| Peanut (1178656034) | 4.39 / 11,666 | 4.27 / 15 | 0 ratings | 4.45 / 4,003 |
| Yubo (1038653883) | 4.52 / 374,437 | 4.53 / 1,927 | 4.73 / 78 | 4.47 / 122,364 |
| Heylo (1445966180) | 4.89 / 6,652 | 4.67 / 12 | n/a | 4.79 / 602 |
| Plura (1528252601) | 4.58 / 2,018 | n/a | n/a | n/a |
| OpenSports (1056940981) | 4.91 / 2,506 | 4.86 / 7 | 0 ratings | 4.82 / 56 |
| Plei (1225575821) | 4.84 / 12,438 | 4.67 / 3 | n/a | 4.31 / 13 |
| GoodRec (1510554246) | 4.86 / 13,797 | 4.91 / 22 | 0 ratings | 4.81 / 134 |

Source pattern: `https://itunes.apple.com/lookup?id=<id>&country=<us|in|lk|gb>`, e.g. [Meetup lk](https://itunes.apple.com/lookup?id=375990038&country=lk), [Timeleft in](https://itunes.apple.com/lookup?id=6466442949&country=in), [Playo in](https://itunes.apple.com/lookup?id=1018786950&country=in), [Hudle in](https://itunes.apple.com/lookup?id=1380053168&country=in), [Partiful lk](https://itunes.apple.com/lookup?id=1662982304&country=lk), [BFF us](https://itunes.apple.com/lookup?id=1478573199&country=us). (US search one call earlier the same day returned Timeleft 8,895 and BFF 8,831: small same-day drift from Apple's cache.)

- Timeleft's own blog cites BFF App Store 4.2 — consistent with the US figure above — [Timeleft blog](https://timeleft.com/blog/bumble-bff-review/)

**Trustpilot (2026-10-31)**
- Timeleft: TrustScore 3.2, 767 reviews; 47% 5-star, 27% 1-star — [Trustpilot timeleft.com](https://www.trustpilot.com/review/timeleft.com)
- Meetup: TrustScore 3.7 (graphic shows 3.5), 1,147 reviews; 32% 5-star, 56% 1-star — [Trustpilot meetup.com](https://www.trustpilot.com/review/meetup.com)
- Playo: no Trustpilot page (HTTP 404 at trustpilot.com/review/playo.co).

### Inferences
- Apple's headline averages are dominated by rating-only prompts; written reviews skew far more negative (e.g. Meetup US: 469 of its 500 most recent written reviews are 1-3 stars despite a 4.72 average). Use the written-review feed for pain points, not the average.
- Bumble's friend app has a big store gap (Play 2.7 vs iOS 4.2-4.3) and split app identities by country, suggesting a messy migration.
- Timeleft India (290 ratings) shows real but small Indian traction; Playo and Hudle are the only apps here with five-figure Indian rating counts.

### Gaps
- Google Play ratings for Hudle, 222, Heylo, OpenSports, Plei.
- Google Play per-country (India/Sri Lanka) ratings: Play's web page does not split by country.
- Sensor Tower/AppFollow download estimates were not retrieved.

---

## 3. Recurring themes in 1-3 star reviews

### Takeaway
Across the curated-stranger apps the dominant complaints are: paywalls and aggressive/"dark pattern" subscriptions; last-minute cancellations and no-shows; empty or distant cities; mismatched groups (age, interests, diversity); poor (often AI) support; and, for Bumble's BFF, a broken app plus dating/hookup drift. Sports-booking apps (Playo, Hudle) draw complaints about refunds, venue reliability, OTP login failures and notification spam.

### Cited Findings

**Meetup** (US App Store feed: 469 of the 500 most recent written reviews rated 1-3) — [feed](https://itunes.apple.com/us/rss/customerreviews/page=1/id=375990038/sortBy=mostRecent/json)
- Subscription traps / charges after cancelling: "They keep charging after you cancel within trial period." (1-star, 2026-10-21); "They will bombard you with pop ups to get the weekly subscription even after clicking free version only." (2-star, 2026-10-21)
- Paid features pushing toward dating: "Stop trying to turn Meetup into a trashy dating site." (1-star, 2026-10-28, on paying to see male vs female attendee counts)
- Features moved behind paywall: "Meetup continues to cut free features from the app to add them back as premium subscription features." (2-star, 2026-10-19)
- Organizer cost and Meetup+ pop-up hurting groups: "putting an 'offer' to join 'Meetup Plus' for a ridiculous monthly amount ... is put in front of the joining page as a popup" (2-star, 2026-10-07, partial quote)
- Intrusive ads; no human support ("I just get an ai bot", 2026-10-26); events concentrated downtown/online.
- Trustpilot echo: "they charge organizers a lot and you cannot see who is attending an event without paying more $$$$." (3-star, 2026-10-24) — [Trustpilot](https://www.trustpilot.com/review/meetup.com)

**Timeleft** (US feed: 310 of 500 rated 1-3) — [feed](https://itunes.apple.com/us/rss/customerreviews/page=1/id=6466442949/sortBy=mostRecent/json)
- New paywall to see attendees: "now you have to pay $5 to see the attending list" (1-star, 2026-10-28)
- Last-minute cancellations: "kept canceling events on me with only hours notice" (1-star, 2026-10-20)
- No-shows and wrong venues: "I've been sent to closed coffee shops ... and others have 0 people attend other than me." (2-star, 2026-10-17); "People don't show up so u end up with 4 people instead of 7-8" (1-star, 2026-10-11)
- Poor matching: "groups are ranging from 18 to 65" (1-star, 2026-10-08); a woman of colour reported being the only one and feeling "microaggressed the entire night" (1-star, 2026-10-17)
- Empty/distant cities: "Hopelessly underpopulated" (1-star, 2026-10-11); nearest cities "2-2.5 hours away" (3-star, 2026-10-20)
- Fixed schedule: dinners "only offered on the same day of the week and at the same time" (2-star, 2026-10-21)
- Pay before seeing anything / refunds removed / hard to unsubscribe: "The unsub button exploits a dark pattern" (1-star, 2026-09-30); "They used to offer a 30 day refund, but took that away" (2026-10-08)
- Trustpilot echo (3.2/5): auto-renew, last-minute cancellations, noisy venues, age/gender imbalance, automated support. "the other participants had cancelled at the last minute." (Oct 27, 2026) — [Trustpilot](https://www.trustpilot.com/review/timeleft.com)

**BFF by Bumble (US, ex-Geneva)** (465 of 500 rated 1-3) — [feed](https://itunes.apple.com/us/rss/customerreviews/page=1/id=1478573199/sortBy=mostRecent/json)
- Migration backlash: "Move the app back to Bumble App!" (1-star, 2026-10-21); "I met friends more easily when it was on the BUMBLE APP."
- Sign-up/login broken: "Every time I try to create an account it says 'something went wrong'" (1-star, 2026-10-22)
- Thin supply: "I'm in a populated city and it only shows 0-3 profiles per day. Most far away." (1-star, 2026-10-10)
- Dating/hookup drift: "This is just Grindr for closet cases" (2-star title, 2026-10-23)
- Scammers: "Constant harassment from scammers" posing as artists (3-star, 2026-10-08); blocking doesn't stop tagging (2-star, 2026-10-17); un-mutable promo notifications.
- US-only: "it's only available in US" (2-star, 2026-10-25)

**Bumble For Friends (UK app)** (168 of 186 rated 1-3) — [feed](https://itunes.apple.com/gb/rss/customerreviews/page=1/id=6444040977/sortBy=mostRecent/json)
- App stuck on loading screen (many reviews Sept-Oct 2026), including paying premium users.
- "Ghost town": "Haven't seen anybody new in my area for weeks ... It seems abandoned." (1-star, 2026-10-20)
- Selfie verification failures: "The photo verification failed 30 times" (1-star, 2026-10-19)
- Paywall: "You have to pay to see who likes you which just makes the whole thing pointless" (1-star, 2026-10-02)
- Competitor-authored summary of BFF complaints: many matches but few meetups, ghosting, planning burden on one person — [Timeleft blog](https://timeleft.com/blog/bumble-bff-review/)

**222** (153 of 500 rated 1-3) — [feed](https://itunes.apple.com/us/rss/customerreviews/page=1/id=6450612690/sortBy=mostRecent/json)
- Paying but repeatedly not selected: "I've been rejected for 21 of the 22 events I've requested." (2-star, 2026-10-19); "After your first event they take your money but don't select you" (1-star, 2026-10-21)
- Contacts spammed during onboarding, called a "pyramid scheme" (2026-09-21, 2026-10-03)
- Cost stack: "$30 a month to have the provide to pay $15 to go to to $50 dinners" (1-star, 2026-09-18, verbatim incl. typos)
- Privacy: "requiring phone number, full date of birth, and precise GPS location sharing is ridiculous" (1-star, 2026-09-10); not available in town discovered only after onboarding.

**Partiful** (64 of 500 rated 1-3: low) — [feed](https://itunes.apple.com/us/rss/customerreviews/page=1/id=1662982304/sortBy=mostRecent/json)
- Forced app download, glitches, text spam ("you'll start regularly receiving text spam", 2026-10-23), missing reminders, unwanted public-events feed.

**Luma** (41 of 219 rated 1-3: low) — [feed](https://itunes.apple.com/us/rss/customerreviews/page=1/id=1546150895/sortBy=mostRecent/json)
- Wrong location defaults and global feed ("a game night in Bangalore", 2026-10-17); Plus auto-renew hard to cancel (2026-05-30); invites not delivered (2026-05-12).

**Playo (India store)** (365 of 500 rated 1-3) — [feed](https://itunes.apple.com/in/rss/customerreviews/page=1/id=1018786950/sortBy=mostRecent/json)
- OTP/phone login failures ("couldn't even give otp i have tried 20+ times", 2026-10-03); notification spam ("Every 10 mins there is a notification", 2026-09-15); venue refund disputes; crashes; peer rating abuse ("Players are deliberately giving low rating", 2026-06-21); "There is no way to report scammers on this app." (2026-06-14)

**Hudle (India store)** (41 of 108 rated 1-3) — [feed](https://itunes.apple.com/in/rss/customerreviews/page=1/id=1380053168/sortBy=mostRecent/json)
- Refunds as expiring credits, rain/fog cancellations not refunded, double booking, wrong-date bookings, slow support ("I lose 5000 INR", 2026-05-13).

### Inferences
- The most repeated failure across curated-stranger apps is **reliability of the meet itself** (cancellations, no-shows, closed venues, being waitlisted) rather than the matching idea. The second is **monetisation hostility** (pay before seeing value, pay to see who is coming, hard-to-cancel renewals).
- Paying to see attendee gender (Meetup) or attendee lists (Timeleft) is read by users as a dating-adjacent move and generates backlash; Trimegos' "faces hidden until full" is the opposite stance and could be positioned explicitly against this.
- Trust and safety gaps users name: scammers, failed blocking, no reporting path (Playo), failed selfie verification (Bumble UK). Verification must be reliable, not just present.

### Gaps
- Google Play review text was not scraped (only star/count); Play-specific themes may differ (e.g. Bumble For Friends 2.7 on Play).
- Reddit threads were only lightly covered (one r/datingoverforty anecdote on Timeleft ages being mostly 40+: [mirror](https://nyc1.lr.ggtyler.dev/r/datingoverforty/comments/1gr8ldd/timeleft_experience/lx4cvu0/?context=3), unofficial mirror).
- Review counts above are the share of the most recent written reviews only, not of all ratings.

---

## 4. Timeleft and Bumble For Friends deep dive (cities, South Asia, pricing, model, 2025 relaunch)

### Takeaway
Timeleft is in 4 Indian cities (Bangalore, Hyderabad, Mumbai, New Delhi) but not Sri Lanka; its model is a paid, algorithm-matched Wednesday dinner of about 5 with venue revealed late. Bumble's BFF was relaunched in September 2025 on Geneva's group-chat technology with a Groups tab; it earns no revenue and is not on the Indian or Sri Lankan App Store.

### Cited Findings
- Timeleft city list includes India (4), Singapore, Kuala Lumpur, Bangkok, Bali, Jakarta, Makati, Taguig, Dubai, Abu Dhabi, Riyadh; no Sri Lanka/Pakistan/Bangladesh — [timeleft.com/cities](https://timeleft.com/cities/)
- Model, group size (5, or 4-6), personality quiz, late reveal, after-party — [TechCrunch 2026-04-05](https://techcrunch.com/2026/04/05/as-people-look-for-ways-to-make-new-friends-here-are-the-apps-promising-to-help/); [Timeleft blog](https://timeleft.com/blog/timeleft-vs-other-dinner-with-strangers-apps/)
- Pricing (US estimates, no public list): ~$20-26/month subscription, ~$20-35 single ticket, meal extra, no-show fee up to 35% of monthly price — [Nexspark 2026](https://nexspark.org/journal/timeleft-review); ~$5 attendee-preview fee reported by users Oct 2026 — [App Store US feed](https://itunes.apple.com/us/rss/customerreviews/page=1/id=6466442949/sortBy=mostRecent/json)
- Timeleft India App Store: 4.40 stars, 290 ratings — [iTunes lookup in](https://itunes.apple.com/lookup?id=6466442949&country=in)
- BFF relaunch Sept 2025 on Geneva, Groups tab, discovery Feb 2026, Geneva closed, no revenue — [TechCrunch 2025-09-18](https://techcrunch.com/2025/09/18/bumble-bffs-revamped-app-is-here-focusing-on-friend-groups-and-community-building); [MarketScreener Q3 2025](https://www.marketscreener.com/news/bumble-third-quarter-2025-earnings-fact-sheet-ce7d5cddda8ff526)
- Selfie verification on every profile; free incl. Groups; optional premium; Bumble said as of mid-2026 it had not sought revenue from the app — [Timeleft blog (competitor-authored)](https://timeleft.com/blog/bumble-bff-review/)
- Store split: US iOS app "BFF: Make friends & meet up" by Geneva Technologies (US-only); UK still on old "Bumble For Friends: Meet IRL"; neither in IN/LK — [iTunes lookups](https://itunes.apple.com/lookup?id=1478573199&country=in)

### Inferences
- Timeleft's presence in Bangalore/Mumbai means Sri Lankan users who travel or follow Indian social media may know the format; a Colombo launch by Timeleft is plausible but there is no evidence of plans.
- Bumble's pivot from 1:1 swiping to groups validates Trimegos' group-first thesis, but its dating-brand baggage and US focus leave South Asia open.

### Gaps
- Timeleft India pricing in INR and India launch date.
- Whether Bumble's Android "Bumble For Friends" (`com.bumblebff.app`) is downloadable in Sri Lanka/India.

---

## 5. Playo and Hudle: sports booking plus finding players

### Takeaway
Both are India-first sports platforms that pair venue booking with community games. Playo has the richer social layer (join games, chat, split payments, skill ratings, Karma, planned verification) and **launched in Colombo in April 2026**; Hudle is focused on padel/pickleball across Indian cities with no stated international plans.

### Cited Findings
- Playo features: book venues, "Play" tab to join public games and chat, GameTime hosted games, host public/private games and verify attendees, split payments, Karma points, rating graph, coaches; 5M+ users — [Playo blog, 2025-10-07](https://blog.playo.co/playo-a-complete-guide-into-how-to-use-it-2020/)
- Playo Sri Lanka: Colombo first, then Kandy, Jaffna, Galle, Negombo; subscription with profile verification planned Q2 FY27 — [Business News This Week, 2026-04-29](https://businessnewsthisweek.com/business/playo-expands-global-footprint-with-sri-lanka-launch/)
- Playo India App Store 4.65 / 15,108; Sri Lanka 5.0 / 8; Google Play 4.6 / 57K / 1M+ — [iTunes in](https://itunes.apple.com/lookup?id=1018786950&country=in); [iTunes lk](https://itunes.apple.com/lookup?id=1018786950&country=lk); [Google Play](https://play.google.com/store/apps/details?id=com.techmash.playo)
- Playo monetization: free app; paid bookings; a convenience fee per booking is suggested only by a third-party student analysis (not official) — [GrowthX](https://growthx.club/proof-of-work/health-wellness-and-fitness/playo/monetization-project-----playo%7C67d91570685d52e5b28d82de)
- Hudle: $2.5M Series A Jul 2025; 4,000+ venues, 110+ cities, 40+ sports; community games; GRIP rating; no international plans — [FinSMEs](https://www.finsmes.com/2025/07/hudle-raises-2-5m-in-series-a-funding.html); [Indian Startup Times 2026-10-19](https://www.indianstartuptimes.com/interviews/from-booking-courts-to-building-a-sports-ecosystem-how-hudle-is-scaling-the-way-india-plays/)
- Hudle India App Store 4.87 / 11,557; Sri Lanka 0 ratings — [iTunes in](https://itunes.apple.com/lookup?id=1380053168&country=in); [lk](https://itunes.apple.com/lookup?id=1380053168&country=lk)
- Colombo futsal venues charge hourly (e.g. Uni Sports Center) — [Yamu](https://www.yamu.lk/highlights/8-indoor-sports-outlets-in-colombo/)

### Inferences
- Playo will likely own court booking in Colombo if it signs venues; Trimegos should not compete on booking but on the social/safety layer (blind feed, verified people, min-3 public plans across non-sport activities), or partner with/link to booking.
- Playo reviewers already complain about notification spam, peer-rating abuse and no scam reporting: areas where a safety-first app can differentiate.

### Gaps
- Number of Colombo venues on Playo, LKR pricing, and whether split payments work with Sri Lankan payment methods.
- Hudle Google Play listing and Android rating.

---

## 6. Gaps a Colombo-first, safety-first group-plans app could own

### Takeaway
The open space is: a free-to-browse, verified, group-only (min 3) plans app for non-sport and sport activities in Sri Lanka, with faces hidden until full, transparent or no paywalls, and strong reliability tooling against no-shows and cancellations. None of the analysed competitors offers this combination in Sri Lanka.

### Cited Findings
- Not in Sri Lanka: Timeleft (no LK city), Bumble BFF (not in LK App Store), Partiful, Spond, Heylo, Plura, Plei (not in LK App Store) — [timeleft.com/cities](https://timeleft.com/cities/); iTunes lookups cited above.
- Present in Sri Lanka but not stranger small-group social: Meetup (tech groups), Luma (events), Playo (sports, since Apr 2026) — [iTunes lookups lk](https://itunes.apple.com/lookup?id=375990038&country=lk); [Business News This Week](https://businessnewsthisweek.com/business/playo-expands-global-footprint-with-sri-lanka-launch/)
- Reliability is the top pain (cancellations, no-shows, closed venues, waitlist rejections) — Timeleft, 222 feeds and Trustpilot cited in section 3.
- Paywalls and dark-pattern subscriptions are a top pain (Meetup, Timeleft, 222, Bumble UK) — section 3.
- Dating drift is a live complaint (Meetup gender-count feature, BFF "Grindr" review) — section 3.
- Verification exists but fails (Bumble UK selfie failures) or is planned (Playo) — section 3; [Business News This Week](https://businessnewsthisweek.com/business/playo-expands-global-footprint-with-sri-lanka-launch/)
- Empty-city problem in non-core cities (Timeleft, BFF "0-3 profiles per day") — section 3.
- Fixed formats (Timeleft one weekday dinner) frustrate shift workers — [Timeleft US feed](https://itunes.apple.com/us/rss/customerreviews/page=1/id=6466442949/sortBy=mostRecent/json)

### Inferences
- **Free core loop, no "pay to see who's coming"**: competitors' most-hated monetisation; Trimegos' blind-until-full design makes attendee identity a reward for showing up, not a paid upsell.
- **Reliability as a feature**: no-show penalties/reputation, host cancellation rules, and Colombo-curated public venues would address the #1 complaint. (Timeleft's no-show fee shows users accept penalties when the meet is reliable.)
- **Anti-dating by structure**: min 3 people, public places, faces hidden until full, no 1:1 swipe, and no gender-ratio paywall are concrete differentiators against Meetup+ and BFF criticism.
- **Hyperlocal density**: launching only in Colombo areas avoids the "nearest city 2 hours away" and "ghost town" failure; fixed areas (as Trimegos already has) match this.
- **Activity breadth beyond sport and dinner**: Playo/Hudle own sport booking; Timeleft/222/Pie own curated dinners; user-hosted coffee, hikes, board games with any day/time is unclaimed in Sri Lanka. A possible tie-in: link futsal gigs to Playo-booked courts rather than competing on booking.
- **Low-cost market fit**: US subscription levels ($20-30/month) are mismatched to Sri Lanka; local pricing (if any) needs LKR-scale micro-pricing or free-with-venue-partnerships (222's venue-pays model is one precedent).
- **Local payments and phone/OTP reliability**: Playo's top India complaints are OTP login failures; email+password plus reliable login is a small but real edge.

### Gaps
- No primary user research on Sri Lankan attitudes to these apps was found in this scope (covered by other researchers).
- Whether Timeleft or Bumble plan South Asian expansion beyond Timeleft's 4 Indian cities: no evidence found.
