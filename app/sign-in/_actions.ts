"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteURL } from "@/lib/site-url";
import { ageFrom } from "@/lib/time";

export type AuthResult =
  | { ok: true; needsConfirmation?: boolean }
  | { ok: false; error: string; field?: string };

const HANDLE_RE = /^[a-z0-9_]{3,20}$/;

/** Only same-site paths, never protocol-relative ones. */
function safeNext(next: unknown): string {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/feed";
}


function mapAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("already registered") || m.includes("already been registered") || m.includes("already exists")) return "email_in_use";
  if (m.includes("invalid login") || m.includes("invalid credentials")) return "bad_credentials";
  if (m.includes("email not confirmed")) return "email_not_confirmed";
  if (m.includes("rate limit") || m.includes("too many")) return "rate_limited";
  if (m.includes("password")) return "weak_password";
  if (m.includes("database error")) return "underage";
  return "generic";
}

const signInSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function signInAction(input: unknown, next?: string): Promise<AuthResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "bad_credentials" };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { ok: false, error: mapAuthError(error.message) };
  redirect(safeNext(next)); // server-side, so a stray client refresh can't cancel it
}

const signUpSchema = z.object({
  name: z.string().trim().min(1, "name_required").max(40),
  handle: z.string().trim().toLowerCase().regex(HANDLE_RE, "username_format"),
  email: z.string().trim().email("email_invalid"),
  password: z.string().min(8, "weak_password").max(72),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "birth_required"),
  gender: z.enum(["woman", "man", "nonbinary"], { message: "gender_required" }),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: "terms_required" }) }),
});

/**
 * Sign-up is a server action so age/gender/terms are validated here AND in the
 * database trigger (which refuses under-18s outright).
 */
export async function signUpAction(input: unknown, next?: string): Promise<AuthResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: issue?.message ?? "generic", field: String(issue?.path[0] ?? "") };
  }
  const v = parsed.data;
  const age = ageFrom(v.birthDate);
  if (Number.isNaN(age) || age > 100) return { ok: false, error: "birth_required", field: "birthDate" };
  if (age < 18) return { ok: false, error: "underage", field: "birthDate" };

  const supabase = await createClient();
  const { data: available } = await supabase.rpc("check_handle", { p_handle: v.handle });
  if (available === false) return { ok: false, error: "username_taken", field: "handle" };

  const { data, error } = await supabase.auth.signUp({
    email: v.email,
    password: v.password,
    options: {
      emailRedirectTo: `${getSiteURL()}/auth/callback?next=/feed`,
      data: {
        display_name: v.name,
        handle: v.handle,
        birth_date: v.birthDate,
        gender: v.gender,
        accepted_terms: "true",
      },
    },
  });
  if (error) return { ok: false, error: mapAuthError(error.message) };
  // Supabase returns a user with no identities when the email already exists
  // (to avoid leaking accounts) — treat it as "email in use".
  if (data.user && (data.user.identities?.length ?? 0) === 0) return { ok: false, error: "email_in_use", field: "email" };
  if (!data.session) return { ok: true, needsConfirmation: true };
  redirect(safeNext(next));
}

export async function checkHandleAction(handle: string): Promise<boolean | null> {
  const h = handle.trim().toLowerCase();
  if (!HANDLE_RE.test(h)) return null;
  const supabase = await createClient();
  const { data } = await supabase.rpc("check_handle", { p_handle: h });
  return data ?? null;
}

export async function requestPasswordResetAction(email: string): Promise<AuthResult> {
  const parsed = z.string().trim().email().safeParse(email);
  if (!parsed.success) return { ok: false, error: "email_invalid" };
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${getSiteURL()}/auth/callback?next=/reset-password`,
  });
  if (error && mapAuthError(error.message) === "rate_limited") return { ok: false, error: "rate_limited" };
  return { ok: true }; // never reveal whether the account exists
}

export async function updatePasswordAction(password: string): Promise<AuthResult> {
  if (password.length < 8) return { ok: false, error: "weak_password" };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, error: mapAuthError(error.message) };
  redirect("/feed");
}
