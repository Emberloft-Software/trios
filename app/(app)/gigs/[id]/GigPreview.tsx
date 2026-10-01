import type { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { SlotStrip } from "@/components/ui/SlotStrip";
import { ReliabilityMark, VerifiedBadge } from "@/components/gig/Badges";
import { firstName } from "@/lib/avatar";
import { copy } from "@/lib/copy";
import { GigDetails, GigHeader, GuestsNotice } from "./GigHeader";
import { JoinPanel } from "./JoinPanel";
import type { LoadedGig } from "./_data";

/** What someone outside the crew sees: no names, no faces, just the plan. */
export async function GigPreview({ g, supabase }: { g: LoadedGig; supabase: Awaited<ReturnType<typeof createClient>> }) {
  const { gig } = g;
  const { data: host } = await supabase
    .from("profiles_public")
    .select("display_name, reliability_band, verification_status, age")
    .eq("id", gig.host_id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl">
      <GigHeader g={g} />
      <div className="space-y-4">
        <GuestsNotice g={g} />
        <Card className="p-5">
          <SlotStrip
            capacity={gig.capacity}
            claimed={gig.claimed_count}
            reserved={gig.reserved_slots}
            minToConfirm={gig.min_to_confirm}
            locked={gig.status === "locked"}
          />
          {host && (
            <div className="mt-4 flex items-center gap-3 border-t border-line pt-4">
              <Avatar name={host.display_name} size={40} />
              <div className="min-w-0 flex-1">
                <p className="text-[0.75rem] font-semibold text-muted">{copy.gig.hostedBy}</p>
                <p className="font-bold text-plum">
                  {firstName(host.display_name)}
                  {host.age ? <span className="font-medium text-muted">, {host.age}</span> : null}
                </p>
              </div>
              <div className="flex flex-wrap justify-end gap-1.5">
                {host.verification_status === "verified" && <VerifiedBadge />}
                <ReliabilityMark band={host.reliability_band} />
              </div>
            </div>
          )}
          <p className="mt-4 text-[0.8125rem] text-muted">{copy.lobby.previewBlind}</p>
        </Card>
        <GigDetails g={g} showCode={false} />
        <JoinPanel
          gigId={gig.id}
          status={gig.status}
          full={gig.claimed_count + gig.reserved_slots >= gig.capacity}
          hasGuests={gig.host_guests > 0 || g.crew.some((r) => r.joined_via === "invite")}
        />
      </div>
    </div>
  );
}
