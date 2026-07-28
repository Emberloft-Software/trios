"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { copy } from "@/lib/copy";
import { reviewVerificationAction } from "./_actions";
import type { Challenge } from "@/app/(app)/me/verify/_actions";

export interface ReviewItem {
  id: string;
  userId: string;
  name: string;
  photoUrl: string | null;
  accountDays: number;
  gigCount: number;
  reportCount: number;
  isVideo: boolean;
  challenge: Challenge;
}

const REJECT_REASONS = [
  "face_not_clear",
  "actions_not_performed",
  "code_not_read",
  "photo_mismatch",
  "suspected_recording",
  "other",
] as const;
type RejectReason = (typeof REJECT_REASONS)[number];

/**
 * The reviewer's console. The actual check: does the person in the video
 * perform the assigned actions and say the assigned code? The challenge is
 * shown beside the video — without it the reviewer can't do the check.
 * Video plays from a fresh 60-second signed URL fetched per item.
 * Keyboard: A approve, R reject, J/K next/previous.
 */
export function ReviewClient({ items }: { items: ReviewItem[] }) {
  const [queue, setQueue] = useState<ReviewItem[]>(items);
  const [idx, setIdx] = useState(0);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [reason, setReason] = useState<RejectReason>("face_not_clear");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = queue[idx] ?? null;
  const v = copy.verification;

  // Fetch a fresh signed URL whenever the current item changes.
  useEffect(() => {
    if (!current) {
      setMediaUrl(null);
      return;
    }
    let active = true;
    setMediaUrl(null);
    fetch(`/api/admin/verifications/${current.id}/media`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { url: string }) => {
        if (active) setMediaUrl(d.url);
      })
      .catch(() => active && setError("Couldn't load the recording."));
    return () => {
      active = false;
    };
  }, [current]);

  const act = useCallback(
    async (decision: "approve" | "reject" | "retake") => {
      if (!current || busy) return;
      setBusy(true);
      setError(null);
      const res = await reviewVerificationAction({
        requestId: current.id,
        decision,
        reason: decision === "approve" ? undefined : reason,
      });
      setBusy(false);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      // drop the reviewed item; keep the cursor in range
      setQueue((q) => q.filter((x) => x.id !== current.id));
      setIdx((i) => Math.min(i, queue.length - 2 < 0 ? 0 : queue.length - 2));
    },
    [current, busy, reason, queue.length],
  );

  const move = useCallback(
    (delta: number) => {
      setIdx((i) => Math.max(0, Math.min(queue.length - 1, i + delta)));
    },
    [queue.length],
  );

  // Keyboard shortcuts — skip when typing in a form control.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (t.tagName === "SELECT" || t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
      if (e.key === "a" || e.key === "A") act("approve");
      else if (e.key === "r" || e.key === "R") act("reject");
      else if (e.key === "j" || e.key === "J") move(1);
      else if (e.key === "k" || e.key === "K") move(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [act, move]);

  if (!current) {
    return (
      <Card className="p-8 text-center text-[0.9375rem] text-[var(--color-dust)]">
        Queue is clear. Nothing to review.
      </Card>
    );
  }

  return (
    <div>
      <p className="mb-3 font-data text-[0.8125rem] text-[var(--color-dust)]">
        {idx + 1} of {queue.length}
      </p>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* Recording + current profile photo side by side */}
        <Card className="p-4">
          <div className="grid grid-cols-[1.6fr_1fr] gap-3">
            <div className="overflow-hidden rounded-[var(--radius-chip)] border-2 border-[var(--color-ink)] bg-[var(--color-ink)]">
              {mediaUrl ? (
                current.isVideo ? (
                  <video src={mediaUrl} controls playsInline autoPlay className="aspect-[4/3] w-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl} alt="Liveness stills" className="w-full" />
                )
              ) : (
                <div className="grid aspect-[4/3] place-items-center text-[0.8125rem] text-[var(--color-chalk)]">
                  Loading…
                </div>
              )}
            </div>
            <div>
              <p className="mb-1 font-data text-[0.6875rem] uppercase tracking-[0.06em] text-[var(--color-dust)]">
                Profile photo
              </p>
              <div className="overflow-hidden rounded-[var(--radius-chip)] border-2 border-[var(--color-ink)] bg-[var(--color-court)]">
                {current.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={current.photoUrl} alt={current.name} className="aspect-square w-full object-cover" />
                ) : (
                  <div className="grid aspect-square place-items-center text-[0.75rem] text-[var(--color-dust)]">
                    No photo
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* The check + context + actions */}
        <div className="space-y-4">
          <Card className="p-4">
            <h2 className="mb-2 font-display text-[1.125rem] font-600">The check</h2>
            <p className="mb-1 text-[0.875rem] text-[var(--color-dust)]">Code spoken</p>
            <p className="font-data mb-3 text-2xl tracking-[0.15em]">{current.challenge.code}</p>
            <p className="mb-1 text-[0.875rem] text-[var(--color-dust)]">Actions performed, in order</p>
            <ol className="list-decimal space-y-1 pl-5 text-[0.9375rem]">
              {current.challenge.actions.map((a) => (
                <li key={a}>{v.actionPrompts[a] ?? a}</li>
              ))}
            </ol>
          </Card>

          <Card className="p-4">
            <h2 className="mb-2 font-display text-[1.125rem] font-600">{current.name}</h2>
            <dl className="grid grid-cols-3 gap-2 text-center">
              <Stat label="Account" value={`${current.accountDays}d`} />
              <Stat label="Gigs" value={String(current.gigCount)} />
              <Stat label="Reports" value={String(current.reportCount)} danger={current.reportCount > 0} />
            </dl>
          </Card>

          <Card className="p-4">
            <label htmlFor="reason" className="mb-1 block text-[0.875rem] font-500">
              Reject / retake reason
            </label>
            <select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value as RejectReason)}
              className="mb-3 w-full rounded-[var(--radius-chip)] border-2 border-[var(--color-ink)] bg-[var(--color-chalk)] px-3 py-2 text-[0.9375rem]"
            >
              {REJECT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {v.rejectReasons[r]}
                </option>
              ))}
            </select>

            {error && <p className="mb-2 text-[0.875rem] text-[var(--color-tape)]">{error}</p>}

            <div className="space-y-2">
              <Button onClick={() => act("approve")} disabled={busy} className="w-full">
                Approve <span className="font-data ml-1 opacity-70">A</span>
              </Button>
              <Button variant="secondary" onClick={() => act("reject")} disabled={busy} className="w-full">
                Reject <span className="font-data ml-1 opacity-70">R</span>
              </Button>
              <Button variant="secondary" onClick={() => act("retake")} disabled={busy} className="w-full">
                Ask for a retake
              </Button>
            </div>

            <div className="mt-3 flex justify-between text-[0.875rem]">
              <button onClick={() => move(-1)} className="text-[var(--color-net)] hover:underline">
                ← Previous (K)
              </button>
              <button onClick={() => move(1)} className="text-[var(--color-net)] hover:underline">
                Next (J) →
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="rounded-[var(--radius-tile)] border-2 border-[var(--color-ink)] p-2">
      <p className={`font-data text-lg ${danger ? "text-[var(--color-tape)]" : ""}`}>{value}</p>
      <p className="text-[0.6875rem] text-[var(--color-dust)]">{label}</p>
    </div>
  );
}
