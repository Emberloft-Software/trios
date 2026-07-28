"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { placeDetails, isResidential } from "@/lib/places";
import { copy } from "@/lib/copy";

export interface PickedVenue {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  isPartner: boolean;
  partnerPerk: string | null;
  photoRef: string | null;
  photoAttribution: string | null;
  mapsUrl: string | null;
}

export type UpsertVenueResult = { ok: true; venue: PickedVenue } | { ok: false; error: string };

const schema = z.object({ placeId: z.string().min(1), sessionToken: z.string().min(1) });

const THIRTY_DAYS = 30 * 86400_000;

/**
 * Resolve a picked place into a venues row. Reuses an existing row with fresh
 * photos (skips the Details call — a cost control from docs/03), otherwise calls
 * Place Details (field-masked, terminating the session token), rejects
 * residential places (R7), and upserts keyed on google_place_id. Stores photo
 * references + attribution, never image bytes.
 */
export async function upsertVenueFromPlaceAction(input: unknown): Promise<UpsertVenueResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: copy.errors.generic };

  // must be signed in
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: copy.errors.not_authenticated };

  const admin = createAdminClient();

  // Reuse a fresh existing venue for this place — no Details call needed.
  const { data: existing } = await admin
    .from("venues")
    .select("id, name, address, lat, lng, is_partner, partner_perk, photo_refs, photo_attribution, maps_url, photos_refreshed_at")
    .eq("google_place_id", parsed.data.placeId)
    .maybeSingle();

  if (
    existing &&
    existing.photos_refreshed_at &&
    Date.now() - new Date(existing.photos_refreshed_at).getTime() < THIRTY_DAYS
  ) {
    return {
      ok: true,
      venue: toPicked(existing),
    };
  }

  // Fresh Details call.
  let details;
  try {
    details = await placeDetails(parsed.data.placeId, parsed.data.sessionToken);
  } catch {
    return { ok: false, error: copy.errors.generic };
  }
  if (!details) return { ok: false, error: copy.errors.generic };

  if (isResidential(details.types)) {
    return { ok: false, error: copy.errors.residential };
  }

  const row = {
    name: details.displayName || "Venue",
    address: details.formattedAddress,
    lat: details.lat,
    lng: details.lng,
    google_place_id: details.id,
    google_types: details.types,
    photo_refs: details.photoRefs,
    photo_attribution: details.photoAttribution,
    photos_refreshed_at: new Date().toISOString(),
    maps_url: details.googleMapsUri,
    verified_public: true,
  };

  const { data: upserted, error } = await admin
    .from("venues")
    .upsert(row, { onConflict: "google_place_id" })
    .select("id, name, address, lat, lng, is_partner, partner_perk, photo_refs, photo_attribution, maps_url")
    .single();

  if (error || !upserted) return { ok: false, error: copy.errors.generic };
  return { ok: true, venue: toPicked(upserted) };
}

function toPicked(v: {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  is_partner: boolean;
  partner_perk: string | null;
  photo_refs: string[];
  photo_attribution: string[];
  maps_url: string | null;
}): PickedVenue {
  return {
    id: v.id,
    name: v.name,
    address: v.address,
    lat: v.lat,
    lng: v.lng,
    isPartner: v.is_partner,
    partnerPerk: v.partner_perk,
    photoRef: v.photo_refs?.[0] ?? null,
    photoAttribution: v.photo_attribution?.[0] ?? null,
    mapsUrl: v.maps_url,
  };
}
