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
