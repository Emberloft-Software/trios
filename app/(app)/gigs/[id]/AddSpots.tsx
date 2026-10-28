"use client";

import { useState, useTransition } from "react";
import { UsersRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { Stepper } from "@/app/(app)/gigs/new/form-parts";
import { copy } from "@/lib/copy";
import { increaseCapacityAction } from "./capacity-actions";

/** Host-only: make the group bigger while the gig is still open. */
export function AddSpots({ gigId, capacity, isPrivate }: { gigId: string; capacity: number; isPrivate: boolean }) {
  const t = copy.addSpots;
  const [value, setValue] = useState(capacity);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();
  if (capacity >= 16) return null;
  const added = value - capacity;

  return (
    <section className="glass rounded-2xl p-5">
      <p className="flex items-center gap-2 font-bold text-plum">
        <UsersRound className="h-4.5 w-4.5" /> {t.title}
      </p>
      <p className="mt-1 text-[0.8125rem] text-muted">{isPrivate ? t.hintPrivate : t.hint}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <Stepper value={value} min={capacity} max={16} onChange={(v) => { setValue(v); setDone(false); }} label={t.title} />
        <Button
          size="sm"
          disabled={added <= 0}
          loading={pending}
          onClick={() =>
            start(async () => {
              setError(null);
              const r = await increaseCapacityAction(gigId, value);
              if (!r.ok) return setError(r.error);
              setDone(true);
              // full reload so the new size is on screen everywhere on the page
              // (in-place refreshes after an action can stall in production builds)
              setTimeout(() => window.location.reload(), 700);
            })
          }
        >
          {added > 0 ? t.save(added) : t.saveIdle}
        </Button>
      </div>
      {error && <Notice tone="danger" compact className="mt-3">{error}</Notice>}
      {done && !error && <p className="mt-3 text-[0.8125rem] font-semibold text-mint">{t.done}</p>}
    </section>
  );
}
