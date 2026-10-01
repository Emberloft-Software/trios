"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { Textarea } from "@/components/ui/Field";
import { adminCancelGigAction } from "./_actions";

export function CancelGigButton({ gigId }: { gigId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <>
      <Button size="sm" variant="danger" onClick={() => setOpen(true)}>Cancel gig</Button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Cancel this gig?">
        <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (logged)" />
        {error && <p className="mt-2 text-[0.8125rem] text-coral-600">{error}</p>}
        <Button className="mt-3" block loading={pending} disabled={reason.trim().length < 3}
          onClick={() => start(async () => {
            const r = await adminCancelGigAction(gigId, reason);
            if (!r.ok) return setError(r.error);
            setOpen(false);
          })}>
          Cancel gig
        </Button>
      </Sheet>
    </>
  );
}
