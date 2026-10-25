"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { peekResetTicket, redeemResetTicket } from "@/lib/reset-ticket";

export type ResetResult = { ok: false; error: string } | undefined;

/**
 * Sets a new password from a reset ticket, then signs the account out on
 * every device (so anyone holding an old session is cut off) and sends the
 * person to sign in with the new password.
 */
export async function resetPasswordAction(password: string, confirm: string): Promise<ResetResult> {
  if (typeof password !== "string" || password.length < 8 || password.length > 72) return { ok: false, error: "weak_password" };
  if (password !== confirm) return { ok: false, error: "password_mismatch" };

  const ticket = await peekResetTicket();
  if (!ticket) return { ok: false, error: "reset_expired" };
  const local = ticket.email?.split("@")[0].toLowerCase() ?? "";
  if (local.length >= 4 && password.toLowerCase().includes(local)) return { ok: false, error: "password_like_email" };

  const db = createAdminClient();
  const { error } = await db.auth.admin.updateUserById(ticket.userId, { password });
  if (error) {
    console.error("reset updateUserById:", error.message);
    return { ok: false, error: /weak|short|characters/i.test(error.message) ? "weak_password" : "generic" };
  }
  const userId = await redeemResetTicket();
  if (userId) await db.rpc("revoke_all_sessions", { p_user: userId });
  redirect("/sign-in?mode=signin&reset=done");
}
