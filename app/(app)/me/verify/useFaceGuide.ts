"use client";

import { useEffect, useRef, useState } from "react";
import { getVideoFaceDetector } from "@/lib/face";

/**
 * Live "face in frame" signal (~5 fps) from on-device MediaPipe, plus a
 * counter of how often a face was visible while `counting` is on. Advisory
 * only — the reviewer makes the call.
 */
export function useFaceGuide(videoRef: React.RefObject<HTMLVideoElement | null>, enabled: boolean) {
  const [face, setFace] = useState<boolean | null>(null);
  const stats = useRef({ frames: 0, hits: 0, counting: false });

  useEffect(() => {
    if (!enabled) return;
    let stop = false;
    let last = 0;
    let raf = 0;
    (async () => {
      const det = await getVideoFaceDetector();
      if (!det || stop) return;
      const loop = (t: number) => {
        if (stop) return;
        const el = videoRef.current;
        if (el && el.readyState >= 2 && t - last > 200) {
          last = t;
          try {
            const hit = det.detectForVideo(el, t).detections.some((d) => (d.categories?.[0]?.score ?? 0) >= 0.5);
            setFace(hit);
            if (stats.current.counting) {
              stats.current.frames++;
              if (hit) stats.current.hits++;
            }
          } catch {
            /* skip a bad frame */
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
  }, [enabled, videoRef]);

  const startCounting = () => (stats.current = { frames: 0, hits: 0, counting: true });
  const stopCounting = () => {
    stats.current.counting = false;
    const { frames, hits } = stats.current;
    return frames > 3 ? hits / frames : null;
  };

  return { face, setFace, startCounting, stopCounting };
}
