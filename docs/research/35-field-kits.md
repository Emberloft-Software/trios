# 35 · Field kits

Everything the team needs to run the primary research: **15 to 20 player interviews, 5 to 8 venue interviews and one survey**. It covers who to recruit, what to say, how to ask for consent, what to ask, and how to turn notes into decisions.

Written for the three people who will run the sessions. Nothing here needs a researcher's background. Follow the scripts, take notes in the templates, and do the synthesis together at the end.

**Why this exists.** Most of what the product rests on can only be learned from real people. Examples: how often Colombo adults want company for an activity and can't find it; whether parents and partners accept mixed-gender meetups with strangers; whether a cafe owner would pay to receive groups. The research standards forbid guessing these (`docs/research/PROMPT.md`), so this kit collects them.

**Status note.** This was written before the Phase 1 desk research (`01` to `16`). Its hypotheses come from the original spec (`docs/`) and the Phase 0 audit (`00-current-state.md`). When the Phase 1 docs land, re-check §1 and add or drop questions before the first interview.

---

## Contents

1. [What we're trying to learn](#1-what-were-trying-to-learn)
2. [Plan, roles and timeline](#2-plan-roles-and-timeline)
3. [Who to recruit (quotas)](#3-who-to-recruit-quotas)
4. [Screeners](#4-screeners)
5. [Recruitment messages](#5-recruitment-messages)
6. [Consent and data handling](#6-consent-and-data-handling)
7. [Player interview script](#7-player-interview-script-45-minutes)
8. [Venue interview script](#8-venue-interview-script-30-minutes)
9. [Survey (Google Forms-ready)](#9-survey-google-forms-ready)
10. [Note-taking template](#10-note-taking-template)
11. [Synthesis template](#11-synthesis-template)
12. [Participant tracker](#12-participant-tracker)

---

## 1. What we're trying to learn

Each line is an **Assumption** the product currently rests on. The right-hand columns show which instrument tests it. The interviews explain *why*; the survey shows *how common*.

| # | Assumption to test | Where it comes from | Player interview | Venue interview | Survey |
|---|---|---|---|---|---|
| H1 | Adults in Colombo regularly want to do an activity but can't find enough people for it. | `docs/01` "The wedge is the activity" | §7 B, C | | Q4, Q5 |
| H2 | Today they solve this with WhatsApp or Facebook groups, friends of friends, or not at all, and those methods fail often enough to hurt. | PROMPT Phase 1 item 1 | §7 C | | Q6, Q7 |
| H3 | Meeting strangers in a group of 3+ in a public place feels safe enough to try, for women as well as men. | `docs/01` R1, R7 | §7 D | | Q9, Q10 |
| H4 | Family, partner and cultural norms around mixed-gender meetups don't block participation (or a women-only option removes the block). | PROMPT Phase 1 item 6 | §7 D | | Q10, Q11 |
| H5 | People won't read the product as a dating app if it's built and worded as group plans. | `docs/09` platonic clause; Phase 0 finding on hero art | §7 D, G | | Q12 |
| H6 | Enough people are willing to **host** (post a plan and show up first). | `docs/10` seeding section | §7 E | | Q8 |
| H7 | Verification (live video checked against photo) is a trust signal people value, not a barrier. | `docs/05` | §7 D, G | | Q9 |
| H8 | A PWA in the browser is good enough; people won't insist on a Play Store or App Store app. | PROMPT Phase 1 item 8 | §7 F | | Q13 |
| H9 | English-only UI is acceptable for the first audience. | PROMPT "English UI first" | §7 F | | Q14 |
| H10 | Venues have slow periods they want to fill and already spend money on marketing they can't measure. | `docs/08` | | §8 B, C | |
| H11 | Venues would pay roughly LKR 5,000 (Spot) or LKR 15,000 (Home Spot) per month for proven group visits. | `docs/08` (explicitly "not researched") | | §8 E | |
| H12 | A crew perk + code redemption is simple enough for staff to use. | `docs/08` redemption loop; `/spot/[slug]` | | §8 D | |
| H13 | Players would accept a small refundable deposit to cut no-shows. | `docs/08` "staked gigs, later" | §7 E | | Q15 |

Prices in H11 are the spec's own placeholders. At **LKR 331 per USD** (Fact: Federal Reserve H.10 series, 16 Oct 2026, [FRED DEXSLUS](https://alfred.stlouisfed.org/series?seid=DEXSLUS), accessed 2026-10-30), LKR 5,000 ≈ USD 15 and LKR 15,000 ≈ USD 45 (**Estimate**: 5,000 ÷ 331 = 15.1; 15,000 ÷ 331 = 45.3).

---

## 2. Plan, roles and timeline

### Roles (rotate so everyone hears users)

| Role | During a session | Before / after |
|---|---|---|
| **Interviewer** | Asks the questions, follows the script loosely, probes | Books the session, sends the reminder |
| **Note-taker** | Types notes into the template (§10), marks quotes word for word, watches body language | Cleans notes within 24 hours |
| **Recruiter / synthesis lead** | Not in the room | Runs screeners, keeps the tracker (§12), books the next people, pre-fills the synthesis board |

With three people: two run each session, one recruits. Swap every few days.

### Three-week timeline (Assumption: about 10 hours per person per week)

| Week | Recruiter | Interviewer + note-taker | Everyone |
|---|---|---|---|
| 1 | Post screeners (§4) and recruitment messages (§5); launch the survey (§9) | 2 pilot player interviews, then fix the script | 30-minute end-of-week review: what's confusing in the script? |
| 2 | Keep the pipeline at 2 booked sessions per working day | 8 to 10 player interviews, 3 to 4 venue interviews | Midweek: update the synthesis board after every 3 interviews |
| 3 | Close the survey at n ≥ 100 or on Friday, whichever comes first | Remaining player and venue interviews | Half-day synthesis workshop (§11), then write up findings |

**Stop rule.** Stop interviewing a segment when two interviews in a row add nothing new to the synthesis board ("saturation"). Use the spare slots on the segment that's still surprising you.

### Survey sample size

A target of **n = 100** gives a margin of error of about ±10 percentage points on a yes/no question at 95% confidence (**Estimate**: 1.96 × √(0.5 × 0.5 ÷ 100) = 0.098). That's enough to tell "most" from "few" but not to compare small subgroups. Treat anything below 30 responses in a subgroup as directional only. This is a convenience sample from the team's own channels, so it won't represent Colombo as a whole. Report it as "respondents we reached", never as "Colombo residents".

---

## 3. Who to recruit (quotas)

### Players: 15 to 20 interviews

Personas come from PROMPT Phase 1 item 2. Each person counts toward one primary segment. Spread across the other columns as you go.

| Primary segment | Target | Notes |
|---|---|---|
| University students (18 to 24) | 3 to 4 | Mix of state and private universities |
| Young professionals (23 to 35) | 4 to 5 | Office workers, shift workers, freelancers |
| New to Colombo (moved in the last 2 years, from elsewhere in Sri Lanka) | 3 to 4 | The likeliest "nobody to go with" group |
| Returning diaspora or expats in Colombo | 2 to 3 | Often fewer local networks |
| Women who want safe group plans | 3 to 4 | Recruit some through women-only groups; offer a woman interviewer |
| People who already organise group activities (club captains, run-club leads, WhatsApp group admins) | 2 | Potential hosts. They know the pain from the organiser's side |

**Spread across the whole set:**
- At least 40% women.
- At least 3 people who rarely use English day to day. Do these interviews in Sinhala or Tamil if the team can (§7 note).
- At least 4 on a lower-end Android phone.
- Both "plays sport" and "doesn't play sport" people.
- Colombo neighbourhoods: aim for variety in where they live and work. Note both in the tracker, because Phase 1 picks starting neighbourhoods from evidence.

**Exclude:** anyone under 18; current Trimegos team members, their family or close friends; anyone who works in a competing app; existing Trimegos test accounts.

### Venues: 5 to 8 interviews

| Venue type | Target | Examples of who to ask for |
|---|---|---|
| Cafe | 2 | Owner or manager |
| Futsal or badminton court | 2 | Owner, booking manager |
| Board-game or games cafe | 1 | Owner |
| Gym or studio (yoga, dance, climbing) | 1 to 2 | Owner, front-desk lead |
| Wildcard (bar with quiz night, bookshop with events, co-working space) | 0 to 1 | Events manager |

Spread: at least 2 independents and at least 1 small chain. At least 1 venue that already runs events. Talk to whoever **decides on marketing spend**, not just whoever is on shift (screener V5).

---

## 4. Screeners

Run these as a short Google Form or as a WhatsApp chat. Keep answers in the tracker (§12) under a participant ID, never on the shared synthesis board.

### 4.1 Player screener (2 minutes)

| # | Question | Answers | Rule |
|---|---|---|---|
| S1 | How old are you? | Under 18 / 18–24 / 25–29 / 30–34 / 35–44 / 45+ | **Under 18: thank and end.** 45+: accept, but no more than 2 in total. |
| S2 | Where do you live most of the week? | Colombo city (1–15) / Elsewhere in Colombo District / Gampaha District / Kalutara District / Other | Other: thank and end (Colombo first). |
| S3 | How long have you lived there? | Under 6 months / 6–24 months / 2–5 years / 5+ years | Under 2 years counts toward "New to Colombo". |
| S4 | In the last 3 months, did you want to do something (sport, outing, hobby) but not do it because you had nobody to go with? | Yes, more than once / Yes, once / No / Not sure | Aim for about 75% "Yes". Keep some "No" so we hear the other side. |
| S5 | Which of these have you done in the last 3 months? (tick all) | Played a team sport / Gone to a cafe or restaurant with friends / Gone on a hike or day trip / Gone to a class, club or meetup / Played board or video games with others / None of these | Use for spread. |
| S6 | Have you ever organised a group activity yourself (posted in a group, booked a court, gathered people)? | Often / Sometimes / Never | "Often" counts toward organisers. |
| S7 | What phone do you mainly use? | iPhone / Android, roughly LKR 75,000 or more / Android, under LKR 75,000 / Not sure | For device spread only. The LKR 75,000 split is an **Assumption** for a rough mid/low tier. Refine after Phase 1 item 8. |
| S8 | Which language are you most comfortable in for a 40-minute conversation? | English / Sinhala / Tamil / Any | Book a matching interviewer. |
| S9 | Gender | Woman / Man / Non-binary / Prefer not to say | For spread only. |
| S10 | Do you or anyone close to you work on a social, events or sports app? | Yes / No | **Yes: thank and end.** |
| S11 | Are you free for a 40-minute video call or coffee in the next 2 weeks? | Yes / No | No: thank and end. |
| S12 | Best way to reach you to book a time | WhatsApp number or email | Stored in the tracker only. |

### 4.2 Venue screener (1 minute, can be asked in person)

| # | Question | Rule |
|---|---|---|
| V1 | What kind of place is this? (cafe / court / games / gym or studio / other) | For quotas |
| V2 | Roughly how long has it been open? | Under 6 months: OK, but note it |
| V3 | Is it independent or part of a group with more than one location? | For spread |
| V4 | Do you ever have quiet times you wish were busier? | Note the answer. Don't exclude on "No". |
| V5 | Who decides what the place spends on marketing or promotions? | **Interview that person.** If they're not available, book a time with them. |
| V6 | Would you give us 25 minutes, at a quiet time, to talk about how you get customers? There's nothing to buy. | |

---

## 5. Recruitment messages

**Tone:** plain, short, no hype, no emojis in anything that represents the product. Personal channels can follow normal chat habits. Say who you are, what it is, how long it takes, what they get, and that it isn't a sales pitch.

**Incentive (Assumption):** a **LKR 1,500 voucher** (≈ USD 4.50 at LKR 331 per USD) for a player interview, e.g. a coffee-chain or ride-hailing voucher. Venues get the summary report (§8 close) instead of cash, which is more useful to them and keeps the relationship clean. Test whether LKR 1,500 is enough: if fewer than 1 in 5 qualified people book in week 1, raise it.

### 5.1 WhatsApp or Facebook group post (players)

> Hi all. We're three people in Colombo building a small app that helps people find others for group plans (futsal, coffee, a hike, a quiz night). Before we build more, we want to hear how people here actually find company for things.
>
> Looking for people aged 18+ in or around Colombo for a 40-minute chat (call or coffee, English, Sinhala or Tamil). You'll get a LKR 1,500 voucher as thanks. It's not a sales pitch and you don't need to sign up for anything.
>
> 2-minute form to see if it's a fit: [screener link]
> Questions: trimegos@gmail.com

Always ask the group admin before posting. Many groups ban promotion.

### 5.2 Direct message (Instagram, LinkedIn, someone a friend suggested)

> Hi [name], [mutual / where you found them] suggested you might be up for this. We're researching how people in Colombo find others for activities like [their thing: futsal / hiking / board games]. Would you be open to a 40-minute chat in the next two weeks? There's a LKR 1,500 voucher to say thanks, and nothing to buy. If yes, here's a 2-minute form: [link]. If not, no worries at all.

Never cold-message more than once. No reply means no.

### 5.3 Women-only groups

Same as 5.1, plus:

> The chat can be with a woman from our team, with your camera off if you prefer, or over coffee somewhere public. Bring a friend if you like.

Only post where a woman on the team (or a trusted admin) is a member and has asked the admin first.

### 5.4 Reddit (r/srilanka, r/colombo)

> **Research request: how do you find people for activities in Colombo?** We're a three-person team in Colombo looking into how people here find company for sports, outings and hobbies (and what goes wrong). If you're 18+ and around Colombo, we'd love a 40-minute chat. LKR 1,500 voucher as thanks. Screener: [link]. Mods, happy to remove this if it breaks the rules.

Read each subreddit's rules on surveys and self-promotion before posting.

### 5.5 Campus

Ask a student society (sports, outdoors, debating, gaming) to share 5.1 in their group. Offer to share the anonymous findings with the society afterwards.

### 5.6 Survey share text (any channel)

> 3-minute anonymous survey: how do you find people to do things with in Colombo? We're a small local team trying to understand this before we build more. [survey link]

### 5.7 Venue walk-in (say it, don't read it)

> Hi, I'm [name]. We're a small team in Colombo researching how places like yours get groups of customers in. Could I have 25 minutes with whoever handles marketing, at a quiet time this week? There's nothing to buy. Afterwards we'll send you a short summary of what other venues told us.

### 5.8 Venue follow-up message (WhatsApp or email)

> Hi [name], thanks for talking to us at [venue] today. As mentioned, we'd love 25 minutes with you at a quiet time, about how you get customers and groups in. Would [two time options] work? No pitch, and we'll share a short summary of what other venues told us.

### 5.9 Booking confirmation and reminder

> Thanks, [name]. Booked: [day, date, time, place or call link], about 40 minutes. We'll ask how you find people to do things with, and there are no right answers. Before we start we'll ask your OK to take notes (and, only if you agree, to record). Reply here if you need to move it.

Send a reminder 24 hours before and 2 hours before.

---

## 6. Consent and data handling

### 6.1 Why it matters here

Sri Lanka's **Personal Data Protection Act, No. 9 of 2022** is overseen by the Data Protection Authority of Sri Lanka (Fact: [dpa.gov.lk](https://dpa.gov.lk/), accessed 2026-10-30). A third-party report says key compliance provisions take effect on **1 January 2027** (Fact as reported: [Daily FT](https://www.ft.lk/front-page/Data-protection-compliance-regime-takes-effect-on-1-Jan-2027/44-795776), accessed 2026-10-30; check the Gazette before relying on the date). This research may finish before then. Run it as if the Act applies anyway, because the same people may become users, and `11-legal-compliance.md` will need a clean record. **This section is not legal advice.** Flag it for the lawyer review in `11-legal-compliance.md`.

### 6.2 Verbal consent script (read before every interview)

> Before we start: I'm [name] from Trimegos, a small team in Colombo. [Note-taker's name] is taking notes.
>
> We're asking how people find company for activities. There are no right or wrong answers, and you won't hurt our feelings. Criticism helps us most.
>
> We'll take typed notes. With your OK, we'd also like to audio-record so we don't misquote you. Only the three of us hear the recording, and we delete it within 30 days. Is recording OK, or would you prefer notes only?
>
> We won't use your name in anything we write. If we quote you, it'll be as "a participant". You can skip any question, stop at any time, or ask us later to delete your notes by writing to trimegos@gmail.com. You'll still get the voucher if you stop early.
>
> Is that all OK?

Write in the notes: **date, time, "consent: notes yes/no, recording yes/no"**. If the answer to recording is no, don't record. Don't ask twice.

### 6.3 Written version (for the survey and for in-person participants who want it on paper)

> **About this research.** Trimegos (trimegos@gmail.com) is researching how people in Sri Lanka find others for group activities. Taking part is voluntary. You can skip any question and stop at any time.
>
> **What we collect.** Your answers. For interviews, typed notes and (only if you agree) an audio recording. For the survey, we don't collect your name. Contact details are only collected if you choose to leave them for a follow-up.
>
> **How we use it.** Only to improve the product. We won't sell it or use it for advertising. Quotes are anonymised.
>
> **How long we keep it.** Recordings: deleted within 30 days. Notes and survey answers: kept without names for up to 12 months, then deleted. Contact details: deleted once the follow-up is done or within 3 months.
>
> **Your rights.** Email trimegos@gmail.com to see, correct or delete what we hold about you.

### 6.4 Team rules

1. Names and contact details live **only** in the private tracker (§12). Everything else uses IDs (P01 to P20, V01 to V08).
2. Recordings are kept in one private folder that only the three of you can access, and deleted by day 30. Log the deletion date in the tracker.
3. Don't record or photograph venues, staff or customers without asking.
4. Don't share raw notes outside the team. Share only the synthesis.
5. If a participant discloses harm (harassment, assault, a threat), stop the research questions. Thank them, point them to the emergency numbers on `/safety` (Police 119, Suwa Seriya ambulance 1990), and don't probe further. Don't put the details on the synthesis board.

---

## 7. Player interview script (45 minutes)

**Rules for the interviewer.** These follow standard customer-interview practice:
- Ask about the **past**, not the future. "Tell me about the last time…" beats "Would you…".
- Don't pitch, explain or defend the product until section G.
- Let silences run. Count to five before you fill one.
- Get **specific stories**, with a date, a place and who was there.
- Ask "Why?" and "What happened next?" more than anything else.
- Never say "Trimegos is a…" before section G. If they ask what you're building, say "We'll show you at the end."
- If they mention dating, sex, family or safety, follow it gently. That's the gold.

**Language note.** Sinhala and Tamil interviews should use the same structure. Translate the questions into natural, spoken language rather than word for word, and keep the probes. Note the language used in the tracker. Mixing in English (Singlish or Tanglish) is fine.

### A. Warm-up (3 min)
1. What do you do most weekdays? Where are you based?
2. What does a free Saturday usually look like for you?

### B. Wanting company (8 min)
3. Think of the last time you wanted to do something (a sport, an outing, a hobby) but needed other people for it. What was it? When was that?
   - *Probe:* How many people did you need? Who did you ask first?
4. What happened in the end? Did it happen?
   - *If it didn't:* What did you do instead? How did that feel?
   - *If it did:* How long did it take to organise? Who did the work?
5. How often does that happen to you? Once a week, once a month, rarely?
   - *Probe for a number. Don't suggest one.*
6. Is there something you'd like to start doing but haven't, because of who you'd do it with?

### C. How they find people today (8 min)
7. Walk me through how you usually get a group together for something.
   - *Probe each channel they mention:* WhatsApp groups, Facebook groups, Instagram, Reddit, clubs, the office, campus, family, apps.
8. Have you ever joined a group or plan with people you didn't know before? Tell me about that time.
   - *Probe:* How did you find it? How did you decide it was OK to go? Who did you tell?
9. What's the most annoying part of organising things with others?
   - *Probe:* flaking, too many messages, nobody commits, costs, transport, timing.
10. Have you used any app or website to find people for activities? Which one? What happened?
    - *If yes:* Do you still use it? Why or why not?

### D. Safety, family and the dating question (10 min)

Go gently here, and don't lead. Use their words.

11. Imagine a group of four people you've never met, meeting at a cafe in Colombo to play board games. What goes through your mind?
    - *Probe:* What would make you go? What would make you not go?
12. Does it matter to you who else is in the group? In what way?
    - *Probe neutrally:* age, gender, number of people, whether anyone knows each other.
13. Would anyone in your life have an opinion about you doing that, like parents, a partner or friends? What would they say?
    - *Probe:* Would you tell them? Would it change if the group were all women, or all men?
14. Some apps for meeting people end up being used for dating. Has that happened to you, or to someone you know, on an app that wasn't meant for it? What happened?
15. If an app said it was for group plans, not dating, what would make you believe it?
16. What would make you trust a stranger in a group like that?
    - *Probe without listing options first.* Afterwards, if they haven't mentioned them, ask about a photo, a verified badge, reviews from others, mutual friends, the place being public, the group being three or more.

### E. Hosting, commitment and money (6 min)
17. Have you ever been the one who organised and then nobody turned up, or people dropped out? Tell me about it.
18. If you could post "Futsal, Friday 7pm, need 6 more" and strangers could join, would you? What would worry you?
19. When a plan costs money (court fees, tickets), how is it usually split? Has anyone ever not paid?
20. Some apps take a small refundable deposit when you join, which you get back when you show up. How would you feel about that, say LKR 300 to 500?
    - *Probe:* Would it make you more likely to go, or less likely to join?

### F. Phone, data and language (3 min)
21. What phone do you use? Do you ever run out of data or storage?
22. When someone sends you a link to something new, do you prefer to open it in the browser or download an app? Why?
23. Which language do you prefer apps to be in? Does it matter?

### G. Concept reaction (5 min)

Now show the product. Use screenshots, not the live site, so nobody's personal data appears. Show [`01-landing-375.png`](screens/01-landing-375.png), then [`21-feed-375.png`](screens/21-feed-375.png), then [`24-gig-preview-open-375.png`](screens/24-gig-preview-open-375.png) on your phone.

24. Look at this first page for 10 seconds. What do you think this is for? Who is it for?
    - *Note exactly what they say. Don't correct them.*
25. *(On the landing image.)* What do you see in this picture? What does it make you think the app is about?
26. *(On the feed.)* What would you do next on this screen? What's missing?
27. *(On the gig page.)* Would you join this? What would you want to know first?
28. Is there anything here that would stop you from signing up?

### H. Close (2 min)
29. Is there anything I should have asked but didn't?
30. Who else should we talk to? (Ask for an introduction, not a phone number.)
31. Would you like us to tell you when we try this with real groups? (Collect permission only. Store it in the tracker.)

> Thank them, confirm the voucher and how it'll arrive, and remind them how to ask us to delete their notes.

---

## 8. Venue interview script (30 minutes)

**Rules.**
- Talk to the decision-maker (screener V5).
- Visit at their quiet time.
- Buy something if it's a cafe.
- Don't sell. If they ask to sign up, say "Not yet. We're learning first, and we'll come back with something concrete."

### A. Warm-up (3 min)
1. How long have you been running this place? What kind of customers do you get most?

### B. Busy and quiet (6 min)
2. When are you busiest? When are you quietest?
   - *Probe:* days, times, seasons. Monsoon, Poya days, exam season, holidays.
3. What does a quiet slot cost you? What do you do about it today?
4. Do you get groups (3 or more people together)? How do they usually find you?
   - *Probe:* Do groups spend more or less per head than people on their own?

### C. Marketing today (6 min)
5. What did you do in the last 3 months to bring people in? (Ads, Instagram, offers, delivery apps, events, word of mouth.)
6. Roughly how much do you spend on that in a typical month?
   - *Ask for a range if they hesitate:* under LKR 10,000 / 10,000–50,000 / 50,000+.
7. How do you know if it worked?
   - *Probe:* Do you ever know a customer came because of an ad? How?
8. Has anyone tried to sell you a marketing or booking platform before? What happened?

### D. The crew idea (6 min)

Now explain in two sentences: "We help people form groups of three or more for activities in public places, like a board-game night or a futsal match. A group could choose your venue and arrive together."

9. What would make a group like that good for you, or bad?
   - *Probe:* noise, table space, minimum spend, court booking, behaviour.
10. If those groups showed a short code and your staff typed it into a simple web page on the counter phone (no login, one box, one button), would they do that? What would get in the way?
11. Would you offer something to groups that came through the app, like a discount, a free item or a reserved table? What would be realistic?

### E. Value and price (6 min)

Ask these in order, and don't anchor before question 13.

12. If we could show you each month exactly how many groups and people we sent you, what would that be worth to you?
13. At what monthly price would this be **so cheap** you'd doubt it works?
14. At what price would it be **a bargain**, a good deal?
15. At what price would it start to feel **expensive**, but you'd still consider it?
16. At what price would it be **too expensive** to consider at all?
    - *(Questions 13 to 16 are a simplified Van Westendorp price-sensitivity check. Record exact LKR amounts.)*
17. Only now: we've been thinking of two levels, around LKR 5,000 a month (listing, perk, report) and around LKR 15,000 a month (featured, plus a group event we run at your place each week). What's your honest reaction?
18. How would you prefer to pay? (Card, bank transfer, LankaQR, cash, monthly or per group.)
19. Who else would need to agree before you paid for something like this?

### F. Close (3 min)
20. What would have to be true for you to try this for a month?
21. Is there another venue owner we should talk to?
22. Can we send you the summary of what other venues told us? (Write down how they want it: WhatsApp or email.)

> Thank them. Send the summary within 2 weeks of the last venue interview, with no names of other venues in it.

---

## 9. Survey (Google Forms-ready)

**Setup in Google Forms:**
- Settings → Responses: **don't collect email addresses**. Untick "Limit to 1 response" (it forces sign-in and kills completion on phones).
- Put the consent text from §6.3 in the form description.
- Use 3 sections:
  - Section 1: Q1 to Q3, the eligibility questions.
  - Section 2: Q4 to Q14.
  - Section 3: Q15 and the optional follow-up.
- On Q1, use "Go to section based on answer": "Under 18" goes to an end screen that says "Thanks, this survey is for people aged 18 and over." That's how to end the survey for them.
- Keep it under 4 minutes. Test it on a low-end Android phone before sharing.
- Title: **How do you find people to do things with?** It's 15 questions.

| # | Question (exact wording) | Type | Options | Required |
|---|---|---|---|---|
| Q1 | How old are you? | Multiple choice | Under 18 / 18–24 / 25–29 / 30–34 / 35–44 / 45 or older | Yes |
| Q2 | Where do you spend most of your week? | Multiple choice | Colombo city (Colombo 1–15) / Elsewhere in Colombo District / Gampaha District / Kalutara District / Elsewhere in Sri Lanka / Outside Sri Lanka | Yes |
| Q3 | Which best describes you? | Multiple choice | Student / Working full-time / Working part-time or freelance / Not working right now / Other | Yes |
| Q4 | In the last 3 months, how many times did you want to do something (sport, outing, hobby) but didn't, because you had nobody to go with? | Multiple choice | Never / Once / 2–3 times / 4–6 times / More than 6 times | Yes |
| Q5 | Which of these would you do more often if it were easier to find people? (tick all that apply) | Checkboxes | Futsal or football / Badminton / Cricket / Running / Gym or fitness class / Yoga / Hiking or day trips / Beach / Coffee or brunch / Board games / Video games / Quiz nights / Karaoke / Movies / Study or co-working / Language exchange / Book club / Art or craft / Other… | Yes |
| Q6 | How do you usually find people for these things today? (tick all that apply) | Checkboxes | Friends I already have / Work or campus colleagues / WhatsApp groups / Facebook groups / Instagram / Reddit / Clubs or societies / An app or website / Family / I usually don't find anyone / Other… | Yes |
| Q7 | How well does that work for you? | Linear scale 1–5 | 1 = Not at all, 5 = Very well | Yes |
| Q8 | Would you ever post a plan yourself and let people you don't know join? | Multiple choice | Yes, I'd host / Maybe, depending on the group / No, I'd only join others' plans / No, I wouldn't do either | Yes |
| Q9 | Which of these would make you comfortable joining a group of people you haven't met? (pick up to 3) | Checkboxes (validation: at most 3) | Meeting in a public place / At least 3 people in the group / Photos of people checked by the app / People verified as real by video / Reviews from people who went before / A friend coming with me / Women-only or men-only groups / Seeing the host's profile / Nothing, I wouldn't join / Other… | Yes |
| Q10 | How comfortable would you be joining a mixed group (women and men) of people you haven't met, in a public place? | Linear scale 1–5 | 1 = Not at all, 5 = Completely | Yes |
| Q11 | Would anyone close to you (parents, partner) object to you doing that? | Multiple choice | Yes, strongly / Yes, a little / No / I wouldn't tell them / Prefer not to say | Yes |
| Q12 | If an app helped you find people for group activities, how worried would you be that people use it for dating? | Linear scale 1–5 | 1 = Not worried, 5 = Very worried | Yes |
| Q13 | If a friend sent you a link to an app like this, how would you prefer to use it? | Multiple choice | Straight away in my browser / Install from the Play Store or App Store / Either is fine / I wouldn't try it | Yes |
| Q14 | Which language would you prefer to use it in? | Multiple choice | English / Sinhala / Tamil / Any of these | Yes |
| Q15 | Some apps take a small refundable deposit (say LKR 300) when you join a plan, returned when you show up. How would that affect you? | Multiple choice | I'd be more likely to join / No difference / I'd be less likely to join / I wouldn't join at all | Yes |
| Optional | Gender (helps us check we heard from everyone) | Multiple choice | Woman / Man / Non-binary / Prefer not to say | No |
| Optional | Can we contact you for a 40-minute chat (LKR 1,500 voucher)? If yes, leave a WhatsApp number or email. | Short answer | | No |

**Rules for using survey results:**
- Report counts and percentages with the base: "34 of 112 respondents (30%)".
- Never extrapolate to "Colombo" or "Sri Lankans" (§2).
- Segment by Q1, Q2 and the optional gender question only when a segment has 30 or more responses.
- Export the follow-up contacts to the tracker, then delete that column from the response sheet.

**Translation:** run English first. If fewer than 10% of respondents come from Sinhala- or Tamil-first channels, publish Sinhala and Tamil versions in week 2. Have a native speaker check each translation (feeds `09-localization.md`).

---

## 10. Note-taking template

Copy this once per interview. File it as `P07-2026-11-12.md` or `V03-2026-11-14.md` in the team's private notes folder, not in this repo.

```
ID: P__ / V__              Date:            Interviewer:          Note-taker:
Segment:                    Language:         Mode: call / in person (place type, not address)
Consent: notes Y/N   recording Y/N   (recording delete-by date: ______)

TOP 3 TAKEAWAYS (write within 15 minutes of finishing)
1.
2.
3.

STORIES (one block per concrete past event)
- When / where / who:
- What they wanted:
- What happened:
- How they felt (their words):

QUOTES (word for word, with a timestamp if recorded)
- "…"   [hypothesis tag, e.g. H4]

HYPOTHESIS SIGNALS
H1 ___  H2 ___  H3 ___  H4 ___  H5 ___  H6 ___  H7 ___  H8 ___  H9 ___  H13 ___
(+ supports, − contradicts, ? unclear, blank = not covered)

VENUES ONLY
Quiet slots:                         Current monthly marketing spend (range):
Price points (LKR): too cheap ___  bargain ___  getting expensive ___  too expensive ___
Reaction to 5,000 / 15,000:          Payment preference:       Decision-maker:
H10 ___  H11 ___  H12 ___

CONCEPT REACTION (players, section G)
What they thought it was for:
What they saw in the hero image:
Would join the gig? Why:
Blockers:

SURPRISES / THINGS TO ASK NEXT TIME
-
```

---

## 11. Synthesis template

Do this together, in a half-day session, once interviews are done. Use a shared board (Miro, FigJam or a wall of sticky notes). Use **participant IDs only**.

### 11.1 Steps

1. **Unpack (60 min).** Each person reads their notes aloud. Write one observation per sticky: a fact, a behaviour or a quote, tagged with the participant ID. Aim for 15 to 30 stickies per interview.
2. **Cluster (45 min).** Group stickies silently by similarity. Don't pre-label. Name each cluster with a sentence a participant could have said, e.g. "I'd go if I knew one other person there", not "Trust".
3. **Count (20 min).** For each cluster, count **distinct participants**, not stickies. Write "7 of 18 players" on it.
4. **Score the hypotheses (30 min).** Fill in 11.2.
5. **Write the insights (30 min).** Fill in 11.3. An insight is a finding plus why it matters, backed by at least 3 participants (or flagged as weak).
6. **Decide (30 min).** Fill in 11.4 and feed it into `43-decisions.md`.

### 11.2 Hypothesis scorecard

| # | Hypothesis | Players: supports / contradicts / unclear | Venues | Survey evidence (n, %) | Verdict | Confidence |
|---|---|---|---|---|---|---|
| H1 | | __ / __ / __ | | Q4: | Supported / Mixed / Refuted / Not tested | H / M / L |
| H2 | | | | Q6, Q7: | | |
| H3 | | | | Q9, Q10: | | |
| H4 | | | | Q10, Q11: | | |
| H5 | | | | Q12: | | |
| H6 | | | | Q8: | | |
| H7 | | | | Q9: | | |
| H8 | | | | Q13: | | |
| H9 | | | | Q14: | | |
| H10 | | | __ / __ / __ | | | |
| H11 | | | __ / __ / __ | | | |
| H12 | | | __ / __ / __ | | | |
| H13 | | | | Q15: | | |

**Verdict rules:**
- **Supported**: at least two thirds of the people who spoke to it support it, with no strong counter-story.
- **Refuted**: at least two thirds contradict it.
- **Mixed**: anything in between. Then look for which segment splits.
- **Not tested**: fewer than 5 people spoke to it.

### 11.3 Insight cards

```
INSIGHT:     (one sentence, in plain words)
EVIDENCE:    P03, P07, P11, P15 (+ survey Q__: __ of __)
BEST QUOTE:  "…" (P__)
SEGMENT:     everyone / students / women / newcomers / venues / …
SO WHAT:     what this changes in product, design, marketing or sales
CONFIDENCE:  H / M / L, and why
```

### 11.4 Venue pricing summary

| ID | Type | Too cheap | Bargain | Getting expensive | Too expensive | Reaction to 5k / 15k | Would trial? |
|---|---|---|---|---|---|---|---|
| V01 | | LKR | LKR | LKR | LKR | | Y / N / Maybe |

Read the **range between the median "bargain" and the median "getting expensive"** answers as the acceptable band. With 5 to 8 venues this is directional only (**Confidence: low**). Say so wherever it's quoted.

### 11.5 Decision log (feeds `43-decisions.md`)

| Decision | Options | What the research says | Recommendation | Evidence IDs |
|---|---|---|---|---|
| e.g. Lead wedge activity | Futsal / board games / coffee | | | |
| e.g. Women-only gigs prominence | Keep / promote / remove | | | |
| e.g. Hero imagery | Keep / recrop / replace | | | |
| e.g. Venue price points | 5k / 15k / other | | | |
| e.g. Deposit for no-shows | Now / later / never | | | |

### 11.6 Rules for writing up

- Never write a statistic from interviews as if it were a survey result. Say "6 of 18 people we interviewed", never "33% of users".
- Quotes are anonymised and word for word. Translated quotes are marked "(translated from Sinhala/Tamil)".
- Every insight that goes into a Phase 1 or Phase 4 document cites its evidence IDs, so anyone can trace it back to notes.
- Keep surprising minority views. A single woman saying "my brother would never let me" is a signal worth checking with more people, not noise.

---

## 12. Participant tracker

One private spreadsheet, shared only between the three of you. **This is the only place names and contact details are stored.**

| Column | Notes |
|---|---|
| ID | P01–P20, V01–V08, S-prefixed for survey follow-ups |
| Name | Delete after the voucher is sent and follow-up is done |
| Contact (WhatsApp / email) | Same as above |
| Source | Which channel recruited them (§5 message number) |
| Segment | From §3 |
| Screener answers | S1–S11 or V1–V5 |
| Age band, gender, area lived, area worked | Area as district or Colombo number, not street |
| Phone tier, language | |
| Booked for / status | Booked / done / no-show / cancelled |
| Interviewer, note-taker | |
| Consent: notes / recording | |
| Recording delete-by date, deleted on | Must be within 30 days |
| Voucher sent (date) | |
| Follow-up permission | Y / N |

Track the **recruitment funnel** by channel as you go (posted → screener completed → qualified → booked → done). This is free data on which channels reach which personas, and it feeds `31-channels.md`.

---

## Key findings

This document is an instrument, not a report, so there are no research findings yet. What it establishes:

1. There are **13 testable assumptions** (H1 to H13) under the current product. None is backed by primary evidence today. That includes venue willingness to pay, which the original spec itself says is unresearched (`docs/08`).
2. The most sensitive questions are family norms, mixed-gender groups and dating perception (H4, H5). They need a safe, optional, woman-led path in recruiting and interviewing (§5.3, §7 D).
3. Phase 0's imagery concern (the hero art reading as a couple) is tested directly in §7 G question 25 rather than decided by opinion.
4. A **n ≈ 100** survey distinguishes majority from minority views (about ±10 points, Estimate) but can't represent Colombo. Report it with its base every time.

## Decisions this informs

- Lead persona and wedge activities (`02-personas-jtbd.md`, `40-strategy.md`).
- Whether women-only gigs, audience filters and verification are central or secondary (`06-trust-safety.md`, `15-feature-opportunities.md`).
- Positioning language and hero imagery (`05-positioning.md`, `30-brand-messaging.md`).
- PWA vs native timing and English-first (`08-platform.md`, `09-localization.md`).
- Venue tiers and prices, perk design, redemption flow (`10-monetization.md`, `34-venue-sales-kit.md`).
- Whether to build refundable deposits (`10-monetization.md`, `15-feature-opportunities.md`).
- Starting Colombo neighbourhoods (`07-liquidity-cold-start.md`, `13-expansion.md`), from where participants live and work.

## Open questions

1. **Incentive level:** is LKR 1,500 enough to book young professionals at short notice? Check the week-1 booking rate (§5).
2. **Interview language:** can someone on the team run interviews in Sinhala and Tamil, or do you need a paid interpreter? That affects budget and the H9 result.
3. **Women-led sessions:** is there a woman on the team, or a trusted collaborator, who can run the women-only recruiting and interviews (§5.3)?
4. **Legal check:** should the consent text (§6) be reviewed by a Sri Lankan lawyer before use, or is that acceptable to do afterwards as part of `11-legal-compliance.md`?
5. **Survey channels:** which WhatsApp, Facebook and campus groups can the team post in with an admin's blessing? The answer shapes who the survey reaches.

## Confidence

**High** that the instruments cover the assumptions the product depends on, and that the method suits a three-person team: story-based interviews, a short survey, and counted synthesis.
**Medium** on the logistics numbers: incentive, timeline and survey size are reasonable starting points, labelled as Assumptions, and should be adjusted after week 1.
**Low**, by design, for anything the venue sample alone will say about pricing (5 to 8 venues). Treat it as a starting range for `10-monetization.md`, not a price.
