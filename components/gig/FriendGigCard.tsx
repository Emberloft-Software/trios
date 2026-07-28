import { SlotStrip } from "@/components/ui/SlotStrip";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { formatGigTime } from "@/lib/time";
import { firstName } from "@/lib/avatar";
import type { Database } from "@/lib/database.types";

type FriendGig = Database["public"]["Views"]["friend_hosted_gigs"]["Row"];

/**
 * A gig hosted by a friend — the single deliberate exception to the blind feed
 * (R5), and only for hosts. Shows the host's name; still shows filled sockets
 * as anonymous shapes (the rest of the crew stays blind).
 */
export function FriendGigCard({ gig, tiltIndex = 0 }: { gig: FriendGig; tiltIndex?: number }) {
  return (
    <Card pinned hover tiltIndex={tiltIndex} className="p-5">
      <div className="mb-2 flex items-center gap-2">
        <span aria-hidden className="text-xl">{gig.activity_emoji}</span>
        <span className="font-data text-[0.75rem] uppercase tracking-[0.06em] text-[var(--color-net)]">
          {firstName(gig.host_name)} is hosting
        </span>
      </div>
      <h3 className="mb-1 font-display text-[1.25rem] font-600">{gig.title}</h3>
      <p className="mb-3 text-[0.875rem]">
        <span className="font-data">{formatGigTime(gig.starts_at)}</span> · {gig.place_label}
      </p>
      <SlotStrip
        variant="blind"
        capacity={gig.capacity}
        filled={gig.claimed_count}
        minToConfirm={gig.min_to_confirm}
      />
      <div className="mt-4">
        <ButtonLink href={`/gigs/${gig.id}`} variant="secondary" className="w-full">
          See this gig
        </ButtonLink>
      </div>
    </Card>
  );
}
