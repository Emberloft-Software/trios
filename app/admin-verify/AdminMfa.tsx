/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { KeyRound, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { FieldError, Input, Label } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";

type Enrolment = { factorId: string; qr: string; secret: string };

/** Admin-only screen: enrol an authenticator app, or enter its current code. */
export function AdminMfa({ mode, factorId }: { mode: "enroll" | "challenge"; factorId: string | null }) {
  const supabase = useMemo(() => createClient(), []);
  const [enrolment, setEnrolment] = useState<Enrolment | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function startEnrol() {
    setBusy(true);
    setError(null);
    // clear any half-finished enrolment first (it would block a new one)
    const { data: list } = await supabase.auth.mfa.listFactors();
    for (const f of list?.all ?? []) if (f.factor_type === "totp" && f.status === "unverified") await supabase.auth.mfa.unenroll({ factorId: f.id });
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `Admin ${new Date().toISOString().slice(0, 10)}` });
    setBusy(false);
    if (error || !data) return setError("Couldn't start set-up. Refresh and try again.");
    setEnrolment({ factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    const id = enrolment?.factorId ?? factorId;
    if (!id || !/^\d{6}$/.test(code)) return setError("Enter the 6-digit code from your authenticator app.");
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: id, code });
    if (error) {
      setBusy(false);
      setCode("");
      return setError(/invalid|expired/i.test(error.message) ? "That code didn't match. Wait for a new one and try again." : "Verification failed. Try again.");
    }
    window.location.assign("/admin"); // full load so the server sees the upgraded session
  }

  const codeForm = (
    <form onSubmit={verify} className="mt-5 space-y-3">
      <div>
        <Label htmlFor="otp">6-digit code</Label>
        <Input id="otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className="tabular tracking-[0.3em]" autoFocus />
        <FieldError>{error}</FieldError>
      </div>
      <Button type="submit" size="lg" block loading={busy}>Verify</Button>
    </form>
  );

  return (
    <div className="animate-rise">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-plum text-white">
        {mode === "enroll" ? <KeyRound className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
      </span>
      <h1 className="mt-4 text-[1.875rem] font-extrabold">{mode === "enroll" ? "Set up two-factor sign-in" : "Admin verification"}</h1>
      <p className="mt-1 text-[0.9375rem] text-muted">
        {mode === "enroll"
          ? "Admin access needs a code from an authenticator app (Google Authenticator, Microsoft Authenticator, Authy, 1Password) as well as your password."
          : "Enter the current code from your authenticator app to open the admin area."}
      </p>

      <div className="glass mt-6 rounded-[1.75rem] p-6">
        {mode === "challenge" ? (
          codeForm
        ) : !enrolment ? (
          <>
            <Notice tone="info" compact>Keep your phone handy. You'll scan a QR code, then type the code it shows.</Notice>
            {error && <p className="mt-3 text-[0.8125rem] font-semibold text-coral-600">{error}</p>}
            <Button className="mt-4" size="lg" block loading={busy} onClick={startEnrol}>Start set-up</Button>
          </>
        ) : (
          <>
            <p className="text-[0.875rem] font-semibold text-plum">1. Scan this with your authenticator app</p>
            <div className="mt-3 flex justify-center rounded-2xl bg-white p-3">
              <img src={enrolment.qr} alt="QR code for your authenticator app" width={192} height={192} />
            </div>
            <p className="mt-3 text-[0.8125rem] text-muted">Can&apos;t scan? Enter this key instead:</p>
            <code className="mt-1 block break-all rounded-xl bg-plum/5 px-3 py-2 text-[0.8125rem] font-semibold text-plum">{enrolment.secret}</code>
            <p className="mt-5 text-[0.875rem] font-semibold text-plum">2. Type the 6-digit code it shows</p>
            {codeForm}
          </>
        )}
      </div>
      <p className="mt-4 text-center text-[0.8125rem] text-muted">
        <Link href="/feed" className="font-semibold text-plum hover:underline">Back to the app</Link>
      </p>
    </div>
  );
}
