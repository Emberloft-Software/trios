"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { copy } from "@/lib/copy";
import { checkInAction } from "./_actions";

/** "Who showed up?" — confirmations drive attendance + reliability. */
export function CheckinPanel({
  gigId,
  members,
  confirmed,
}: {
  gigId: string;
  members: { userId: string; name: string; avatarUrl: string | null }[];
  confirmed: string[];
}) {
  const [done, setDone] = useState<Set<string>>(new Set(confirmed));
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="glass rounded-[1.75rem] p-5 ring-2 ring-mint/40">
      <h2 className="text-[1.0625rem] font-bold">{copy.lobby.checkinTitle}</h2>
      <p className="mb-3 text-[0.8125rem] text-muted">{copy.lobby.checkinHint}</p>
      <ul className="space-y-2">
        {members.map((m) => (
          <li key={m.userId} className="flex items-center gap-3">
            <Avatar name={m.name} src={m.avatarUrl} size={36} />
            <span className="flex-1 font-semibold text-plum">{m.name}</span>
            {done.has(m.userId) ? (
              <span className="inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-mint"><Check className="h-4 w-4" />{copy.lobby.checkedIn}</span>
            ) : (
              <Button size="sm" variant="secondary" loading={busy === m.userId}
                onClick={async () => {
                  setBusy(m.userId);
                  setError(null);
                  const r = await checkInAction(gigId, m.userId);
                  setBusy(null);
                  if (r.ok) setDone((s) => new Set(s).add(m.userId));
                  else setError(r.error);
                }}>
                {copy.lobby.confirm}
              </Button>
            )}
          </li>
        ))}
      </ul>
      {error && <p className="mt-2 text-[0.8125rem] text-coral-600">{error}</p>}
    </section>
  );
}
