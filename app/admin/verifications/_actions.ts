"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { adminContext, audit } from "../_lib";

const REJECT_REASONS = ["face_not_clear", "actions_not_performed", "code_not_read", "photo_mismatch", "suspected_recording", "other"] as const;

const schema = z.object({
  requestId: z.string().uuid(),
  decision: z.enum(["approve", "reject", "retake"]),
  reason: z.enum(REJECT_REASONS).optional(),
  note: z.string().max(500).optional(),
});

export type ReviewResult = { ok: true } | { ok: false; error: string };

/**
 * The single verification-decision path: re-checks admin, writes the verdict,
 * profile status, audit row and the user's notification. Also sweeps media
 * that's past its 7-day retention so the policy holds even without the cron
 * Edge Function.
 */
export async function reviewVerificationAction(input: unknown): Promise<ReviewResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input." };
  const { requestId, decision, reason, note } = parsed.data;
  if (decision !== "approve" && !reason) return { ok: false, error: "Pick a reason." };

  const ctx = await adminContext();
  if (!ctx) return { ok: false, error: "Not allowed." };
  const { adminId, db } = ctx;

  const { data: req } = await db.from("verification_requests").select("id, user_id, status").eq("id", requestId).maybeSingle();
  if (!req) return { ok: false, error: "Request not found." };
  if (req.status !== "pending") return { ok: false, error: "Already reviewed." };
  if (req.user_id === adminId) return { ok: false, error: "You can't review your own verification." };

  const now = new Date().toISOString();
  if (decision === "approve") {
    await db.from("verification_requests").update({ status: "verified", reviewer_id: adminId, review_note: note ?? null, reviewed_at: now }).eq("id", requestId);
    await db.from("profiles").update({ verification_status: "verified", verified_at: now }).eq("id", req.user_id);
    await db.from("notification_outbox").insert({ user_id: req.user_id, kind: "verification_approved", payload: {} });
  } else {
    const reviewNote = decision === "retake" ? `retake:${reason}` : reason!;
    await db.from("verification_requests").update({ status: "rejected", reviewer_id: adminId, review_note: reviewNote, reviewed_at: now }).eq("id", requestId);
    await db.from("profiles").update({ verification_status: decision === "retake" ? "unverified" : "rejected" }).eq("id", req.user_id);
    await db.from("notification_outbox").insert({ user_id: req.user_id, kind: "verification_rejected", payload: { reason, retake: decision === "retake" } });
  }
  await audit(db, { admin_id: adminId, action: `verification.${decision}`, target_type: "verification", target_id: requestId, reason: reason ?? note ?? null, meta: { subject: req.user_id } });

  // retention sweep: media reviewed > 7 days ago
  const cutoff = new Date(Date.now() - 7 * 864e5).toISOString();
  const { data: old } = await db
    .from("verification_requests")
    .select("id, media_path")
    .not("media_path", "is", null)
    .is("media_purged_at", null)
    .lt("reviewed_at", cutoff)
    .limit(50);
  const paths = (old ?? []).map((o) => o.media_path!).filter(Boolean);
  if (paths.length) {
    await db.storage.from("verification").remove(paths);
    await db.from("verification_requests").update({ media_purged_at: now }).in("id", (old ?? []).map((o) => o.id));
  }

  revalidatePath("/admin/verifications");
  revalidatePath("/admin");
  return { ok: true };
}
