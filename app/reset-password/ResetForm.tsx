"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { FieldError, Hint, Label } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { copy } from "@/lib/copy";
import { resetPasswordAction } from "./_actions";

export function ResetForm({ email }: { email: string }) {
  const c = copy.auth;
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="animate-rise">
      <h1 className="text-[1.875rem] font-extrabold">{c.newPasswordTitle}</h1>
      {email && <p className="mt-1 text-[0.9375rem] text-muted">{c.newPasswordFor(email)}</p>}
      <form
        className="glass mt-6 space-y-4 rounded-2xl p-6"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          if (password.length < 8) return setError(c.errors.weak_password);
          if (password !== confirm) return setError(c.errors.password_mismatch);
          start(async () => {
            const res = await resetPasswordAction(password, confirm);
            if (res && !res.ok) setError(c.errors[res.error] ?? c.errors.generic);
          });
        }}
      >
        <div>
          <Label htmlFor="pw">{c.newPasswordLabel}</Label>
          <PasswordInput id="pw" value={password} onChange={setPassword} autoComplete="new-password" minLength={8} />
          <Hint>{c.passwordHint}</Hint>
        </div>
        <div>
          <Label htmlFor="pw2">{c.confirmPasswordLabel}</Label>
          <PasswordInput id="pw2" value={confirm} onChange={setConfirm} autoComplete="new-password" minLength={8} />
          <FieldError>{error}</FieldError>
        </div>
        <p className="text-[0.8125rem] text-muted">{c.newPasswordSignOutNote}</p>
        <Button type="submit" size="lg" block loading={pending}>{c.newPasswordCta}</Button>
      </form>
    </div>
  );
}
