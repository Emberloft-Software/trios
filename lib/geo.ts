/**
 * Location helpers for Discover. Areas are fixed circles around Sri Lankan
 * towns (no geocoding calls, no user location sent anywhere). The viewer's own
 * position is optional, rounded to ~1 km on the device, and kept in a cookie
 * so the server can sort by distance without it ever appearing in a URL.
 */

export const LOC_COOKIE = "tm_loc";

export interface Area {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  radiusKm: number;
}

export const AREAS: Area[] = [
  { slug: "colombo", name: "Colombo", lat: 6.9271, lng: 79.8612, radiusKm: 13 },
  { slug: "anuradhapura", name: "Anuradhapura", lat: 8.3114, lng: 80.4037, radiusKm: 15 },
  { slug: "badulla", name: "Badulla & Ella", lat: 6.93, lng: 81.05, radiusKm: 15 },
  { slug: "batticaloa", name: "Batticaloa", lat: 7.731, lng: 81.6747, radiusKm: 15 },
  { slug: "dambulla", name: "Dambulla & Sigiriya", lat: 7.8742, lng: 80.6511, radiusKm: 15 },
  { slug: "galle", name: "Galle", lat: 6.0535, lng: 80.221, radiusKm: 14 },
  { slug: "gampaha", name: "Gampaha", lat: 7.0897, lng: 79.9925, radiusKm: 12 },
  { slug: "hambantota", name: "Hambantota", lat: 6.1241, lng: 81.1185, radiusKm: 15 },
  { slug: "jaffna", name: "Jaffna", lat: 9.6615, lng: 80.0255, radiusKm: 15 },
  { slug: "kalutara", name: "Kalutara", lat: 6.5854, lng: 79.9607, radiusKm: 12 },
  { slug: "kandy", name: "Kandy", lat: 7.2906, lng: 80.6337, radiusKm: 13 },
  { slug: "kurunegala", name: "Kurunegala", lat: 7.4863, lng: 80.3647, radiusKm: 12 },
  { slug: "matara", name: "Matara", lat: 5.9549, lng: 80.555, radiusKm: 12 },
  { slug: "negombo", name: "Negombo", lat: 7.2083, lng: 79.8358, radiusKm: 10 },
  { slug: "nuwara-eliya", name: "Nuwara Eliya", lat: 6.9497, lng: 80.7891, radiusKm: 12 },
  { slug: "polonnaruwa", name: "Polonnaruwa", lat: 7.9403, lng: 81.0188, radiusKm: 15 },
  { slug: "ratnapura", name: "Ratnapura", lat: 6.6828, lng: 80.3992, radiusKm: 12 },
  { slug: "trincomalee", name: "Trincomalee", lat: 8.5874, lng: 81.2152, radiusKm: 15 },
];

export type LatLng = { lat: number; lng: number };

export type FeedParams = { cat: string; area: string; sort: string };

/** Discover URL for a filter combination (location itself never goes in the URL). */
export function feedHref(p: FeedParams): string {
  const q = new URLSearchParams();
  if (p.cat) q.set("cat", p.cat);
  if (p.area) q.set("area", p.area);
  if (p.sort === "near") q.set("sort", "near");
  const s = q.toString();
  return s ? `/feed?${s}` : "/feed";
}

export function areaBySlug(slug: string | undefined): Area | null {
  return AREAS.find((a) => a.slug === slug) ?? null;
}

/** Great-circle distance in km. */
export function distanceKm(a: LatLng, b: LatLng): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Round to 2 decimals (~1.1 km) so a precise position is never stored. */
export function coarse(p: LatLng): LatLng {
  return { lat: Math.round(p.lat * 100) / 100, lng: Math.round(p.lng * 100) / 100 };
}

/** Parse the cookie value "lat_lng"; anything odd (or outside Sri Lanka's box) is ignored. */
export function parseLoc(v: string | undefined): LatLng | null {
  const m = v?.match(/^(-?\d{1,2}(?:\.\d{1,3})?)_(-?\d{1,3}(?:\.\d{1,3})?)$/);
  if (!m) return null;
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  return lat > 5 && lat < 10.5 && lng > 79 && lng < 82.5 ? { lat, lng } : null;
}

/** Filter to an area and (optionally) sort by distance from the viewer. */
export function placeGigs<T extends LatLng & { starts_at: string }>(
  rows: T[],
  opts: { area: Area | null; me: LatLng | null; near: boolean },
): (T & { km: number | null })[] {
  const out = rows
    .filter((g) => !opts.area || distanceKm(opts.area, g) <= opts.area.radiusKm)
    .map((g) => ({ ...g, km: opts.me ? distanceKm(opts.me, g) : null }));
  if (opts.near && opts.me) out.sort((a, b) => a.km! - b.km! || a.starts_at.localeCompare(b.starts_at));
  return out;
}
