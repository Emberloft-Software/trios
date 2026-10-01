"use client";

/* eslint-disable @next/next/no-img-element */
import { CheckCircle2, CircleAlert } from "lucide-react";
import { copy } from "@/lib/copy";
import type { Captured, Phase } from "./capture";

const v = copy.verification;

/**
 * The camera viewport: live mirrored preview with oval guide, the code to read,
 * face status, countdown and per-prompt timer — or the review playback and
 * upload progress. Purely presentational.
 */
export function CaptureStage({
  phase,
  videoRef,
  captured,
  code,
  face,
  count,
  prompt,
  secondsLeft,
  progress,
}: {
  phase: Phase;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  captured: Captured | null;
  code: string | null;
  face: boolean | null;
  count: number;
  prompt: string;
  secondsLeft: number;
  progress: number;
}) {
  const live = phase === "ready" || phase === "countdown" || phase === "recording";
  const isVideo = captured?.mime.startsWith("video");

  return (
    <div className="relative aspect-[3/4] w-full bg-plum-800 sm:aspect-[4/3]">
      {live && <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 h-full w-full -scale-x-100 object-cover" />}
      {phase === "review" && captured && isVideo && (
        <video src={captured.url} controls playsInline className="absolute inset-0 h-full w-full bg-black object-contain" />
      )}
      {phase === "review" && captured && !isVideo && <img src={captured.url} alt="" className="absolute inset-0 h-full w-full bg-black object-contain" />}

      {phase === "uploading" && (
        <div className="absolute inset-0 grid place-items-center text-white">
          <div className="w-2/3 text-center">
            <p className="mb-3 font-semibold">{v.uploadingPct(progress)}</p>
            <div className="h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-coral transition-[width]" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      )}

      {live && (
        <div
          aria-hidden
          className={`pointer-events-none absolute left-1/2 top-[44%] h-[58%] w-[56%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-[3px] border-dashed transition-colors ${
            face === false ? "border-coral" : face ? "border-mint" : "border-white/60"
          }`}
        />
      )}

      {code && live && (
        <div className="glass-strong absolute right-3 top-3 rounded-2xl px-3 py-2 text-center">
          <p className="text-[1.75rem] font-extrabold leading-none tracking-[0.18em] text-plum tabular">{code}</p>
          <p className="mt-0.5 text-[0.625rem] font-bold uppercase tracking-wider text-muted">{v.holdCode}</p>
        </div>
      )}

      {live && face !== null && (
        <span className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.75rem] font-bold text-white ${face ? "bg-mint/90" : "bg-coral/90"}`}>
          {face ? <CheckCircle2 className="h-3.5 w-3.5" /> : <CircleAlert className="h-3.5 w-3.5" />}
          {face ? v.faceOk : v.faceMissing}
        </span>
      )}

      {phase === "countdown" && (
        <div className="absolute inset-0 grid place-items-center bg-plum-800/40">
          <div className="text-center text-white">
            <p className="text-[0.875rem] font-semibold uppercase tracking-wider">{v.getReady}</p>
            <p key={count} className="text-[5rem] font-extrabold leading-none animate-pop">{count}</p>
          </div>
        </div>
      )}

      {phase === "recording" && (
        <>
          <span className="absolute left-1/2 top-3 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-[0.75rem] font-bold text-white">
            <span className="h-2 w-2 rounded-full bg-coral" style={{ animation: "rec-pulse 1s infinite" }} /> {v.recording}
          </span>
          <div className="absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-2xl bg-plum-800/85 px-4 py-3">
            <span className="flex-1 text-[1.0625rem] font-bold text-white">{prompt}</span>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-sun text-[1rem] font-bold text-white tabular">{secondsLeft}</span>
          </div>
        </>
      )}
    </div>
  );
}
