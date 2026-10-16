"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { issueResetTicket } from "@/lib/reset-ticket";
import { requestOrigin } from "@/lib/request-origin";

/**
 * Verifies the emailed reset link (PKCE `code` or `token_hash`), throws the
 * resulting login session away, and swaps it for a single-use 15-minute
 * reset ticket. The link never signs anyone into the app.
 */
export async function confirmResetAction(code: string | null, tokenHash: string | null): Promise<void> {
  const supabase = await createClient();
  let userId: string | null = null;
  if (code && code.length < 200) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) console.error("reset exchange:", error.code, error.message);
    else userId = data.user?.id ?? null;
  } else if (tokenHash && tokenHash.length < 200) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
    if (error) console.error("reset verify:", error.code, error.message);
    else userId = data.user?.id ?? null;
  }
  if (!userId) redirect("/auth/reset?error_code=otp_expired");

  await supabase.auth.signOut({ scope: "local" }); // discard the link's login session
  await issueResetTicket(userId, (await requestOrigin()).startsWith("https:"));
  redirect("/reset-password");
}
