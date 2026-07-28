"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { copy } from "@/lib/copy";
import { acceptFriendRequestAction, unfriendAction } from "./_actions";

export function AcceptButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <span>
      <Button
        onClick={() =>
          start(async () => {
            const res = await acceptFriendRequestAction(requestId);
            if (!res.ok) setError(res.error);
            else router.refresh();
          })
        }
        disabled={pending}
      >
        {copy.friends.accept}
      </Button>
      {error && <span className="ml-2 text-[0.8125rem] text-[var(--color-tape)]">{error}</span>}
    </span>
  );
}

export function UnfriendButton({ otherId }: { otherId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      variant="ghost"
      className="text-[var(--color-net)]"
      onClick={() =>
        start(async () => {
          const res = await unfriendAction(otherId);
          if (res.ok) router.refresh();
        })
      }
      disabled={pending}
    >
      {copy.friends.unfriend}
    </Button>
  );
}
