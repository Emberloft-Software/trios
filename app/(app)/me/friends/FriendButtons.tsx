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
    <span className="flex items-center gap-2">
      <Button size="sm" loading={pending}
        onClick={() => start(async () => {
          const res = await acceptFriendRequestAction(requestId);
          if (!res.ok) setError(res.error);
          else router.refresh();
        })}>
        {copy.friends.accept}
      </Button>
      {error && <span className="text-[0.8125rem] text-coral-600">{error}</span>}
    </span>
  );
}

export function UnfriendButton({ otherId }: { otherId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button size="sm" variant="ghost" className="text-muted" loading={pending}
      onClick={() => start(async () => {
        const res = await unfriendAction(otherId);
        if (res.ok) router.refresh();
      })}>
      {copy.friends.unfriend}
    </Button>
  );
}
