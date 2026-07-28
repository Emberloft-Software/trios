"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { moderateUserAction, setVerificationAction } from "../_actions";
import type { ModAction } from "@/lib/database.types";

const LADDER: { action: ModAction; label: string; needsDuration: boolean }[] = [
  { action: "warn", label: "Warn", needsDuration: false },
  { action: "restrict_posting", label: "Restrict posting (can't host)", needsDuration: true },
  { action: "restrict_joining", label: "Restrict joining", needsDuration: true },
  { action: "suspend", label: "Suspend", needsDuration: true },
  { action: "ban", label: "Ban (permanent)", needsDuration: false },
  { action: "clear", label: "Clear all restrictions", needsDuration: false },
];

const FIELD =
  "w-full rounded-[var(--radius-chip)] border-2 border-[var(--color-ink)] bg-[var(--color-chalk)] px-3 py-2 text-[0.875rem] outline-none";

/** Apply a rung of the moderation ladder, or force/revoke verification. Each
 *  writes moderation_actions + admin_audit and notifies the user. */
export function ModerationForm({ targetId, verified }: { targetId: string; verified: boolean }) {
  const router = useRouter();
  const [action, setAction] = useState<ModAction>("warn");
  const [reason, setReason] = useState("");
  const [days, setDays] = useState(30);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const current = LADDER.find((l) => l.action === action)!;

  function apply() {
    setError(null);
    setOk(null);
    start(async () => {
      const res = await moderateUserAction({
        targetId,
        action,
        reason,
        durationDays: current.needsDuration ? days : undefined,
      });
      if (!res.ok) return setError(res.error);
      setOk("Applied.");
      setReason("");
      router.refresh();
    });
  }

  function toggleVerify() {
    start(async () => {
      const res = await setVerificationAction(targetId, !verified);
      if (!res.ok) return setError(res.error);
      router.refresh();
    });
  }

  return (
    <Card className="p-5">
      <h2 className="mb-3 font-display text-[1.25rem] font-600">Moderation</h2>
      <div className="space-y-3">
        <select className={FIELD} value={action} onChange={(e) => setAction(e.target.value as ModAction)}>
          {LADDER.map((l) => (
            <option key={l.action} value={l.action}>{l.label}</option>
          ))}
        </select>
        {current.needsDuration && (
          <label className="flex items-center gap-2 text-[0.875rem]">
            For
            <input type="number" min={1} max={3650} value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className={`${FIELD} w-24`} />
            days
          </label>
        )}
        <textarea className={FIELD} rows={2} value={reason} maxLength={1000}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (recorded; a ban should name the second admin who signed off)" />
        {error && <p className="text-[0.8125rem] text-[var(--color-tape)]">{error}</p>}
        {ok && <p className="text-[0.8125rem] text-[var(--color-net)]">{ok}</p>}
        <Button onClick={apply} disabled={pending || reason.trim().length < 3} className="w-full">
          Apply
        </Button>
      </div>

      <div className="mt-4 border-t-2 border-[var(--color-ink)] pt-4">
        <Button variant="secondary" onClick={toggleVerify} disabled={pending} className="w-full">
          {verified ? "Revoke verification" : "Force-verify"}
        </Button>
      </div>
    </Card>
  );
}
