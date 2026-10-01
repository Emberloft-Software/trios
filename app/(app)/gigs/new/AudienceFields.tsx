"use client";

import { FieldError, Hint, Label, Segmented, Select } from "@/components/ui/Field";
import { copy } from "@/lib/copy";

export type GenderPref = "everyone" | "women" | "men";

const AGE_PRESETS: [number, number][] = [
  [18, 99],
  [18, 25],
  [21, 30],
  [25, 35],
  [30, 45],
  [40, 99],
];
const AGES = Array.from({ length: 82 }, (_, i) => i + 18);

/** Who can see and join: gender audience + age range (host must fit both). */
export function AudienceFields({
  hostAge,
  hostGender,
  genderPref,
  onGender,
  ageMin,
  ageMax,
  onAges,
}: {
  hostAge: number;
  hostGender: "woman" | "man" | "nonbinary";
  genderPref: GenderPref;
  onGender: (g: GenderPref) => void;
  ageMin: number;
  ageMax: number;
  onAges: (min: number, max: number) => void;
}) {
  const n = copy.newGig;
  const hostOutside = hostAge < ageMin || hostAge > ageMax;
  const options: { value: GenderPref; label: string }[] = [
    { value: "everyone", label: copy.audience.everyone },
    ...(hostGender === "woman" ? [{ value: "women" as const, label: copy.audience.women }] : []),
    ...(hostGender === "man" ? [{ value: "men" as const, label: copy.audience.men }] : []),
  ];

  return (
    <div className="space-y-5">
      {options.length > 1 && (
        <div>
          <Label>{n.gender}</Label>
          <Segmented<GenderPref> name={n.gender} value={genderPref} onChange={onGender} options={options} />
        </div>
      )}
      <div>
        <Label>{n.ageRange}</Label>
        <div className="mb-3 flex flex-wrap gap-2">
          {AGE_PRESETS.map(([a, b]) => (
            <button
              key={`${a}-${b}`}
              type="button"
              disabled={hostAge < a || hostAge > b}
              onClick={() => onAges(a, b)}
              className={`rounded-full px-3.5 py-1.5 text-[0.8125rem] font-semibold transition disabled:opacity-35 ${
                a === ageMin && b === ageMax ? "bg-plum text-white" : "bg-white/80 text-plum ring-1 ring-line hover:bg-white"
              }`}
            >
              {copy.audience.ages(a, b)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Select aria-label="Minimum age" value={ageMin} onChange={(e) => { const v = Number(e.target.value); onAges(v, Math.max(v, ageMax)); }}>
            {AGES.map((a) => <option key={a} value={a}>{a}</option>)}
          </Select>
          <span className="text-muted">–</span>
          <Select aria-label="Maximum age" value={ageMax} onChange={(e) => { const v = Number(e.target.value); onAges(Math.min(v, ageMin), v); }}>
            {AGES.map((a) => <option key={a} value={a}>{a === 99 ? "99+" : a}</option>)}
          </Select>
        </div>
        {hostOutside ? <FieldError>{copy.errors.host_outside_age_range}</FieldError> : <Hint>{n.ageRangeHint}</Hint>}
      </div>
    </div>
  );
}
