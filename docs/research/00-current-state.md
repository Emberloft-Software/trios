# 00 · Current-state audit

**Phase 0 of the research programme** (`docs/research/PROMPT.md`). Audited on 30 October 2026.

| | |
|---|---|
| Code audited | `main` at `4899da2` ("Merge origin/main: Trimegos rename and official email"), which includes `0a5b41a` "updated UI" (the retro "desktop windows" redesign, Google sign-in, Add spots). |
| Live site | `https://www.trimegos.com`, confirmed to be running this code: it serves `/photos/rooftop-sunset.webp`, the Space Mono accent and the Google button, which only exist from `0a5b41a` onward. |
| Screenshots | 52 PNGs in [`screens/`](screens/), every screen I could reach at 375px and 1280px, full page, taken from production with headless Chrome over the DevTools protocol. |
| Test account | Created for this audit with the owner's approval: `trimegos+audit6psze@gmail.com`, handle `@audit_6psze`, non-binary, born 1998, acceptable-use agreement accepted. It is the **11th test account** and belongs on the Phase 5 deletion list. Its password is not in the repo. |
| Not touched | No gigs joined or posted, no photos uploaded, no admin access, no database writes beyond the sign-up itself and the acceptable-use acceptance. |

Claim labels used below: **Fact** (seen in code, on screen or in a cited source), **Estimate** (maths shown), **Assumption** (with how to test it). File references are repo-relative.

---

## 1. Summary

The product is far more complete than a typical pre-launch app. Every core loop is built and enforced in Postgres: post, join, held seats, private gigs, chat unlock, crew vote, check-in, friends, verification, moderation, push and admin with two-factor authentication. The gaps are not missing features. They are:

1. **Nobody can see the product working.** The feed shows 2 upcoming gigs to the test account (Fact, [21-feed-375](screens/21-feed-375.png)). Every core screen is either empty or locked until a gig fills, so a new visitor's first session is a cold start.
2. **The visual identity fights the positioning.** On desktop, the hero art crops to two people on a rooftop at sunset with drinks ([01-landing-1280](screens/01-landing-1280.png)). That reads as a date, which is the one thing the brand says it isn't. The feed's largest image is a cocktail in a bar ([21-feed-375](screens/21-feed-375.png)).
3. **The new retro style has no hierarchy.** Every card, chip, input, badge and button gets the same 2px plum outline and hard shadow, so the primary action never stands out. The mono accent font is on buttons, nav, badges and even user-written text.
4. **Accessibility misses on the main colour.** White on coral, the primary button, is 3.58:1. Coral-600 links and errors are 4.22:1 and the active tab label is 3.38:1. All fail WCAG AA for normal text (Fact, computed, §6.4).
5. **There is zero instrumentation.** There are no analytics, no error monitoring, no tests, no CI and no lint config (Fact, §5.8). The team can't currently measure fill rate, show-up rate or crashes.
6. **Some promises outrun the plumbing.** The Privacy Policy promises verification videos are deleted 7 days after review, but the purge only runs when an admin reviews something. Unapproved and old profile photos sit in a public bucket. Google sign-in isn't disclosed in the Privacy Policy (Fact, §5.6).
7. **The spec in `docs/` is now mostly fiction.** At least 20 product rules differ from the code, several of them deliberately (held seats, audience filters, chat at full capacity). `docs/` should be archived as planned.
8. **Performance is acceptable, but images are wasted.** Cold landing on emulated slow 4G: LCP 2.05s, 676 KB. 306 KB of that is a 1024px PNG shown at 76px (Fact, §6). `backdrop-filter` has mostly gone with the redesign.

---

## 2. Feature inventory

Status: **Complete** = works end to end and is enforced server-side. **Partial** = works but is missing a piece the product needs. **Stub** = exists but isn't wired up.

### 2.1 Public and auth

| Route | Purpose | Status | Notes |
|---|---|---|---|
| `/` | Landing | Complete | Hero + how it works + activities + features + safety + install + CTA. Signed-in users are redirected to `/feed`. |
| `/about` | About | Complete | Three paragraphs. Thin. |
| `/safety` | What we check and don't, meeting tips, rules, emergency numbers | Complete | Good, honest content. |
| `/terms`, `/privacy` | Legal | Partial | Content is thorough but not lawyer-reviewed. Privacy omits Google sign-in (§5.6). |
| `/sign-in` | Sign up / sign in / forgot password (one page, three modes) + Google | Complete | Google button only renders if Supabase reports the provider enabled (`lib/auth-providers.ts`). |
| `/auth/callback` | OAuth and email-link landing | Complete | |
| `/auth/reset` → `/reset-password` | Scanner-safe password reset with single-use ticket | Complete | Well engineered (`lib/reset-ticket.ts`). |
| `/onboarding` | Date of birth, gender, Terms for accounts that lack them (Google sign-ups) | Complete | |
| `/join/[code]` | Single-use invite landing | Complete | |
| `/spot/[slug]` | Venue staff log a crew's visit by gig code, no login | Partial | Works only for partner venues. Unauthenticated, service role, no rate limit (§5.6). No venue-facing onboarding. |
| `/admin-verify` | Enrol or enter authenticator code for admin | Complete | |
| `/offline.html` | Service-worker offline fallback | Partial | Still in the old glass style and system font ([13-offline-375](screens/13-offline-375.png)). |

### 2.2 Signed-in app

