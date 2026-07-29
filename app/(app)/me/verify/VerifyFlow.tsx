"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { copy } from "@/lib/copy";
import {
  startVerificationAction,
  submitVerificationAction,
  type Challenge,
} from "./_actions";

// Feature-detect the recording mime — Safari does not produce WebM (docs/05).
const MIME_CANDIDATES = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
  "video/mp4;codecs=avc1,mp4a.40.2",
  "video/mp4",
];

const MAX_BYTES = 20 * 1024 * 1024; // 20MB cap (docs/05)
const PHASE_MS = 4000; // 4s per action, 4s for the code

type Phase =
  | "explainer"
  | "starting"
  | "denied"
  | "ready"
  | "countdown"
  | "recording"
  | "review"
  | "uploading"
  | "done";

function extFor(mime: string): string {
  if (mime.startsWith("video/webm")) return "webm";
  if (mime.startsWith("video/mp4")) return "mp4";
  if (mime.startsWith("image/")) return "png";
  return "bin";
}

export function VerifyFlow({ userId }: { userId: string }) {
  const router = useRouter();
  const v = copy.verification;

  const [phase, setPhase] = useState<Phase>("explainer");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [phaseLeft, setPhaseLeft] = useState<number>(0);
  const [count, setCount] = useState<number>(3);
  const [fallback, setFallback] = useState(false);

  const previewRef = useRef<HTMLVideoElement>(null);
  const playbackRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const blobRef = useRef<{ blob: Blob; mime: string; url: string } | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };
  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  useEffect(() => () => {
    clearTimers();
    stopStream();
    if (blobRef.current) URL.revokeObjectURL(blobRef.current.url);
  }, []);

  // ── Start: issue challenge, then request the camera ─────────────────────────
  const begin = useCallback(async () => {
    setError(null);
    setPhase("starting");
    const res = await startVerificationAction();
    if (!res.ok) {
      setError(res.error);
      setPhase("explainer");
      return;
    }
    setChallenge(res.challenge);
    setRequestId(res.requestId);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640 },
        audio: true,
      });
      streamRef.current = stream;
      const supported = MIME_CANDIDATES.find(
        (t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t),
      );
      setFallback(!supported || typeof MediaRecorder === "undefined");
      setPhase("ready");
      // attach preview once the element is mounted
      requestAnimationFrame(() => {
        if (previewRef.current) {
          previewRef.current.srcObject = stream;
          previewRef.current.play().catch(() => {});
        }
      });
    } catch {
      stopStream();
      setPhase("denied");
    }
  }, []);

  // ── Build the ordered prompt list for the assigned challenge ────────────────
  const prompts = challenge
    ? [
        ...challenge.actions.map((a) => v.actionPrompts[a] ?? a),
        v.readCodeNow,
      ]
    : [];

  // ── Recording path (MediaRecorder) ──────────────────────────────────────────
  function startRecording() {
    if (!streamRef.current) return;
    const mime = MIME_CANDIDATES.find((t) => MediaRecorder.isTypeSupported(t))!;
    chunksRef.current = [];
    const rec = new MediaRecorder(streamRef.current, { mimeType: mime });
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mime });
      const url = URL.createObjectURL(blob);
      blobRef.current = { blob, mime, url };
      stopStream();
      setPhase("review");
      requestAnimationFrame(() => {
        if (playbackRef.current) playbackRef.current.src = url;
      });
    };
    recorderRef.current = rec;
    rec.start();
    runPrompts(() => rec.state !== "inactive" && rec.stop());
  }

  // ── Fallback path (3 canvas stills → one composite PNG) ─────────────────────
  async function startFallback() {
    const video = previewRef.current;
    if (!video) return;
    const shots: HTMLCanvasElement[] = [];
    const grab = () => {
      const c = document.createElement("canvas");
      c.width = 480;
      c.height = 360;
      const ctx = c.getContext("2d");
      if (ctx) ctx.drawImage(video, 0, 0, c.width, c.height);
      shots.push(c);
    };
    runPrompts(
      () => {
        // stitch the three stills vertically
        const out = document.createElement("canvas");
        out.width = 480;
        out.height = 360 * shots.length;
        const ctx = out.getContext("2d");
        shots.forEach((s, i) => ctx?.drawImage(s, 0, i * 360));
        out.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          blobRef.current = { blob, mime: "image/png", url };
          stopStream();
          setPhase("review");
        }, "image/png");
      },
      grab, // grab a still at the start of each phase
    );
  }

  // Drives the phase prompts + countdown ring; calls onEnd after the last phase.
  function runPrompts(onEnd: () => void, onPhaseStart?: () => void) {
    clearTimers();
    setPhase("recording");
    let i = 0;
    const tick = () => {
      if (i >= prompts.length) {
        onEnd();
        return;
      }
      setPrompt(prompts[i]);
      setPhaseLeft(PHASE_MS / 1000);
      onPhaseStart?.();
      // per-second countdown within the phase
      let left = PHASE_MS / 1000;
      const iv = setInterval(() => {
        left -= 1;
        setPhaseLeft(Math.max(0, left));
        if (left <= 0) clearInterval(iv);
      }, 1000);
      timersRef.current.push(
        setTimeout(() => {
          clearInterval(iv);
          i += 1;
          tick();
        }, PHASE_MS),
      );
    };
    tick();
  }

  function startCapture() {
    // 3-2-1 countdown, then record
    setPhase("countdown");
    setCount(3);
    let c = 3;
    const iv = setInterval(() => {
      c -= 1;
      setCount(c);
      if (c <= 0) {
        clearInterval(iv);
        if (fallback) startFallback();
        else startRecording();
      }
    }, 1000);
  }

  async function retake() {
    if (blobRef.current) {
      URL.revokeObjectURL(blobRef.current.url);
      blobRef.current = null;
    }
    // re-acquire the camera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640 },
        audio: true,
      });
      streamRef.current = stream;
      setPhase("ready");
      requestAnimationFrame(() => {
        if (previewRef.current) {
          previewRef.current.srcObject = stream;
          previewRef.current.play().catch(() => {});
        }
      });
    } catch {
      setPhase("denied");
    }
  }

  async function send() {
    const b = blobRef.current;
    if (!b || !requestId) return;
    if (b.blob.size > MAX_BYTES) {
      setError(v.tooLarge);
      return;
    }
    setError(null);
    setPhase("uploading");
    const supabase = createClient();
    const path = `${userId}/${requestId}.${extFor(b.mime)}`;
    const { error: upErr } = await supabase.storage
      .from("verification")
      .upload(path, b.blob, { contentType: b.mime, upsert: true });
    if (upErr) {
      // Log the real storage error (bucket missing, policy, size) to the console
      // instead of masking every failure as "too large".
      console.error("verification upload failed:", upErr);
      const msg = upErr.message?.toLowerCase() ?? "";
      setError(
        msg.includes("exceeded") || msg.includes("maximum")
          ? v.tooLarge
          : msg.includes("bucket") || msg.includes("not found")
            ? "Storage isn't set up yet — the 'verification' bucket is missing (migration 0008)."
            : v.uploadFailed,
      );
      setPhase("review");
      return;
    }
    const res = await submitVerificationAction({
      requestId,
      mediaPath: path,
      mediaMime: b.mime,
    });
    if (!res.ok) {
      setError(res.error);
      setPhase("review");
      return;
    }
    setPhase("done");
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  if (phase === "explainer" || phase === "starting") {
    return (
      <Card className="p-6">
        <h2 className="mb-3 font-display text-[1.25rem] font-600">{v.explainer.heading}</h2>
        <ul className="mb-5 space-y-2 text-[0.9375rem]">
          {v.explainer.points.map((p) => (
            <li key={p} className="flex gap-2">
              <span aria-hidden className="text-[var(--color-net)]">•</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
        {error && <p className="mb-3 text-[0.9375rem] text-[var(--color-tape)]">{error}</p>}
        <Button onClick={begin} disabled={phase === "starting"}>
          {phase === "starting" ? "…" : v.explainer.start}
        </Button>
      </Card>
    );
  }

  if (phase === "denied") {
    return (
      <Card className="p-6">
        <p className="text-[0.9375rem]">{copy.errors.camera_off}</p>
        <Button variant="secondary" className="mt-4" onClick={() => setPhase("explainer")}>
          Try again
        </Button>
      </Card>
    );
  }

  if (phase === "done") {
    return (
      <Card className="p-6">
        <h2 className="mb-2 font-display text-[1.25rem] font-600">{v.sent}</h2>
        <Button variant="secondary" className="mt-2" onClick={() => router.push("/me")}>
          Back to your profile
        </Button>
      </Card>
    );
  }

  const showPreview = phase === "ready" || phase === "countdown" || phase === "recording";

  return (
    <Card className="p-5">
      {fallback && showPreview && (
        <p className="mb-3 text-[0.875rem] text-[var(--color-dust)]">{v.fallbackNote}</p>
      )}

      <div className="relative overflow-hidden rounded-[var(--radius-chip)] border-2 border-[var(--color-ink)] bg-[var(--color-ink)]">
        {/* Live preview */}
        <video
          ref={previewRef}
          muted
          playsInline
          className={`aspect-[4/3] w-full object-cover ${showPreview ? "" : "hidden"}`}
        />
        {/* Playback */}
        <video
          ref={playbackRef}
          controls
          playsInline
          className={`aspect-[4/3] w-full object-cover ${phase === "review" && blobRef.current?.mime.startsWith("video") ? "" : "hidden"}`}
        />
        {phase === "review" && blobRef.current?.mime.startsWith("image") && (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="Your captured stills" src={blobRef.current.url} className="w-full" />
        )}

        {/* The 4-digit code, large and in-frame */}
        {challenge && showPreview && (
          <div className="absolute right-3 top-3 rounded-[var(--radius-tile)] border-2 border-[var(--color-ink)] bg-[var(--color-chalk)] px-3 py-1 text-center">
            <p className="font-data text-2xl leading-none tracking-[0.15em]">{challenge.code}</p>
            <p className="text-[0.625rem] text-[var(--color-dust)]">{v.holdCode}</p>
          </div>
        )}

        {/* Countdown overlay */}
        {phase === "countdown" && (
          <div className="absolute inset-0 grid place-items-center bg-[var(--color-ink)]/40">
            <span className="font-data text-6xl text-[var(--color-chalk)]">{count}</span>
          </div>
        )}

        {/* Recording prompt + phase ring */}
        {phase === "recording" && (
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-[var(--color-ink)]/70 px-4 py-3">
            <span className="text-[1rem] font-600 text-[var(--color-chalk)]">{prompt}</span>
            <span className="font-data grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-[var(--color-line)] text-[var(--color-chalk)]">
              {phaseLeft}
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-4">
        {phase === "ready" && (
          <div>
            <p className="mb-3 text-[0.9375rem]">
              You&apos;ll do: <span className="font-500">{prompts.slice(0, -1).join(", ")}</span>,
              then read the number aloud.
            </p>
            <Button onClick={startCapture} className="w-full">
              {v.ready}
            </Button>
          </div>
        )}

        {phase === "review" && (
          <div className="space-y-2">
            {error && <p className="text-[0.9375rem] text-[var(--color-tape)]">{error}</p>}
            <Button onClick={send} className="w-full">
              {v.send}
            </Button>
            <Button variant="secondary" onClick={retake} className="w-full">
              {v.retake}
            </Button>
          </div>
        )}

        {phase === "uploading" && (
          <Button disabled loading className="w-full">
            {v.uploading}
          </Button>
        )}
      </div>
    </Card>
  );
}
