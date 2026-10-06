"use client";

import { Globe2, Lock, UserPlus } from "lucide-react";
import { SlotStrip } from "@/components/ui/SlotStrip";
import { copy } from "@/lib/copy";
import { Stepper } from "./form-parts";

/** Public (listed in Discover) vs private (personal links only). */
export function VisibilityPicker({ isPrivate, onChange }: { isPrivate: boolean; onChange: (v: boolean) => void }) {
  const p = copy.privacy;
  const opts = [
    { v: false, Icon: Globe2, label: p.public, hint: p.publicHint },
    { v: true, Icon: Lock, label: p.private, hint: p.privateHint },
  ];
  return (
    <div role="radiogroup" aria-label={p.title} className="grid gap-3 sm:grid-cols-2">
      {opts.map(({ v, Icon, label, hint }) => {
        const on = v === isPrivate;
        return (
          <button
            key={label}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(v)}
            className={`rounded-2xl p-4 text-left transition ${on ? "bg-plum text-white shadow-[0_8px_20px_rgba(54,2,83,0.25)]" : "bg-white/70 text-plum ring-1 ring-line hover:bg-white"}`}
          >
            <span className="flex items-center gap-2 font-bold"><Icon className="h-4.5 w-4.5" /> {label}</span>
            <span className={`mt-1 block text-[0.8125rem] ${on ? "text-white/80" : "text-muted"}`}>{hint}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Group size, plus held seats for people the host is bringing (public gigs). */
export function GroupSize({
  capacity,
  onCapacity,
  guests,
  onGuests,
  isPrivate,
}: {
  capacity: number;
  onCapacity: (n: number) => void;
  guests: number;
  onGuests: (n: number) => void;
  isPrivate: boolean;
}) {
  const n = copy.newGig;
  const held = isPrivate ? capacity - 1 : guests;
  return (
    <>
      <Stepper value={capacity} min={3} max={16} onChange={onCapacity} label={n.howMany} />

      {!isPrivate && (
        <div className="mt-6 rounded-2xl bg-sun-100/60 p-4 ring-1 ring-sun/30">
          <p className="flex items-center gap-2 text-[0.9375rem] font-bold text-plum">
            <UserPlus className="h-4.5 w-4.5" /> {n.guests}
          </p>
          <p className="mt-1 text-[0.8125rem] text-[#6b4400]">{n.guestsHint}</p>
          <div className="mt-3">
            <Stepper value={guests} min={0} max={Math.max(0, capacity - 2)} onChange={onGuests} label={n.guests} zeroLabel={n.guestsNone} />
          </div>
        </div>
      )}

      <div className="mt-5 rounded-2xl bg-white/70 p-4 ring-1 ring-line">
        <SlotStrip capacity={capacity} claimed={1} reserved={held} minToConfirm={3} privateGig={isPrivate} crew={[{ userId: "you", name: copy.lobby.you }]} />
        <p className="mt-2 text-[0.8125rem] font-semibold text-plum">
          {isPrivate ? copy.privacy.allHeld(held) : n.openSpots(capacity - 1 - guests)}
        </p>
      </div>
    </>
  );
}
