# 04 — Design system

## The direction

**Community notice board meets game lobby.**

The real-world object this app is a descendant of is the pin board at a badminton club or a cafe — index cards with a sign-up sheet, tacked up at angles, filling in as people add their names. The digital object it's a descendant of is a game lobby, where you watch slots fill in real time before the match starts.

So: physical, tactile, hand-pinned, slightly imperfect. Cards have weight and hard shadows. Things sit at small angles. Nothing floats in a frosted-glass void.

The mood is **playground energy, not startup energy**. Bright, sporty, a bit loud, confident enough to be casual.

## Palette — "Court Day"

Drawn from the actual materials: court surfaces, boundary tape, line paint, net shadow. Not decorative choices; the subject's own colours.

```css
@theme {
  --color-court:  #E7EDE4;  /* page background — pale court green-grey */
  --color-chalk:  #FFFFFF;  /* card surfaces */
  --color-ink:    #1B1A16;  /* text, borders, hard shadows — warm near-black */
  --color-tape:   #FF5E3A;  /* primary action — sports-tape orange */
  --color-line:   #FFD23F;  /* highlight, active slot, hover fills */
  --color-net:    #12706B;  /* secondary, links, verified badge */
  --color-dust:   #9A9B8F;  /* muted text, disabled, empty sockets */
}
```

Rules:
- `--color-tape` is for actions only. Never a background wash, never a text colour for body copy.
- `--color-line` never carries text. It's a fill behind ink.
- Exactly one `--color-tape` element per screen region. If there are two primary buttons in view, one of them is wrong.
- **No gradients anywhere.** Flat fills only. This is the single easiest tell to avoid.

## Type

```
Display:  Gabarito         (Google Fonts) — 600/700/800
Body:     Instrument Sans  (Google Fonts) — 400/500/600
Data:     DM Mono          (Google Fonts) — 400/500
```

Gabarito is rounded and geometric with real character and is not yet the default everyone reaches for. It carries the bubbly personality without a novelty face. Instrument Sans is clean and slightly quirky and holds up at 14px. DM Mono is used **only** for things that are literally counts or codes — slot counters, gig codes, countdown timers, LKR amounts. That's the structural rule from the brief: mono means "this is a real number", it is not decoration.

Scale (fluid, `clamp()`):

| Role | Size | Face | Notes |
|---|---|---|---|
| Hero | 3.5–6rem | Gabarito 800 | tracking `-0.03em`, line-height `0.95` |
| Page title | 2–2.75rem | Gabarito 700 | tracking `-0.02em` |
| Card title | 1.25rem | Gabarito 600 | |
| Body | 1rem | Instrument Sans 400 | line-height `1.6` |
| Small | 0.875rem | Instrument Sans 500 | |
| Data | 0.875rem | DM Mono 500 | tracking `0.02em`, often uppercase |

Sentence case everywhere. No ALL CAPS headings except mono labels.

## Shape and depth

```css
--radius-card:  20px;
--radius-btn:   999px;   /* buttons only — see note */
--radius-chip:  8px;
--radius-tile:  4px;
--border:       2px solid var(--color-ink);
--shadow-hard:  4px 4px 0 var(--color-ink);
--shadow-lift:  6px 6px 0 var(--color-ink);
```

Everything on a surface has a **2px ink border and a hard offset shadow**. No blur, no soft drop shadows, no `box-shadow: 0 4px 6px rgba(0,0,0,0.1)`. On hover, cards translate `-2px, -2px` and the shadow grows to `--shadow-lift`. That's the physical language: things are objects you can pick up.

Radii are deliberately **inconsistent across element types** — 20px cards, 8px chips, 4px tiles. Uniform radius on everything is the templated look.

> On `--radius-btn: 999px`: fully round buttons are fine and correct here. What's banned is the **pill badge above a hero headline** — the "✨ Now in beta" capsule. See below.

