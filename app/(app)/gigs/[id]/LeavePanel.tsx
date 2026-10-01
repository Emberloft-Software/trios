"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { Notice } from "@/components/ui/Notice";
import { copy } from "@/lib/copy";
import { cancelGigAction, leaveGigAction } from "./_actions";

/** Two doors out. "I didn't feel comfortable" never costs anything. */
export function LeavePanel({ gigId }: { gigId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [which, setWhich] = useState<"cameUp" | "uncomfortable" | null>(null);
  const [error, setError] = useState<string | null>(null);

  function leave(uncomfortable: boolean) {
    setError(null);
    setWhich(uncomfortable ? "uncomfortable" : "cameUp");
    start(async () => {
      const res = await leaveGigAction(gigId, uncomfortable);
      if (!res.ok) return setError(res.error);
      router.push("/gigs");
      router.refresh();
    });
  }

  return (
    <>
      <Button variant="ghost" block onClick={() => setOpen(true)} className="text-muted">
        <LogOut className="h-4 w-4" /> {copy.gig.leave}
      </Button>
      <Sheet open={open} onClose={() => setOpen(false)} title={copy.lobby.leaving} closeLabel={copy.trust.close}>
        <div className="space-y-2">
          <Button variant="secondary" block onClick={() => leave(false)} disabled={pending} loading={which === "cameUp" && pending}>
            {copy.lobby.somethingCameUp}
          </Button>
          <Button variant="secondary" block onClick={() => leave(true)} disabled={pending} loading={which === "uncomfortable" && pending}>
            {copy.lobby.didntFeelComfortable}
          </Button>
          <p className="pt-1 text-[0.8125rem] text-muted">{copy.lobby.leaveHint}</p>
          {error && <Notice tone="danger" compact>{error}</Notice>}
        </div>
      </Sheet>
    </>
  );
}

export function HostControls({ gigId }: { gigId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <>
      <Button variant="ghost" block onClick={() => setOpen(true)} className="text-coral-600">
        <XCircle className="h-4 w-4" /> {copy.gig.cancel}
      </Button>
      <Sheet open={open} onClose={() => setOpen(false)} title={copy.gig.cancel} closeLabel={copy.trust.close}>
        <p className="text-[0.9375rem] text-muted">{copy.gig.cancelConfirm}</p>
        {error && <Notice tone="danger" compact className="mt-3">{error}</Notice>}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>{copy.gig.keep}</Button>
          <Button
            loading={pending}
            onClick={() =>
              start(async () => {
                const res = await cancelGigAction(gigId);
                if (!res.ok) return setError(res.error);
                setOpen(false);
                router.refresh();
              })
            }
          >
            {copy.gig.cancelDo}
          </Button>
        </div>
      </Sheet>
    </>
  );
}
