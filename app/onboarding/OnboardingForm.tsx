"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FieldError } from "@/components/ui/Field";
import { ProfileBasics, type Gender } from "@/components/app/ProfileBasics";
import { copy } from "@/lib/copy";
import { completeProfileAction } from "./_actions";


export function OnboardingForm({ next }: { next: string }) {
  const router = useRouter();
  const c = copy.auth;
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

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
        <ProfileBasics birthDate={birthDate} onBirthDate={setBirthDate} gender={gender} onGender={setGender} terms={terms} onTerms={setTerms} />
        <FieldError>{error}</FieldError>
        <Button type="submit" size="lg" block loading={pending}>{copy.onboarding.cta}</Button>
      </form>
    </div>
  );
}
