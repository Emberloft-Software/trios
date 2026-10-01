"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { adminContext, audit } from "../_lib";
import type { Database, ModAction } from "@/lib/database.types";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type AdminResult = { ok: true } | { ok: false; error: string };

const BAN_FAR_FUTURE = "2099-01-01T00:00:00Z";

const modSchema = z.object({
  targetId: z.string().uuid(),
  action: z.enum(["warn", "restrict_posting", "restrict_joining", "suspend", "ban", "clear"]),
  reason: z.string().trim().min(3).max(1000),
  durationDays: z.coerce.number().int().min(1).max(3650).optional(),
});

/**
 * Moderation ladder: warn → restrict posting → restrict joining → suspend →
 * ban, or clear. Writes moderation_actions + profile state + audit, and
 * notifies the user (every action is appealable by email).
 */
export async function moderateUserAction(input: unknown): Promise<AdminResult> {
  const parsed = modSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Give a reason (a few words at least)." };
  const { targetId, action, reason, durationDays } = parsed.data;
  const ctx = await adminContext();
  if (!ctx) return { ok: false, error: "Not allowed." };
  const { adminId, db } = ctx;
  if (targetId === adminId) return { ok: false, error: "You can't moderate yourself." };

  const until = new Date(Date.now() + (durationDays ?? 30) * 864e5).toISOString();
  const patch: ProfileUpdate = {};
  let expiresAt: string | null = null;
  switch (action) {
    case "restrict_posting":
      patch.posting_restricted_until = expiresAt = until;
      break;
    case "restrict_joining":
      patch.joining_restricted_until = expiresAt = until;
      break;
    case "suspend":
      patch.suspended_until = expiresAt = until;
      break;
    case "ban":
      patch.suspended_until = BAN_FAR_FUTURE;
      break;
    case "clear":
      patch.posting_restricted_until = null;
      patch.joining_restricted_until = null;
      patch.suspended_until = null;
      break;
  }
  if (Object.keys(patch).length) await db.from("profiles").update(patch).eq("id", targetId);

  await db.from("moderation_actions").insert({ admin_id: adminId, target_id: targetId, action: action as ModAction, reason, expires_at: expiresAt });
  await audit(db, { admin_id: adminId, action: `moderation.${action}`, target_type: "user", target_id: targetId, reason });
  await db.from("notification_outbox").insert({ user_id: targetId, kind: "moderation_action", payload: { action, reason } });

  revalidatePath(`/admin/users/${targetId}`);
  return { ok: true };
}

export async function setVerificationAction(targetId: string, verified: boolean): Promise<AdminResult> {
  if (!z.string().uuid().safeParse(targetId).success) return { ok: false, error: "Bad id." };
  const ctx = await adminContext();
  if (!ctx) return { ok: false, error: "Not allowed." };
  await ctx.db
    .from("profiles")
    .update({ verification_status: verified ? "verified" : "unverified", verified_at: verified ? new Date().toISOString() : null })
    .eq("id", targetId);
  await audit(ctx.db, { admin_id: ctx.adminId, action: verified ? "verification.force" : "verification.revoke", target_type: "user", target_id: targetId });
  revalidatePath(`/admin/users/${targetId}`);
  return { ok: true };
}

const fieldsSchema = z.object({
  targetId: z.string().uuid(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(["woman", "man", "nonbinary"]),
  reason: z.string().trim().min(3).max(500),
});

/** Correct a user's date of birth / gender (users can't change these themselves). */
export async function setProfileFieldsAction(input: unknown): Promise<AdminResult> {
  const parsed = fieldsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Check the fields and add a reason." };
  const ctx = await adminContext();
  if (!ctx) return { ok: false, error: "Not allowed." };
  const { targetId, birthDate, gender, reason } = parsed.data;
  const { data: before } = await ctx.db.from("profiles").select("birth_date, gender").eq("id", targetId).maybeSingle();
  await ctx.db.from("profiles").update({ birth_date: birthDate, gender }).eq("id", targetId);
  await audit(ctx.db, { admin_id: ctx.adminId, action: "profile.correct_fields", target_type: "user", target_id: targetId, reason, meta: { before, after: { birthDate, gender } } });
  revalidatePath(`/admin/users/${targetId}`);
  return { ok: true };
}

export async function setAdminAction(targetId: string, makeAdmin: boolean): Promise<AdminResult> {
  if (!z.string().uuid().safeParse(targetId).success) return { ok: false, error: "Bad id." };
  const ctx = await adminContext();
  if (!ctx) return { ok: false, error: "Not allowed." };
  if (targetId === ctx.adminId) return { ok: false, error: "You can't change your own admin role." };
  await ctx.db.from("profiles").update({ is_admin: makeAdmin }).eq("id", targetId);
  await audit(ctx.db, { admin_id: ctx.adminId, action: makeAdmin ? "role.grant_admin" : "role.revoke_admin", target_type: "user", target_id: targetId });
  revalidatePath(`/admin/users/${targetId}`);
  return { ok: true };
}
