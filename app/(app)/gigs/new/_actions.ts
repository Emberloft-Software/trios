"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { errorCopy } from "@/lib/copy";

// Colombo city centre — placeholder coordinates until the Places picker (M6)
// supplies real venue lat/lng. Residential rejection also lands in M6.
const COLOMBO = { lat: 6.9271, lng: 79.8612 };

const schema = z.object({
  activityId: z.string().uuid(),
  title: z.string().min(4).max(80),
  placeLabel: z.string().min(2).max(120),
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
    p_venue_id: null,
    p_place_label: v.placeLabel,
    p_lat: COLOMBO.lat,
    p_lng: COLOMBO.lng,
    p_starts_at: v.startsAt,
    p_capacity: v.capacity,
    p_duration_min: v.durationMin,
    p_notes: v.notes ?? null,
    p_cost_note: v.costNote ?? null,
  });

  if (error) {
    // Postgres exception message (e.g. 'capacity_too_low', 'starts_too_soon')
    return { ok: false, error: errorCopy(error.message) };
  }
  return { ok: true, gigId: data.id };
}
