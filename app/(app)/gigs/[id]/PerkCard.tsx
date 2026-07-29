"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { copy } from "@/lib/copy";
import { redeemPerkAction } from "./_actions";

/**
 * Partner perk, shown in the lobby once the gig locks (docs/08). The gig code is
 * displayed large — the crew shows it at the venue, or the host taps Redeem.
 */
export function PerkCard({
  gigId,
  venueId,
  perk,
  code,
  isHost,
  alreadyRedeemed,
}: {
  gigId: string;
  venueId: string;
  perk: string;
  code: string;
  isHost: boolean;
  alreadyRedeemed: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(alreadyRedeemed);

  return (
    <Card className="p-5">
      <h2 className="mb-1 font-display text-[1.125rem] font-600">{copy.gig.perkTitle}</h2>
      <p className="text-[0.9375rem]">{perk}</p>
      <p className="mt-3 text-[0.75rem] uppercase tracking-[0.06em] text-[var(--color-dust)]">
        Show this code
      </p>
      <p className="font-data text-3xl tracking-[0.15em]">{code}</p>

      {isHost && !done && (
        <div className="mt-3">
          <Button
            variant="secondary"
            disabled={pending}
            loading={pending}
            onClick={() =>
              start(async () => {
                const res = await redeemPerkAction(gigId, venueId);
                if (!res.ok) setError(res.error);
                else {
                  setDone(true);
                  router.refresh();
                }
              })
            }
          >
            {copy.gig.redeem}
          </Button>
          {error && <p className="mt-2 text-[0.8125rem] text-[var(--color-tape)]">{error}</p>}
        </div>
      )}
      {done && (
        <p className="mt-3 text-[0.8125rem] text-[var(--color-net)]">{copy.gig.redeemed}</p>
      )}
    </Card>
  );
}
