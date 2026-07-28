"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { copy } from "@/lib/copy";

const FIELD =
  "w-full rounded-[var(--radius-chip)] border-2 border-[var(--color-ink)] bg-[var(--color-chalk)] px-3 py-2.5 text-[1rem] outline-none";

const HANDLE_RE = /^[a-z0-9_]{3,20}$/;

/**
 * Email + password auth (sign in / sign up in one card). Signup collects a name
 * and a username, passed as auth metadata — the profiles trigger (0015) turns
 * those into display_name + handle. With email confirmation off in Supabase,
 * signup returns a session and drops the user straight into the app.
 */
export function SignInForm({ next = "/feed" }: { next?: string }) {
  const router = useRouter();
  const supabase = createClient();
  const c = copy.auth;

  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function mapAuthError(message: string): string {
    const m = message.toLowerCase();
    if (m.includes("already registered") || m.includes("already been registered")) return c.errors.email_in_use;
    if (m.includes("invalid login")) return c.errors.bad_credentials;
    if (m.includes("password")) return c.errors.weak_password;
    return c.errors.generic;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (mode === "signin") {
      setBusy(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setError(mapAuthError(error.message));
      router.push(next);
      router.refresh();
      return;
    }

    // ── sign up ────────────────────────────────────────────────────────────
    const handle = username.trim().toLowerCase();
    if (!HANDLE_RE.test(handle)) return setError(c.errors.username_format);
    if (password.length < 8) return setError(c.errors.weak_password);
    if (name.trim().length < 1) return setError(c.errors.generic);

    setBusy(true);
    // Pre-check the username so we can say "taken" before creating the account.
    const { data: available } = await supabase.rpc("check_handle", { p_handle: handle });
    if (available === false) {
      setBusy(false);
      return setError(c.errors.username_taken);
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { display_name: name.trim(), handle } },
    });
    setBusy(false);
    if (error) return setError(mapAuthError(error.message));

    if (data.session) {
      // email confirmation is off → straight in
      router.push(next);
      router.refresh();
    } else {
      // confirmation is on → they must confirm first
      setNotice(c.confirmEmail);
    }
  }

  if (notice) {
    return (
      <Card className="p-6">
        <p className="text-[0.9375rem]">{notice}</p>
      </Card>
    );
  }

  const isSignup = mode === "signup";

  return (
    <Card className="p-6">
      <h1 className="mb-4 font-display text-[1.375rem] font-700">
        {isSignup ? c.signUpTitle : c.signInTitle}
      </h1>
      <form onSubmit={submit} noValidate className="space-y-3">
        {isSignup && (
          <>
            <Field id="name" label={c.name} value={name} onChange={setName}
              placeholder={c.namePlaceholder} autoComplete="given-name" />
            <div>
              <Field id="username" label={c.username} value={username}
                onChange={(v) => setUsername(v.toLowerCase())} placeholder={c.usernamePlaceholder}
                autoComplete="username" />
              <p className="mt-1 text-[0.8125rem] text-[var(--color-dust)]">{c.usernameHint}</p>
            </div>
          </>
        )}
        <Field id="email" label={c.email} type="email" value={email} onChange={setEmail}
          placeholder="you@example.com" autoComplete="email" />
        <div>
          <Field id="password" label={c.password} type="password" value={password}
            onChange={setPassword} autoComplete={isSignup ? "new-password" : "current-password"} />
          {isSignup && <p className="mt-1 text-[0.8125rem] text-[var(--color-dust)]">{c.passwordHint}</p>}
        </div>

        {error && <p className="text-[0.875rem] text-[var(--color-tape)]">{error}</p>}

        <Button type="submit" disabled={busy} className="w-full">
          {busy ? c.working : isSignup ? c.signUpCta : c.signInCta}
        </Button>
      </form>

      <button
        onClick={() => {
          setMode(isSignup ? "signin" : "signup");
          setError(null);
        }}
        className="mt-4 block w-full text-center text-[0.875rem] text-[var(--color-net)] hover:underline"
      >
        {isSignup ? c.toggleToSignIn : c.toggleToSignUp}
      </button>
    </Card>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[0.875rem] font-500">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={FIELD}
      />
    </div>
  );
}
