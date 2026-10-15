"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** Records that this account accepted the acceptable-use rules. */
export async function acceptConductAction(): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("accept_acceptable_use");
  if (error) return { ok: false };
  revalidatePath("/", "layout");
  return { ok: true };
}
