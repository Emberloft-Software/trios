"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database, ModAction } from "@/lib/database.types";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

async function requireAdmin(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  return data?.is_admin ? user.id : null;
}

const BAN_FAR_FUTURE = "2099-01-01T00:00:00Z";

const schema = z.object({
  targetId: z.string().uuid(),
  action: z.enum(["warn", "restrict_posting", "restrict_joining", "suspend", "ban", "clear"]),
  reason: z.string().min(3).max(1000),
  durationDays: z.coerce.number().int().min(1).max(3650).optional(),
});

export type AdminResult = { ok: true } | { ok: false; error: string };

/**
 * Apply a step of the moderation ladder (docs/06). Re-checks admin server-side,
 * writes moderation_actions + the relevant profile state + admin_audit, and
 * notifies the user (every action is appealable by email).
 *
 *   warn              notice only, no functional change
 *   restrict_posting  can join, can't host        → posting_restricted_until
 *   restrict_joining  can't join (time-boxed)     → joining_restricted_until
 *   suspend           blocked at claim/create     → suspended_until
 *   ban               permanent                   → suspended_until (far future)
 *   clear             lift all restrictions
 */
export async function moderateUserAction(input: unknown): Promise<AdminResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Give a reason (a few words at least)." };
  const { targetId, action, reason, durationDays } = parsed.data;

  const adminId = await requireAdmin();
  if (!adminId) return { ok: false, error: "Not allowed." };
  if (targetId === adminId) return { ok: false, error: "You can't moderate yourself." };

  const admin = createAdminClient();
  const until =
    durationDays != null
      ? new Date(Date.now() + durationDays * 86400000).toISOString()
      : new Date(Date.now() + 30 * 86400000).toISOString(); // default 30 days

  // profile state change per rung
  const patch: ProfileUpdate = {};
  let expiresAt: string | null = null;
  switch (action) {
    case "restrict_posting":
      patch.posting_restricted_until = until;
      expiresAt = until;
      break;
    case "restrict_joining":
      patch.joining_restricted_until = until;
      expiresAt = until;
      break;
    case "suspend":
      patch.suspended_until = until;
      expiresAt = until;
      break;
    case "ban":
      patch.suspended_until = BAN_FAR_FUTURE;
      break;
    case "clear":
      patch.posting_restricted_until = null;
      patch.joining_restricted_until = null;
      patch.suspended_until = null;
      break;
    case "warn":
    default:
      break;
  }

  if (Object.keys(patch).length > 0) {
    await admin.from("profiles").update(patch).eq("id", targetId);
  }

  await admin.from("moderation_actions").insert({
    admin_id: adminId,
    target_id: targetId,
    action: action as ModAction,
    reason,
    expires_at: expiresAt,
  });

  await admin.from("admin_audit").insert({
    admin_id: adminId,
    action: `moderation.${action}`,
    target_type: "user",
    target_id: targetId,
    reason,
  });

  await admin.from("notification_outbox").insert({
    user_id: targetId,
    kind: "moderation_action",
    payload: { action, reason },
  });

  revalidatePath(`/admin/users/${targetId}`);
  revalidatePath("/admin");
  return { ok: true };
}

/** Force-verify or revoke verification (docs/07). */
export async function setVerificationAction(
  targetId: string,
  verified: boolean,
): Promise<AdminResult> {
  if (!z.string().uuid().safeParse(targetId).success) return { ok: false, error: "Bad id." };
  const adminId = await requireAdmin();
  if (!adminId) return { ok: false, error: "Not allowed." };

  const admin = createAdminClient();
  await admin
    .from("profiles")
    .update({
      verification_status: verified ? "verified" : "unverified",
      verified_at: verified ? new Date().toISOString() : null,
    })
    .eq("id", targetId);

  await admin.from("admin_audit").insert({
    admin_id: adminId,
    action: verified ? "verification.force" : "verification.revoke",
    target_type: "user",
    target_id: targetId,
  });

  revalidatePath(`/admin/users/${targetId}`);
  return { ok: true };
}
