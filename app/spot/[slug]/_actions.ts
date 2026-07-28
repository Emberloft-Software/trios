"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { copy } from "@/lib/copy";

const schema = z.object({
  slug: z.string().min(1).max(120),
  code: z.string().min(3).max(20),
});

export type SpotResult = { ok: true } | { ok: false; error: string };

/**
 * No-login redemption for venue staff at /spot/[slug]. Uses the service role
 * (this page has no auth) and redeem_perk_by_code(), which validates the gig
 * belongs to this venue and writes exactly one perk_redemptions row.
 */
export async function redeemBySpotAction(input: unknown): Promise<SpotResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: copy.spot.errors.generic };

  const admin = createAdminClient();
  const { error } = await admin.rpc("redeem_perk_by_code", {
    p_slug: parsed.data.slug,
    p_code: parsed.data.code.trim(),
  });
  if (error) {
    return { ok: false, error: copy.spot.errors[error.message] ?? copy.spot.errors.generic };
  }
  return { ok: true };
}
