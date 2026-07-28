import type { ReliabilityBand } from "@/lib/database.types";

/**
 * Verified badge — docs/05: means "same face as photo", nothing more.
 * A small --color-net tick.
 */
export function VerifiedBadge() {
  return (
    <span
      title="Verified — a real person recorded live, checked by a human"
      className="inline-flex items-center gap-1 text-[var(--color-net)]"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden fill="none">
        <path d="M2 7.5 5.5 11 12 3.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="font-data text-[0.6875rem] uppercase tracking-[0.06em]">Verified</span>
    </span>
  );
}

/**
 * Reliability band (docs/06). Never a number. `reliable` is a --color-net tick;
 * `new` is neutral (most users are new at launch — not a warning). `mixed`
 * shows only to host/admin; `restricted` never renders (they can't join).
 */
export function ReliabilityMark({ band }: { band: ReliabilityBand }) {
  if (band === "reliable") {
    return (
      <span className="inline-flex items-center gap-1 text-[var(--color-net)]" title="Shows up">
        <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden fill="none">
          <path d="M2 7.5 5.5 11 12 3.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-data text-[0.6875rem] uppercase tracking-[0.06em]">Reliable</span>
      </span>
    );
  }
  if (band === "new") {
    return (
      <span className="font-data text-[0.6875rem] uppercase tracking-[0.06em] text-[var(--color-dust)]" title="Hasn't finished enough gigs to say">
        New
      </span>
    );
  }
  if (band === "mixed") {
    return (
      <span className="font-data text-[0.6875rem] uppercase tracking-[0.06em] text-[var(--color-dust)]" title="Has flaked recently">
        Mixed
      </span>
    );
  }
  return null;
}
