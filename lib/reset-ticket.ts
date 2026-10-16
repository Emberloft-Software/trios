import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Single-use password-reset tickets. The emailed link is exchanged for one of
 * these instead of a login session, so opening the link never gets anyone
 * into the app. Only the SHA-256 of the ticket is stored.
 */
export const RESET_COOKIE = "tm_reset";
const TTL_SECONDS = 15 * 60;

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export async function issueResetTicket(userId: string, secure: boolean): Promise<void> {
  const ticket = randomBytes(32).toString("base64url");
  const db = createAdminClient();
  await db.from("password_reset_tickets").delete().eq("user_id", userId); // one live ticket per account
  const { error } = await db.from("password_reset_tickets").insert({
    token_hash: sha256(ticket),
    user_id: userId,
    expires_at: new Date(Date.now() + TTL_SECONDS * 1000).toISOString(),
  });
  if (error) throw new Error(`reset ticket: ${error.message}`);
  (await cookies()).set(RESET_COOKIE, ticket, { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: TTL_SECONDS });
}

/** The account this browser's ticket belongs to, if still valid (does not use it up). */
export async function peekResetTicket(): Promise<{ userId: string; email: string | null } | null> {
  const ticket = (await cookies()).get(RESET_COOKIE)?.value;
  if (!ticket || ticket.length > 100) return null;
  const db = createAdminClient();
  const { data } = await db
    .from("password_reset_tickets")
    .select("user_id")
    .eq("token_hash", sha256(ticket))
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (!data) return null;
  const { data: u } = await db.auth.admin.getUserById(data.user_id);
  return { userId: data.user_id, email: u.user?.email ?? null };
}

/** Uses the ticket up. Returns the account id only the first time. */
export async function redeemResetTicket(): Promise<string | null> {
  const jar = await cookies();
  const ticket = jar.get(RESET_COOKIE)?.value;
  jar.delete(RESET_COOKIE);
  if (!ticket) return null;
  const { data } = await createAdminClient().rpc("redeem_password_reset_ticket", { p_token_hash: sha256(ticket) });
  return data ?? null;
}

/** Shows only the first letter of the address, e.g. c*****@gmail.com */
export function maskEmail(email: string | null): string {
  if (!email) return "";
  const [name, domain] = email.split("@");
  return `${name.slice(0, 1)}${"*".repeat(Math.max(2, Math.min(name.length - 1, 6)))}@${domain}`;
}
