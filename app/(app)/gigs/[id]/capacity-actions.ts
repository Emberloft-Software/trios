"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { errorCopy } from "@/lib/copy";

/** Host adds spots to their own open gig (enforced in increase_gig_capacity). */
export async function increaseCapacityAction(gigId: string, capacity: number): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!/^[0-9a-f-]{36}$/i.test(gigId) || !Number.isInteger(capacity)) return { ok: false, error: errorCopy("generic") };
  const supabase = await createClient();
  const { error } = await supabase.rpc("increase_gig_capacity", { p_gig_id: gigId, p_capacity: capacity });
  if (error) return { ok: false, error: errorCopy(error.message) };
  revalidatePath(`/gigs/${gigId}`);
  revalidatePath("/feed");
  revalidatePath("/gigs");
  return { ok: true };
}
