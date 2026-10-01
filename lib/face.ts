"use client";

/**
 * On-device face detection (MediaPipe BlazeFace short-range, ~230 KB model
 * served from /models). Used to (1) refuse profile photos with no face before
 * they're uploaded and (2) coach people to keep their face in frame during the
 * liveness recording. It's a hint for the human reviewer, never a verdict.
 * If the detector can't load (old browser, offline), callers carry on without it.
 */
import type { FaceDetector } from "@mediapipe/tasks-vision";

const WASM_BASE = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
const MODEL = "/models/blaze_face_short_range.tflite";

let imageDetector: Promise<FaceDetector | null> | null = null;
let videoDetector: Promise<FaceDetector | null> | null = null;

async function create(mode: "IMAGE" | "VIDEO"): Promise<FaceDetector | null> {
  try {
    const vision = await import("@mediapipe/tasks-vision");
    const files = await vision.FilesetResolver.forVisionTasks(WASM_BASE);
    const make = (delegate: "GPU" | "CPU") =>
      vision.FaceDetector.createFromOptions(files, {
        baseOptions: { modelAssetPath: MODEL, delegate },
        runningMode: mode,
        minDetectionConfidence: 0.5,
      });
    try {
      return await make("GPU");
    } catch {
      return await make("CPU");
    }
  } catch (e) {
    console.warn("face detector unavailable", e);
    return null;
  }
}

export function getImageFaceDetector() {
  imageDetector ??= create("IMAGE");
  return imageDetector;
}

export function getVideoFaceDetector() {
  videoDetector ??= create("VIDEO");
  return videoDetector;
}

export interface FaceCheck {
  faces: number;
  score: number | null; // best detection confidence 0–1
}

export async function detectFaces(source: HTMLCanvasElement | HTMLImageElement): Promise<FaceCheck | null> {
  const det = await getImageFaceDetector();
  if (!det) return null;
  try {
    const res = det.detect(source);
    const scores = res.detections.map((d) => d.categories?.[0]?.score ?? 0).filter((s) => s >= 0.5);
    return { faces: scores.length, score: scores.length ? Math.max(...scores) : 0 };
  } catch {
    return null;
  }
}
