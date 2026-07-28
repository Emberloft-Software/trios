"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { copy } from "@/lib/copy";
import { inviteFriendAction } from "@/app/(app)/me/friends/_actions";

/**
 * Host invites a friend to a gig they're hosting. The invite holds no slot and
 * gives no ordering advantage (R10) — it's just a nudge. Say that plainly.
 */
export function InvitePanel({
  gigId,
  friends,
}: {
  gigId: string;
  friends: { id: string; name: string }[];
}) {
  const [pending, start] = useTransition();
  const [invited, setInvited] = useState<Set<string>>(new Set());

  if (friends.length === 0) return null;

  return (
    <Card className="p-5">
      <h2 className="mb-1 font-display text-[1.125rem] font-600">{copy.friends.invite}</h2>
      <p className="mb-3 text-[0.8125rem] text-[var(--color-dust)]">
        Slots are first-come — nothing gets held for them.
      </p>
      <ul className="space-y-2">
        {friends.map((fr) => (
          <li key={fr.id} className="flex items-center justify-between text-[0.9375rem]">
            <span className="font-500">{fr.name}</span>
            {invited.has(fr.id) ? (
              <span className="text-[0.8125rem] text-[var(--color-net)]">{copy.friends.inviteSent}</span>
            ) : (
              <Button
                variant="secondary"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    const res = await inviteFriendAction(gigId, fr.id);
                    if (res.ok) setInvited((s) => new Set(s).add(fr.id));
                  })
                }
              >
                {copy.friends.invite}
              </Button>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
