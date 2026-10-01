"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, UserPlus } from "lucide-react";
import { SlotStrip } from "@/components/ui/SlotStrip";
import { Button } from "@/components/ui/Button";
import { Checkbox, FieldError, Hint, Input, Label, Segmented, Select, Textarea } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";
import { VenuePicker } from "@/components/gig/VenuePicker";
import { copy } from "@/lib/copy";
import { colomboLocalToUtcISO, toColomboLocalInput } from "@/lib/time";
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

type GenderPref = "everyone" | "women" | "men";
const DURATIONS = [60, 90, 120, 180, 240];
const AGE_PRESETS: [number, number][] = [
  [18, 99],
  [18, 25],
  [21, 30],
  [25, 35],
  [30, 45],
  [40, 99],
];
const AGES = Array.from({ length: 82 }, (_, i) => i + 18);

export function NewGigForm({
  activities,
  hostAge,
  hostGender,
}: {
  activities: Activity[];
  hostAge: number;
  hostGender: "woman" | "man" | "nonbinary";
}) {
  const router = useRouter();
  const n = copy.newGig;
  const [pending, start] = useTransition();

  const [activityId, setActivityId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState<PickedVenue | null>(null);
  const [startsAtLocal, setStartsAtLocal] = useState("");
  const [durationMin, setDurationMin] = useState(90);
  const [notes, setNotes] = useState("");
  const [costNote, setCostNote] = useState("");
  const [genderPref, setGenderPref] = useState<GenderPref>("everyone");
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(99);
  const [capacity, setCapacity] = useState(4);
  const [guests, setGuests] = useState(0);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const minLocal = toColomboLocalInput(new Date(Date.now() + 3 * 3600e3 + 5 * 60e3));
  const maxLocal = toColomboLocalInput(new Date(Date.now() + 59 * 864e5));
  const hostOutside = hostAge < ageMin || hostAge > ageMax;
  const maxGuests = Math.max(0, capacity - 2);
  const genderOptions: { value: GenderPref; label: string }[] = [
    { value: "everyone", label: copy.audience.everyone },
    ...(hostGender === "woman" ? [{ value: "women" as const, label: copy.audience.women }] : []),
    ...(hostGender === "man" ? [{ value: "men" as const, label: copy.audience.men }] : []),
  ];

  const grouped = useMemo(() => {
    const m = new Map<string, Activity[]>();
    activities.forEach((a) => m.set(a.category, [...(m.get(a.category) ?? []), a]));
    return [...m.entries()];
  }, [activities]);

  function pickActivity(a: Activity) {
    setActivityId(a.id);
    setCapacity(a.default_capacity);
    setGuests((g) => Math.min(g, Math.max(0, a.default_capacity - 2)));
  }

  function changeCapacity(c: number) {
    const next = Math.max(3, Math.min(16, c));
    setCapacity(next);
    setGuests((g) => Math.min(g, next - 2));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!activityId) return setError(n.pickActivity);
    if (title.trim().length < 4) return setError(n.title);
    if (!startsAtLocal) return setError(copy.gig.needTime);
    if (!venue) return setError(copy.gig.needVenue);
    if (hostOutside) return setError(copy.errors.host_outside_age_range);
    if (!agree) return setError(copy.gig.mustAgree);

    start(async () => {
      const res = await createGigAction({
        activityId,
        title: title.trim(),
        venueId: venue.id,
        placeLabel: venue.name,
        lat: venue.lat,
        lng: venue.lng,
        startsAt: colomboLocalToUtcISO(startsAtLocal),
        capacity,
        durationMin,
        notes: notes || null,
        costNote: costNote || null,
        ageMin,
        ageMax,
        genderPref,
        hostGuests: guests,
      });
      if (!res.ok) return setError(res.error);
      router.push(`/gigs/${res.gigId}?created=1`);
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* 1. Activity */}
      <Step n={1} title={n.pickActivity}>
        <div className="space-y-4">
          {grouped.map(([cat, list]) => (
            <div key={cat}>
              <p className="mb-2 text-[0.75rem] font-bold uppercase tracking-wider text-muted">{cat}</p>
              <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0">
                {list.map((a) => {
                  const active = a.id === activityId;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => pickActivity(a)}
                      aria-pressed={active}
                      className={`flex w-[5.75rem] shrink-0 flex-col items-center gap-1 rounded-2xl px-2 py-3 text-[0.8125rem] font-semibold transition sm:w-auto ${
                        active
                          ? "bg-plum text-white shadow-[0_8px_20px_rgba(54,2,83,0.25)]"
                          : "bg-white/75 text-plum ring-1 ring-line hover:bg-white"
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
      </Step>

      {/* 2. Details */}
      <Step n={2} title={n.step2}>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">{n.title}</Label>
            <Input id="title" maxLength={80} value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder={n.titlePlaceholder} />
          </div>
          <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
            <div>
              <Label htmlFor="when">{n.when}</Label>
              <Input id="when" type="datetime-local" className="tabular" min={minLocal} max={maxLocal} value={startsAtLocal}
                onChange={(e) => setStartsAtLocal(e.target.value)} />
              <Hint>{n.whenHint}</Hint>
            </div>
            <div>
              <Label htmlFor="dur">{n.length}</Label>
              <Select id="dur" value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))}>
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>{d < 60 ? `${d} ${n.minutes}` : `${d / 60} h`}</option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label>{n.where}</Label>
            <VenuePicker value={venue} onPick={setVenue} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="cost" optional={n.optional}>{n.costNote}</Label>
              <Input id="cost" maxLength={120} value={costNote} onChange={(e) => setCostNote(e.target.value)} placeholder={n.costPlaceholder} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="notes" optional={n.optional}>{n.notes}</Label>
              <Textarea id="notes" rows={3} maxLength={600} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={n.notesPlaceholder} />
            </div>
          </div>
        </div>
      </Step>

      {/* 3. Audience */}
      <Step n={3} title={n.audience} sub={n.audienceHint}>
        <div className="space-y-5">
          {genderOptions.length > 1 && (
            <div>
              <Label>{n.gender}</Label>
              <Segmented<GenderPref> name={n.gender} value={genderPref} onChange={setGenderPref} options={genderOptions} />
            </div>
          )}
          <div>
            <Label>{n.ageRange}</Label>
            <div className="mb-3 flex flex-wrap gap-2">
              {AGE_PRESETS.map(([a, b]) => {
                const active = a === ageMin && b === ageMax;
                const disabled = hostAge < a || hostAge > b;
                return (
                  <button
                    key={`${a}-${b}`}
                    type="button"
                    disabled={disabled}
                    onClick={() => { setAgeMin(a); setAgeMax(b); }}
                    className={`rounded-full px-3.5 py-1.5 text-[0.8125rem] font-semibold transition disabled:opacity-35 ${
                      active ? "bg-plum text-white" : "bg-white/80 text-plum ring-1 ring-line hover:bg-white"
                    }`}
                  >
                    {copy.audience.ages(a, b)}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-3">
              <Select aria-label="Minimum age" value={ageMin} onChange={(e) => { const v = Number(e.target.value); setAgeMin(v); if (v > ageMax) setAgeMax(v); }}>
                {AGES.map((a) => <option key={a} value={a}>{a}</option>)}
              </Select>
              <span className="text-muted">–</span>
              <Select aria-label="Maximum age" value={ageMax} onChange={(e) => { const v = Number(e.target.value); setAgeMax(v); if (v < ageMin) setAgeMin(v); }}>
                {AGES.map((a) => <option key={a} value={a}>{a === 99 ? "99+" : a}</option>)}
              </Select>
            </div>
            {hostOutside ? <FieldError>{copy.errors.host_outside_age_range}</FieldError> : <Hint>{n.ageRangeHint}</Hint>}
          </div>
        </div>
      </Step>

      {/* 4. Size + guests */}
      <Step n={4} title={n.howMany} sub={n.howManyHint}>
        <Stepper value={capacity} min={3} max={16} onChange={changeCapacity} label={n.howMany} />

        <div className="mt-6 rounded-2xl bg-sun-100/60 p-4 ring-1 ring-sun/30">
          <p className="flex items-center gap-2 text-[0.9375rem] font-bold text-plum">
            <UserPlus className="h-4.5 w-4.5" /> {n.guests}
          </p>
          <p className="mt-1 text-[0.8125rem] text-[#6b4400]">{n.guestsHint}</p>
          <div className="mt-3">
            <Stepper value={guests} min={0} max={maxGuests} onChange={setGuests} label={n.guests} zeroLabel={n.guestsNone} />
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-white/70 p-4 ring-1 ring-line">
          <SlotStrip capacity={capacity} claimed={1} reserved={guests} minToConfirm={3} crew={[{ userId: "you", name: copy.lobby.you }]} />
          <p className="mt-2 text-[0.8125rem] font-semibold text-plum">{n.openSpots(capacity - 1 - guests)}</p>
        </div>
      </Step>

      <div className="glass space-y-4 rounded-[1.75rem] p-5">
        <Checkbox id="agree" checked={agree} onChange={setAgree}>{copy.platonicClause.checkbox}</Checkbox>
        <Notice tone="info" compact>{copy.disclaimers.meetPublic}</Notice>
      </div>

      {error && <Notice tone="danger">{error}</Notice>}

      <Button type="submit" size="lg" block loading={pending}>{n.submit}</Button>
    </form>
  );
}

function Step({ n, title, sub, children }: { n: number; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="glass rounded-[1.75rem] p-5 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-coral text-[0.8125rem] font-bold text-white">{n}</span>
        <div>
          <h2 className="text-[1.0625rem] font-bold">{title}</h2>
          {sub && <p className="text-[0.8125rem] text-muted">{sub}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Stepper({
  value,
  min,
  max,
  onChange,
  label,
  zeroLabel,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  label: string;
  zeroLabel?: string;
}) {
  return (
    <div className="flex items-center gap-4" role="group" aria-label={label}>
      <button type="button" aria-label="Fewer" disabled={value <= min} onClick={() => onChange(value - 1)}
        className="grid h-11 w-11 place-items-center rounded-full bg-white text-plum ring-1 ring-line transition hover:bg-plum-50 disabled:opacity-40">
        <Minus className="h-5 w-5" />
      </button>
      <span className="min-w-16 text-center text-[1.75rem] font-extrabold text-plum tabular" aria-live="polite">
        {value === 0 && zeroLabel ? <span className="text-[1rem] font-bold">{zeroLabel}</span> : value}
      </span>
      <button type="button" aria-label="More" disabled={value >= max} onClick={() => onChange(value + 1)}
        className="grid h-11 w-11 place-items-center rounded-full bg-white text-plum ring-1 ring-line transition hover:bg-plum-50 disabled:opacity-40">
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );
}
