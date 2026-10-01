"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";
import { copy } from "@/lib/copy";
import { joinGigAction } from "./_actions";
import type { GigStatus } from "@/lib/database.types";

export function JoinPanel({
  gigId,
  status,
  full,
  hasGuests,
}: {
  gigId: string;
  status: GigStatus;
  full: boolean;
  hasGuests: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ack, setAck] = useState(!hasGuests);

  if (status !== "open" || full) {
    return (
      <Notice tone="info">
        {full && status === "open" ? copy.errors.gig_full : status === "locked" ? copy.errors.gig_locked : copy.errors.gig_not_open}
      </Notice>
    );
  }

  return (
    <Card className="p-5">
      <p className="mb-3 text-[0.875rem] text-muted">{copy.lobby.joinHint}</p>
      {hasGuests && (
        <div className="mb-3">
          <Checkbox id="ack-guests" checked={ack} onChange={setAck}>
            {copy.guests.ack}
          </Checkbox>
        </div>
      )}
      <Button
        size="lg"
        block
        disabled={!ack}
        loading={pending}
        onClick={() => {
          setError(null);
          start(async () => {
            const res = await joinGigAction(gigId);
            if (!res.ok) return setError(res.error);
            router.refresh();
          });
        }}
      >
        {copy.gig.take}
      </Button>
      <p className="mt-3 text-center text-[0.75rem] text-muted">{copy.disclaimers.meetPublic}</p>
      {error && <Notice tone="danger" compact className="mt-3">{error}</Notice>}
    </Card>
  );
}
