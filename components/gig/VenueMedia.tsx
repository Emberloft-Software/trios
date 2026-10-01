/* eslint-disable @next/next/no-img-element */
import { ExternalLink, Star } from "lucide-react";
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

/** Venue at a glance — photo, map thumbnail, name, rating — opening Google Maps. */
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
      rel="noreferrer noopener"
      aria-label={`${name}: ${copy.venue.openInMaps}`}
      className="group flex items-center gap-3 rounded-2xl bg-white/70 p-2 ring-1 ring-line transition hover:bg-white"
    >
      <div className="flex shrink-0 -space-x-3">
        {photoRef && (
          <img
            src={`/api/place-photo?ref=${encodeURIComponent(photoRef)}&w=160`}
            alt=""
            className="h-14 w-14 rounded-xl object-cover ring-2 ring-white"
            loading="lazy"
          />
        )}
        <img
          src={`/api/static-map?lat=${lat}&lng=${lng}&w=112&h=112&z=15`}
          alt=""
          aria-hidden
          className="h-14 w-14 rounded-xl bg-plum-50 object-cover ring-2 ring-white"
          loading="lazy"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.9375rem] font-semibold text-plum">{name}</p>
        {typeof rating === "number" && (
          <p className="flex items-center gap-1 text-[0.8125rem] text-muted tabular">
            <Star className="h-3.5 w-3.5 fill-sun text-sun" /> {rating.toFixed(1)}
            {ratingCount ? <span>({ratingCount})</span> : null}
          </p>
        )}
        <p className="mt-0.5 inline-flex items-center gap-1 text-[0.75rem] font-semibold text-coral-600">
          {copy.venue.openInMaps} <ExternalLink className="h-3 w-3" />
        </p>
        {photoAttribution && <p className="truncate text-[0.625rem] text-muted/70">© {photoAttribution}</p>}
      </div>
    </a>
  );
}
