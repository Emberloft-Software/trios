import { SlotStrip } from "@/components/ui/SlotStrip";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { formatGigTime } from "@/lib/time";
import type { Database } from "@/lib/database.types";

type FeedGig = Database["public"]["Views"]["gig_feed"]["Row"];

/**
 * A feed row. Blind by construction (R5): activity, title, time, place, and how
 * many slots are filled — never crew names or faces. Filled sockets are solid
 * shapes, not avatars.
 */
export function GigCard({ gig, tiltIndex = 0 }: { gig: FeedGig; tiltIndex?: number }) {
  const locked = gig.status === "locked";
  return (
    <Card pinned hover tiltIndex={tiltIndex} className="p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <span aria-hidden className="text-xl">{gig.activity_emoji}</span>
            <span className="font-data text-[0.75rem] uppercase tracking-[0.06em] text-[var(--color-dust)]">
              {gig.activity_name}
            </span>
          </div>
          <h3 className="truncate font-display text-[1.25rem] font-600">{gig.title}</h3>
        </div>
        <span className="font-data shrink-0 rounded-[var(--radius-chip)] border-2 border-[var(--color-ink)] bg-[var(--color-line)] px-2 py-1 text-[0.6875rem] tracking-[0.04em]">
          {gig.code}
        </span>
      </div>

      <dl className="mb-4 space-y-1 text-[0.875rem]">
        <div className="flex gap-2">
          <dt className="text-[var(--color-dust)]">When</dt>
          <dd className="font-data">{formatGigTime(gig.starts_at)}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-[var(--color-dust)]">Where</dt>
          <dd className="truncate">{gig.place_label}</dd>
        </div>
        {gig.cost_note && (
          <div className="flex gap-2">
            <dt className="text-[var(--color-dust)]">Cost</dt>
            <dd>{gig.cost_note}</dd>
          </div>
        )}
      </dl>

      <SlotStrip
        variant="blind"
        capacity={gig.capacity}
        filled={gig.claimed_count}
        minToConfirm={gig.min_to_confirm}
        locked={locked}
      />

      <div className="mt-4">
        <ButtonLink href={`/gigs/${gig.id}`} variant="secondary" className="w-full">
          {locked ? "View" : "See this gig"}
        </ButtonLink>
      </div>
    </Card>
  );
}
