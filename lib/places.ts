import "server-only";
import { brand } from "@/lib/brand";

/**
 * Google Places API (New) helpers — SERVER-ONLY. The Maps key never reaches the
 * browser (docs/03, docs/08). Autocomplete and Details share a session token so
 * a whole search bills as ONE session; the Details call terminates it. Details
 * uses a field mask so we only pay for the fields we use.
 */

const PLACES = "https://places.googleapis.com/v1";
const COLOMBO = { latitude: 6.9271, longitude: 79.8612 };
const RADIUS_M = 25000; // 25km bias (docs/03)

function key(): string {
  const k = process.env.GOOGLE_MAPS_SERVER_KEY;
  if (!k) throw new Error("GOOGLE_MAPS_SERVER_KEY is not set");
  return k;
}

export interface AutocompleteSuggestion {
  placeId: string;
  primary: string;
  secondary: string;
}

/** Places Autocomplete (New), biased to Colombo, restricted to Sri Lanka. */
export async function autocomplete(
  input: string,
  sessionToken: string,
): Promise<AutocompleteSuggestion[]> {
  if (input.trim().length < 2) return [];
  const res = await fetch(`${PLACES}/places:autocomplete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key(),
      "X-Goog-FieldMask":
        "suggestions.placePrediction.placeId,suggestions.placePrediction.structuredFormat",
    },
    body: JSON.stringify({
      input,
      sessionToken,
      includedRegionCodes: ["lk"],
      locationBias: { circle: { center: COLOMBO, radius: RADIUS_M } },
    }),
  });
  if (!res.ok) return [];
  const data = (await res.json()) as {
    suggestions?: {
      placePrediction?: {
        placeId: string;
        structuredFormat?: { mainText?: { text: string }; secondaryText?: { text: string } };
      };
    }[];
  };
  return (data.suggestions ?? [])
    .map((s) => s.placePrediction)
    .filter((p): p is NonNullable<typeof p> => !!p)
    .map((p) => ({
      placeId: p.placeId,
      primary: p.structuredFormat?.mainText?.text ?? "",
      secondary: p.structuredFormat?.secondaryText?.text ?? "",
    }));
}

export interface PlaceDetails {
  id: string;
  displayName: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  types: string[];
  photoRefs: string[];
  photoAttribution: string[];
  googleMapsUri: string | null;
  openingHours: unknown | null;
}

/**
 * Place Details (New) with a field mask. Passing the sessionToken here
 * terminates the autocomplete session so the whole thing bills as one session.
 * We store photo *resource names* (references), never image bytes.
 */
export async function placeDetails(
  placeId: string,
  sessionToken: string,
): Promise<PlaceDetails | null> {
  const fields = [
    "id",
    "displayName",
    "formattedAddress",
    "location",
    "types",
    "photos",
    "googleMapsUri",
    "regularOpeningHours",
  ].join(",");

  const res = await fetch(
    `${PLACES}/places/${encodeURIComponent(placeId)}?sessionToken=${encodeURIComponent(sessionToken)}`,
    {
      headers: { "X-Goog-Api-Key": key(), "X-Goog-FieldMask": fields },
    },
  );
  if (!res.ok) return null;
  const d = (await res.json()) as {
    id: string;
    displayName?: { text: string };
    formattedAddress?: string;
    location?: { latitude: number; longitude: number };
    types?: string[];
    photos?: { name: string; authorAttributions?: { displayName: string }[] }[];
    googleMapsUri?: string;
    regularOpeningHours?: unknown;
  };

  return {
    id: d.id,
    displayName: d.displayName?.text ?? "",
    formattedAddress: d.formattedAddress ?? "",
    lat: d.location?.latitude ?? COLOMBO.latitude,
    lng: d.location?.longitude ?? COLOMBO.longitude,
    types: d.types ?? [],
    photoRefs: (d.photos ?? []).map((p) => p.name),
    photoAttribution: (d.photos ?? []).map(
      (p) => p.authorAttributions?.[0]?.displayName ?? "Google",
    ),
    googleMapsUri: d.googleMapsUri ?? null,
    openingHours: d.regularOpeningHours ?? null,
  };
}

/**
 * Residential rejection (docs/03 step 4, R7): reject if the place is an address
 * point with no business type. Public places (establishments) pass.
 */
const RESIDENTIAL = new Set(["premise", "subpremise", "street_address", "route"]);
export function isResidential(types: string[]): boolean {
  if (types.includes("establishment")) return false;
  return types.some((t) => RESIDENTIAL.has(t));
}

/** Fetch photo bytes from the Places Photo endpoint (New) for the proxy route. */
export async function fetchPlacePhoto(
  photoName: string,
  maxWidth = 800,
): Promise<{ body: ArrayBuffer; contentType: string } | null> {
  const res = await fetch(
    `${PLACES}/${photoName}/media?maxWidthPx=${maxWidth}&key=${key()}`,
    { redirect: "follow" },
  );
  if (!res.ok) return null;
  return {
    body: await res.arrayBuffer(),
    contentType: res.headers.get("content-type") ?? "image/jpeg",
  };
}

export const placesConfig = { COLOMBO, RADIUS_M, city: brand.city };
