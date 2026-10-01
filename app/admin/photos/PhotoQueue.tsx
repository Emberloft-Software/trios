"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import Link from "next/link";
import { Check, ScanFace, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { copy } from "@/lib/copy";
import { reviewPhotoAction } from "./_actions";

export interface PhotoItem {
  userId: string;
  name: string;
  handle: string;
  age: number | null;
  gender: string | null;
  pendingUrl: string;
  currentUrl: string | null;
  faceScore: number | null;
  faces: number | null;
  joined: string;
}

const REASONS = ["no_face", "not_you", "group_photo", "inappropriate", "low_quality"] as const;
type Reason = (typeof REASONS)[number];

function scoreBadge(score: number | null, faces: number | null) {
  if (score == null) return <Badge tone="muted" icon={<ScanFace className="h-3 w-3" />}>No auto check</Badge>;
  if (faces === 1 && score >= 0.8) return <Badge tone="mint" icon={<ScanFace className="h-3 w-3" />}>1 face · {Math.round(score * 100)}%</Badge>;
  if (faces === 1) return <Badge tone="sun" icon={<ScanFace className="h-3 w-3" />}>1 face · {Math.round(score * 100)}%</Badge>;
  return <Badge tone="coral" icon={<ScanFace className="h-3 w-3" />}>{faces ?? 0} faces</Badge>;
}

export function PhotoQueue({ items }: { items: PhotoItem[] }) {
  const [queue, setQueue] = useState(items);
  const [reasons, setReasons] = useState<Record<string, Reason>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function decide(userId: string, decision: "approve" | "reject") {
    setBusy(`${userId}:${decision}`);
    const res = await reviewPhotoAction({ userId, decision, reason: decision === "reject" ? reasons[userId] ?? "no_face" : undefined });
    setBusy(null);
    if (!res.ok) return setErrors((e) => ({ ...e, [userId]: res.error }));
    setQueue((q) => q.filter((x) => x.userId !== userId));
  }

  if (queue.length === 0) return <EmptyState title="No photos waiting for review." />;

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {queue.map((p) => (
        <article key={p.userId} className="glass overflow-hidden rounded-[1.75rem]">
          <div className="relative">
            <a href={p.pendingUrl} target="_blank" rel="noreferrer">
              <img src={p.pendingUrl} alt={`Pending photo for ${p.name}`} className="aspect-square w-full bg-plum-50 object-cover" />
            </a>
            <div className="absolute left-3 top-3">{scoreBadge(p.faceScore, p.faces)}</div>
            {p.currentUrl && (
              <img src={p.currentUrl} alt="Current photo" title="Current approved photo" className="absolute bottom-3 right-3 h-14 w-14 rounded-xl object-cover ring-2 ring-white" />
            )}
          </div>
          <div className="space-y-3 p-4">
            <div>
              <Link href={`/admin/users/${p.userId}`} className="font-bold text-plum hover:underline">{p.name}</Link>
              <p className="text-[0.75rem] text-muted">@{p.handle}{p.age ? ` · ${p.age}` : ""}{p.gender ? ` · ${p.gender}` : ""} · joined {p.joined}</p>
            </div>
            <Select aria-label="Reject reason" value={reasons[p.userId] ?? "no_face"} onChange={(e) => setReasons((r) => ({ ...r, [p.userId]: e.target.value as Reason }))} className="!py-2 text-[0.875rem]">
              {REASONS.map((r) => <option key={r} value={r}>{copy.photo.rejectReasons[r]}</option>)}
            </Select>
            {errors[p.userId] && <p className="text-[0.8125rem] font-semibold text-coral-600">{errors[p.userId]}</p>}
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" onClick={() => decide(p.userId, "approve")} loading={busy === `${p.userId}:approve`} disabled={!!busy} className="!bg-mint hover:!bg-[#0e8a5a] !shadow-none">
                <Check className="h-4 w-4" /> Approve
              </Button>
              <Button size="sm" variant="danger" onClick={() => decide(p.userId, "reject")} loading={busy === `${p.userId}:reject`} disabled={!!busy}>
                <X className="h-4 w-4" /> Reject
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
