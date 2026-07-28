"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { brand } from "@/lib/brand";
import {
  upsertVenueFromPlaceAction,
  type PickedVenue,
} from "@/app/(app)/gigs/new/venue-actions";

interface Suggestion {
  placeId: string;
  primary: string;
  secondary: string;
}

const FIELD =
  "w-full rounded-[var(--radius-chip)] border-2 border-[var(--color-ink)] bg-[var(--color-chalk)] px-3 py-2.5 text-[1rem] outline-none";

/**
 * Real place search (docs/03). A session token spans the keystrokes and is
 * terminated by the Details call inside the upsert action, so a whole search
 * bills as ONE session. Debounced at 300ms. The Maps key stays server-side —
 * both autocomplete and photos go through our proxy routes.
 */
export function VenuePicker({
  value,
  onPick,
}: {
  value: PickedVenue | null;
  onPick: (v: PickedVenue | null) => void;
}) {
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tokenRef = useRef<string>(newToken());
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  function newToken() {
    return typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  }

  const search = useCallback(async (input: string) => {
    if (input.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    const res = await fetch(
      `/api/places/autocomplete?q=${encodeURIComponent(input)}&token=${tokenRef.current}`,
    );
    setLoading(false);
    if (!res.ok) return;
    const data = (await res.json()) as { suggestions: Suggestion[] };
    setSuggestions(data.suggestions ?? []);
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
    const res = await upsertVenueFromPlaceAction({
      placeId: s.placeId,
      sessionToken: tokenRef.current,
    });
    setLoading(false);
    // Details terminated the session; start a fresh token for the next search.
    tokenRef.current = newToken();
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setSuggestions([]);
    setQ("");
    onPick(res.venue);
  }

  function clear() {
    onPick(null);
    setError(null);
  }

  // ── Confirm card ────────────────────────────────────────────────────────────
  if (value) {
    return (
      <div className="rounded-[var(--radius-chip)] border-2 border-[var(--color-ink)] bg-[var(--color-chalk)] p-3">
        <div className="flex gap-3">
          {value.photoRef && (
            <div className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/place-photo?ref=${encodeURIComponent(value.photoRef)}&w=200`}
                alt={value.name}
                className="h-20 w-20 rounded-[var(--radius-tile)] border-2 border-[var(--color-ink)] object-cover"
              />
              {value.photoAttribution && (
                <p className="mt-0.5 text-[0.5625rem] text-[var(--color-dust)]">
                  © {value.photoAttribution}
                </p>
              )}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-display text-[1.0625rem] font-600">{value.name}</p>
            <p className="text-[0.875rem] text-[var(--color-dust)]">{value.address}</p>
            {value.isPartner && value.partnerPerk && (
              <p className="mt-1 inline-block rounded-[var(--radius-tile)] border-2 border-[var(--color-ink)] bg-[var(--color-line)] px-2 py-0.5 text-[0.8125rem]">
                {value.partnerPerk}
              </p>
            )}
            {value.mapsUrl && (
              <a href={value.mapsUrl} target="_blank" rel="noreferrer"
                className="mt-1 block text-[0.8125rem] text-[var(--color-net)] hover:underline">
                View on Google Maps
              </a>
            )}
          </div>
        </div>
        <Button variant="ghost" onClick={clear} className="mt-2 text-[var(--color-net)]">
          Change venue
        </Button>
      </div>
    );
  }

  // ── Search ──────────────────────────────────────────────────────────────────
  return (
    <div>
      <input
        className={FIELD}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search a cafe, court, park, or venue"
        aria-label="Search venues"
      />
      <p className="mt-1 text-[0.8125rem] text-[var(--color-dust)]">
        A public place in and around {brand.city}. Home addresses aren&apos;t allowed.
      </p>
      {loading && <p className="mt-2 text-[0.8125rem] text-[var(--color-dust)]">Searching…</p>}
      {error && <p className="mt-2 text-[0.875rem] text-[var(--color-tape)]">{error}</p>}
      {suggestions.length > 0 && (
        <ul className="mt-2 space-y-1 rounded-[var(--radius-chip)] border-2 border-[var(--color-ink)] bg-[var(--color-chalk)] p-1">
          {suggestions.map((s) => (
            <li key={s.placeId}>
              <button
                type="button"
                onClick={() => select(s)}
                className="w-full rounded-[var(--radius-tile)] px-3 py-2 text-left hover:bg-[var(--color-line)]"
              >
                <span className="block font-500">{s.primary}</span>
                <span className="block text-[0.8125rem] text-[var(--color-dust)]">{s.secondary}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
