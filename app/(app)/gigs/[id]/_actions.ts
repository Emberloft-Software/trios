"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { errorCopy } from "@/lib/copy";

const idSchema = z.string().uuid();

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Join a gig via claim_slot() — the atomic, row-locked path. Never a
 *  client-side "is it full?" check. */
export async function joinGigAction(gigId: string): Promise<ActionResult> {
  if (!idSchema.safeParse(gigId).success) return { ok: false, error: errorCopy("generic") };
  const supabase = await createClient();
  const { error } = await supabase.rpc("claim_slot", { p_gig_id: gigId });
  if (error) return { ok: false, error: errorCopy(error.message) };
  revalidatePath(`/gigs/${gigId}`);
  revalidatePath("/feed");
  return { ok: true };
}

const reportSchema = z.object({
  gigId: z.string().uuid().nullable(),
  targetId: z.string().uuid(),
  category: z.string().min(1),
  details: z.string().min(1).max(2000),
});

/** File a report. Priority categories jump the admin queue + email admins,
 *  handled inside file_report(). Never attributed, never shown to the target. */
export async function reportAction(input: unknown): Promise<ActionResult> {
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: errorCopy("details_required") };
  const supabase = await createClient();
  const { error } = await supabase.rpc("file_report", {
    p_target: parsed.data.targetId,
    p_category: parsed.data.category,
    p_details: parsed.data.details,
    p_gig_id: parsed.data.gigId,
  });
  if (error) return { ok: false, error: errorCopy(error.message) };
  return { ok: true };
}

/** Block someone — one transaction (drops friendship, cancels requests, hides
 *  gigs both ways, removes the later joiner from shared upcoming gigs). */
export async function blockAction(targetId: string, gigId?: string): Promise<ActionResult> {
  if (!idSchema.safeParse(targetId).success) return { ok: false, error: errorCopy("generic") };
  const supabase = await createClient();
  const { error } = await supabase.rpc("block_user", { p_blocked: targetId });
  if (error) return { ok: false, error: errorCopy(error.message) };
  if (gigId) revalidatePath(`/gigs/${gigId}`);
  revalidatePath("/feed");
  return { ok: true };
}

const removeSchema = z.object({
  gigId: z.string().uuid(),
  targetId: z.string().uuid(),
  category: z.string().min(1),
  reason: z.string().min(10).max(600),
});

/** Host removes a crew member. Rate-limited + logged in remove_crew_member().
 *  The freed slot reopens if the gig is still open. */
export async function removeCrewAction(input: unknown): Promise<ActionResult> {
  const parsed = removeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: errorCopy("reason_too_short") };
  const supabase = await createClient();
  const reason = `${parsed.data.category}: ${parsed.data.reason}`;
  const { error } = await supabase.rpc("remove_crew_member", {
    p_gig_id: parsed.data.gigId,
    p_target: parsed.data.targetId,
    p_reason: reason,
  });
  if (error) return { ok: false, error: errorCopy(error.message) };
  revalidatePath(`/gigs/${parsed.data.gigId}`);
  return { ok: true };
}

/** Host redeems the partner perk from the lobby. Exactly one row per gig
 *  (unique constraint holds under a double submit). */
export async function redeemPerkAction(gigId: string, venueId: string): Promise<ActionResult> {
  if (!idSchema.safeParse(gigId).success || !idSchema.safeParse(venueId).success) {
    return { ok: false, error: errorCopy("generic") };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("redeem_perk", { p_gig_id: gigId, p_venue_id: venueId });
  if (error) return { ok: false, error: errorCopy(error.message) };
  revalidatePath(`/gigs/${gigId}`);
  return { ok: true };
}

/** Leave. p_uncomfortable=true is the "I didn't feel comfortable" door — no
 *  reliability penalty at any timing, and the caller opens a report next. */
export async function leaveGigAction(
  gigId: string,
  uncomfortable: boolean,
): Promise<ActionResult> {
  if (!idSchema.safeParse(gigId).success) return { ok: false, error: errorCopy("generic") };
  const supabase = await createClient();
  const { error } = await supabase.rpc("leave_gig", {
    p_gig_id: gigId,
    p_uncomfortable: uncomfortable,
  });
  if (error) return { ok: false, error: errorCopy(error.message) };
  revalidatePath(`/gigs/${gigId}`);
  revalidatePath("/feed");
  return { ok: true };
}
