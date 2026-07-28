"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { leaveGigAction } from "./_actions";

/**
 * Two doors (docs/03). "Something came up" is a normal leave; "I didn't feel
 * comfortable" carries no penalty at any timing and (in M4) opens a report.
 */
export function LeavePanel({ gigId }: { gigId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function leave(uncomfortable: boolean) {
    setError(null);
    start(async () => {
      const res = await leaveGigAction(gigId, uncomfortable);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/feed");
      router.refresh();
    });
  }

  if (!open) {
    return (
      <Button variant="ghost" onClick={() => setOpen(true)} className="text-[var(--color-net)]">
        Leave gig
      </Button>
    );
  }

  return (
    <Card className="p-5">
      <h2 className="mb-3 font-display text-[1.125rem] font-600">Leaving?</h2>
      <div className="space-y-2">
        <Button variant="secondary" onClick={() => leave(false)} disabled={pending} className="w-full">
          Something came up
        </Button>
        <Button variant="secondary" onClick={() => leave(true)} disabled={pending} className="w-full">
          I didn&apos;t feel comfortable
        </Button>
        <p className="text-[0.8125rem] text-[var(--color-dust)]">
          The second door never costs you anything, at any time. It quietly flags this to us.
        </p>
      </div>
      {error && <p className="mt-3 text-[0.9375rem] text-[var(--color-tape)]">{error}</p>}
      <button onClick={() => setOpen(false)} className="mt-3 text-[0.875rem] text-[var(--color-net)] hover:underline">
        Never mind
      </button>
    </Card>
  );
}
