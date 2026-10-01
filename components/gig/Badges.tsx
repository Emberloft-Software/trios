import { BadgeCheck, Sparkles, ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { ReliabilityBand } from "@/lib/database.types";

/** Verified = a live recording matched their approved photo. Nothing more. */
export function VerifiedBadge({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <span title="Verified: live video matched their photo" className="inline-flex text-mint">
        <BadgeCheck className="h-4.5 w-4.5" />
      </span>
    );
  }
  return (
    <Badge tone="mint" icon={<BadgeCheck className="h-3.5 w-3.5" />} title="Live video matched their photo, checked by our team">
      Verified
    </Badge>
  );
}

/** Reliability band — never a number. `restricted` never renders. */
export function ReliabilityMark({ band }: { band: ReliabilityBand }) {
  if (band === "reliable")
    return <Badge tone="mint" icon={<ThumbsUp className="h-3 w-3" />} title="Shows up">Reliable</Badge>;
  if (band === "new")
    return <Badge tone="muted" icon={<Sparkles className="h-3 w-3" />} title="Hasn't done enough gigs to say">New</Badge>;
  if (band === "mixed") return <Badge tone="sun" title="Has flaked recently">Mixed</Badge>;
  return null;
}
