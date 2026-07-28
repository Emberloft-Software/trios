import { type NextRequest } from "next/server";
import { fetchPlacePhoto } from "@/lib/places";

/**
 * Place-photo proxy (docs/03, docs/08). The Maps key stays server-side; we
 * stream the bytes through and cache for up to 30 days. We store only photo
 * *references* + attribution — never Google photo bytes in our DB/buckets.
 * Google's required attribution is rendered alongside the image in the UI
 * (the `attr` query param carries it back to the caller for display).
 *
 *   /api/place-photo?ref=places/PID/photos/REF&w=800
 */
export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref");
  const w = Number(req.nextUrl.searchParams.get("w") ?? "800");
  if (!ref) return new Response("missing ref", { status: 400 });

  try {
    const photo = await fetchPlacePhoto(ref, Number.isFinite(w) ? w : 800);
    if (!photo) return new Response("not found", { status: 404 });
    return new Response(photo.body, {
      headers: {
        "Content-Type": photo.contentType,
        // Cache the proxied response for at most 30 days (docs/03).
        "Cache-Control": "public, max-age=2592000, immutable",
      },
    });
  } catch {
    return new Response("error", { status: 500 });
  }
}
