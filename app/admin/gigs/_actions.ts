"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { adminContext, audit } from "../_lib";

/** Admin takedown: cancel a gig (no reliability penalty for anyone) and tell the crew. */
export async function adminCancelGigAction(gigId: string, reason: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!z.string().uuid().safeParse(gigId).success || reason.trim().length < 3) return { ok: false, error: "Add a reason." };
  const ctx = await adminContext();
  if (!ctx) return { ok: false, error: "Not allowed." };
  const { adminId, db } = ctx;

  const { data: gig } = await db.from("gigs").select("id, status").eq("id", gigId).maybeSingle();
  if (!gig || !["open", "locked"].includes(gig.status)) return { ok: false, error: "Gig isn't active." };

  await db.from("gigs").update({ status: "cancelled", cancelled_reason: "admin_removed" }).eq("id", gigId);
  await db.from("gig_messages").insert({ gig_id: gigId, user_id: null, body: "cancelled", system_kind: "cancelled" });
  const { data: crew } = await db.from("gig_crew").select("user_id").eq("gig_id", gigId).eq("state", "claimed");
  if (crew?.length) {
    await db.from("notification_outbox").insert(crew.map((c) => ({ user_id: c.user_id, kind: "gig_cancelled", gig_id: gigId, payload: { reason: "admin_removed" } })));
  }
  await audit(db, { admin_id: adminId, action: "gig.cancel", target_type: "gig", target_id: gigId, reason });
  revalidatePath("/admin/gigs");
  return { ok: true };
}
