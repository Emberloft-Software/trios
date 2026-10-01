/** Camera, recording-format and upload helpers for liveness capture. */
import { copy } from "@/lib/copy";

// mp4 first: it plays everywhere (incl. the admin's Safari); webm as fallback.
export const MIME_CANDIDATES = [
  "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
  "video/mp4;codecs=avc1,mp4a.40.2",
  "video/mp4",
  "video/webm;codecs=vp8,opus",
  "video/webm;codecs=vp9,opus",
  "video/webm",
];
export const MAX_BYTES = 45 * 1024 * 1024;
export const ACTION_MS = 4500;
export const CODE_MS = 5000;

export type Phase = "explainer" | "starting" | "ready" | "countdown" | "recording" | "review" | "uploading" | "done" | "blocked";
export type Captured = { blob: Blob; mime: string; url: string; faceRatio: number | null };

export function pickMime(): string | null {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") return null;
  return MIME_CANDIDATES.find((t) => {
    try {
      return MediaRecorder.isTypeSupported(t);
    } catch {
      return false;
    }
  }) ?? "";
}

export function isStandalone() {
  return window.matchMedia?.("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function deviceHint(faceRatio: number | null) {
  const ua = navigator.userAgent;
  const os = /iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Mac/.test(ua) ? "macOS" : /Windows/.test(ua) ? "Windows" : "other";
  const br = /CriOS|Chrome/.test(ua) ? "Chrome" : /FxiOS|Firefox/.test(ua) ? "Firefox" : /Safari/.test(ua) ? "Safari" : "other";
  const face = faceRatio == null ? "face n/a" : `face ${Math.round(faceRatio * 100)}%`;
  return `${os} · ${br} · ${isStandalone() ? "installed app" : "browser"} · ${face}`;
}

export async function getCameraStream(): Promise<MediaStream> {
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

export function putWithProgress(url: string, blob: Blob, contentType: string, onProgress: (p: number) => void) {
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

/** Opens the front camera, or explains in plain words why it can't. */
export async function openCameraOrReason(): Promise<{ stream: MediaStream } | { blocked: string }> {
  const v = copy.verification;
  if (!window.isSecureContext) return { blocked: v.insecure };
  if (!navigator.mediaDevices?.getUserMedia) return { blocked: v.noCamera };
  try {
    return { stream: await getCameraStream() };
  } catch (e) {
    const name = (e as DOMException)?.name;
    return { blocked: name === "NotFoundError" || name === "OverconstrainedError" ? v.noCamera : v.cameraBlocked };
  }
}
