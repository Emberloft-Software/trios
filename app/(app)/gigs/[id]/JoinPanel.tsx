"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { copy } from "@/lib/copy";
import { joinGigAction } from "./_actions";
import type { GigStatus } from "@/lib/database.types";

export function JoinPanel({ gigId, status }: { gigId: string; status: GigStatus }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (status !== "open") {
    return (
      <Card className="p-5">
        <p className="text-[0.9375rem] text-[var(--color-dust)]">
          {status === "locked" ? copy.errors.gig_locked : copy.errors.gig_not_open}
        </p>
      </Card>
    );
  }

  function join() {
    setError(null);
    start(async () => {
      const res = await joinGigAction(gigId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Card className="p-5">
      <p className="mb-3 text-[0.9375rem]">{copy.lobby.joinHint}</p>
      <Button onClick={join} disabled={pending} className="w-full">
        {pending ? "Taking…" : copy.gig.take}
      </Button>
      {error && <p className="mt-3 text-[0.9375rem] text-[var(--color-tape)]">{error}</p>}
    </Card>
  );
}
