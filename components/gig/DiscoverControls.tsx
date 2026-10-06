"use client";

import { useState } from "react";
import { CalendarClock, ChevronDown, LocateFixed, MapPin } from "lucide-react";
import { AREAS, LOC_COOKIE, coarse, type FeedParams, type LatLng } from "@/lib/geo";
import { copy } from "@/lib/copy";

/** Area filter + "closest first" sort. Location is asked for only on tap. */
export function DiscoverControls({
  params,
  onChange,
}: {
  params: FeedParams;
  onChange: (next: Partial<FeedParams>, loc?: LatLng) => void;
}) {
  const t = copy.nearby;
  const [locating, setLocating] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const near = params.sort === "near";

  function sortNear() {
    setMsg(null);
    if (!("geolocation" in navigator)) return setMsg(t.unavailable);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = coarse({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        const secure = location.protocol === "https:" ? "; Secure" : "";
        // rounded to ~1 km; lets the server sort the first render next time
        document.cookie = `${LOC_COOKIE}=${c.lat}_${c.lng}; Path=/; Max-Age=${12 * 3600}; SameSite=Lax${secure}`;
        setLocating(false);
        onChange({ sort: "near" }, c);
      },
      (err) => {
        setLocating(false);
        setMsg(err.code === err.PERMISSION_DENIED ? t.denied : t.unavailable);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 10 * 60e3 },
    );
  }

  const pill = (on: boolean) =>
    `inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[0.875rem] font-semibold transition ${
      on ? "bg-plum text-white" : "glass text-plum hover:bg-white"
    }`;

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <label className="glass relative inline-flex h-10 items-center rounded-full pl-3.5 pr-2 text-plum focus-within:ring-2 focus-within:ring-coral">
          <MapPin aria-hidden className="h-4 w-4 shrink-0" />
          <span className="sr-only">{t.areaLabel}</span>
          <select
            value={params.area}
            onChange={(e) => onChange({ area: e.target.value })}
            className="h-full max-w-[11rem] cursor-pointer appearance-none bg-transparent pl-1.5 pr-5 text-[0.875rem] font-semibold outline-none"
          >
            <option value="">{t.allAreas}</option>
            {AREAS.map((a) => (
              <option key={a.slug} value={a.slug}>{a.name}</option>
            ))}
          </select>
          <ChevronDown aria-hidden className="pointer-events-none absolute right-3 h-3.5 w-3.5" />
        </label>
        <div role="group" aria-label={t.sortLabel} className="flex gap-2">
          <button type="button" className={pill(!near)} aria-pressed={!near} onClick={() => onChange({ sort: "" })}>
            <CalendarClock aria-hidden className="h-4 w-4" /> {t.soonest}
          </button>
          <button type="button" className={pill(near)} aria-pressed={near} onClick={sortNear} disabled={locating}>
            <LocateFixed aria-hidden className={`h-4 w-4 ${locating ? "animate-pulse" : ""}`} />
            {locating ? t.locating : t.closest}
          </button>
        </div>
      </div>
      {msg ? (
        <p role="status" className="mt-2 text-[0.8125rem] font-semibold text-coral-600">{msg}</p>
      ) : (
        near && <p className="mt-2 text-[0.75rem] text-muted">{t.privacyHint}</p>
      )}
    </div>
  );
}
