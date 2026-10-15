"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { adminContext, audit } from "../_lib";

export type ChatFlagResult = { ok: true } | { ok: false; error: string };

const ERRORS: Record<string, string> = {
  gig_not_active: "That gig has already finished, so there's nobody to remove.",
  target_not_in_crew: "They're no longer in this gig.",
  cannot_remove_host: "Hosts can't be removed from their own gig. Cancel the gig or restrict the account instead.",
  reason_too_short: "Add a short reason.",
};

async function load(flagId: string) {
  const ctx = await adminContext();
  if (!ctx) return null;
  const { data: flag } = await ctx.db.from("chat_flags").select("*").eq("id", flagId).maybeSingle();
  return flag ? { ...ctx, flag } : null;
}

async function close(c: NonNullable<Awaited<ReturnType<typeof load>>>, status: "actioned" | "dismissed", action: string) {
  const prev = c.flag.action ? `${c.flag.action}, ` : "";
  await c.db
    .from("chat_flags")
    .update({ status, action: status === "dismissed" ? "dismissed" : `${prev}${action}`, reviewed_by: c.adminId, reviewed_at: new Date().toISOString() })
    .eq("id", c.flag.id);
  revalidatePath("/admin/chat");
  revalidatePath("/admin");
}

const id = z.string().uuid();

export async function deleteFlaggedMessageAction(flagId: string): Promise<ChatFlagResult> {
  if (!id.safeParse(flagId).success) return { ok: false, error: "Bad request." };
  const c = await load(flagId);
  if (!c) return { ok: false, error: "Not allowed." };
  if (c.flag.message_id) {
    const { error } = await c.db.rpc("admin_delete_message", { p_message_id: c.flag.message_id, p_admin: c.adminId });
    if (error) return { ok: false, error: "Couldn't remove the message." };
  }
  await audit(c.db, { admin_id: c.adminId, action: "chat.delete_message", target_type: "user", target_id: c.flag.user_id, meta: { flag_id: c.flag.id, gig_id: c.flag.gig_id } });
  await close(c, "actioned", "message removed");
  return { ok: true };
}

export async function removeFlaggedUserAction(flagId: string, reason: string): Promise<ChatFlagResult> {
  if (!id.safeParse(flagId).success) return { ok: false, error: "Bad request." };
  const r = reason.trim().slice(0, 500);
  if (r.length < 3) return { ok: false, error: ERRORS.reason_too_short };
  const c = await load(flagId);
  if (!c || !c.flag.user_id) return { ok: false, error: "Not allowed." };
  const { error } = await c.db.rpc("admin_remove_crew_member", { p_gig_id: c.flag.gig_id, p_target: c.flag.user_id, p_reason: r, p_admin: c.adminId });
  if (error) return { ok: false, error: ERRORS[error.message] ?? "Couldn't remove them." };
  await audit(c.db, { admin_id: c.adminId, action: "chat.remove_from_gig", target_type: "user", target_id: c.flag.user_id, reason: r, meta: { flag_id: c.flag.id, gig_id: c.flag.gig_id } });
  await close(c, "actioned", "removed from gig");
  revalidatePath(`/gigs/${c.flag.gig_id}`);
  return { ok: true };
}

export async function dismissFlagAction(flagId: string): Promise<ChatFlagResult> {
  if (!id.safeParse(flagId).success) return { ok: false, error: "Bad request." };
  const c = await load(flagId);
  if (!c) return { ok: false, error: "Not allowed." };
  await audit(c.db, { admin_id: c.adminId, action: "chat.dismiss_flag", target_type: "user", target_id: c.flag.user_id, meta: { flag_id: c.flag.id } });
  await close(c, "dismissed", "dismissed");
  return { ok: true };
}
