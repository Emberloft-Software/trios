"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, currentUser } from "@/lib/supabase/server";
import { errorCopy } from "@/lib/copy";

const id = z.string().uuid();
export type ActionResult = { ok: true } | { ok: false; error: string };

function done(gigId?: string): ActionResult {
  if (gigId) revalidatePath(`/gigs/${gigId}`);
  revalidatePath("/feed");
  revalidatePath("/gigs");
  return { ok: true };
}

/** Public join — claim_slot() is row-locked and enforces the audience filter. */
export async function joinGigAction(gigId: string): Promise<ActionResult> {
  if (!id.safeParse(gigId).success) return { ok: false, error: errorCopy("generic") };
  const supabase = await createClient();
  const { error } = await supabase.rpc("claim_slot", { p_gig_id: gigId });
  if (error) return { ok: false, error: errorCopy(error.message) };
  return done(gigId);
}

const sendSchema = z.object({ gigId: z.string().uuid(), body: z.string().trim().min(1).max(1000) });

/** Chat send. RLS decides whether chat is open and whether you're crew. */
export async function sendMessageAction(input: unknown): Promise<{ ok: true; id: string; created_at: string } | { ok: false; error: string }> {
  const parsed = sendSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: errorCopy("generic") };
  const supabase = await createClient();
  const user = await currentUser(supabase);
  if (!user) return { ok: false, error: errorCopy("not_authenticated") };
  const { data, error } = await supabase
    .from("gig_messages")
    .insert({ gig_id: parsed.data.gigId, user_id: user.id, body: parsed.data.body })
    .select("id, created_at")
    .single();
  if (error || !data) return { ok: false, error: errorCopy("generic") };
  return { ok: true, id: data.id, created_at: data.created_at };
}

const reportSchema = z.object({
  gigId: z.string().uuid().nullable(),
  targetId: z.string().uuid(),
  category: z.string().min(1).max(60),
  details: z.string().trim().min(1).max(2000),
});

export async function reportAction(input: unknown): Promise<ActionResult> {
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: errorCopy("details_required") };
  const supabase = await createClient();
  const { error } = await supabase.rpc("file_report", {
    p_target: parsed.data.targetId,
    p_category: parsed.data.category,
    p_details: parsed.data.details,
    p_gig_id: parsed.data.gigId ?? undefined,
  });
  if (error) return { ok: false, error: errorCopy(error.message) };
  return { ok: true };
}

export async function blockAction(targetId: string, gigId?: string): Promise<ActionResult> {
  if (!id.safeParse(targetId).success) return { ok: false, error: errorCopy("generic") };
  const supabase = await createClient();
  const { error } = await supabase.rpc("block_user", { p_blocked: targetId });
  if (error) return { ok: false, error: errorCopy(error.message) };
  return done(gigId);
}

const removeSchema = z.object({
  gigId: z.string().uuid(),
  targetId: z.string().uuid(),
  category: z.string().min(1),
  reason: z.string().trim().min(10).max(600),
});

export async function removeCrewAction(input: unknown): Promise<ActionResult> {
  const parsed = removeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: errorCopy("reason_too_short") };
  const supabase = await createClient();
  const { error } = await supabase.rpc("remove_crew_member", {
    p_gig_id: parsed.data.gigId,
    p_target: parsed.data.targetId,
    p_reason: `${parsed.data.category}: ${parsed.data.reason}`,
  });
  if (error) return { ok: false, error: errorCopy(error.message) };
  return done(parsed.data.gigId);
}

const voteSchema = z.object({
  gigId: z.string().uuid(),
  targetId: z.string().uuid(),
  reason: z.string().trim().min(3).max(300),
});

export type VoteResult = { ok: true; votes: number; needed: number; removed: boolean } | { ok: false; error: string };

/** Crew vote to remove someone (majority of the other members, min 2 votes). */
export async function castVoteAction(input: unknown): Promise<VoteResult> {
  const parsed = voteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: errorCopy("reason_too_short") };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("cast_kick_vote", {
    p_gig_id: parsed.data.gigId,
    p_target: parsed.data.targetId,
    p_reason: parsed.data.reason,
  });
  if (error || !data) return { ok: false, error: errorCopy(error?.message) };
  const r = data as { votes: number; needed: number; removed: boolean };
  revalidatePath(`/gigs/${parsed.data.gigId}`);
  return { ok: true, ...r };
}

export async function retractVoteAction(gigId: string, targetId: string): Promise<ActionResult> {
  if (!id.safeParse(gigId).success || !id.safeParse(targetId).success) return { ok: false, error: errorCopy("generic") };
  const supabase = await createClient();
  const { error } = await supabase.rpc("retract_kick_vote", { p_gig_id: gigId, p_target: targetId });
  if (error) return { ok: false, error: errorCopy(error.message) };
  revalidatePath(`/gigs/${gigId}`);
  return { ok: true };
}

/**
 * Leaving ends with a SERVER redirect to My gigs. A client-side push could be
 * cancelled by the leaver's own lobby reacting to the "left" message, which is
 * what left the spinner stuck even though the leave had saved.
 */
export async function leaveGigAction(gigId: string, uncomfortable: boolean): Promise<ActionResult | undefined> {
  if (!id.safeParse(gigId).success) return { ok: false, error: errorCopy("generic") };
  const supabase = await createClient();
  const { error } = await supabase.rpc("leave_gig", { p_gig_id: gigId, p_uncomfortable: uncomfortable });
  if (error) return { ok: false, error: errorCopy(error.message) };
  revalidatePath("/feed");
  revalidatePath("/gigs");
  redirect("/gigs");
}

export async function cancelGigAction(gigId: string): Promise<ActionResult> {
  if (!id.safeParse(gigId).success) return { ok: false, error: errorCopy("generic") };
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_gig", { p_gig_id: gigId });
  if (error) return { ok: false, error: errorCopy(error.message) };
  return done(gigId);
}

/** Host cancels one unused guest link; the held seat goes back to the public. */
export async function revokeInviteAction(gigId: string, inviteId: string): Promise<ActionResult> {
  if (!id.safeParse(gigId).success || !id.safeParse(inviteId).success) return { ok: false, error: errorCopy("generic") };
  const supabase = await createClient();
  const { error } = await supabase.rpc("revoke_guest_invite", { p_invite_id: inviteId });
  if (error) return { ok: false, error: errorCopy(error.message) };
  return done(gigId);
}

export async function checkInAction(gigId: string, subjectId: string): Promise<ActionResult> {
  if (!id.safeParse(gigId).success || !id.safeParse(subjectId).success) return { ok: false, error: errorCopy("generic") };
  const supabase = await createClient();
  const { error } = await supabase.rpc("check_in", { p_gig_id: gigId, p_subject: subjectId });
  if (error) return { ok: false, error: errorCopy(error.message) };
  revalidatePath(`/gigs/${gigId}`);
  return { ok: true };
}

export async function redeemPerkAction(gigId: string, venueId: string): Promise<ActionResult> {
  if (!id.safeParse(gigId).success || !id.safeParse(venueId).success) return { ok: false, error: errorCopy("generic") };
  const supabase = await createClient();
  const { error } = await supabase.rpc("redeem_perk", { p_gig_id: gigId, p_venue_id: venueId });
  if (error) return { ok: false, error: errorCopy(error.message) };
  revalidatePath(`/gigs/${gigId}`);
  return { ok: true };
}
