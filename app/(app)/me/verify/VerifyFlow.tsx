"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, Send, Video } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { copy } from "@/lib/copy";
import { startVerificationAction, type Challenge } from "./_actions";
import { MAX_BYTES, openCameraOrReason, pickMime, type Captured, type Phase } from "./capture";
import { runCapture } from "./runCapture";
import { uploadRecording } from "./upload";
import { useFaceGuide } from "./useFaceGuide";
import { CaptureStage } from "./CaptureStage";
import { BlockedScreen, DoneScreen, ExplainerScreen } from "./VerifyScreens";

const v = copy.verification;

/** Liveness capture: challenge → camera → countdown → prompts → review → upload. */
export function VerifyFlow() {
  const [phase, setPhase] = useState<Phase>("explainer");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [blockedMsg, setBlockedMsg] = useState("");
  const [promptIdx, setPromptIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [count, setCount] = useState(3);
  const [fallback, setFallback] = useState(false);
  const [progress, setProgress] = useState(0);
  const [captured, setCaptured] = useState<Captured | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const cancelRef = useRef<(() => void) | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const live = phase === "ready" || phase === "countdown" || phase === "recording";
  const { face, setFace, startCounting, stopCounting } = useFaceGuide(videoRef, !!stream && live);

  const prompts = challenge ? [...challenge.actions.map((a) => v.actionPrompts[a] ?? a), v.readCodeNow] : [];

  const stopStream = useCallback(() => {
    setStream((s) => {
      s?.getTracks().forEach((t) => t.stop());
      return null;
    });
  }, []);

  const abort = useCallback(() => {
    cancelRef.current?.();
    cancelRef.current = null;
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  useEffect(() => () => { abort(); stopStream(); }, [abort, stopStream]);
  useEffect(() => () => { if (captured) URL.revokeObjectURL(captured.url); }, [captured]);

  // attach the stream once the <video> exists (iOS needs muted + playsInline first)
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !stream) return;
    el.muted = true;
    el.playsInline = true;
    el.srcObject = stream;
    el.play().catch(() => {});
  }, [stream, phase]);

  // backgrounding the app mid-recording kills the camera on iOS → reset cleanly
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState !== "hidden" || (phase !== "recording" && phase !== "countdown")) return;
      abort();
      stopStream();
      setError(v.uploadFailed);
      setPhase("explainer");
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [phase, abort, stopStream]);

  async function openCamera() {
    const r = await openCameraOrReason();
    if ("blocked" in r) {
      setBlockedMsg(r.blocked);
      setPhase("blocked");
      return false;
    }
    setStream(r.stream);
    setFace(null);
    return true;
  }

  async function begin() {
    setError(null);
    setPhase("starting");
    const res = await startVerificationAction();
    if (!res.ok) {
      setError(res.error);
      return setPhase("explainer");
    }
    setChallenge(res.challenge);
    setRequestId(res.requestId);
    if (await openCamera()) {
      setFallback(pickMime() === null);
      setPhase("ready");
    }
  }

  function startCapture() {
    if (!stream || !videoRef.current) return;
    setError(null);
    setPhase("countdown");
    let c = 3;
    setCount(c);
    countdownRef.current = setInterval(() => {
      setCount(--c);
      if (c > 0) return;
      clearInterval(countdownRef.current!);
      setPhase("recording");
      startCounting();
      cancelRef.current = runCapture({
        stream,
        video: videoRef.current!,
        promptCount: prompts.length,
        fallback,
        onPrompt: (i, left) => {
          setPromptIdx(i);
          setSecondsLeft(left);
        },
        onTick: setSecondsLeft,
        onDone: (blob, mime) => {
          setCaptured({ blob, mime, url: URL.createObjectURL(blob), faceRatio: stopCounting() });
          stopStream();
          setPhase("review");
        },
      });
    }, 1000);
  }

  async function retake() {
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
    const res = await uploadRecording(requestId, captured, setProgress);
    if (!res.ok) {
      setError(res.error);
      return setPhase("review");
    }
    setPhase("done");
  }

  if (phase === "explainer" || phase === "starting") return <ExplainerScreen error={error} starting={phase === "starting"} onStart={begin} />;
  if (phase === "blocked") return <BlockedScreen message={blockedMsg} onRetry={() => setPhase("explainer")} />;
  if (phase === "done") return <DoneScreen />;

  return (
    <div className="glass overflow-hidden rounded-[1.75rem]">
      <CaptureStage
        phase={phase}
        videoRef={videoRef}
        captured={captured}
        code={challenge?.code ?? null}
        face={face}
        count={count}
        prompt={prompts[promptIdx] ?? ""}
        secondsLeft={secondsLeft}
        progress={progress}
      />
      <div className="space-y-3 p-5">
        {fallback && live && <Notice tone="info" compact>{v.fallbackNote}</Notice>}
        {phase === "ready" && (
          <>
            <p className="text-[0.9375rem]">
              {v.youllDo}: <span className="font-semibold text-plum">{prompts.slice(0, -1).join(", ").toLowerCase()}</span>, {v.thenRead}
            </p>
            <Button size="lg" block onClick={startCapture}><Video className="h-5 w-5" /> {v.ready}</Button>
          </>
        )}
        {phase === "review" && (
          <>
            {error && <Notice tone="danger" compact>{error}</Notice>}
            <Button size="lg" block onClick={send}><Send className="h-4.5 w-4.5" /> {v.send}</Button>
            <Button variant="secondary" block onClick={retake}><RotateCcw className="h-4 w-4" /> {v.retake}</Button>
          </>
        )}
        {phase === "uploading" && <Button size="lg" block loading>{v.uploading}</Button>}
      </div>
    </div>
  );
}
