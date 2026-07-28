"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const REJECT_REASONS = [
  "face_not_clear",
  "actions_not_performed",
  "code_not_read",
  "photo_mismatch",
  "suspected_recording",
  "other",
] as const;

const schema = z.object({
  requestId: z.string().uuid(),
  decision: z.enum(["approve", "reject", "retake"]),
  reason: z.enum(REJECT_REASONS).optional(),
});

export type ReviewResult = { ok: true } | { ok: false; error: string };

/**
 * The single verification-decision path. Re-checks is_admin server-side (the
 * layout guard is not authorisation — docs/07), then writes via the service
 * role: the request verdict, the profile status, an admin_audit row, and a
 * user notification. A reject/retake requires a reason.
 */
export async function reviewVerificationAction(input: unknown): Promise<ReviewResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input." };
  const { requestId, decision, reason } = parsed.data;
  if (decision !== "approve" && !reason) {
    return { ok: false, error: "Pick a reason." };
  }

  // ── gate: authenticated + admin ─────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };
  const { data: me } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!me?.is_admin) return { ok: false, error: "Not allowed." };

  // ── act via service role ────────────────────────────────────────────────────
  const admin = createAdminClient();
  const { data: reqRow } = await admin
    .from("verification_requests")
    .select("id, user_id, status")
    .eq("id", requestId)
    .maybeSingle();
  if (!reqRow) return { ok: false, error: "Request not found." };
  if (reqRow.status !== "pending") return { ok: false, error: "Already reviewed." };

  const now = new Date().toISOString();

  if (decision === "approve") {
    await admin
      .from("verification_requests")
      .update({ status: "verified", reviewer_id: user.id, review_note: null, reviewed_at: now })
      .eq("id", requestId);
    await admin
      .from("profiles")
      .update({ verification_status: "verified", verified_at: now })
      .eq("id", reqRow.user_id);
    await admin.from("notification_outbox").insert({
      user_id: reqRow.user_id,
      kind: "verification_approved",
      payload: {},
    });
  } else {
    const note = decision === "retake" ? `retake: ${reason}` : reason!;
    await admin
      .from("verification_requests")
      .update({ status: "rejected", reviewer_id: user.id, review_note: note, reviewed_at: now })
      .eq("id", requestId);
    await admin
      .from("profiles")
      .update({ verification_status: decision === "retake" ? "unverified" : "rejected" })
      .eq("id", reqRow.user_id);
    await admin.from("notification_outbox").insert({
      user_id: reqRow.user_id,
      kind: "verification_rejected",
      payload: { reason, retake: decision === "retake" },
    });
  }

  await admin.from("admin_audit").insert({
    admin_id: user.id,
    action: `verification.${decision}`,
    target_type: "verification",
    target_id: requestId,
    reason: reason ?? null,
    meta: { subject: reqRow.user_id },
  });

  revalidatePath("/admin/verifications");
  revalidatePath("/admin");
  return { ok: true };
}
