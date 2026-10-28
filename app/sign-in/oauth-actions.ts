"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requestOrigin } from "@/lib/request-origin";
import { googleEnabled } from "@/lib/auth-providers";

/**
 * Starts "Continue with Google". Google sends the person back through
 * /auth/callback; first-timers then land on /onboarding (date of birth,
 * gender, Terms) because none of that comes from Google.
 */
export async function googleSignInAction(next: string): Promise<{ ok: false; error: string }> {
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/feed";
  if (!(await googleEnabled())) return { ok: false, error: "google_disabled" };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${await requestOrigin()}/auth/callback?next=${encodeURIComponent(safeNext)}`,
      queryParams: { prompt: "select_account" },
    },
  });
  if (error || !data.url) {
    console.error("google oauth:", error?.message);
    return { ok: false, error: /not enabled|unsupported provider/i.test(error?.message ?? "") ? "google_disabled" : "generic" };
  }
  redirect(data.url);
}
