"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, CheckCircle2, CircleAlert, RotateCcw, ScanFace, Send, Video } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { createClient } from "@/lib/supabase/client";
import { getVideoFaceDetector } from "@/lib/face";
import { copy } from "@/lib/copy";
import {
  createVerificationUploadAction,
  startVerificationAction,
  submitVerificationAction,
  type Challenge,
} from "./_actions";

// mp4 first: it plays everywhere (incl. the admin's Safari); webm as fallback.
const MIME_CANDIDATES = [
  "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
  "video/mp4;codecs=avc1,mp4a.40.2",
  "video/mp4",
  "video/webm;codecs=vp8,opus",
  "video/webm;codecs=vp9,opus",
  "video/webm",
];
const MAX_BYTES = 45 * 1024 * 1024;
const ACTION_MS = 4500;
const CODE_MS = 5000;

type Phase = "explainer" | "starting" | "ready" | "countdown" | "recording" | "review" | "uploading" | "done" | "blocked";
type Captured = { blob: Blob; mime: string; url: string; faceRatio: number | null };

function pickMime(): string | null {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") return null;
  return MIME_CANDIDATES.find((t) => {
    try {
      return MediaRecorder.isTypeSupported(t);
    } catch {
      return false;
    }
  }) ?? "";
}

function isStandalone() {
  return window.matchMedia?.("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function deviceHint(faceRatio: number | null) {
  const ua = navigator.userAgent;
  const os = /iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Mac/.test(ua) ? "macOS" : /Windows/.test(ua) ? "Windows" : "other";
  const br = /CriOS|Chrome/.test(ua) ? "Chrome" : /FxiOS|Firefox/.test(ua) ? "Firefox" : /Safari/.test(ua) ? "Safari" : "other";
  const face = faceRatio == null ? "face n/a" : `face ${Math.round(faceRatio * 100)}%`;
  return `${os} · ${br} · ${isStandalone() ? "installed app" : "browser"} · ${face}`;
}

async function getCameraStream(): Promise<MediaStream> {
  const md = navigator.mediaDevices;
  const audio = { echoCancellation: true, noiseSuppression: true };
  try {
    return await md.getUserMedia({ video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }, audio });
  } catch (e) {
    const name = (e as DOMException)?.name;
    if (name === "NotAllowedError" || name === "SecurityError") throw e;
    // over-constrained or missing mic → progressively simpler asks
    try {
      return await md.getUserMedia({ video: { facingMode: "user" }, audio: true });
    } catch (e2) {
      if ((e2 as DOMException)?.name === "NotAllowedError") throw e2;
      return await md.getUserMedia({ video: true, audio: false });
    }
  }
}

function putWithProgress(url: string, blob: Blob, contentType: string, onProgress: (p: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("content-type", contentType);
    xhr.setRequestHeader("x-upsert", "true");
    xhr.setRequestHeader("apikey", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`${xhr.status}: ${xhr.responseText}`)));
    xhr.onerror = () => reject(new Error("network"));
    xhr.send(blob);
  });
}

