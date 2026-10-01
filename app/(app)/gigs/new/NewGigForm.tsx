"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { SlotStrip } from "@/components/ui/SlotStrip";
import { Button } from "@/components/ui/Button";
import { Checkbox, Hint, Input, Label, Select, Textarea } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";
import { VenuePicker } from "@/components/gig/VenuePicker";
import { copy } from "@/lib/copy";
import { colomboLocalToUtcISO, toColomboLocalInput } from "@/lib/time";
import { createGigAction } from "./_actions";
import { Step, Stepper } from "./form-parts";
import { ActivityPicker, type Activity } from "./ActivityPicker";
import { AudienceFields, type GenderPref } from "./AudienceFields";
import type { PickedVenue } from "./venue-actions";


const DURATIONS = [60, 90, 120, 180, 240];

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
        <ActivityPicker activities={activities} value={activityId} onPick={pickActivity} />
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
        <AudienceFields
          hostAge={hostAge}
          hostGender={hostGender}
          genderPref={genderPref}
          onGender={setGenderPref}
          ageMin={ageMin}
          ageMax={ageMax}
          onAges={(lo, hi) => {
            setAgeMin(lo);
            setAgeMax(hi);
          }}
        />
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