| Route | Purpose | Status | Notes |
|---|---|---|---|
| `/feed` | Discover: blind gig cards, category, area, closest-first | Complete | Filters run client-side over up to 200 RLS-filtered rows. Area list covers 18 towns nationwide, not just Colombo. |
| `/gigs` | My gigs, upcoming and past | Complete | "On" badge uses a different rule from chat unlock (§5.5 bug 7). |
| `/gigs/new` | Post a gig in four steps | Complete | Activity, details + Google Places venue, public/private + audience, size + held seats. |
| `/gigs/[id]` (not a member) | Preview: host first name and age, venue, slot strip, join | Complete | |
| `/gigs/[id]` (member) | Lobby: crew, chat, invites, add spots, check-in, perk, leave/cancel, vote/report/block | Complete | Not screenshotted (would need joining someone's gig, §3.2). |
| `/me` | Profile, photo upload with on-device face check, verification status, edit, install, legal, sign out, delete | Complete | Credit-in-stats layout bug (§5.5 bug 1). |
| `/me/friends` | Friends, incoming and outgoing requests, "why no DMs" | Complete | Unreachable in practice until people have completed gigs together with check-ins. |
| `/me/verify` | Liveness video with random challenge | Complete | Requires an approved or pending photo first. |
| `/notifications` | Activity list + push toggle | Complete | |
| (missing) | Host edits gig details | **Missing** | Hosts can cancel or add spots but can't fix a typo, time or venue (`app/(app)/gigs/[id]/_actions.ts`). `docs/03` expected edit. |
| (missing) | "Share your plan" with someone outside the app | **Missing** | Specified in `docs/06`. Cheap and high-trust. |

### 2.3 Admin (`/admin`, requires `is_admin` + authenticator-app session)

| Route | Purpose | Status |
|---|---|---|
| `/admin` | Queue counts, users, gigs at risk, recent audit | Complete |
| `/admin/verifications` | Video review with challenge, keyboard shortcuts | Complete |
| `/admin/photos` | Photo approval queue | Complete |
| `/admin/reports` | Reports, priority pinned | Complete |
| `/admin/chat` | Moderation word-list flags with context | Complete |
| `/admin/flags` | Cross-gig red-flag patterns (view `admin_flags`) | Complete |
| `/admin/users`, `/admin/users/[id]` | Search, full history, moderation ladder, corrections, grant admin | Complete. The ban needs no second admin (docs asked for one), and "Make admin" is one `confirm()`. |
| `/admin/gigs` | List and cancel | Partial (no edit) |
| `/admin/venues` | Partner toggle and perk text | Partial (no create, edit, photos or slug management) |
| `/admin/partners` | Venue report + CSV | Partial. One query pair per venue (N+1), people-sent trend missing, CSV filename still `trio-partners-…`. |

### 2.4 Back end and platform

| Piece | Status | Notes |
|---|---|---|
| 30 migrations, 26 tables, 74 functions | Complete | All 26 tables enable RLS. Default privileges revoked, then granted back narrowly (§5.1). |
| pg_cron jobs | Complete | lock, complete, recompute bands, expire verifications and friend requests, purge chats, push sweep, purge reset tickets (`0014_cron.sql`, `0024`, `0029`). |
| Web push (outbox → `pg_net` → `/api/push/dispatch`) | Complete | Chat pushes collapsed per gig. |
| Edge function `purge-verification-media` | **Stub** | Written but, per `supabase/README-ops.md`, not deployed or scheduled. |
| Edge function `send-emails` | **Stub** | Not scheduled. The subject line contains an em dash. It also marks `sent_at`, which would clash with the push claim if both ran. |
| Google Places proxy (`/api/places/autocomplete`, `/api/place-photo`, `/api/static-map`) | Complete | The two image routes are unauthenticated (§5.6). |
| PWA (manifest, `sw.js`, install prompt, offline page) | Complete | |

---

## 3. Screen inventory

### 3.1 Captured (each at 375px and 1280px)

| # | Screen | Files |
|---|---|---|
| 01 | Landing | [375](screens/01-landing-375.png) · [1280](screens/01-landing-1280.png) |
| 02 | About | [375](screens/02-about-375.png) · [1280](screens/02-about-1280.png) |
| 03 | Safety | [375](screens/03-safety-375.png) · [1280](screens/03-safety-1280.png) |
| 04 | Terms | [375](screens/04-terms-375.png) · [1280](screens/04-terms-1280.png) |
| 05 | Privacy | [375](screens/05-privacy-375.png) · [1280](screens/05-privacy-1280.png) |
| 06 | Sign up | [375](screens/06-sign-up-375.png) · [1280](screens/06-sign-up-1280.png) |
| 07 | Sign in | [375](screens/07-sign-in-375.png) · [1280](screens/07-sign-in-1280.png) |
| 08 | Forgot password | [375](screens/08-forgot-password-375.png) · [1280](screens/08-forgot-password-1280.png) |
| 09 | Reset link expired/invalid | [375](screens/09-reset-link-error-375.png) · [1280](screens/09-reset-link-error-1280.png) |
| 10 | New password without ticket | [375](screens/10-reset-password-expired-375.png) · [1280](screens/10-reset-password-expired-1280.png) |
| 11 | Invite link not found | [375](screens/11-invite-not-found-375.png) · [1280](screens/11-invite-not-found-1280.png) |
| 12 | 404 | [375](screens/12-not-found-375.png) · [1280](screens/12-not-found-1280.png) |
| 13 | Offline page | [375](screens/13-offline-375.png) · [1280](screens/13-offline-1280.png) |
| 14 | Signed-out visit to `/feed` (redirects to sign-up) | [375](screens/14-feed-signed-out-375.png) · [1280](screens/14-feed-signed-out-1280.png) |
| 20 | Acceptable-use gate (first visit after sign-up) | [375](screens/20-acceptable-use-gate-375.png) · [1280](screens/20-acceptable-use-gate-1280.png) |
| 21 | Discover feed | [375](screens/21-feed-375.png) · [1280](screens/21-feed-1280.png) |
| 22 | Discover, empty category | [375](screens/22-feed-empty-filter-375.png) · [1280](screens/22-feed-empty-filter-1280.png) |
| 23 | Gig preview, full gig | [375](screens/23-gig-preview-full-375.png) · [1280](screens/23-gig-preview-full-1280.png) |
| 24 | Gig preview, open gig | [375](screens/24-gig-preview-open-375.png) · [1280](screens/24-gig-preview-open-1280.png) |
| 25 | My gigs, empty | [375](screens/25-my-gigs-empty-375.png) · [1280](screens/25-my-gigs-empty-1280.png) |
| 26 | Post a gig | [375](screens/26-post-a-gig-375.png) · [1280](screens/26-post-a-gig-1280.png) |
| 27 | Profile | [375](screens/27-profile-375.png) · [1280](screens/27-profile-1280.png) |
| 28 | Friends, empty | [375](screens/28-friends-empty-375.png) · [1280](screens/28-friends-empty-1280.png) |
| 29 | Verify, needs photo first | [375](screens/29-verify-needs-photo-375.png) · [1280](screens/29-verify-needs-photo-1280.png) |
| 30 | Activity, empty | [375](screens/30-activity-375.png) · [1280](screens/30-activity-1280.png) |
| 31 | `/admin` as a non-admin (404) | [375](screens/31-admin-as-member-404-375.png) · [1280](screens/31-admin-as-member-404-1280.png) |

### 3.2 Not captured, and what it would take

| Screen(s) | Why not | What's needed |
|---|---|---|
| Lobby: crew, locked chat, open chat, vote sheet, report and block sheets, leave sheet, check-in, perk card, completed-gig summary with Add friend | Needs membership of a gig. Joining a test user's gig or posting one writes to the hosted DB and notifies other accounts. | Approval to post one throwaway gig from the audit account (host view), plus 2 more test accounts to fill it for the open-chat state. |
| Host invite links panel, Add spots | Host-only | Same as above |
| Verification capture (camera, countdown, recording, review) | Needs an approved photo + a camera | A phone run-through, or upload a photo and approve it from admin |
| Onboarding | Email sign-up already collects DOB and gender. Only Google sign-ups see it. | One Google sign-up |
| Reset-password form (valid ticket) | Needs an emailed link | A reset to the test inbox |
| `/spot/[slug]` (valid), `/join/[code]` (valid) | Need a partner venue slug / a live invite | Admin flags a venue as partner; a host shares a link |
| All admin screens and `/admin-verify` | Test account isn't an admin | An admin session (needs your authenticator) or screenshots taken by the team |
| Install sheet (iOS), delete-account sheet | Interaction-only states | Can be captured on request |

Admin screens are critiqued from code in §4.4.

---

## 4. Design critique

### 4.1 System-level (applies everywhere)

- **Identity: distinctive, but the wrong distinction.** The retro "desktop windows" look (`app/globals.css`: 2px plum borders, `4px 4px 0` shadows, title bars with two dots, Space Mono) is more memorable than the glass it replaced, and it's internally consistent. But "retro computer" says nothing about meeting people for futsal in Colombo. The window chrome (two dots, empty title bar) is decoration with no meaning. The dots look like controls and aren't.
- **No hierarchy.** Every element has the same outline-plus-shadow treatment: cards, chips, filter pills, inputs, badges, secondary buttons, primary buttons. On the feed at 375px there are about ten outlined, shadowed boxes above the first card's title ([21-feed-375](screens/21-feed-375.png)). When everything is raised, nothing is. The coral primary is the only thing that differs, and only by fill.
- **The mono font is over-applied.** Space Mono is on buttons, nav, filter chips, badges, form labels and section labels. That includes user-written content such as "Entrance fee around 300", which `components/ui/Badge.tsx` renders in mono. Monospace at 11 to 13px is slower to read. It also has **no Sinhala or Tamil glyphs**, so the planned i18n would fall back to a mismatched system font in exactly the places that carry the most words (buttons, labels).
- **Contrast failures on the brand colour** (Fact, computed in §6.4): primary button text 3.58:1, coral-600 links and error text 4.22:1, active bottom-tab label 3.38:1, mint text on mint-50 2.96:1, white on mint (admin Approve) 3.28:1. AA needs 4.5:1 for text under 18.66px bold. Body text passes comfortably (muted on cream 5.33:1, plum on cream 15.36:1).
- **Persistent install banner.** It sits on every app screen above the tab bar, takes about 110px, and on mobile covers the primary action of the gig preview ("Join this gig", [24-gig-preview-open-375](screens/24-gig-preview-open-375.png)). With the tab bar, about 200 of 812px (25%) is fixed chrome. `/me` shows it twice: the banner plus an inline install card ([27-profile-375](screens/27-profile-375.png)).
- **Imagery.** The only real imagery is the anime-style hero illustration and Google Places venue photos. The hero characters don't look Sri Lankan, which matters for a "Colombo first" product. The art looks AI-generated; **Assumption**, to confirm with whoever supplied it before using it in paid marketing. Venue photos are uncurated: the second feed card is a bartender with a blue cocktail.
- **Trust cues.** The honest safety copy is excellent and is the strongest asset ([03-safety-1280](screens/03-safety-1280.png)). But trust signals in the core flow are small mono badges ("New", "Verified") that read as metadata. Modern consumer apps (Partiful, Luma) lead with who's going. Trimegos deliberately can't (blind feed), so the card has to carry the vibe through activity, place and time. Right now it carries a Google photo and a date tile.
- **Decorative waves.** The `.ambient` sun and coral SVG waves behind every page compete with content on long pages and make cream cards on cream backgrounds blur together at the wave edges.
- **Motion.** Restrained (rise, pop, hover nudge) and globally disabled under `prefers-reduced-motion` (`app/globals.css`). Fine.

### 4.2 Public screens

| Screen | Critique |
|---|---|
| **01 Landing** | The hero type is strong and the copy is good ("Plans need people. Find your crew."). Problems: (1) on desktop the illustration is cropped to the left woman and the right man, so the middle friend disappears and it reads as a couple's sunset drink. Its alt text still says "Three friends". (2) The cans read as alcohol to many Sri Lankan parents. (3) Six-up feature grid with icon-in-square tiles: the generic SaaS pattern `docs/04` explicitly banned. (4) The phone collage shows invented gigs with no "example" label. That's harmless now, but it's the only "social proof" and it's fake. (5) At 375px the page is 6,585px tall: long for a product with one idea. (6) Hero badges "3+ per gig · public places only · photos reviewed" are the best trust line on the page and are styled as small mono captions. |
| **02 About** | Three paragraphs and a button. No team, no faces, no city story. For a safety-sensitive meetup app, "who runs this" is a trust question and it isn't answered. |
| **03 Safety** | The best page in the product. Honest "what we check / what we don't" with emergency numbers. The 375px version is long but readable. The dark "When you meet" block uses translucent tiles on plum (`glass-dark`, with `backdrop-filter`) for no visual gain. |
| **04/05 Terms, Privacy** | Readable long-form, with a table of contents on desktop. At 375px there's no table of contents, so 7,500px of scrolling. "Last updated" is hardcoded English. |
| **06 Sign up** | Clear, single column, Google first. Asks for 7 things before any value is shown: name, username, email, password, DOB, gender, Terms. The username is the highest-friction field and is barely used in the UI. Gender and DOB are justified by audience filtering, and the hints say why (good). The date input shows `yyyy-mm-dd`, which is hostile on Android. |
| **07 Sign in** | Clean. The desktop left panel repeats the platonic clause, which is good brand placement. |
| **08–10 Reset flow** | Clear, honest copy about single-use links. The expired state explains why. Good. |
| **11 Invite not found** | Error plus a single button labelled "Discover" that actually goes to the landing page. A dead end for someone who came from a friend. It should say who to ask. |
| **12 404** | On brand. Its CTA "Back to Discover" sends signed-out visitors to sign-up. |
| **13 Offline** | Old glass design, system font and blur. Inconsistent with everything else. |
| **14 Signed-out `/feed`** | Redirects to **sign-up** (not sign-in), with no notice that you need an account. Returning users must find "Already have an account?". |

### 4.3 Signed-in screens

| Screen | Critique |
|---|---|
| **20 Acceptable-use gate** | Necessary and well written. It's a wall of legal-style bullets as the first thing after sign-up, with a disabled button at pale coral (low contrast). It would land better after the user has seen the feed once, or as 3 plain-language cards. |
| **21 Discover** | At 375px, filters take about 300px (category chips, area select, two sort pills) before the first card, and only one card is fully visible above the install banner. The "Full" gig still occupies the top slot. Full gigs should sink or collapse. Cards are image-led, but the image is whatever Google returns for the venue: grass steps, a bartender. Category chips overflow horizontally with no affordance. Desktop: two "Post a gig" buttons (nav + header), and a 3-column grid holding 2 cards with large dead space. "You only see gigs whose age range and audience include you" sits under the list where nobody reads it. |
| **22 Discover, empty filter** | Logo mascot + "No gigs in this category right now. Post one and see who bites." + CTA. Friendly, but it's the screen most users will see most often at launch. There's no "notify me when one appears", no suggested activity and no nearby alternative. |
| **23 Preview, full** | The header shows a **"Chat open"** badge to a non-member, which is noise for them. The footer notice says "That gig just filled up. There are others on.", which is race-condition copy shown for a gig that has been full for hours. It doesn't link to the "others". |
| **24 Preview, open** | Good information order: slots, host, place, details, join. But (1) the install banner covers "Join this gig" at 375px. (2) The bottom tab shows **"My gigs" as active** while you browse a gig you're not in. (3) The host block shows first name and **age** ("Allie, 26"), which nudges toward judging people by age before joining: the dynamic the blind feed exists to prevent. (4) "1/8 · 2 more needed to go ahead" is good, honest data and should be bigger. |
| **25 My gigs, empty** | Fine. Single CTA. |
| **26 Post a gig** | Complete but long (3,115px at 375px). Four numbered cards, about 15 inputs. Activity tiles scroll sideways with clipped last items. Age presets that don't fit the host's age are greyed without explanation. The "Bringing people you know?" stepper reads "Just me" between − and +, an odd control label. The platonic-intent checkbox is the last thing before submit, which is good placement. No preview of how the card will look in the feed. |
| **27 Profile** | **Layout bug:** the "A product by Emberloft" credit renders inside both stat tiles. The "Not verified" badge looks like a penalty to a brand-new user. The order puts install and legal links above Account, and "Delete account" sits under the install banner. |
| **28 Friends, empty** | Honest "why no DMs" card. Without completed gigs this page has nothing to do and could be hidden from the main nav until it does. Today it takes one of 5 tabs. |
| **29 Verify, needs photo** | Clear dependency message. Fine. |
| **30 Activity, empty** | Push prompt first, then the empty state. Asking for push before any gig exists has a low chance of a yes. The prompt belongs at the moment of joining or hosting. |
| **31 `/admin` as member** | Correctly 404s without confirming the route exists. |

### 4.4 Admin (from code, not screenshotted)

- Uses the same retro primitives, with all strings inline (allowed by hard rule 9).
- `/admin/verifications` is genuinely good: challenge beside video, account context, A/R/T/J/K shortcuts, playback speed (`app/admin/verifications/ReviewClient.tsx`).
- `/admin/venues` and `/admin/partners` are the weakest. They use bare `<input>`s with their own styles instead of `components/ui/Field`, no partner photos, and no venue creation (`app/admin/venues/page.tsx`).
- Approve buttons use white on mint (3.28:1).
- Destructive actions use the browser's native `confirm()` (3 call sites), inconsistent with the `Sheet` used elsewhere.

### 4.5 Compared with modern consumer apps (summary, detail in Phase 2)

| Benchmark habit | Trimegos today |
|---|---|
| One dominant primary action per screen | Flattened by uniform outlines and shadows |
| Real photos of real people and places, curated | Google venue photos + one illustration |
| Social proof of attendance (avatars, "12 going") | Deliberately blind. Needs a substitute (fill bar, host track record, "ran 4 times") |
| System font or one humanist sans for UI, display face for headings | Two faces, with mono doing body-UI work |
| Sticky bottom CTA on detail pages | CTA sits at the end of the scroll and is then covered by the install banner |

---

## 5. Code and docs issues

### 5.1 Hard rules (CLAUDE.md)

| # | Rule | Verdict | Evidence |
|---|---|---|---|
| 1 | RLS on every table | **Pass** | All 26 `create table` statements have a matching `enable row level security` across `supabase/migrations/0001`–`0030`. I didn't review every policy's logic line by line. |
| 2 | Service role never in browser | **Pass** | `lib/supabase/admin.ts` imports `server-only`. All users are server actions or route handlers. |
| 3 | Every admin action re-checks admin | **Pass for actions, partial for reads** | All admin mutations call `adminContext()`/`requireAdminId()`. Admin **pages** read with the service role and rely only on `app/admin/layout.tsx`. Current guidance is that a layout check is not enough on its own, because layouts and pages render independently ([Clerk, "Protect content"](https://clerk.com/docs/nextjs/guides/secure/protect-content), accessed 2026-10-30; [DEV, Next.js auth best practices](https://dev.to/franciscomoretti/nextjs-authentication-best-practices-in-2025-o00), accessed 2026-10-30). Add `requireAdminId()` at the top of each admin page or in a shared data-access helper. |
| 4 | Capacity, audience, seats, votes in Postgres | **Pass** | `claim_slot`, `join_by_invite`, `cast_kick_vote`, `increase_gig_capacity` (`0030`) are security-definer with checks. No automated concurrency test exists (§5.8). |
| 5 | Verification media private, 60s URLs, purged after 7 days | **Partial** | Bucket private (`0013_storage.sql`), 60s signed URLs (`app/api/admin/verifications/[id]/media/route.ts`). The 7-day purge only runs as a side effect of an admin decision (`app/admin/verifications/_actions.ts`). The scheduled function is undeployed. |
| 6 | Privileges explicit | **Pass** | `revoke all … from anon, authenticated` and `revoke execute on all functions`, then 18 explicit `grant execute` statements. |
| 7 | No `any` | **Pass** | No `: any` or `as any`. 8 `as unknown as` casts paper over join types (`app/(app)/gigs/[id]/_data.ts`, `app/(app)/gigs/page.tsx`, etc.). |
| 8 | Mutations are server actions or route handlers | **Pass** | |
| 9 | User-facing strings in `lib/copy/` | **Fail** (many small leaks) | See §5.3. |
| 10 | No source file over 200 lines | **Pass for live code** | Only `supabase/_legacy/migrations-trio/0005_functions.sql` (512) and `0012_…` (223) exceed it, and they're dead (§5.7). Near the limit: `0023_private_gig_functions.sql` 200, `VerifyFlow.tsx` 197, `admin/users/[id]/page.tsx` 197, `globals.css` 194, `SignInForm.tsx` 188. |
| 11 | No `router.refresh()` after revalidating actions | **Pass** | `AddSpots.tsx` uses `window.location.reload()` as a documented workaround. That's a smell: a full reload on a 211 kB page. |
| 12 | Navigate with server `redirect()` | **Partial** | `app/(app)/me/AccountActions.tsx` sets `window.location.href = "/"` after `deleteAccountAction` resolves. `AddSpots` reloads. |
| 13 | No emojis or em dashes in UI | **Pass** | None in rendered UI. Seed `activities.emoji` holds emojis but they're never rendered. `supabase/functions/send-emails` subject "Crew's final — here's the address" has one (not live). |

### 5.2 Brand rule

"Tremigos" is banned by CLAUDE.md, but it appears in header comments of 20 migrations, including the new `0030_google_names_capacity.sql`. It isn't user-facing, and applied migrations must not be edited, so the fix is only to stop adding it.

### 5.3 Hardcoded user-facing strings (rule 9)

| File | Strings |
|---|---|
| `components/gig/Badges.tsx` | "Verified", "Reliable", "New", "Mixed" and their `title` tooltips |
| `components/marketing/Hero.tsx` | "3+ per gig", "public places only", "photos reviewed", the image alt |
| `components/marketing/PhoneCollage.tsx` | All four example gig titles and meta |
| `app/(marketing)/page.tsx` | 16 activity labels |
| `app/(marketing)/layout.tsx` | "Safety", "About", "Legal", "Terms of Service", "Privacy Policy" |
| `components/app/AuthShell.tsx` | "Terms", "Privacy", "Safety" |
| `components/marketing/LegalPage.tsx` | "Last updated", "Contents"; page titles in `app/(marketing)/terms|privacy/page.tsx` |
| `app/(app)/feed/DiscoverFeed.tsx` | "Sports", "Food & chill", "Outdoors", "Learn & make" |
| `app/(app)/gigs/new/form-parts.tsx` | aria "Fewer", "More" |
| `app/(app)/gigs/new/AudienceFields.tsx` | aria "Minimum age", "Maximum age", "99+" |
| `app/(app)/gigs/new/NewGigForm.tsx` | "h" (hours) |
| `app/(app)/gigs/new/_actions.ts` | "Check the fields and try again." |
| `app/(app)/gigs/[id]/CrewList.tsx` | aria "Options for {name}" |
| `app/(app)/me/friends/page.tsx` | "a gig" |
| `components/ui/SlotStrip.tsx` | aria "{n} of {m} spots taken", "Open spot", "+1" |
| `components/ui/PasswordInput.tsx` | "Show password", "Hide password" |
| `components/ui/Spinner.tsx`, `Skeleton.tsx` | "Loading" |
| `components/ui/Logo.tsx` | "{brand} home" |
| `components/app/AppNav.tsx` | "({n} new)", aria "Main" |
| `lib/avatar.ts` | "Someone" |
| `lib/time.ts` | "now", "in 3h", "just now", "5m ago" (English-only relative time) |
| `lib/push/dispatch.ts`, `public/sw.js`, `public/offline.html` | Fallback push titles and bodies; the whole offline page |

Copy keys defined but not referenced anywhere outside `lib/copy/` include `auth.working`, `auth.usernameHint`, `feed.seeGig`, `gig.joining`, `gig.youreIn`, `newGig.submitting`, `newGig.step1`, `newGig.step3`, `venue.searching`, `lobby.neverMind`, `lobby.notOpenToYou`, `notifications.markRead`, `offline` and `productLine`. This came from a name search of a sample of keys, not a full sweep.

### 5.4 Where `docs/` and the code disagree

The code wins in every case below (CLAUDE.md says so). The table shows how far the original thesis has moved, which matters for Phase 1.

| Topic | `docs/` (Trio spec) | Code today |
|---|---|---|
| Sign-in | Email OTP | Email + password, Google OAuth |
| Design | "Court Day" palette, Gabarito / Instrument Sans / DM Mono, glass banned, no gradients | Logo palette, Plus Jakarta Sans + Space Mono, hard-shadow windows (oddly closer to the original spec than the glass era was) |
| Chat opens | At confirmation (3 people) | When every spot is filled, or 2h before start |
| R3: host can't filter people | No pre-filtering at all | Hosts set age range and women/men-only audiences, enforced by RLS |
| R10: nothing social touches slot order | Invites never hold seats | Hosts hold seats with single-use links; private gigs are 100% invite-only |
| R5: blind feed and preview | Host first name + reliability band only | Host first name **and age**, verified badge |
| Face rule | `face_visible` setting; crew always sees faces at confirmation | No setting. Photos hidden by `can_see_face()` until unlock, admin-approved only |
| Removal | Host remove-for-cause only | Host remove + crew majority vote + admin remove |
| Notifications | Email only | In-app + Web Push. Email function unscheduled |
| Capacity | 3–12 | 3–16, and the host can increase while open |
| Activities | 23 | 38 (`supabase/seed.sql`) |
| Geography | "Any city outside Colombo in the feed" is a non-goal | 18 areas across Sri Lanka in the area filter (`lib/geo.ts`) |
| Check-in window | Opens 15 min before | Opens 30 min before (`app/(app)/gigs/[id]/page.tsx`) |
| `mixed` reliability band | Visible only to host and admins | `ReliabilityMark` shows "Mixed" to the whole crew (`CrewList.tsx`) |
| Contact details in chat | Soft-blocked until lock | Warn-and-allow at all times, received ones labelled |
| Ban | Needs a second admin's sign-off | Any single admin |
| Venue picker | Partners pinned to the top | No pinning |
| Share-your-plan button | Required safety feature | Not built |
| Host edits gig | Allowed while open | Not possible |
| Monetization | Venue tiers, PayHere later | Partner flag + perk + redemption log only. No billing, no tiers |

### 5.5 Bugs found

| # | Bug | Where | Severity |
|---|---|---|---|
| 1 | Studio credit renders inside each stat tile | `app/(app)/me/page.tsx`, `Stat()` contains `<MadeBy />` ([27-profile-375](screens/27-profile-375.png)) | Low, very visible |
| 2 | "My gigs" tab shown active on any `/gigs/[id]`, including gigs you aren't in | `components/app/AppNav.tsx` `isActive()` ([24-gig-preview-open-375](screens/24-gig-preview-open-375.png)) | Low |
| 3 | Install banner covers the gig's Join button and the bottom of every page on phones | `components/pwa/InstallPrompt.tsx` banner variant, `app/(app)/layout.tsx` | **Medium**: blocks the core conversion |
| 4 | Full-gig preview shows race-condition copy "That gig just filled up" | `JoinPanel.tsx` uses `errors.gig_full` for a static state ([23](screens/23-gig-preview-full-1280.png)) | Low |
| 5 | Non-members see a "Chat open" badge | `GigHeader.tsx` | Low |
| 6 | Hero crops out one of the three people on desktop; alt text then misdescribes it | `components/marketing/Hero.tsx` (`object-cover` on a half-width tall panel) | **Medium**: positioning |
| 7 | "On" badge in My gigs uses `min_to_confirm` + 2 claimed; chat unlock uses full capacity | `app/(app)/gigs/page.tsx` | Low: confusing |
| 8 | Any Postgres "database error" on sign-up is reported as "You need to be 18 or older" | `app/sign-in/_actions.ts` `mapAuthError` | Medium: wrong message to adults when anything else fails |
| 9 | Admin actions ignore update and insert errors and report success | `app/admin/users/_actions.ts`, `app/admin/verifications/_actions.ts`, `app/admin/photos/_actions.ts` | Medium |
| 10 | Account deletion lists at most 100 files per bucket | `app/(app)/me/_actions.ts` | Low today |
| 11 | Two "Post a gig" buttons on desktop Discover | `app/(app)/feed/page.tsx` + `AppNav` ([21-feed-1280](screens/21-feed-1280.png)) | Low |
| 12 | Signed-out deep links redirect to sign-up, not sign-in | `lib/supabase/middleware.ts` + `app/sign-in/page.tsx` default mode | Low |
| 13 | Partner CSV named `trio-partners-…`; static-map marker uses old Trio orange `0xFF5E3A` | `app/api/admin/partners/export/route.ts`, `app/api/static-map/route.ts` | Cosmetic |

### 5.6 Security, privacy and legal observations

| Issue | Detail | Risk |
|---|---|---|
| Verification media retention | Privacy Policy §5 promises deletion 7 days after review. In practice the purge runs only when an admin reviews any request; the scheduled edge function isn't deployed (`supabase/README-ops.md`). With a quiet queue, videos persist indefinitely. | **High** (PDPA, broken promise) |
| Public `avatars` bucket | `0013_storage.sql` makes `avatars` public. Pending, unapproved uploads are written there (`uploadAvatarAction`), and anyone who once saw a crew-mate's photo URL can keep fetching it after the gig. "Photos hidden structurally" holds at the view level, not the storage level. | **Medium** |
| Google sign-in undisclosed | Privacy Policy §3 lists Supabase, hosting and Google Maps only (`lib/legal/privacy.ts`). | Medium (PDPA notice) |
| Admin pages gated only by layout | §5.1 rule 3 | Medium, to verify |
| Unauthenticated Maps proxies | `/api/place-photo` (unvalidated `ref`) and `/api/static-map` let anyone spend the Google Maps quota by varying parameters. The CDN cache only helps identical URLs. | Medium (cost) |
| `/spot/[slug]` | No login, service role, no rate limit on code guesses. Partner-only, so exposure is small today. | Low–medium |
| Committed dev script | `.rt_listen.mjs` at repo root reads `.env.local` and signs in test users from a credentials file | Low (remove) |
| CSP | Strong (`next.config.ts`): no third-party script origins beyond jsDelivr for MediaPipe. Any analytics tool added later must be allowed here. | Good |

### 5.7 Dead code

- `supabase/_legacy/migrations-trio/` (23 files, including the only files over 200 lines). Not used per `README-ops.md`.
- `.rt_listen.mjs`.
- `lib/brand.ts` `colors` export, `lib/places.ts` `placesConfig`, `glass-dark` and `text-gradient` utilities (barely used or unused after the redesign).
- Unused copy keys (§5.3).
- `isStandalone()`/`isIos()` implemented three times (`capture.ts`, `InstallPrompt.tsx`, `lib/push/client.ts`).
- Seed `activities.emoji` column (never rendered).
- `supabase/functions/send-emails` (unscheduled, conflicts with push on `sent_at`).

### 5.8 Missing foundations

| Area | State | Consequence |
|---|---|---|
| Product analytics | **None.** The Privacy Policy states "We don't use analytics or advertising cookies." | Fill rate, show-up rate and retention can't be measured. The north star in Phase 4 has no data source. Adding a tool needs a Privacy Policy update and a CSP change. |
| Error monitoring | **None.** `console.error` only; `app/error.tsx` logs to the browser console. | Production failures (e.g. verification upload on a given phone) are invisible unless a user emails. |
| Tests | **None.** No test files, no `test` script. `docs/10` required a 10-way concurrent `claim_slot` test. | Every capacity and RLS guarantee is unverified by automation. |
| CI | **None** (no `.github/`). | Typecheck and build run only when someone remembers. |
| Lint | `npm run lint` exists but there's no ESLint config, so it would prompt interactively. | |

Typecheck passes on `4899da2` (Fact, `npm run typecheck`, 2026-10-30). The production build succeeds with placeholder env vars (Fact, `next build`, 2026-10-30).

---

## 6. Performance

### 6.1 Bundle (Fact, `next build` on `4899da2`)

| Route | Route JS | First-load JS |
|---|---|---|
| Shared by all | | 103 kB |
| `/` | 3.9 kB | 124 kB |
| `/feed` | 7.0 kB | 142 kB |
| `/gigs/new` | 8.7 kB | 143 kB |
| `/gigs/[id]` | 13.8 kB | **211 kB** (Supabase realtime client in the lobby) |
| `/me/verify` | 7.0 kB | 195 kB (MediaPipe loader; the model + WASM load on demand) |
| `/admin-verify` | 4.3 kB | 178 kB |
| Middleware | | 92 kB (runs `getClaims()` on every request) |

Reasonable for Next 15. The lobby is the heaviest page and also the one people reopen most.

### 6.2 Lab measurements (Fact)

Method: production site, headless Chrome 156, 375px at 2x. Network emulated at Lighthouse "slow 4G" (150 ms RTT, 1.6 Mbps down, 750 kbps up), CPU slowed 4x. Cold visit: HTTP cache disabled and service worker bypassed. One run each, measured 2026-10-30. The Vercel response header `x-vercel-id: sin1::bom1` shows requests entering at Singapore and executing in Mumbai, next to Supabase `ap-south-1`.

| Page | TTFB | FCP | LCP | LCP element | Total transfer | of which images | Long-task blocking |
|---|---|---|---|---|---|---|---|
| `/` (signed out) | 789 ms | 1,852 ms | **2,052 ms** | hero `rooftop-sunset.webp` | 676 KB | 446 KB | 81 ms |
| `/sign-in` (signed out) | 830 ms | 1,780 ms | 2,100 ms | wordmark PNG | 583 KB | 361 KB | 0 |
| `/about` (signed out) | 655 ms | 1,456 ms | 1,456 ms | text | 556 KB | 361 KB | 0 |
| `/feed` | 702 ms | 1,840 ms | **4,188 ms** | first card's `/api/place-photo` image | 523 KB | 288 KB | 0 |
| `/gigs/[id]` preview | 567 ms | 1,632 ms | **4,044 ms** | header `/api/place-photo` (w=1200) | 531 KB | 226 KB | 0 |
| `/gigs/new` | 568 ms | 1,732 ms | 1,732 ms | text | 291 KB | 52 KB | 179 ms |
| `/me` | 719 ms | 2,304 ms | 2,380 ms | text | 280 KB | 62 KB | 0 |

CLS was 0 on every page. JS transfer was 129 to 231 KB per page; fonts were 46 KB (Jakarta + Space Mono).

### 6.3 Findings

1. **The 300 KB icon.** `public/brand/icon-rounded.png` is a 1024×1024 PNG of 306 KB (Fact, `file`/`stat`). It's displayed at 76 to 120 px on landing, sign-in and about. That single file is about 45% of the landing page's weight (306/676). A 240px WebP would be roughly 10 to 15 KB (**Estimate**, based on `mark-256.png` being 47 KB as PNG and WebP typically cutting that by 70% or more).
2. **Venue photos are the LCP on the two pages that matter most** (feed and gig). Each is fetched from Google through a serverless function on first view. They're full JPEGs at `w=640`/`w=1200` with no responsive sizes and no `next/image`. The gig header requests a 1200px image for a 375px banner.
3. **TTFB of 570 to 830 ms on a 150 ms RTT link.** Every app route is dynamic (`ƒ`), and middleware verifies the session on each request. **Estimate:** subtract about 4 RTTs for DNS, TLS and request (600 ms in the lab) and server time is very small. Most of it is network round trips, so moving the function closer won't help Sri Lankan users much (Mumbai is already close). Avoiding extra redirects will.
4. **`backdrop-filter` is mostly gone.** The redesign removed blur from `glass` and `glass-strong`, which covered the sticky header, bottom tab bar and install banner over scrolling content: the expensive case. What's left is `glass-dark` (gig header badge, Safety tips), `backdrop-blur-sm` on the full-screen acceptable-use overlay, `backdrop-blur-[2px]` behind sheets, and `offline.html`. Blur over moving content forces the browser to re-render the blurred region every frame and defeats layer caching. Reports describe this as especially bad on low-end mobile GPUs ([Mozilla bug 1732817](https://bug635044.bugzilla.mozilla.org/show_bug.cgi?id=1732817), [Mozilla bug 1828248](https://bugzilla.mozilla.org/show_bug.cgi?id=1828248), [Flutter issue 32804](https://github.com/flutter/flutter/issues/32804), all accessed 2026-10-30). The remaining uses are over static content, so their cost is small. **Recommendation:** remove them for consistency rather than speed.
5. **Fonts.** Two families, 46 KB, preloaded. Space Mono adds about 20 KB (**Estimate**, two weights of a Latin subset) for a style decision that also blocks i18n (§4.1).

### 6.4 Contrast ratios (Fact, computed with the WCAG 2 relative-luminance formula)

| Pair | Ratio | AA normal text (4.5) |
|---|---|---|
| Ink `#24113a` on paper `#fffdf8` | 16.98 | Pass |
| Plum `#360253` on cream `#fbf8f3` | 15.36 | Pass |
| White 80% on plum hero | 10.52 | Pass |
| Hero accent `#ff7a92` on plum | 6.55 | Pass |
| Sun ink `#7a4f00` on sun-100 | 6.31 | Pass |
| Muted `#6e6280` on cream | 5.33 | Pass |
| **Coral-600 `#e81f3d` on cream** (links, errors) | 4.22 | **Fail** |
| **White on coral `#ff3450`** (primary button) | 3.58 | **Fail** |
| **Coral on cream** (active tab label) | 3.38 | **Fail** |
| **White on mint** (admin Approve) | 3.28 | **Fail** |
| **Mint `#12a26b` on mint-50** | 2.96 | **Fail** |

### 6.5 LCP and INP estimates on real Sri Lankan 4G

Network context (**Fact**): median mobile download in Sri Lanka is 45.64 Mbps per Ookla data reported by [DataReportal, Digital 2026: Sri Lanka](https://datareportal.com/reports/digital-2026-sri-lanka) (accessed 2026-10-30). Opensignal measures a lower "download speed experience" of 19.2 Mbps (SLT-Mobitel) and 18.0 Mbps (Dialog) for Oct–Dec 2025 ([Opensignal, Feb 2026](https://insights.opensignal.com/reports/2026/02/srilanka/mobile-network-experience), accessed 2026-10-30). Browser-based tests put the median at 9.9 Mbps ([SpeedOf.Me](https://speedof.me/internet-speed/sri-lanka), accessed 2026-10-30). Methods differ, so I use 10 to 20 Mbps as a realistic range for a mid-range phone in Colombo.

**Estimate, landing LCP:** about 4 RTT × 80 ms for connection and HTML = 0.32 s, plus the critical path (HTML 15 KB + CSS 13 KB + fonts 46 KB + hero 71 KB = 145 KB) at 10 Mbps = 0.12 s, plus main-thread time. On a mid-tier Android (Lighthouse's 4x CPU calibration) that's about 0.6 s. **≈ 1.1 to 1.5 s**, inside the 2.5 s "good" threshold. On a low-end Android (assume roughly 2x slower CPU than the lab profile; test on a real device) about 2 s.

**Estimate, feed and gig LCP:** the same base plus the first venue photo (about 120 KB at w=640, about 200 KB at w=1200) behind an uncached serverless fetch to Google (assume 400 to 800 ms on a cold CDN entry). **≈ 1.8 to 2.8 s**, at risk of crossing 2.5 s on the first view of each new venue. Repeat views hit the CDN cache (`Cache-Control: public, max-age=2592000`).

**Estimate, INP:** the worst observed long task was 179 ms (post-a-gig hydration), and the lab recorded no long tasks on feed or gig. Interaction handlers are light: client-side filters over at most 200 rows, chat appends. Mid-tier INP is likely under 200 ms ("good"). **Assumption:** the riskiest interactions on low-end devices are opening the lobby (211 kB JS + realtime subscribe) and the verification camera (MediaPipe WASM). To test, collect field INP with a web-vitals beacon once analytics exist (§5.8).

### 6.6 Suggested performance budget (input to `24-design-system-spec.md`)

| Budget | Target | Today |
|---|---|---|
| Landing total transfer, cold | ≤ 350 KB | 676 KB |
| Any page's images above the fold | ≤ 150 KB | 446 KB (landing) |
| First-load JS, lobby | ≤ 180 kB | 211 kB |
| LCP, slow-4G lab | ≤ 2.5 s | 4.0 to 4.2 s on feed and gig |
| `backdrop-filter` over scrolling content | 0 | 0 (good) |

---

## Key findings

1. All core features exist and are enforced in Postgres. Liquidity, not functionality, is the bottleneck: 2 upcoming gigs are visible to a new account (Fact).
2. The desktop hero crops to an apparent couple with drinks, and the feed's lead imagery is a cocktail bar. Both undercut "not a dating app" and family trust (Fact, screenshots).
3. The retro style removes hierarchy: identical outline and shadow on every element, plus mono type on buttons, labels and user content. The mono face has no Sinhala or Tamil glyphs (Fact).
4. The primary colour fails WCAG AA as button and link text (3.58:1 and 4.22:1) (Fact).
5. The install banner blocks "Join this gig" on phones, and fixed chrome uses 25% of a 375×812 screen (Fact).
6. No analytics, error monitoring, tests, CI or lint config (Fact).
7. Retention promises aren't automated: the verification-video purge depends on admin activity. Unapproved photos sit in a public bucket. Google sign-in isn't disclosed (Fact).
8. `docs/` contradicts the code on at least 20 product rules, several of them core (held seats, audience filters, chat unlock) (Fact).
9. Cold landing is 676 KB, 45% of it one oversized PNG. Feed and gig LCP is about 4 s in slow-4G lab conditions because of uncached venue photos (Fact). Estimated 1.1 to 2.8 s on typical Sri Lankan 4G (Estimate).
10. `backdrop-filter` cost is no longer a meaningful performance issue after the redesign (Fact).

## Decisions this informs

- **Design direction** (`22-design-directions.md`, `43-decisions.md`): keep, soften or replace the retro-window style, and whether the clean white/light theme is the better base. Mono font in the UI: keep for numbers only, or drop.
- **Hero and marketing imagery:** replace or recrop the illustration. Commission locally representative, clearly group-based art or photography.
- **Instrumentation first:** which privacy-respecting analytics and error-monitoring tools to adopt (Phase 4 metrics plan, Phase 5 step 5) and the matching Privacy Policy change.
- **Retention fixes:** schedule the verification purge; make the avatars bucket private with signed URLs or a proxy. Both are database or storage changes that need approval (Phase 5 step 7).
- **Archive `docs/`** (Phase 5 step 9).
- **Feature gaps to evaluate in `15-feature-opportunities.md`:** host edit gig, share-your-plan, "notify me" on empty feeds, full gigs sinking in the feed, a sticky Join CTA, smarter install-prompt timing, and push prompt timing.
- **Whether hosts' age (and audience filters at all) belong in the product**, given the original anti-cherry-picking thesis (`06-trust-safety.md`, `16-direction-options.md`).

## Open questions

1. Who supplied the rooftop illustration, and what are its licence and provenance (AI-generated or commissioned)?
2. Should the remaining lobby, host, admin and verification screens be captured? That needs approval to post one throwaway gig and fill it with 2 more test accounts, plus an admin session from the team (§3.2).
3. Is the `purge-verification-media` function deployed anywhere outside what `README-ops.md` describes? The live state of `vault`, cron and edge functions can't be read from the repo.
4. Are any of the 10 existing accounts real people (e.g. the "Chanka" and "Allie" hosts) rather than test data? This matters before the Phase 5 deletion script.
5. Was the move away from the `docs/` rules (held seats, audience filters, full-capacity chat unlock) a deliberate decision with user evidence, or an iteration that should be re-tested?

## Confidence

**High** for the feature inventory, hard-rule checks, bugs, contrast ratios and bundle sizes: read directly from code, build output and screenshots of production running the same commit.
**Medium** for the lab performance numbers: single runs on an emulated profile, not a real low-end phone.
**Low to medium** for the real-network LCP and INP estimates: they depend on an assumed 10 to 20 Mbps and assumed device tiers; field data is needed.
