"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { errorCopy } from "@/lib/copy";

const schema = z.object({
  activityId: z.string().uuid(),
  title: z.string().min(4).max(80),
  venueId: z.string().uuid(),
  placeLabel: z.string().min(2).max(120),
  lat: z.number(),
  lng: z.number(),
  startsAt: z.string().min(1), // ISO from the client (already UTC)
  capacity: z.coerce.number().int().min(3).max(12),
  durationMin: z.coerce.number().int().min(30).max(480).default(90),
  notes: z.string().max(600).optional().nullable(),
  costNote: z.string().max(120).optional().nullable(),
});

export type CreateGigResult = { ok: true; gigId: string } | { ok: false; error: string };

export async function createGigAction(input: unknown): Promise<CreateGigResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Check the fields and try again." };
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
    p_notes: v.notes ?? null,
    p_cost_note: v.costNote ?? null,
  });

  if (error || !data) {
    // Surface the real reason server-side for debugging; map to friendly copy.
    console.error("create_gig failed:", {
      code: error?.code,
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
    });
    // A missing profiles row (FK violation on host_id) means the signup trigger
    // never ran for this user — common if the account predates the migrations.
    if (error?.code === "23503") return { ok: false, error: errorCopy("profile_missing") };
    return { ok: false, error: errorCopy(error?.message ?? "generic") };
  }
  return { ok: true, gigId: data.id };
}
