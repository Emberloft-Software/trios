"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { copy } from "@/lib/copy";
import { sendFriendRequestAction } from "@/app/(app)/me/friends/_actions";

/**
 * The ONLY Add-friend entry point in the app (docs/03): a completed gig's
 * summary, for someone you were both marked `attended` alongside. R9 is
 * enforced in the DB regardless.
 */
export function AddFriendButton({ recipientId, gigId }: { recipientId: string; gigId: string }) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (done) {
    return <span className="text-[0.8125rem] text-[var(--color-net)]">{copy.friends.added}</span>;
  }

  return (
    <span className="flex items-center gap-2">
      <Button
        variant="secondary"
        onClick={() =>
          start(async () => {
            const res = await sendFriendRequestAction(recipientId, gigId);
            if (!res.ok) setError(res.error);
            else setDone(true);
          })
        }
        disabled={pending}
        loading={pending}
      >
        {copy.friends.add}
      </Button>
      {error && <span className="text-[0.8125rem] text-[var(--color-tape)]">{error}</span>}
    </span>
  );
}
