# Trimegos: research, positioning and rebuild programme

Paste everything below the line into Claude Code at the repo root, or say "Run docs/research/PROMPT.md".

---

## Your role

Act as a senior product lead who leads market, design and marketing research and then delivers the result. The team is 3 people and they will cover **every area**: development, design, research, marketing, sales, community and operations. Don't drop or shrink an area because of team size. Plan the work so 3 people can carry it, and sequence it if needed. You're expected to **propose improvements, new features and changes of direction** whenever the evidence supports them. Nothing in the current product is protected. Ask before anything hard to reverse: deleting data, changing the hosted database, renaming the brand, or removing features.

## Context you must load first

1. Read `CLAUDE.md` in full. Its hard rules still apply to all code you write.
2. Read every file in `docs/` (the Trio-era spec). Treat it as a set of hypotheses to test, not as truth.
3. Open **every** source file in `app/`, `components/`, `lib/`, `supabase/`, `public/` (names only for binaries), `scripts/` and `middleware.ts`. Don't skim directory listings. Later phases depend on knowing what exists.

Facts about the current state:
- Trimegos is a group-meetup web app and PWA for Sri Lanka. Gigs need at least 3 people, meet in public places, and it is deliberately not a dating app.
- It's pre-launch. There are 10 accounts, all test data, and they can be deleted later (with confirmation, see Phase 5).
- The team is 3 people who will cover every area between them. The budget is small, so prefer cheap and fast ways to learn, but never leave an area out.
- **Everything is open to change:** design system, palette, font, surfaces, IA, flows, features, monetization, positioning, target audience and the product direction itself. If the research points to a better direction (a different core audience, wedge activity, use case or business model), say so plainly and back it with evidence. The brand name stays "Trimegos" unless the research finds a serious problem. If it does, raise it as a decision. Don't rename anything yourself.
- **Add features where they're needed.** Any gap found in research (safety, retention, liquidity, venue value, onboarding, social proof and so on) should become a concrete feature proposal, not just a note.
- The team wants a **clean white/light theme** treated as a serious candidate direction.
- Language: **English UI first**, built so it's ready for i18n. Sinhala and Tamil come later, but plan for them now.
- Geography: **Colombo first.** Pick the starting neighbourhoods from evidence. Kandy, Galle and the rest of the expansion path come later.

## Research standards (apply to every document)

