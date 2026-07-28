"use client";

import { Card } from "@/components/ui/Card";
import { SlotStrip } from "@/components/ui/SlotStrip";

/**
 * The hero is a live board, not a headline-and-buttons block (docs/04). Three
 * seeded gig cards pinned at angles with their SlotStrips — one animating a
 * slot filling on load (the SlotStrip springs its filled sockets on mount).
 * All seeded/illustrative — no fabricated social proof, no user counts.
 */
const DEMO = [
  { emoji: "🏸", activity: "Badminton", title: "Sunday doubles at Havelock", place: "Havelock City Courts", capacity: 4, filled: 2, min: 3, code: "BDM-4KQ2" },
  { emoji: "🎲", activity: "Board games", title: "Catan + snacks", place: "The Commons, Colombo 7", capacity: 5, filled: 3, min: 3, code: "BOA-9XTM" },
  { emoji: "☕", activity: "Coffee", title: "Slow morning, no agenda", place: "Black Cat Cafe", capacity: 3, filled: 1, min: 3, code: "COF-2RPK" },
];

export function BoardHero() {
  return (
    <div className="relative grid gap-4 sm:grid-cols-2">
      {DEMO.map((g, i) => (
        <Card
          key={g.code}
          pinned
          tiltIndex={i}
          className={`p-4 ${i === 1 ? "sm:mt-8" : ""} ${i === 2 ? "sm:col-span-1" : ""}`}
        >
          <div className="mb-2 flex items-center gap-2">
            <span aria-hidden className="text-lg">{g.emoji}</span>
            <span className="font-data text-[0.7rem] uppercase tracking-[0.06em] text-[var(--color-dust)]">
              {g.activity}
            </span>
          </div>
          <h3 className="mb-1 font-display text-[1.125rem] font-600">{g.title}</h3>
          <p className="mb-3 text-[0.8125rem] text-[var(--color-dust)]">{g.place}</p>
          <SlotStrip variant="blind" capacity={g.capacity} filled={g.filled} minToConfirm={g.min} />
        </Card>
      ))}
    </div>
  );
}
