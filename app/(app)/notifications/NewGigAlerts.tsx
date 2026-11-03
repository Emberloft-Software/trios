"use client";

import { useState, useTransition } from "react";
import { copy } from "@/lib/copy";
import { setNewGigAlertsAction } from "./_actions";

/** On/off switch for "new gig" push alerts (on by default). */
export function NewGigAlerts({ initial }: { initial: boolean }) {
  const t = copy.notifications.push;
  const [on, setOn] = useState(initial);
  const [pending, start] = useTransition();
  return (
    <label className="glass mb-5 flex cursor-pointer items-center gap-3 rounded-2xl p-4">
      <span className="min-w-0 flex-1">
        <span className="block font-bold text-plum">{t.newGigAlerts}</span>
        <span className="block text-[0.8125rem] text-muted">{t.newGigAlertsHint}</span>
      </span>
      <input
        type="checkbox"
        role="switch"
        aria-checked={on}
        checked={on}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.checked;
          setOn(next);
          start(async () => {
            const r = await setNewGigAlertsAction(next);
            if (!r.ok) setOn(!next);
          });
        }}
        className="peer sr-only"
      />
      <span aria-hidden className={`relative h-7 w-12 shrink-0 rounded-lg border-2 border-plum transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-coral ${on ? "bg-coral" : "bg-plum/10"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-md border-2 border-plum bg-white transition-all ${on ? "left-[1.375rem]" : "left-0.5"}`} />
      </span>
    </label>
  );
}
