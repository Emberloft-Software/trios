"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  return data?.is_admin ? user.id : null;
}

const schema = z.object({
  venueId: z.string().uuid(),
  isPartner: z.boolean(),
  perk: z.string().max(200).optional().nullable(),
});

export type AdminResult = { ok: true } | { ok: false; error: string };

/** Toggle a venue's partner status and set its perk text (docs/07, docs/08). */
export async function setVenuePartnerAction(input: unknown): Promise<AdminResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input." };
  const adminId = await requireAdmin();
  if (!adminId) return { ok: false, error: "Not allowed." };

  const { venueId, isPartner, perk } = parsed.data;
  const admin = createAdminClient();

  const { data: current } = await admin
    .from("venues")
    .select("partner_since")
    .eq("id", venueId)
    .maybeSingle();

  await admin
    .from("venues")
    .update({
      is_partner: isPartner,
      partner_perk: isPartner ? (perk ?? null) : null,
      // stamp partner_since the first time they become a partner
      partner_since: isPartner
        ? current?.partner_since ?? new Date().toISOString().slice(0, 10)
        : null,
    })
    .eq("id", venueId);

  await admin.from("admin_audit").insert({
    admin_id: adminId,
    action: isPartner ? "venue.partner_on" : "venue.partner_off",
    target_type: "venue",
    target_id: venueId,
    meta: { perk: isPartner ? perk : null },
  });

  revalidatePath("/admin/venues");
  revalidatePath("/admin/partners");
  return { ok: true };
}
