"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import type { ReviewItem } from "./ReviewClient";

/** The recording (fresh 60s signed URL) beside the profile photo. */
export function ReviewMedia({ current, mediaUrl, mediaErr, videoRef }: {
  current: ReviewItem;
  mediaUrl: string | null;
  mediaErr: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}) {
  const [rate, setRate] = useState(1);
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = rate;
  }, [rate, mediaUrl, videoRef]);

  return (
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

  );
}