- Cite every fact with a URL and the date you accessed it. Use Sri Lankan sources wherever they exist.
- Label each claim **Fact** (sourced), **Estimate** (show the maths) or **Assumption** (state how we'd test it).
- Never invent statistics, quotes, reviews or user data. If data doesn't exist, say so and design a way to collect it.
- Prices in LKR, with USD alongside where useful, and the date.
- End each document with: **Key findings**, **Decisions this informs**, **Open questions**, **Confidence (high/med/low)**.
- If something can only be learned from real people, write a **field kit** (scripts, screeners, surveys) for the team to run. Don't guess the answers.
- Use the `anthropic-skills:deep-research` skill and parallel research agents for the desk research. Use `ui-ux-pro-max` and `frontend-design` for design work.

## Phase 0: Current-state audit

Write `docs/research/00-current-state.md`:
- Feature inventory: each route, its purpose, and whether it's complete, partial or a stub.
- Screen inventory. Run the app with the `run` skill, screenshot every screen at 375px and 1280px, and save the images to `docs/research/screens/`.
- Design critique of each screen: hierarchy, density, contrast, consistency, trust cues, and how it feels compared with modern consumer apps. Be blunt.
- Code and docs issues: violations of the CLAUDE.md hard rules, files over 200 lines, hardcoded strings, places where `docs/` and the code disagree, dead code, missing analytics, error monitoring and tests.
- Performance: what frosted-glass `backdrop-filter` costs on low-end Android, bundle size, and LCP/INP estimates on 4G.

## Phase 1: Market and strategy research

One file per area in `docs/research/`:

1. `01-problem-demand.md`: The problem, how often it happens and how badly it hurts. How people in Colombo find activity partners today (WhatsApp/FB groups, Reddit r/srilanka, clubs, apps). Signals of social isolation and urban migration among 18 to 35 year-olds in Sri Lanka.
2. `02-personas-jtbd.md`: Players (students, young professionals, people new to Colombo, returning diaspora, expats, women looking for safe group plans) and venues (cafes, futsal and badminton courts, board-game spots, gyms, studios). For each: routine, budget, phone and data plan, triggers, objections, and jobs to be done. Include who hosts and who joins.
3. `03-market-size.md`: TAM/SAM/SOM for Colombo, then Sri Lanka, then the expansion markets. Count both players and venues. Show the maths.
4. `04-competitors.md`: Direct competitors (Meetup, Timeleft, Bumble BFF, Partiful, Luma, Playo, Hudle, local sports-booking apps), indirect ones (WhatsApp/FB groups, Instagram communities, clubs) and doing nothing. Compare features, pricing, store ratings, and the themes in their 1 to 3 star reviews. Finish with the gaps Trimegos can own.
5. `05-positioning.md`: A positioning statement, a category choice ("group plans", "activity crews" or something else), how to stay clearly not a dating app, and 3 messaging options to test. Define the value proposition separately for players and for venues.
6. `06-trust-safety.md`: Risks particular to Sri Lanka: harassment, scams, the dating perception, family and cultural norms around mixed-gender meetups, LGBTQ safety under current law, emergency and incident response, and law-enforcement requests. Map each risk to an existing control (verification, RLS, moderation, votes) or to a gap.
7. `07-liquidity-cold-start.md`: The minimum density needed per area and activity. A seeding playbook (house gigs, clubs, universities, venue-run gigs), host incentives, no-show reduction, and the first 90 days broken down week by week for a team of 3.
8. `08-platform.md`: Recommend PWA or native, and when. Cover the Sri Lankan Android/iOS split, device tiers, data costs, iOS web push working only after Home Screen install, PWA install rates, and Play Store via a Trusted Web Activity (TWA) as a middle option.
9. `09-localization.md`: English now, but i18n-ready. A Sinhala/Tamil plan: fonts (Noto Sans Sinhala/Tamil pairing), how long strings grow, Singlish/Tanglish in marketing, the holiday and seasonal calendar (Poya, Avurudu, Vesak, Deepavali, Christmas, monsoons) and how it affects activities.
10. `10-monetization.md`: Test the venue-first model in `docs/08` against the alternatives (sponsored gigs, staked deposits, brand partnerships, premium hosts). Venue willingness to pay, LKR price points, PayHere/LankaQR/card options and their fees, and when to switch on revenue so it doesn't hurt liquidity.
11. `11-legal-compliance.md`: Personal Data Protection Act No. 9 of 2022 (current status of enforcement, Data Protection Authority duties, DPO, cross-border transfer given Supabase's hosting region, biometric/face data). Liability for injuries at sports gigs, 18+ enforcement, company registration and trademark, and a gap list for the existing Terms and Privacy Policy. Flag what needs a Sri Lankan lawyer.
12. `12-unit-economics.md`: Infra cost per active user at 100, 1k and 10k users (Supabase, Vercel, push, storage). Cost to win a venue and its lifetime value, break-even, and how long the money lasts.
13. `13-expansion.md`: How to expand: Colombo neighbourhoods, then Kandy and Galle, then the diaspora and regional markets. Define the traction thresholds that unlock each step and what has to change at each (language, payments, law).
14. `14-risks.md`: A risk register with likelihood, impact, an early-warning signal and a mitigation for each risk.
15. `15-feature-opportunities.md`: Every improvement and new feature the research suggests, for players, hosts, venues and admins, each traced to the finding behind it. Examples to evaluate (not to assume): recurring gigs, groups or clubs, waitlists, check-in and show-up proof, post-gig ratings or kudos, gig templates, sharing to WhatsApp and Instagram, a calendar view, women-only gigs, venue self-serve, referrals, achievements. Score each on impact, effort, risk and how much it helps liquidity. Also list the existing features that should be cut, simplified or reworked, and why.
16. `16-direction-options.md`: 3 to 5 alternative product directions compared with the current one. Examples: campus-first, sports-only, newcomers and expats in Colombo, corporate team outings, venue-led events, travel or weekend trips. For each: target audience, wedge, monetization, how it fits the research, the main risk, and what it would cost to switch from the current code. Recommend whether to stay, adjust or change direction.

## Phase 2: Design research

1. `20-design-teardown.md`: A screen-by-screen teardown of 8 to 10 best-in-class apps (Partiful, Luma, Timeleft, Airbnb Experiences, Strava, Bumble BFF, Playo, and Revolut or Monzo for trust UI). Note what to borrow and what to avoid.
2. `21-design-principles.md`: 5 to 7 principles that come from the personas and safety research. Each one has to rule something out.
3. `22-design-directions.md`: 3 distinct directions. One must be the **clean white/light theme**. For each: mood, palette with WCAG contrast ratios, type (with Sinhala/Tamil fallback), surfaces and depth, iconography, imagery, motion, and a mock of the landing, feed, gig and lobby screens as a single HTML file per direction in `docs/research/directions/`. Recommend one direction and say why.
4. `23-ia-flows.md`: A new information architecture and the key flows: first visit, sign up, onboarding, verification, find a gig, join, the lobby, the meetup itself, after the meetup, hosting, and the venue journey. Cut steps everywhere you can. Show cold-start empty states.
5. `24-design-system-spec.md`: Tokens (colour, type scale, spacing, radius, elevation, motion), the component list with states, accessibility (WCAG 2.2 AA, focus, 375px, reduced motion) and a performance budget for budget Android on 4G.
6. `25-usability-kit.md`: A moderated usability test script (5 tasks), recruiting screener, consent text and a scoring sheet, so the team can test the chosen direction with 5 to 8 people.

## Phase 3: Marketing research and go-to-market

1. `30-brand-messaging.md`: Brand voice, tagline options, how "Trimegos" reads in Sinhala and Tamil, availability of handles and domains, and the trust signals Sri Lankans expect.
2. `31-channels.md`: Where each persona actually spends time (Instagram, TikTok, Facebook, WhatsApp channels, Reddit, campus groups, run and futsal clubs, creators). Estimated cost to acquire a user per channel. SEO keywords ("futsal Colombo", "things to do in Colombo this weekend") and which landing pages to build.
3. `32-launch-plan.md`: Closed beta, then a launch in one neighbourhood, then city-wide, then the next city. Dates, owners (3 people), budget and the exit criteria for each stage.
4. `33-content-calendar.md`: 8 weeks of content tied to the Sri Lankan calendar, with formats and example captions (no emojis in product UI; marketing copy may follow channel norms).
5. `34-venue-sales-kit.md`: Venue target list criteria, pitch, objection handling, a one-page offer, and a sample monthly report.
6. `35-field-kits.md`: Interview scripts (player and venue), a survey (Google Forms-ready, 10 to 15 questions), recruitment messages, and a synthesis template. The aim is 15 to 20 player and 5 to 8 venue interviews.

## Phase 4: Synthesis (then STOP)

1. `40-strategy.md`: A one-page strategy covering who it's for, positioning, the wedge activities, launch zones, monetization timing and the north star metric.
2. `41-metrics-plan.md`: The north star (proposed: gigs that ran with 3 or more people checked in). Activation, fill rate, show-up rate, week-1/4/8 retention, the venue metrics, the target for each, and the analytics events to implement.
3. `42-roadmap.md`: A 12-week roadmap across every area (product, design, engineering, research, marketing, venue sales, community, operations). Give each of the 3 people their workstreams per week. Split it into research-validated must-haves, should-haves, new features from `15-feature-opportunities.md`, and things that are cut.
4. `43-decisions.md`: Every decision that needs an owner's call, with options, a recommendation and evidence. Examples: product direction (from `16-direction-options.md`), which new features to build, which existing features to cut, design direction, the glass vs white surface, venue pricing, native timing.
5. `README.md`: An index of every research doc with a one-line summary of each.

**Stop here.** Summarize the top 10 findings and list the decisions in `43-decisions.md`. Wait for approval before Phase 5.

## Phase 5: Implementation (only after approval)

Use the approved decisions to:
1. **Rebuild the design system**: tokens in `app/globals.css` `@theme`, `components/ui/*`, fonts and the layout background. Update the CLAUDE.md "Design system" section to match.
2. **Redesign every screen** to the approved direction and IA, marketing, app and admin included. Check each at 375px and 1280px with screenshots.
2b. **Build the approved new features and rework or remove the approved cuts** from `15-feature-opportunities.md`. If the product direction changed, reshape the flows, copy and data model to match. Do one feature per commit, and give each one its own new migration where needed.
3. **Fix every file** flagged in Phase 0: hard-rule violations, files over 200 lines, hardcoded strings, dead code.
4. **Make it i18n-ready**: restructure `lib/copy/` into keyed English locale files that Sinhala and Tamil can later drop into, plus a font fallback stack. Don't translate yet.
5. **Add analytics and error monitoring** to match `41-metrics-plan.md`. Choose privacy-respecting tools, update the Privacy Policy, and keep payloads free of personal data.
6. **Update legal copy** in `lib/legal/` for the gaps in `11-legal-compliance.md`, marked "pending lawyer review".
7. **Database changes**: only new numbered migrations, never edits to applied ones. Every new table gets RLS and explicit grants. Show the SQL and **ask before applying to the hosted project**.
8. **Test data**: write a script that deletes the 10 test accounts and their storage objects. **Show it and ask before running it.**
9. **Docs**: move `docs/0*.md` to `docs/archive/` with a note that `docs/research/` supersedes them, and update CLAUDE.md wherever product rules changed.
10. Before reporting done: `npm run typecheck` and `npm run build` pass, the UI works at 375px with visible focus and reduced motion respected, and there are no emojis or em dashes in the UI. Report anything skipped or failing honestly.

Work in small, reviewable commits on a feature branch (`redesign/v2`), not on `main`. Don't push or open a PR without asking.
