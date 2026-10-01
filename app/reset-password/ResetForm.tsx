"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FieldError, Hint, Input, Label } from "@/components/ui/Field";
import { copy } from "@/lib/copy";
import { updatePasswordAction } from "@/app/sign-in/_actions";

export function ResetForm() {
  const router = useRouter();
  const c = copy.auth;
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="animate-rise">
      <h1 className="text-[1.875rem] font-extrabold">{c.newPasswordTitle}</h1>
      <form
        className="glass mt-6 space-y-4 rounded-[1.75rem] p-6"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          start(async () => {
            const res = await updatePasswordAction(password);
            if (!res.ok) return setError(c.errors[res.error] ?? c.errors.generic);
            router.replace("/feed");
          });
        }}
      >
        <div>
          <Label htmlFor="pw">{c.password}</Label>
          <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" minLength={8} required />
          <Hint>{c.passwordHint}</Hint>
          <FieldError>{error}</FieldError>
        </div>
        <Button type="submit" size="lg" block loading={pending}>{c.newPasswordCta}</Button>
      </form>
    </div>
  );
}
