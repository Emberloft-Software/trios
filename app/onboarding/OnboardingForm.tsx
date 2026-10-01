"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Checkbox, FieldError, Hint, Input, Label, Segmented } from "@/components/ui/Field";
import { copy } from "@/lib/copy";
import { completeProfileAction } from "./_actions";

type Gender = "woman" | "man" | "nonbinary";

export function OnboardingForm({ next }: { next: string }) {
  const router = useRouter();
  const c = copy.auth;
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const max = new Date(Date.now() - 18 * 365.25 * 864e5).toISOString().slice(0, 10);

  return (
    <div className="animate-rise">
      <h1 className="text-[1.875rem] font-extrabold">{copy.onboarding.title}</h1>
      <p className="mt-1 text-[0.9375rem] text-muted">{copy.onboarding.sub}</p>
      <form
        className="glass mt-6 space-y-5 rounded-[1.75rem] p-6"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          start(async () => {
            const res = await completeProfileAction({ birthDate, gender, acceptTerms: terms });
            if (!res.ok) return setError(c.errors[res.error] ?? c.errors.generic);
            router.replace(next);
            router.refresh();
          });
        }}
      >
        <div>
          <Label htmlFor="dob">{c.birthDate}</Label>
          <Input id="dob" type="date" max={max} min="1925-01-01" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required />
          <Hint>{c.birthDateHint}</Hint>
        </div>
        <div>
          <Label>{c.gender}</Label>
          <Segmented<Gender> name={c.gender} value={gender} onChange={setGender}
            options={(["woman", "man", "nonbinary"] as const).map((g) => ({ value: g, label: c.genders[g] }))} />
          <Hint>{c.genderHint}</Hint>
        </div>
        <Checkbox id="terms" checked={terms} onChange={setTerms}>
          {c.terms}{" "}
          <Link href="/terms" target="_blank" className="font-semibold text-coral-600 hover:underline">{c.termsLink}</Link>{" "}
          {c.and}{" "}
          <Link href="/privacy" target="_blank" className="font-semibold text-coral-600 hover:underline">{c.privacyLink}</Link>.
        </Checkbox>
        <FieldError>{error}</FieldError>
        <Button type="submit" size="lg" block loading={pending}>{copy.onboarding.cta}</Button>
      </form>
    </div>
  );
}
