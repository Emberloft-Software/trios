"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Checkbox, FieldError, Hint, Input, Label, Segmented } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";
import { copy } from "@/lib/copy";
import {
  checkHandleAction,
  requestPasswordResetAction,
  signInAction,
  signUpAction,
} from "./_actions";

type Mode = "signin" | "signup" | "reset";
type Gender = "woman" | "man" | "nonbinary";

function maxBirthDate() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().slice(0, 10);
}

export function SignInForm({ next = "/feed", initialMode = "signup" }: { next?: string; initialMode?: Mode }) {
  const router = useRouter();
  const c = copy.auth;
  const [mode, setMode] = useState<Mode>(initialMode);
  const [pending, start] = useTransition();

  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [handleFree, setHandleFree] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [terms, setTerms] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // live username availability
  useEffect(() => {
    if (mode !== "signup") return;
    setHandleFree(null);
    if (!/^[a-z0-9_]{3,20}$/.test(handle)) return;
    const t = setTimeout(async () => setHandleFree(await checkHandleAction(handle)), 400);
    return () => clearTimeout(t);
  }, [handle, mode]);

  function switchMode(m: Mode) {
    setMode(m);
    setError(null);
    setErrorField(null);
    setNotice(null);
  }

  function fail(code: string, field?: string) {
    setError(c.errors[code] ?? c.errors.generic);
    setErrorField(field ?? null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setErrorField(null);

    start(async () => {
      if (mode === "signin") {
        const res = await signInAction({ email, password });
        if (!res.ok) return fail(res.error);
        router.replace(next);
        router.refresh();
        return;
      }
      if (mode === "reset") {
        const res = await requestPasswordResetAction(email);
        if (!res.ok) return fail(res.error);
        setNotice(c.resetSent);
        return;
      }
      if (!gender) return fail("gender_required", "gender");
      if (!terms) return fail("terms_required", "terms");
      const res = await signUpAction({ name, handle, email, password, birthDate, gender, acceptTerms: terms });
      if (!res.ok) return fail(res.error, res.field);
      if (res.needsConfirmation) {
        setNotice(c.confirmEmail);
        return;
      }
      router.replace(next);
      router.refresh();
    });
  }

  if (notice) {
    return (
      <div className="glass rounded-[1.75rem] p-7 text-center animate-rise">
        <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-mint-50 text-mint">
          <MailCheck className="h-7 w-7" />
        </span>
        <p className="text-[0.9375rem]">{notice}</p>
        <Button variant="secondary" className="mt-5" onClick={() => switchMode("signin")}>
          {c.backToSignIn}
        </Button>
      </div>
    );
  }

  const isSignup = mode === "signup";
  const errFor = (f: string) => (errorField === f ? error : null);

  return (
    <div className="animate-rise">
      <h1 className="text-[1.875rem] font-extrabold">
        {mode === "signin" ? c.signInTitle : mode === "reset" ? c.resetTitle : c.signUpTitle}
      </h1>
      <p className="mt-1 text-[0.9375rem] text-muted">
        {mode === "signin" ? c.signInSub : mode === "reset" ? c.resetSub : c.signUpSub}
      </p>

      <form onSubmit={submit} noValidate className="glass mt-6 space-y-4 rounded-[1.75rem] p-5 sm:p-6">
        {isSignup && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">{c.name}</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={c.namePlaceholder} autoComplete="given-name" maxLength={40} required />
                <FieldError>{errFor("name")}</FieldError>
              </div>
              <div>
                <Label htmlFor="handle">{c.username}</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">@</span>
                  <Input id="handle" value={handle} onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder={c.usernamePlaceholder} autoComplete="username" maxLength={20} className="pl-8" autoCapitalize="none" required />
                </div>
                {handleFree === false ? <FieldError>{c.errors.username_taken}</FieldError> : <FieldError>{errFor("handle")}</FieldError>}
              </div>
            </div>
          </>
        )}

        <div>
          <Label htmlFor="email">{c.email}</Label>
          <Input id="email" type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" autoComplete="email" autoCapitalize="none" required />
          <FieldError>{errFor("email")}</FieldError>
        </div>

        {mode !== "reset" && (
          <div>
            <Label htmlFor="password">{c.password}</Label>
            <div className="relative">
              <Input id="password" type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                autoComplete={isSignup ? "new-password" : "current-password"} className="pr-12" required minLength={isSignup ? 8 : undefined} />
              <button type="button" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-muted hover:text-plum">
                {showPw ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
            {isSignup && !errFor("password") && <Hint>{c.passwordHint}</Hint>}
            <FieldError>{errFor("password")}</FieldError>
            {mode === "signin" && (
              <button type="button" onClick={() => switchMode("reset")} className="mt-2 text-[0.8125rem] font-semibold text-coral-600 hover:underline">
                {c.forgot}
              </button>
            )}
          </div>
        )}

        {isSignup && (
          <>
            <div>
              <Label htmlFor="dob">{c.birthDate}</Label>
              <Input id="dob" type="date" value={birthDate} max={maxBirthDate()} min="1925-01-01" onChange={(e) => setBirthDate(e.target.value)} required />
              {errFor("birthDate") ? <FieldError>{errFor("birthDate")}</FieldError> : <Hint>{c.birthDateHint}</Hint>}
            </div>
            <div>
              <Label>{c.gender}</Label>
              <Segmented<Gender>
                name={c.gender}
                value={gender}
                onChange={setGender}
                options={(["woman", "man", "nonbinary"] as const).map((g) => ({ value: g, label: c.genders[g] }))}
              />
              {errFor("gender") ? <FieldError>{errFor("gender")}</FieldError> : <Hint>{c.genderHint}</Hint>}
            </div>
            <div>
              <Checkbox id="terms" checked={terms} onChange={setTerms}>
                {c.terms}{" "}
                <Link href="/terms" target="_blank" className="font-semibold text-coral-600 underline-offset-2 hover:underline">{c.termsLink}</Link>{" "}
                {c.and}{" "}
                <Link href="/privacy" target="_blank" className="font-semibold text-coral-600 underline-offset-2 hover:underline">{c.privacyLink}</Link>.
              </Checkbox>
              <FieldError>{errFor("terms")}</FieldError>
            </div>
          </>
        )}

        {error && !errorField && <Notice tone="danger" compact>{error}</Notice>}

        <Button type="submit" size="lg" block loading={pending}>
          {mode === "signin" ? c.signInCta : mode === "reset" ? c.resetCta : c.signUpCta}
        </Button>
      </form>

      <div className="mt-5 text-center text-[0.9375rem]">
        {mode === "reset" ? (
          <button onClick={() => switchMode("signin")} className="font-semibold text-plum hover:underline">{c.backToSignIn}</button>
        ) : (
          <button onClick={() => switchMode(isSignup ? "signin" : "signup")} className="font-semibold text-plum hover:underline">
            {isSignup ? c.toggleToSignIn : c.toggleToSignUp}
          </button>
        )}
      </div>
    </div>
  );
}
