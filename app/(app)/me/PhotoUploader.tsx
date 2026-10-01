"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import { Camera, Clock } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { detectFaces } from "@/lib/face";
import { copy } from "@/lib/copy";
import { uploadAvatarAction } from "./_actions";

const MAX_EDGE = 720;

async function loadAndResize(file: File): Promise<{ canvas: HTMLCanvasElement; blob: Blob }> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = url;
    });
    const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej()), "image/jpeg", 0.86));
    return { canvas, blob };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function PhotoUploader({
  name,
  approvedUrl,
  pendingUrl,
  status,
  rejectReason,
}: {
  name: string;
  approvedUrl: string | null;
  pendingUrl: string | null;
  status: "none" | "pending" | "approved" | "rejected";
  rejectReason: string | null;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<"idle" | "checking" | "uploading">("idle");
  const [error, setError] = useState<string | null>(null);
  const p = copy.photo;

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) return setError(p.badType);
    try {
      setPhase("checking");
      const { canvas, blob } = await loadAndResize(file);
      const check = await detectFaces(canvas);
      if (check && check.faces === 0) {
        setPhase("idle");
        return setError(p.noFace);
      }
      if (check && check.faces > 1) {
        setPhase("idle");
        return setError(p.manyFaces);
      }
      setPhase("uploading");
      const fd = new FormData();
      fd.append("file", new File([blob], "photo.jpg", { type: "image/jpeg" }));
      if (check) {
        fd.append("score", String(check.score));
        fd.append("faces", String(check.faces));
      }
      const res = await uploadAvatarAction(fd);
      setPhase("idle");
      if (!res.ok) return setError(res.error);
    } catch {
      setPhase("idle");
      setError(copy.errors.generic);
    } finally {
      if (input.current) input.current.value = "";
    }
  }

  const shown = approvedUrl ?? null;

  return (
    <div>
      <div className="flex flex-col items-start">
        <div className="relative">
          <Avatar name={name} src={shown} size={96} ring />
          {status === "pending" && pendingUrl && (
            <img src={pendingUrl} alt="" className="absolute -bottom-1 -right-1 h-10 w-10 rounded-full object-cover opacity-90 ring-2 ring-sun" title={p.pending} />
          )}
        </div>
        <div className="mt-3 flex w-full flex-wrap items-center gap-x-3 gap-y-2">
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
          <Button size="sm" variant="secondary" loading={phase !== "idle"} onClick={() => input.current?.click()}>
            <Camera className="h-4 w-4" /> {shown || status === "pending" ? p.change : p.choose}
          </Button>
          {status === "pending" ? (
            <p className="flex items-center gap-1 text-[0.8125rem] font-semibold text-[#8a5a00]"><Clock className="h-3.5 w-3.5" /> {p.pending}</p>
          ) : phase !== "idle" ? (
            <p className="text-[0.8125rem] text-muted">{phase === "checking" ? p.checking : p.uploading}</p>
          ) : null}
        </div>
        {!shown && status !== "pending" && <p className="mt-2 text-[0.8125rem] text-muted">{p.hint}</p>}
      </div>
      {status === "rejected" && (
        <Notice tone="danger" compact className="mt-3" title={p.rejected}>
          {rejectReason ? p.rejectReasons[rejectReason] ?? rejectReason : null}
        </Notice>
      )}
      {error && <Notice tone="danger" compact className="mt-3">{error}</Notice>}
    </div>
  );
}
