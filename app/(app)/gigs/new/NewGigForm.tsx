"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SlotStrip } from "@/components/ui/SlotStrip";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { VenuePicker } from "@/components/gig/VenuePicker";
import { copy } from "@/lib/copy";
import { colomboLocalToUtcISO } from "@/lib/time";
import { createGigAction } from "./_actions";
import type { PickedVenue } from "./venue-actions";

interface Activity {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  category: string;
  default_capacity: number;
}

const FIELD =
  "w-full rounded-[var(--radius-chip)] border-2 border-[var(--color-ink)] bg-[var(--color-chalk)] px-3 py-2.5 text-[1rem] outline-none";

/** Create-gig flow (docs/03). Capacity stepper renders a live SlotStrip so the
 *  host sees the shape of the crew they're building. The platonic reminder is
 *  shown before submit. Minimum is 3, enforced again by the DB. */
export function NewGigForm({ activities }: { activities: Activity[] }) {
  const router = useRouter();
  const [activityId, setActivityId] = useState<string>(activities[0]?.id ?? "");
  const selected = useMemo(
    () => activities.find((a) => a.id === activityId),
    [activities, activityId],
  );
  const [capacity, setCapacity] = useState<number>(selected?.default_capacity ?? 4);
  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState<PickedVenue | null>(null);
  const [startsAtLocal, setStartsAtLocal] = useState("");
  const [durationMin, setDurationMin] = useState(90);
  const [notes, setNotes] = useState("");
  const [costNote, setCostNote] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function pickActivity(id: string) {
    setActivityId(id);
    const a = activities.find((x) => x.id === id);
    if (a) setCapacity(a.default_capacity);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!agree) {
      setError(copy.gig.mustAgree);
      return;
    }
    if (!startsAtLocal) {
      setError(copy.gig.needTime);
      return;
    }
    if (!venue) {
      setError(copy.gig.needVenue);
      return;
    }
    // The datetime-local value is Colombo wall-time — interpret it as Asia/
    // Colombo (not the browser's zone) before converting to a UTC ISO.
    const startsAt = colomboLocalToUtcISO(startsAtLocal);
    setBusy(true);
    const res = await createGigAction({
      activityId,
      title,
      venueId: venue.id,
      placeLabel: venue.name,
      lat: venue.lat,
      lng: venue.lng,
      startsAt,
      capacity,
      durationMin,
      notes: notes || null,
      costNote: costNote || null,
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.push(`/gigs/${res.gigId}`);
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Activity picker */}
      <Card className="p-5">
        <h2 className="mb-3 font-display text-[1.25rem] font-600">{copy.newGig.pickActivity}</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {activities.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => pickActivity(a.id)}
              aria-pressed={a.id === activityId}
              className={`flex flex-col items-center gap-1 rounded-[var(--radius-tile)] border-2 border-[var(--color-ink)] px-2 py-3 text-[0.8125rem] transition-transform hover:-translate-y-[2px] ${
                a.id === activityId
                  ? "bg-[var(--color-line)]"
                  : "bg-[var(--color-chalk)]"
              }`}
            >
              <span className="text-xl" aria-hidden>{a.emoji}</span>
              {a.name}
            </button>
          ))}
        </div>
      </Card>

      {/* When & where */}
      <Card className="p-5 space-y-4">
        <div>
          <label htmlFor="title" className="mb-1 block text-[0.875rem] font-500">{copy.newGig.title}</label>
          <input id="title" className={FIELD} maxLength={80} value={title}
            onChange={(e) => setTitle(e.target.value)} placeholder={copy.newGig.titlePlaceholder} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="when" className="mb-1 block text-[0.875rem] font-500">{copy.newGig.when}</label>
            <input id="when" type="datetime-local" className={`${FIELD} font-data`}
              value={startsAtLocal} onChange={(e) => setStartsAtLocal(e.target.value)} />
          </div>
          <div>
            <label htmlFor="dur" className="mb-1 block text-[0.875rem] font-500">{copy.newGig.length}</label>
            <input id="dur" type="number" min={30} max={480} step={15} className={`${FIELD} font-data`}
              value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))} />
          </div>
        </div>
        <div>
          <span className="mb-1 block text-[0.875rem] font-500">{copy.newGig.where}</span>
          <VenuePicker value={venue} onPick={setVenue} />
        </div>
        <div>
          <label htmlFor="cost" className="mb-1 block text-[0.875rem] font-500">{copy.newGig.costNote}</label>
          <input id="cost" className={FIELD} maxLength={120} value={costNote}
            onChange={(e) => setCostNote(e.target.value)} placeholder={copy.newGig.costPlaceholder} />
        </div>
        <div>
          <label htmlFor="notes" className="mb-1 block text-[0.875rem] font-500">{copy.newGig.notes}</label>
          <textarea id="notes" className={FIELD} rows={3} maxLength={600} value={notes}
            onChange={(e) => setNotes(e.target.value)} placeholder={copy.newGig.notesPlaceholder} />
        </div>
      </Card>

      {/* Capacity stepper with live SlotStrip */}
      <Card className="p-5">
        <h2 className="mb-1 font-display text-[1.25rem] font-600">{copy.newGig.howMany}</h2>
        <p className="mb-4 text-[0.875rem] text-[var(--color-dust)]">
          {copy.newGig.howManyHint}
        </p>
        <div className="mb-4 flex items-center gap-3">
          <button type="button" onClick={() => setCapacity((c) => Math.max(3, c - 1))}
            className="grid h-10 w-10 place-items-center rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-chalk)] text-xl">−</button>
          <span className="font-data w-10 text-center text-2xl">{capacity}</span>
          <button type="button" onClick={() => setCapacity((c) => Math.min(12, c + 1))}
            className="grid h-10 w-10 place-items-center rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-chalk)] text-xl">+</button>
        </div>
        {/* index 0 = host slot; show the host filled */}
        <SlotStrip variant="blind" capacity={capacity} filled={1} minToConfirm={3} />
      </Card>

      {/* Platonic reminder (docs/09) */}
      <Card className="p-5">
        <label className="flex items-start gap-3 text-[0.9375rem]">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)}
            className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-tape)]" />
          <span>{copy.platonicClause.firstGigCheckbox}</span>
        </label>
      </Card>

      {error && <p className="text-[0.9375rem] text-[var(--color-tape)]">{error}</p>}

      <Button type="submit" disabled={busy} loading={busy} className="w-full">
        {copy.newGig.submit}
      </Button>
    </form>
  );
}
