"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { errorCopy } from "@/lib/copy";

const schema = z
  .object({
    activityId: z.string().uuid(),
    title: z.string().trim().min(4).max(80),
    venueId: z.string().uuid(),
    placeLabel: z.string().min(2).max(120),
    lat: z.number(),
    lng: z.number(),
    startsAt: z.string().datetime(),
    capacity: z.coerce.number().int().min(3).max(16),
    durationMin: z.coerce.number().int().min(30).max(480).default(90),
    notes: z.string().trim().max(600).optional().nullable(),
    costNote: z.string().trim().max(120).optional().nullable(),
    ageMin: z.coerce.number().int().min(18).max(99),
    ageMax: z.coerce.number().int().min(18).max(99),
    genderPref: z.enum(["everyone", "women", "men"]),
    hostGuests: z.coerce.number().int().min(0).max(14),
  })
  .refine((v) => v.ageMin <= v.ageMax, { message: "bad_age_range" })
  .refine((v) => v.hostGuests <= v.capacity - 2, { message: "too_many_guests" });

export type CreateGigResult = { ok: true; gigId: string } | { ok: false; error: string };

export async function createGigAction(input: unknown): Promise<CreateGigResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message;
    return { ok: false, error: msg && msg in { bad_age_range: 1, too_many_guests: 1 } ? errorCopy(msg) : "Check the fields and try again." };
  }
  const v = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_gig", {
    p_activity_id: v.activityId,
    p_title: v.title,
    p_venue_id: v.venueId,
    p_place_label: v.placeLabel,
    p_lat: v.lat,
    p_lng: v.lng,
    p_starts_at: v.startsAt,
    p_capacity: v.capacity,
    p_duration_min: v.durationMin,
    p_notes: v.notes || undefined,
    p_cost_note: v.costNote || undefined,
    p_age_min: v.ageMin,
    p_age_max: v.ageMax,
    p_gender_pref: v.genderPref,
    p_host_guests: v.hostGuests,
  });

  if (error || !data) {
    console.error("create_gig failed:", error?.code, error?.message);
    return { ok: false, error: errorCopy(error?.message) };
  }
  revalidatePath("/feed");
  revalidatePath("/gigs");
  return { ok: true, gigId: data.id };
}
