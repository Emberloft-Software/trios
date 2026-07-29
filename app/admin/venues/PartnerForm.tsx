"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { setVenuePartnerAction } from "./_actions";

/** Toggle partner status + edit the perk text for one venue. */
export function PartnerForm({
  venueId,
  isPartner,
  perk,
}: {
  venueId: string;
  isPartner: boolean;
  perk: string | null;
}) {
  const router = useRouter();
  const [partner, setPartner] = useState(isPartner);
  const [text, setText] = useState(perk ?? "");
  const [pending, start] = useTransition();
  const [ok, setOk] = useState(false);

  function save() {
    setOk(false);
    start(async () => {
      const res = await setVenuePartnerAction({ venueId, isPartner: partner, perk: text || null });
      if (res.ok) {
        setOk(true);
        router.refresh();
      }
    });
  }

  return (
    <div className="mt-3 border-t-2 border-[var(--color-ink)] pt-3">
      <label className="flex items-center gap-2 text-[0.9375rem]">
        <input type="checkbox" checked={partner} onChange={(e) => setPartner(e.target.checked)}
          className="h-5 w-5 accent-[var(--color-tape)]" />
        Partner venue
      </label>
      {partner && (
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={200}
          placeholder="15% off for Trio crews of 3+"
          className="mt-2 w-full rounded-[var(--radius-chip)] border-2 border-[var(--color-ink)] bg-[var(--color-chalk)] px-3 py-2 text-[0.875rem] outline-none"
        />
      )}
      <div className="mt-2 flex items-center gap-3">
        <Button variant="secondary" onClick={save} disabled={pending} loading={pending}>Save</Button>
        {ok && <span className="text-[0.8125rem] text-[var(--color-net)]">Saved</span>}
      </div>
    </div>
  );
}
