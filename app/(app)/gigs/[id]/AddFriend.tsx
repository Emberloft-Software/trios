"use client";

import { useState, useTransition } from "react";
import { UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { copy } from "@/lib/copy";
import { sendFriendRequestAction } from "@/app/(app)/me/friends/_actions";

/** Post-gig "Add friend" — only for people you both checked in with. */
export function AddFriend({ recipientId, gigId }: { recipientId: string; gigId: string }) {
  const [pending, start] = useTransition();
  const [state, setState] = useState<"idle" | "sent" | string>("idle");
  if (state === "sent") return <Badge tone="mint">{copy.friends.added}</Badge>;
  return (
    <Button
      size="sm"
      variant="secondary"
      loading={pending}
      title={state !== "idle" ? state : undefined}
      onClick={() =>
        start(async () => {
          const res = await sendFriendRequestAction(recipientId, gigId);
          setState(res.ok ? "sent" : res.error);
        })
      }
    >
      <UserPlus className="h-4 w-4" /> {copy.friends.add}
    </Button>
  );
}
