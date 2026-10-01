"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { errorCopy } from "@/lib/copy";

/** Join through the host's private link (takes a held seat if one is left). */
export async function joinByInviteAction(code: string): Promise<{ ok: true; gigId: string } | { ok: false; error: string }> {
  if (!z.string().regex(/^[a-z0-9]{8,16}$/i).safeParse(code).success) return { ok: false, error: errorCopy("invite_not_found") };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("join_by_invite", { p_code: code });
  if (error || !data) return { ok: false, error: errorCopy(error?.message) };
  revalidatePath(`/gigs/${data.id}`);
  revalidatePath("/gigs");
  return { ok: true, gigId: data.id };
}
