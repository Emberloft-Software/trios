"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, MapPin, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";
import { Spinner } from "@/components/ui/Spinner";
import { copy } from "@/lib/copy";
import { upsertVenueFromPlaceAction, type PickedVenue } from "@/app/(app)/gigs/new/venue-actions";

interface Suggestion {
  placeId: string;
  primary: string;
  secondary: string;
}

function newToken() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}

/**
 * Google Places search, proxied through our API so the key stays server-side.
 * One session token spans the keystrokes and the final Details call.
 */
export function VenuePicker({ value, onPick }: { value: PickedVenue | null; onPick: (v: PickedVenue | null) => void }) {
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tokenRef = useRef<string>("");
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    tokenRef.current = newToken();
  }, []);

  const search = useCallback(async (input: string) => {
    if (input.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/places/autocomplete?q=${encodeURIComponent(input)}&token=${tokenRef.current}`);
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { suggestions: Suggestion[] };
      setSuggestions(data.suggestions ?? []);
      setError(null);
    } catch {
      setError(copy.errors.generic);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => search(q), 300);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [q, search]);

  async function select(s: Suggestion) {
    setError(null);
    setLoading(true);
    const res = await upsertVenueFromPlaceAction({ placeId: s.placeId, sessionToken: tokenRef.current });
    setLoading(false);
    tokenRef.current = newToken();
    if (!res.ok) return setError(res.error);
    setSuggestions([]);
    setQ("");
    onPick(res.venue);
  }

  if (value) {
    return (
      <div className="rounded-2xl bg-white/80 p-3 ring-1 ring-line">
        <div className="flex gap-3">
          {value.photoRef ? (
            <img src={`/api/place-photo?ref=${encodeURIComponent(value.photoRef)}&w=200`} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
          ) : (
            <span className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-plum-50 text-plum"><MapPin className="h-6 w-6" /></span>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-bold text-plum">{value.name}</p>
            <p className="text-[0.8125rem] text-muted">{value.address}</p>
            {typeof value.rating === "number" && (
              <p className="mt-0.5 flex items-center gap-1 text-[0.8125rem] text-muted tabular">
                <Star className="h-3.5 w-3.5 fill-sun text-sun" /> {value.rating.toFixed(1)}
              </p>
            )}
            {value.isPartner && value.partnerPerk && (
              <p className="mt-1 inline-block rounded-full bg-sun-100 px-2.5 py-0.5 text-[0.75rem] font-semibold text-[#6b4400]">{value.partnerPerk}</p>
            )}
            {value.mapsUrl && (
              <a href={value.mapsUrl} target="_blank" rel="noreferrer noopener" className="mt-1 flex items-center gap-1 text-[0.8125rem] font-semibold text-coral-600 hover:underline">
                {copy.venue.openInMaps} <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onPick(null)} className="mt-2">{copy.venue.change}</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={copy.venue.searchPlaceholder} aria-label={copy.venue.searchLabel} className="pl-11" />
        {loading && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted"><Spinner /></span>}
      </div>
      <p className="mt-1.5 text-[0.8125rem] text-muted">{copy.venue.searchHint}</p>
      {error && <Notice tone="danger" compact className="mt-2">{error}</Notice>}
      {suggestions.length > 0 && (
        <ul className="mt-2 overflow-hidden rounded-2xl bg-white ring-1 ring-line shadow-[var(--shadow-soft)]">
          {suggestions.map((s) => (
            <li key={s.placeId} className="border-b border-line last:border-0">
              <button type="button" onClick={() => select(s)} className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-plum-50">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-plum">{s.primary}</span>
                  <span className="block truncate text-[0.8125rem] text-muted">{s.secondary}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