export function VerifyFlow() {
  const router = useRouter();
  const v = copy.verification;

  const [phase, setPhase] = useState<Phase>("explainer");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [blockedMsg, setBlockedMsg] = useState<string>("");
  const [promptIdx, setPromptIdx] = useState(0);
  const [phaseLeft, setPhaseLeft] = useState(0);
  const [count, setCount] = useState(3);
  const [fallback, setFallback] = useState(false);
  const [face, setFace] = useState<boolean | null>(null);
  const [progress, setProgress] = useState(0);
  const [captured, setCaptured] = useState<Captured | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const previewRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const faceStats = useRef({ frames: 0, hits: 0, counting: false });
  const abortedRef = useRef(false);

  const prompts = challenge ? [...challenge.actions.map((a) => v.actionPrompts[a] ?? a), v.readCodeNow] : [];

  const clearTimers = () => {
    timersRef.current.forEach((t) => {
      clearTimeout(t);
      clearInterval(t);
    });
    timersRef.current = [];
  };
  const stopStream = useCallback(() => {
    setStream((s) => {
      s?.getTracks().forEach((t) => t.stop());
      return null;
    });
  }, []);

  // cleanup on unmount
  useEffect(
    () => () => {
      clearTimers();
      stopStream();
    },
    [stopStream],
  );
  useEffect(() => () => {
    if (captured) URL.revokeObjectURL(captured.url);
  }, [captured]);

  // attach the live stream once the <video> is in the DOM (iOS needs muted+playsInline first)
  useEffect(() => {
    const el = previewRef.current;
    if (!el || !stream) return;
    el.muted = true;
    el.playsInline = true;
    el.srcObject = stream;
    el.play().catch(() => {});
  }, [stream, phase]);

  // live face guidance (~5 fps). Purely advisory.
  useEffect(() => {
    if (!stream || !["ready", "countdown", "recording"].includes(phase)) return;
    let stop = false;
    let last = 0;
    let raf = 0;
    (async () => {
      const det = await getVideoFaceDetector();
      if (!det || stop) return;
      const loop = (t: number) => {
        if (stop) return;
        const el = previewRef.current;
        if (el && el.readyState >= 2 && t - last > 200) {
          last = t;
          try {
            const r = det.detectForVideo(el, t);
            const hit = r.detections.some((d) => (d.categories?.[0]?.score ?? 0) >= 0.5);
            setFace(hit);
            if (faceStats.current.counting) {
              faceStats.current.frames++;
              if (hit) faceStats.current.hits++;
            }
          } catch {
            /* ignore a bad frame */
          }
        }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    })();
    return () => {
      stop = true;
      cancelAnimationFrame(raf);
    };
  }, [stream, phase]);

  // backgrounding the app mid-recording kills the camera on iOS → abort cleanly
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden" && (phase === "recording" || phase === "countdown")) {
        abortedRef.current = true;
        clearTimers();
        if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop();
        stopStream();
        setError(v.uploadFailed);
        setPhase("explainer");
      }
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [phase, stopStream, v.uploadFailed]);

  async function openCamera(): Promise<boolean> {
    if (!window.isSecureContext) {
      setBlockedMsg(v.insecure);
      setPhase("blocked");
      return false;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setBlockedMsg(v.noCamera);
      setPhase("blocked");
      return false;
    }
    try {
      const s = await getCameraStream();
      setStream(s);
      setFace(null);
      return true;
    } catch (e) {
      const name = (e as DOMException)?.name;
      setBlockedMsg(name === "NotFoundError" || name === "OverconstrainedError" ? v.noCamera : v.cameraBlocked);
      setPhase("blocked");
      return false;
    }
  }

  async function begin() {
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
    if (await openCamera()) {
      setFallback(pickMime() === null);
      setPhase("ready");
    }
  }

  function runPrompts(onEnd: () => void, onPhaseStart?: () => void) {
    clearTimers();
    setPhase("recording");
    let i = 0;
    const tick = () => {
      if (abortedRef.current) return;
      if (i >= prompts.length) return onEnd();
      const dur = i === prompts.length - 1 ? CODE_MS : ACTION_MS;
      setPromptIdx(i);
      let left = Math.ceil(dur / 1000);
      setPhaseLeft(left);
      onPhaseStart?.();
      const iv = setInterval(() => setPhaseLeft(--left > 0 ? left : 0), 1000);
      timersRef.current.push(iv);
      timersRef.current.push(
        setTimeout(() => {
          clearInterval(iv);
          i += 1;
          tick();
        }, dur),
      );
    };
    tick();
  }

  function finish(blob: Blob, mime: string) {
    faceStats.current.counting = false;
    const { frames, hits } = faceStats.current;
    const url = URL.createObjectURL(blob);
    setCaptured({ blob, mime, url, faceRatio: frames > 3 ? hits / frames : null });
    stopStream();
    setPhase("review");
  }

  function startRecording() {
    if (!stream) return;
    const mime = pickMime();
    chunksRef.current = [];
    let rec: MediaRecorder;
    try {
      rec = new MediaRecorder(stream, {
        ...(mime ? { mimeType: mime } : {}),
        videoBitsPerSecond: 1_200_000,
        audioBitsPerSecond: 64_000,
      });
    } catch {
      rec = new MediaRecorder(stream);
    }
    rec.ondataavailable = (e) => e.data && e.data.size > 0 && chunksRef.current.push(e.data);
    rec.onstop = () => {
      if (abortedRef.current) return;
      const type = (rec.mimeType || mime || "video/mp4").split(";")[0];
      finish(new Blob(chunksRef.current, { type }), type);
    };
    recorderRef.current = rec;
    faceStats.current = { frames: 0, hits: 0, counting: true };
    rec.start(1000);
    runPrompts(() => rec.state !== "inactive" && rec.stop());
  }

  function startFallback() {
    const video = previewRef.current;
    if (!video) return;
    const shots: HTMLCanvasElement[] = [];
    faceStats.current = { frames: 0, hits: 0, counting: true };
    runPrompts(
      () => {
        const w = 480;
        const h = Math.round((video.videoHeight / Math.max(1, video.videoWidth)) * w) || 360;
        const out = document.createElement("canvas");
        out.width = w;
        out.height = h * shots.length;
        const ctx = out.getContext("2d");
        shots.forEach((s, i) => ctx?.drawImage(s, 0, i * h, w, h));
        out.toBlob((b) => b && finish(b, "image/jpeg"), "image/jpeg", 0.88);
      },
      () => {
        const c = document.createElement("canvas");
        c.width = video.videoWidth || 640;
        c.height = video.videoHeight || 480;
        c.getContext("2d")?.drawImage(video, 0, 0, c.width, c.height);
        shots.push(c);
      },
    );
  }

  function startCapture() {
    abortedRef.current = false;
    setError(null);
    setPhase("countdown");
    let c = 3;
    setCount(c);
    const iv = setInterval(() => {
      c -= 1;
      setCount(c);
      if (c <= 0) {
        clearInterval(iv);
        if (fallback) startFallback();
        else startRecording();
      }
    }, 1000);
    timersRef.current.push(iv);
  }

  async function retake() {
    if (captured) URL.revokeObjectURL(captured.url);
    setCaptured(null);
    setError(null);
    if (await openCamera()) setPhase("ready");
  }

  async function send() {
    if (!captured || !requestId) return;
    if (captured.blob.size > MAX_BYTES) return setError(v.tooLarge);
    setError(null);
    setProgress(0);
    setPhase("uploading");
    const contentType = captured.mime.split(";")[0];

    const signed = await createVerificationUploadAction({ requestId, mime: contentType });
    if (!signed.ok) {
      setError(signed.error);
      setPhase("review");
      return;
    }
    try {
      await putWithProgress(signed.signedUrl, captured.blob, contentType, setProgress);
    } catch (e) {
      console.warn("xhr upload failed, retrying via storage client", e);
      const token = new URL(signed.signedUrl).searchParams.get("token") ?? "";
      const { error: upErr } = await createClient()
        .storage.from("verification")
        .uploadToSignedUrl(signed.path, token, captured.blob, { contentType, upsert: true });
      if (upErr) {
        console.error("verification upload failed:", upErr.message);
        setError(v.uploadFailed);
        setPhase("review");
        return;
      }
    }
    setProgress(100);
    const res = await submitVerificationAction({
      requestId,
      mediaPath: signed.path,
      mediaMime: contentType,
      bytes: captured.blob.size,
      deviceHint: deviceHint(captured.faceRatio),
    });
    if (!res.ok) {
      setError(res.error);
      setPhase("review");
      return;
    }
    setPhase("done");
    router.refresh();
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  if (phase === "explainer" || phase === "starting") {
    return (
      <div className="glass rounded-[1.75rem] p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-coral-50 text-coral"><ScanFace className="h-6 w-6" /></span>
          <h2 className="text-[1.125rem] font-bold">{v.explainer.heading}</h2>
        </div>
        <ul className="mb-5 space-y-2.5 text-[0.9375rem]">
          {v.explainer.points.map((p) => (
            <li key={p} className="flex gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-mint" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
        {error && <Notice tone="danger" compact className="mb-4">{error}</Notice>}
        <Button size="lg" block onClick={begin} loading={phase === "starting"}>
          <Camera className="h-5 w-5" /> {v.explainer.start}
        </Button>
      </div>
    );
  }

  if (phase === "blocked") {
    return (
      <div className="glass rounded-[1.75rem] p-6">
        <Notice tone="danger" title={blockedMsg}>{/iPhone|iPad/.test(navigator.userAgent) ? v.cameraIosHint : null}</Notice>
        <Button variant="secondary" className="mt-4" onClick={() => setPhase("explainer")}>
          <RotateCcw className="h-4 w-4" /> {v.tryAgain}
        </Button>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="glass rounded-[1.75rem] p-8 text-center animate-rise">
        <span className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-mint-50 text-mint"><CheckCircle2 className="h-8 w-8" /></span>
        <h2 className="text-[1.25rem] font-bold">{v.sent}</h2>
        <Button variant="secondary" className="mt-5" onClick={() => router.push("/me")}>{v.backToProfile}</Button>
      </div>
    );
  }

  const live = phase === "ready" || phase === "countdown" || phase === "recording";
  const isVideo = captured?.mime.startsWith("video");

  return (
    <div className="glass overflow-hidden rounded-[1.75rem]">
      <div className="relative aspect-[3/4] w-full bg-plum-800 sm:aspect-[4/3]">
        {live && (
          <video ref={previewRef} autoPlay muted playsInline className="absolute inset-0 h-full w-full -scale-x-100 object-cover" />
        )}
        {phase === "review" && captured && isVideo && (
          <video src={captured.url} controls playsInline className="absolute inset-0 h-full w-full bg-black object-contain" />
        )}
        {phase === "review" && captured && !isVideo && (
          <img src={captured.url} alt="" className="absolute inset-0 h-full w-full bg-black object-contain" />
        )}
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

        {/* oval face guide */}
        {live && (
          <div aria-hidden className={`pointer-events-none absolute left-1/2 top-[44%] h-[58%] w-[56%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-[3px] border-dashed transition-colors ${face === false ? "border-coral" : face ? "border-mint" : "border-white/60"}`} />
        )}

        {/* the code to read aloud */}
        {challenge && live && (
          <div className="glass-strong absolute right-3 top-3 rounded-2xl px-3 py-2 text-center">
            <p className="text-[1.75rem] font-extrabold leading-none tracking-[0.18em] text-plum tabular">{challenge.code}</p>
            <p className="mt-0.5 text-[0.625rem] font-bold uppercase tracking-wider text-muted">{v.holdCode}</p>
          </div>
        )}

        {/* face status */}
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
            <div className="absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-2xl bg-plum-800/80 px-4 py-3 backdrop-blur">
              <span className="flex-1 text-[1.0625rem] font-bold text-white">{prompts[promptIdx]}</span>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-sun text-[1rem] font-bold text-white tabular">{phaseLeft}</span>
            </div>
          </>
        )}
      </div>

      <div className="space-y-3 p-5">
        {fallback && live && <Notice tone="info" compact>{v.fallbackNote}</Notice>}
        {phase === "ready" && (
          <>
            <p className="text-[0.9375rem]">
              {v.youllDo}: <span className="font-semibold text-plum">{prompts.slice(0, -1).join(", ").toLowerCase()}</span>, {v.thenRead}
            </p>
            <Button size="lg" block onClick={startCapture}>
              <Video className="h-5 w-5" /> {v.ready}
            </Button>
          </>
        )}
        {phase === "review" && (
          <>
            {error && <Notice tone="danger" compact>{error}</Notice>}
            <Button size="lg" block onClick={send}>
              <Send className="h-4.5 w-4.5" /> {v.send}
            </Button>
            <Button variant="secondary" block onClick={retake}>
              <RotateCcw className="h-4 w-4" /> {v.retake}
            </Button>
          </>
        )}
        {phase === "uploading" && <Button size="lg" block loading>{v.uploading}</Button>}
      </div>
    </div>
  );
}
