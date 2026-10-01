"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { adminContext, audit } from "../_lib";

const schema = z.object({
  userId: z.string().uuid(),
  decision: z.enum(["approve", "reject"]),
  reason: z.enum(["no_face", "not_you", "group_photo", "inappropriate", "low_quality"]).optional(),
});

/**
 * Approve: the pending photo becomes the live avatar (previous file deleted).
 * Reject: the pending file is deleted; the last approved photo (if any) stays.
 */
export async function reviewPhotoAction(input: unknown): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input." };
  const { userId, decision, reason } = parsed.data;
  if (decision === "reject" && !reason) return { ok: false, error: "Pick a reason." };

  const ctx = await adminContext();
  if (!ctx) return { ok: false, error: "Not allowed." };
  const { adminId, db } = ctx;

  const { data: p } = await db.from("profiles").select("avatar_path, avatar_pending_path, avatar_status").eq("id", userId).maybeSingle();
  if (!p?.avatar_pending_path || p.avatar_status !== "pending") return { ok: false, error: "Nothing pending for this user." };

  const now = new Date().toISOString();
  if (decision === "approve") {
    await db
      .from("profiles")
      .update({ avatar_path: p.avatar_pending_path, avatar_pending_path: null, avatar_status: "approved", avatar_reject_reason: null, avatar_reviewed_at: now })
      .eq("id", userId);
    if (p.avatar_path && p.avatar_path !== p.avatar_pending_path) await db.storage.from("avatars").remove([p.avatar_path]);
    await db.from("notification_outbox").insert({ user_id: userId, kind: "photo_approved", payload: {} });
  } else {
    await db.storage.from("avatars").remove([p.avatar_pending_path]);
    await db
      .from("profiles")
      .update({ avatar_pending_path: null, avatar_status: "rejected", avatar_reject_reason: reason, avatar_reviewed_at: now })
      .eq("id", userId);
    await db.from("notification_outbox").insert({ user_id: userId, kind: "photo_rejected", payload: { reason } });
  }
  await audit(db, { admin_id: adminId, action: `photo.${decision}`, target_type: "user", target_id: userId, reason: reason ?? null });

  revalidatePath("/admin/photos");
  revalidatePath("/admin");
  return { ok: true };
}

/** Take down a live (already approved) photo — e.g. after a report. */
export async function removeLivePhotoAction(userId: string, reason: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!z.string().uuid().safeParse(userId).success) return { ok: false, error: "Bad id." };
  const ctx = await adminContext();
  if (!ctx) return { ok: false, error: "Not allowed." };
  const { adminId, db } = ctx;
  const { data: p } = await db.from("profiles").select("avatar_path").eq("id", userId).maybeSingle();
  if (!p?.avatar_path) return { ok: false, error: "No live photo." };
  await db.storage.from("avatars").remove([p.avatar_path]);
  await db.from("profiles").update({ avatar_path: null, avatar_status: "rejected", avatar_reject_reason: "inappropriate" }).eq("id", userId);
  await db.from("notification_outbox").insert({ user_id: userId, kind: "photo_rejected", payload: { reason: "inappropriate" } });
  await audit(db, { admin_id: adminId, action: "photo.remove_live", target_type: "user", target_id: userId, reason });
  revalidatePath(`/admin/users/${userId}`);
  return { ok: true };
}
