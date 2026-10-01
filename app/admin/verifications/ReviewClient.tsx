"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronLeft, ChevronRight, RotateCcw, ScanFace, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Select, Textarea } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { copy } from "@/lib/copy";
import { reviewVerificationAction } from "./_actions";
import type { Challenge } from "@/app/(app)/me/verify/_actions";

export interface ReviewItem {
  id: string;
  userId: string;
  name: string;
  handle: string;
  age: number | null;
  gender: string | null;
  photoUrl: string | null;
  photoPending: boolean;
  accountDays: number;
  gigCount: number;
  reportCount: number;
  attempts: number;
  isVideo: boolean;
  mime: string;
  bytes: number | null;
  device: string | null;
  submittedAgo: string;
  challenge: Challenge;
}

const REASONS = ["face_not_clear", "actions_not_performed", "code_not_read", "photo_mismatch", "suspected_recording", "other"] as const;
type Reason = (typeof REASONS)[number];

/**
 * Reviewer console. Recording beside the profile photo, the exact challenge
 * that was issued, and context about the account. A fresh 60-second signed URL
 * is fetched per item. Keyboard: A approve · R reject · T retake · J/K next/prev
 * · Space play/pause.
 */
export function ReviewClient({ items }: { items: ReviewItem[] }) {
  const [queue, setQueue] = useState(items);
  const [idx, setIdx] = useState(0);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaErr, setMediaErr] = useState(false);
  const [reason, setReason] = useState<Reason>("face_not_clear");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<null | "approve" | "reject" | "retake">(null);
  const [error, setError] = useState<string | null>(null);
  const [rate, setRate] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  const current = queue[idx] ?? null;
  const v = copy.verification;

  useEffect(() => {
    if (!current) return;
    let live = true;
    setMediaUrl(null);
    setMediaErr(false);
    fetch(`/api/admin/verifications/${current.id}/media`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { url: string }) => live && setMediaUrl(d.url))
      .catch(() => live && setMediaErr(true));
    return () => {
      live = false;
    };
  }, [current]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = rate;
  }, [rate, mediaUrl]);

  const act = useCallback(
    async (decision: "approve" | "reject" | "retake") => {
      if (!current || busy) return;
      setBusy(decision);
      setError(null);
      const res = await reviewVerificationAction({ requestId: current.id, decision, reason: decision === "approve" ? undefined : reason, note: note || undefined });
      setBusy(null);
      if (!res.ok) return setError(res.error);
      setNote("");
      setQueue((q) => q.filter((x) => x.id !== current.id));
      setIdx((i) => Math.max(0, Math.min(i, queue.length - 2)));
    },
    [current, busy, reason, note, queue.length],
  );

  const move = useCallback((d: number) => setIdx((i) => Math.max(0, Math.min(queue.length - 1, i + d))), [queue.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (["SELECT", "INPUT", "TEXTAREA"].includes(t.tagName)) return;
      const k = e.key.toLowerCase();
      if (k === "a") act("approve");
      else if (k === "r") act("reject");
      else if (k === "t") act("retake");
      else if (k === "j") move(1);
      else if (k === "k") move(-1);
      else if (k === " " && videoRef.current) {
        e.preventDefault();
        if (videoRef.current.paused) videoRef.current.play();
        else videoRef.current.pause();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [act, move]);

  if (!current) return <EmptyState title="Queue is clear. Nothing waiting for review." />;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[0.875rem] font-semibold text-muted tabular">{idx + 1} of {queue.length} · submitted {current.submittedAgo}</p>
        <div className="flex gap-1">
          <Button size="sm" variant="secondary" onClick={() => move(-1)} disabled={idx === 0} aria-label="Previous"><ChevronLeft className="h-4 w-4" /></Button>
          <Button size="sm" variant="secondary" onClick={() => move(1)} disabled={idx >= queue.length - 1} aria-label="Next"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="glass rounded-[1.75rem] p-4">
          <div className="grid gap-3 sm:grid-cols-[1.7fr_1fr]">
            <div>
              <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-muted">Recording</p>
              <div className="overflow-hidden rounded-2xl bg-plum-800">
                {mediaUrl ? (
                  current.isVideo ? (
                    <video ref={videoRef} key={mediaUrl} src={mediaUrl} controls playsInline autoPlay className="aspect-[3/4] w-full bg-black object-contain sm:aspect-[4/3]" />
                  ) : (
                    <img src={mediaUrl} alt="Liveness stills" className="w-full" />
                  )
                ) : (
                  <div className="grid aspect-[4/3] place-items-center text-[0.8125rem] text-white/70">
                    {mediaErr ? "Couldn't load the recording (it may have been purged)." : "Loading…"}
                  </div>
                )}
              </div>
              {current.isVideo && (
                <div className="mt-2 flex items-center gap-1.5">
                  {[0.5, 1, 1.5].map((r) => (
                    <button key={r} onClick={() => setRate(r)} className={`rounded-full px-2.5 py-1 text-[0.75rem] font-bold ${rate === r ? "bg-plum text-white" : "bg-white/70 text-plum ring-1 ring-line"}`}>{r}×</button>
                  ))}
                  <span className="ml-auto text-[0.6875rem] text-muted">{current.mime}{current.bytes ? ` · ${(current.bytes / 1048576).toFixed(1)} MB` : ""}</span>
                </div>
              )}
            </div>
            <div>
              <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-muted">Profile photo {current.photoPending && <Badge tone="sun" className="ml-1">pending</Badge>}</p>
              <div className="overflow-hidden rounded-2xl bg-plum-50">
                {current.photoUrl ? (
                  <img src={current.photoUrl} alt={current.name} className="aspect-square w-full object-cover" />
                ) : (
                  <div className="grid aspect-square place-items-center text-[0.75rem] text-muted">No photo</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-[1.75rem] p-5">
            <p className="flex items-center gap-2 font-bold text-plum"><ScanFace className="h-5 w-5" /> The check</p>
            <p className="mt-3 text-[0.75rem] font-semibold text-muted">Code they should say</p>
            <p className="text-[2rem] font-extrabold tracking-[0.2em] text-plum tabular">{current.challenge.code}</p>
            <p className="mt-2 text-[0.75rem] font-semibold text-muted">Actions, in order</p>
            <ol className="mt-1 list-decimal space-y-1 pl-5 text-[0.9375rem] font-medium">
              {current.challenge.actions.map((a) => <li key={a}>{v.actionPrompts[a] ?? a}</li>)}
            </ol>
          </div>

          <div className="glass rounded-[1.75rem] p-5">
            <div className="flex items-center gap-3">
              <Avatar name={current.name} src={current.photoUrl} size={40} />
              <div className="min-w-0">
                <Link href={`/admin/users/${current.userId}`} className="block truncate font-bold text-plum hover:underline">{current.name}</Link>
                <p className="text-[0.75rem] text-muted">@{current.handle}{current.age ? ` · ${current.age}` : ""}{current.gender ? ` · ${current.gender}` : ""}</p>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-4 gap-2 text-center">
              <Stat label="Account" value={`${current.accountDays}d`} />
              <Stat label="Gigs" value={current.gigCount} />
              <Stat label="Reports" value={current.reportCount} danger={current.reportCount > 0} />
              <Stat label="Tries" value={current.attempts} danger={current.attempts > 2} />
            </dl>
            {current.device && <p className="mt-3 text-[0.75rem] text-muted">Device: {current.device}</p>}
          </div>

          <div className="glass space-y-3 rounded-[1.75rem] p-5">
            <Select aria-label="Reject or retake reason" value={reason} onChange={(e) => setReason(e.target.value as Reason)}>
              {REASONS.map((r) => <option key={r} value={r}>{v.rejectReasons[r]}</option>)}
            </Select>
            <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal note (optional)" maxLength={500} />
            {error && <p className="text-[0.8125rem] font-semibold text-coral-600">{error}</p>}
            <Button block onClick={() => act("approve")} loading={busy === "approve"} disabled={!!busy} className="!bg-mint hover:!bg-[#0e8a5a] !shadow-none">
              <Check className="h-4.5 w-4.5" /> Approve <kbd className="ml-1 rounded bg-white/25 px-1.5 text-[0.6875rem]">A</kbd>
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="danger" onClick={() => act("reject")} loading={busy === "reject"} disabled={!!busy}>
                <X className="h-4 w-4" /> Reject <kbd className="rounded bg-coral-50 px-1 text-[0.6875rem]">R</kbd>
              </Button>
              <Button variant="secondary" onClick={() => act("retake")} loading={busy === "retake"} disabled={!!busy}>
                <RotateCcw className="h-4 w-4" /> Retake <kbd className="rounded bg-plum-50 px-1 text-[0.6875rem]">T</kbd>
              </Button>
            </div>
            <p className="text-[0.6875rem] text-muted">“Retake” lets them try again straight away without the 1-hour cooldown. J/K to move, Space to play/pause.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, danger }: { label: string; value: string | number; danger?: boolean }) {
  return (
    <div className="rounded-xl bg-white/70 p-2 ring-1 ring-line">
      <dd className={`text-[1rem] font-extrabold tabular ${danger ? "text-coral-600" : "text-plum"}`}>{value}</dd>
      <dt className="text-[0.625rem] font-semibold text-muted">{label}</dt>
    </div>
  );
}
