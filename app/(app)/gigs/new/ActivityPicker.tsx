"use client";

import { useMemo } from "react";

export interface Activity {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  category: string;
  default_capacity: number;
}

/** Activities grouped by category; a swipeable row per category on phones. */
export function ActivityPicker({
  activities,
  value,
  onPick,
}: {
  activities: Activity[];
  value: string;
  onPick: (a: Activity) => void;
}) {
  const grouped = useMemo(() => {
    const m = new Map<string, Activity[]>();
    activities.forEach((a) => m.set(a.category, [...(m.get(a.category) ?? []), a]));
    return [...m.entries()];
  }, [activities]);

  return (
    <div className="space-y-4">
      {grouped.map(([cat, list]) => (
        <div key={cat}>
          <p className="mb-2 text-[0.75rem] font-bold uppercase tracking-wider text-muted">{cat}</p>
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0">
            {list.map((a) => {
              const active = a.id === value;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => onPick(a)}
                  aria-pressed={active}
                  className={`flex w-[5.75rem] shrink-0 flex-col items-center gap-1 rounded-2xl px-2 py-3 text-[0.8125rem] font-semibold transition sm:w-auto ${
                    active ? "bg-plum text-white shadow-[0_8px_20px_rgba(54,2,83,0.25)]" : "bg-white/75 text-plum ring-1 ring-line hover:bg-white"
                  }`}
                >
                  <span className="text-2xl" aria-hidden>{a.emoji}</span>
                  <span className="text-center leading-tight">{a.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
