import { type NextRequest } from "next/server";

/**
 * Static map thumbnail proxy (docs/03, docs/08 pattern — same as place-photo).
 * The Maps key stays server-side; we stream a small marker map image through
 * and cache it for up to 30 days.
 *
 *   /api/static-map?lat=6.9271&lng=79.8612&w=160&h=160&z=15
 */
const STATIC_MAPS = "https://maps.googleapis.com/maps/api/staticmap";

function key(): string {
  const k = process.env.GOOGLE_MAPS_SERVER_KEY;
  if (!k) throw new Error("GOOGLE_MAPS_SERVER_KEY is not set");
  return k;
}

export async function GET(req: NextRequest) {
  const lat = Number(req.nextUrl.searchParams.get("lat"));
  const lng = Number(req.nextUrl.searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return new Response("missing/invalid lat,lng", { status: 400 });
  }

  const w = Number(req.nextUrl.searchParams.get("w") ?? "160");
  const h = Number(req.nextUrl.searchParams.get("h") ?? "160");
  const width = Number.isFinite(w) ? Math.min(Math.max(Math.round(w), 40), 640) : 160;
  const height = Number.isFinite(h) ? Math.min(Math.max(Math.round(h), 40), 640) : 160;
  const zoom = req.nextUrl.searchParams.get("z") ?? "15";

  const url = new URL(STATIC_MAPS);
  url.searchParams.set("center", `${lat},${lng}`);
  url.searchParams.set("zoom", zoom);
  url.searchParams.set("size", `${width}x${height}`);
  url.searchParams.set("scale", "2");
  url.searchParams.set("markers", `color:0xFF5E3A|${lat},${lng}`);
  url.searchParams.set("key", key());

  try {
    const res = await fetch(url.toString());
    if (!res.ok) return new Response("not found", { status: 404 });
    return new Response(await res.arrayBuffer(), {
      headers: {
        "Content-Type": res.headers.get("content-type") ?? "image/png",
        "Cache-Control": "public, max-age=2592000, immutable",
      },
    });
  } catch {
    return new Response("error", { status: 500 });
  }
}
