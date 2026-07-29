import { copy } from "@/lib/copy";

export interface VenueMediaInfo {
  placeLabel: string;
  lat: number;
  lng: number;
  venueName?: string | null;
  photoRef?: string | null;
  photoAttribution?: string | null;
  rating?: number | null;
  ratingCount?: number | null;
  mapsUrl?: string | null;
}

/**
 * The venue at a glance: place photo, a map thumbnail, name, Google rating —
 * all one click away from opening the spot in Google Maps. Used on feed
 * cards, friend-hosted cards, and the lobby "when & where" panel so a bare
 * `place_label` string is never the only thing shown for where a gig is.
 */
export function VenueMedia({
  placeLabel,
  lat,
  lng,
  venueName,
  photoRef,
  photoAttribution,
  rating,
  ratingCount,
  mapsUrl,
}: VenueMediaInfo) {
  const name = venueName || placeLabel;
  const href = mapsUrl || `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={`${name} — ${copy.venue.openInMaps}`}
      className="block overflow-hidden rounded-[var(--radius-chip)] border-2 border-[var(--color-ink)] bg-[var(--color-chalk)] transition-transform hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[var(--shadow-hard)]"
    >
      <div className="flex">
        {photoRef && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/place-photo?ref=${encodeURIComponent(photoRef)}&w=160`}
            alt={name}
            className="h-16 w-16 shrink-0 border-r-2 border-[var(--color-ink)] object-cover"
          />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/static-map?lat=${lat}&lng=${lng}&w=64&h=64&z=15`}
          alt=""
          aria-hidden
          className="h-16 w-16 shrink-0 border-r-2 border-[var(--color-ink)] object-cover"
        />
        <div className="min-w-0 flex-1 px-2.5 py-2">
          <p className="truncate text-[0.9375rem] font-500">{name}</p>
          {typeof rating === "number" && (
            <p className="font-data text-[0.8125rem] text-[var(--color-dust)]">
              ★ {rating.toFixed(1)}
              {ratingCount ? ` (${ratingCount})` : ""}
            </p>
          )}
          <p className="mt-0.5 text-[0.75rem] text-[var(--color-net)]">{copy.venue.openInMaps} →</p>
        </div>
      </div>
      {photoAttribution && (
        <p className="border-t-2 border-[var(--color-ink)] px-2.5 py-1 text-[0.5625rem] text-[var(--color-dust)]">
          © {photoAttribution}
        </p>
      )}
    </a>
  );
}
