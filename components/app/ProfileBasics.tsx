"use client";

import Link from "next/link";
import { Checkbox, FieldError, Hint, Input, Label, Segmented } from "@/components/ui/Field";
import { copy } from "@/lib/copy";

export type Gender = "woman" | "man" | "nonbinary";

function maxBirthDate() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().slice(0, 10);
}

/** Date of birth (18+), gender and Terms/Privacy — used by sign-up and onboarding. */
export function ProfileBasics({
  birthDate,
  onBirthDate,
  gender,
  onGender,
  terms,
  onTerms,
  errors = {},
}: {
  birthDate: string;
  onBirthDate: (v: string) => void;
  gender: Gender | null;
  onGender: (g: Gender) => void;
  terms: boolean;
  onTerms: (v: boolean) => void;
  errors?: Partial<Record<"birthDate" | "gender" | "terms", string | null>>;
}) {
  const c = copy.auth;
  return (
    <>
      <div>
        <Label htmlFor="dob">{c.birthDate}</Label>
        <Input id="dob" type="date" value={birthDate} max={maxBirthDate()} min="1925-01-01" onChange={(e) => onBirthDate(e.target.value)} required />
        {errors.birthDate ? <FieldError>{errors.birthDate}</FieldError> : <Hint>{c.birthDateHint}</Hint>}
      </div>
      <div>
        <Label>{c.gender}</Label>
        <Segmented<Gender>
          name={c.gender}
          value={gender}
          onChange={onGender}
          options={(["woman", "man", "nonbinary"] as const).map((g) => ({ value: g, label: c.genders[g] }))}
        />
        {errors.gender ? <FieldError>{errors.gender}</FieldError> : <Hint>{c.genderHint}</Hint>}
      </div>
      <div>
        <Checkbox id="terms" checked={terms} onChange={onTerms}>
          {c.terms}{" "}
          <Link href="/terms" target="_blank" className="font-semibold text-coral-600 underline-offset-2 hover:underline">{c.termsLink}</Link>{" "}
          {c.and}{" "}
          <Link href="/privacy" target="_blank" className="font-semibold text-coral-600 underline-offset-2 hover:underline">{c.privacyLink}</Link>.
        </Checkbox>
        <FieldError>{errors.terms}</FieldError>
      </div>
    </>
  );
}
