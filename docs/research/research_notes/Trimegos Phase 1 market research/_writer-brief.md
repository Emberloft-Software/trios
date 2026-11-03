# Writer brief: Phase 1 docs 01 to 07 (shared by all seven writers)

Today is 2026-10-31. You are writing one Phase 1 document of the Trimegos research programme. Seven writers work in parallel, one per document, from the same notes. This brief keeps them consistent.

## Read first (all of it)

1. `D:\trios\CLAUDE.md` (what the product is and its rules).
2. `D:\trios\docs\research\PROMPT.md`, especially "Your role", "Context", "Research standards" and the Phase 1 item for your document. Your document's scope is exactly that item.
3. `D:\trios\docs\research\00-current-state.md` (Phase 0 audit: what exists, what's broken). Cite it as `00-current-state.md §x`.
4. `D:\trios\docs\research\35-field-kits.md` (interview scripts, survey Q1 to Q15, hypotheses H1 to H13). Cite as `35-field-kits.md §x` / `H4` / `Q10`.
5. Every notes file in `D:\trios\docs\research\research_notes\Trimegos Phase 1 market research\` (8 files: demand_and_current_channels, personas_and_venues, market_size_inputs, competitors_global, competitors_local_indirect, trust_safety_sri_lanka, liquidity_cold_start, positioning_category). Read all eight, not only the obvious one: facts for your document are scattered.
6. The relevant files in `D:\trios\docs\` (the old Trio spec; treat as hypotheses). Skim `01-product-spec.md`; read in full any file directly relevant to your document (for example `06-trust-and-safety.md` for doc 06, `08-monetization.md` and `10-build-plan.md` for docs 03 and 07).
7. For doc 06 and 07, also read the code that implements the controls you assess (`supabase/migrations/`, `app/(app)/gigs/[id]/`, `lib/geo.ts`, `lib/copy/`) so your control mapping is accurate. Cite file paths.

## Research standards (non-negotiable, from PROMPT.md)

- Cite every fact with its URL and access date (2026-10-31 unless the notes say otherwise). Carry the citation from the notes; don't strip it.
- Label claims **Fact** (sourced), **Estimate** (show the maths inline) or **Assumption** (state how we'd test it, ideally pointing to a `35-field-kits.md` question or a new one).
- Never invent statistics, quotes, reviews, member counts, prices or user data. If the notes don't have it, say it's unknown and say how to collect it. You may run a few targeted web searches to fill a critical gap or verify a number, but don't restart the research.
- Facts the notes mark "(snippet)", "[snippet]" or "search summary" must keep a visible marker such as "(from search summary, verify before quoting publicly)".
- Prices in LKR with date; USD alongside at **LKR 331 per USD** (FRED DEXSLUS, 16 Oct 2026, https://alfred.stlouisfed.org/series?seid=DEXSLUS, accessed 2026-10-30), as in `35-field-kits.md`.
- End with exactly these sections: **Key findings**, **Decisions this informs**, **Open questions**, **Confidence** (high/med/low, per area, with why).
- Where something can only be learned from real people, don't guess: point to the existing `35-field-kits.md` question, or write a short "Proposed additions to 35-field-kits.md" subsection with exact wording.
- Gaps should become **concrete feature proposals** (name, what it does, which finding it answers). Mark them "→ candidate for `15-feature-opportunities.md`". Don't score them; doc 15 does that.
- The product direction itself is open. If evidence points somewhere other than the current product, say so plainly.

## Canonical numbers (use these so the seven docs agree)

| Item | Value | Source / note |
|---|---|---|
| Sri Lanka population | 21,781,800 | Census 2024 final (DCS). Use the census, not DataReportal's UN base of 23.3M |
| Sri Lanka 18 to 34 | ≈ 5.11M (Estimate) | market_size_inputs: 15-19 band split evenly |
| Colombo District population | 2,375,415 | Census 2024 |
| Colombo District 18 to 34 | ≈ 599k (Estimate) | market_size_inputs |
| Western Province 18 to 34 | ≈ 1.48M (Estimate) | market_size_inputs |
| Kandy / Galle districts 18 to 34 | ≈ 329k / ≈ 249k (Estimate) | market_size_inputs |
| Colombo city core (Colombo + Thimbirigasyaya DS divisions) | 509k people, ≈ 128k aged 18 to 34 (Estimate) | market_size_inputs proxy; CMC itself has no official age data |
| Internet use by age (past year) | 15-19 79.2%, 20-24 88.4%, 25-29 84.9%, 30-34 79.6%; urban 67.1% | DCS Computer Literacy 2024 |
| Internet users / social reach | 13.9M internet users; Facebook 9.0M, YouTube 8.82M, TikTok 6.79M, Instagram 2.25M, LinkedIn 2.9M ad reach | DataReportal Digital 2026 |
| Android share | ≈ 80 to 85% (StatCounter, varies month to month in 2026) | personas_and_venues |
| Exchange rate | LKR 331 / USD | above |
| Free-event no-show | median 28%; small free events (10-49) ≈ 37%; paid ≈ 17% | PheedLoop Apr 2026, liquidity / demand notes |

## Known conflicts in the notes, resolved

- **Playo in Sri Lanka.** competitors_global says Playo began operating in Colombo in April 2026 with plans for Kandy, Jaffna, Galle, Negombo; market_size_inputs says Playo lists 5 Colombo venues; competitors_local_indirect found "no sign" on Playo's site. Treat Playo as **present in Colombo since April 2026** (cite the global notes' sources), note the small venue count, and note the local notes couldn't confirm it from Playo's own site.
- **Local competitors to always include:** Volt (volt.lk, futsal "post a game, fill the last slots", launching 2026), mithuru.lk (announced Sri Lankan friend-finding app with group Hangouts, sports partners, campus/work circles, Sinhala/Tamil/English, and a dating mode; not launched), Play.Book (5K+ installs, the only local booking app with traction).
- **Timeleft scale:** cities reported as 196 (its locations page) and "200 to 220" after cutting back from 320+. Say "about 200 cities" and cite both.
- **Online Safety Act 2024:** the President said on 26 Jun 2026 it would not be implemented as is and would be replaced; ICNL says as of Sep 2026 it remains in force with no replacement tabled; sources conflict on whether the 2024 amendment was enacted. State it as unresolved and lawyer-flagged.
- **PDPA:** amended by Act No. 22 of 2025; core provisions in force **1 January 2027** per Gazette (verify the Gazette).
- **In-migration:** use the official 2024 Census press note (Gampaha +357,528, Colombo +191,524 net lifetime).
- **Reddit** was blocked to the research tools. Say so; the team must search r/srilanka and r/colombo by hand (give exact search strings).
- **Facebook group member counts** couldn't be read. Say so; list what to check manually.

## Style

- Written for the 3-person Trimegos team. Plain English, short sentences, tables where they help. Match the tone and layout of `00-current-state.md` (title line `# 0N · Title`, a one-line phase note, then numbered sections).
- No em dashes. No emojis.
- Be blunt and opinionated where evidence supports it; the team asked for recommendations, not surveys.
- Target length: roughly 2,500 to 5,000 words. Dense beats long.
- Write only your one document. Don't edit any other file.
