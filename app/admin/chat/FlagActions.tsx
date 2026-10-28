"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, MessageSquareX, UserMinus, UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { deleteFlaggedMessageAction, dismissFlagAction, removeFlaggedUserAction, type ChatFlagResult } from "./_actions";

export function FlagActions({
  flagId,
  userId,
  messageRemoved,
  canRemoveUser,
}: {
  flagId: string;
  userId: string | null;
  messageRemoved: boolean;
  canRemoveUser: boolean;
}) {
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [reason, setReason] = useState("Abusive or inappropriate messages in the group chat");

  const run = (key: string, fn: () => Promise<ChatFlagResult>) =>
    start(async () => {
      setBusy(key);
      setError(null);
      const r = await fn();
      setBusy(null);
      if (!r.ok) setError(r.error);
      else setAsking(false);
    });

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2">
        {!messageRemoved && (
          <Button size="sm" variant="dark" loading={pending && busy === "del"} onClick={() => run("del", () => deleteFlaggedMessageAction(flagId))}>
            <MessageSquareX className="h-4 w-4" /> Remove message
          </Button>
        )}
        {canRemoveUser && !asking && (
          <Button size="sm" variant="danger" onClick={() => setAsking(true)}>
            <UserMinus className="h-4 w-4" /> Remove from gig
          </Button>
        )}
        <Button size="sm" variant="secondary" loading={pending && busy === "dismiss"} onClick={() => run("dismiss", () => dismissFlagAction(flagId))}>
          <Check className="h-4 w-4" /> Dismiss (no problem)
        </Button>
        {userId && (
          <Link href={`/admin/users/${userId}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[0.8125rem] font-semibold text-plum hover:bg-plum/5">
            <UserRound className="h-4 w-4" /> Warn or restrict account
          </Link>
        )}
      </div>
      {asking && (
        <div className="mt-3 flex flex-wrap items-end gap-2 rounded-2xl bg-coral-50 p-3 ring-1 ring-coral/15">
          <label className="min-w-0 flex-1 basis-60 text-[0.75rem] font-semibold text-plum">
            Reason (shown in the audit log)
            <Input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} className="mt-1" />
          </label>
          <Button size="sm" variant="danger" loading={pending && busy === "kick"} onClick={() => run("kick", () => removeFlaggedUserAction(flagId, reason))}>
            Confirm removal
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setAsking(false)}>Cancel</Button>
        </div>
      )}
      {error && <p className="mt-2 text-[0.8125rem] font-semibold text-coral-600">{error}</p>}
    </div>
  );
}