Pinned cards get `transform: rotate(-0.6deg)` / `rotate(0.5deg)` alternating, with a small pin/tape element. Use on the feed and the landing page. Do **not** rotate form fields or anything the user types into.

## Signature element: the SlotStrip

The one thing this product is remembered by. Every gig, everywhere, shows a horizontal strip of sockets — one per slot.

```
LOBBY  ● ● ○ ○        (2 of 4)
       └─┴─┴─┘
```

- **Filled socket, feed view** — solid ink circle. Deliberately anonymous. This is R5.
- **Filled socket, lobby view** — the person's face, circular, 2px ink border, `--shadow-hard`.
- **Empty socket** — 2px dashed `--color-dust` circle with a thin `+`.
- **Host socket** — always position 1, marked with a small `--color-line` flag notch.
- **Locked** — a diagonal `--color-tape` tape strip runs across the remaining empty sockets.

Interaction: when a slot fills in realtime, the socket springs in — scale `0 → 1.15 → 1`, ~380ms, spring. This is the one place motion is allowed to be showy, because watching a lobby fill *is* the product's emotional core. Everything else stays quiet.

Under the strip, a mono counter: `2 OF 4 · 1 MORE TO CONFIRM`. When it reaches minimum, the counter flips to `CONFIRMED` in `--color-net` with a single quick highlight sweep.

The component takes: `capacity`, `crew[]`, `variant: 'blind' | 'crew'`, `locked`, `minToConfirm`. Build it in M0, before anything else, because everything else composes it.

## Motion

Library: `motion`. Budget: small.

Allowed: slot fill spring (above); card hover lift; page-load stagger on the feed at 40ms intervals, once, no scroll-triggered replays; countdown tick on the lock timer.

Banned: scroll-jacking, parallax, elements fading up as you scroll down the page, animated gradient meshes, typewriter text, number count-ups on the landing page.

`prefers-reduced-motion: reduce` disables all of it, including the slot spring — the socket just appears.

## Banned patterns

Reject these on sight. They are the specific tells the brief asked to avoid.

- **The pill.** A small rounded capsule above a hero headline containing a sparkle emoji and a phrase like "Now in beta" or "Introducing Trio". Never.
- Purple-to-blue (or any) gradient text or gradient buttons.
- Glassmorphism — `backdrop-filter: blur()` on cards.
- The three-column feature grid with a lucide icon inside a rounded square above each heading.
- Fabricated social proof — "Join 10,000+ members", logo walls, invented testimonials. This app has no users yet; say so honestly and make that charming instead.
- Inter, or the system font stack, as the display face.
- A centred hero with one filled button and one ghost "Learn more" button beside it.
- Soft blurred drop shadows.
- Emoji as bullet points in body copy. (Activity emoji in the taxonomy is fine — that's data.)
- Dark mode for v1. The identity is a bright daytime one; a hasty dark theme will read as generic.

## The landing page

The hero is a **live board**, not a headline-and-buttons block. Show three real (or seeded) gig cards, pinned at angles, with their SlotStrips — one of them animating a slot filling on load. The headline sits to the left, tight and heavy, and the board does the explaining. If someone lands and immediately understands "oh, people post plans and you take a spot", the page has done its job.

Section order: board hero → how it works (three steps, but as pinned index cards, numbered because it genuinely is a sequence) → the three-person rule, explained honestly as a safety design → what it's not (the platonic clause, told with humour) → sign up.

## Quality floor

Not negotiable, not worth announcing in the UI:

- Works at 375px. The SlotStrip must not overflow at capacity 12 — it wraps to two rows.
- Visible keyboard focus: `outline: 3px solid var(--color-net); outline-offset: 2px`.
- Colour contrast ≥ 4.5:1 for body text. Check `--color-dust` on `--color-court` — it fails at small sizes, so use it only at 14px+ 500 weight, or darken it.
- Every interactive element reachable by keyboard; the SlotStrip's empty sockets are real buttons when joinable.
- Images have alt text; faces get `alt="{first name}"`.
