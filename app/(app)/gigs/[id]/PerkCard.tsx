"use client";

import { useState, useTransition } from "react";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { copy } from "@/lib/copy";
import { redeemPerkAction } from "./_actions";

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
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(alreadyRedeemed);

  return (
    <section className="rounded-[1.75rem] bg-gradient-to-br from-sun to-[#ff9a3d] p-5 text-plum shadow-[var(--shadow-soft)]">
      <p className="flex items-center gap-2 text-[1.0625rem] font-bold"><Gift className="h-5 w-5" /> {copy.gig.perkTitle}</p>
      <p className="mt-1 text-[0.9375rem]">{perk}</p>
      <p className="mt-4 text-[0.6875rem] font-bold uppercase tracking-wider opacity-70">{copy.gig.showCode}</p>
      <p className="text-[2rem] font-extrabold tracking-[0.12em] tabular">{code}</p>
      {done ? (
        <Badge tone="white" className="mt-2">{copy.gig.redeemed}</Badge>
      ) : (
        isHost && (
          <Button size="sm" variant="dark" className="mt-2" loading={pending}
            onClick={() =>
              start(async () => {
                const r = await redeemPerkAction(gigId, venueId);
                if (!r.ok) return setError(r.error);
                setDone(true);
              })
            }>
            {copy.gig.redeem}
          </Button>
        )
      )}
      {error && <p className="mt-2 text-[0.8125rem] font-semibold">{error}</p>}
    </section>
  );
}
