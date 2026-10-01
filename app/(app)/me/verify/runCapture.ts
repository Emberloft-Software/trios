import { ACTION_MS, CODE_MS, pickMime } from "./capture";

/**
 * Drives one capture: shows each prompt for its slot, records video (or grabs
 * a still per prompt when MediaRecorder is missing) and hands back the blob.
 * Plain imperative code, no React — returns a cancel function.
 */
export function runCapture(opts: {
  stream: MediaStream;
  video: HTMLVideoElement;
  promptCount: number;
  fallback: boolean;
  onPrompt: (index: number, secondsLeft: number) => void;
  onTick: (secondsLeft: number) => void;
  onDone: (blob: Blob, mime: string) => void;
}): () => void {
  const timers: ReturnType<typeof setTimeout>[] = [];
  let cancelled = false;
  let recorder: MediaRecorder | null = null;
  const shots: HTMLCanvasElement[] = [];

  const grabStill = () => {
    const c = document.createElement("canvas");
    c.width = opts.video.videoWidth || 640;
    c.height = opts.video.videoHeight || 480;
    c.getContext("2d")?.drawImage(opts.video, 0, 0, c.width, c.height);
    shots.push(c);
  };

  const finishStills = () => {
    const w = 480;
    const h = Math.round((opts.video.videoHeight / Math.max(1, opts.video.videoWidth)) * w) || 360;
    const out = document.createElement("canvas");
    out.width = w;
    out.height = h * shots.length;
    const ctx = out.getContext("2d");
    shots.forEach((s, i) => ctx?.drawImage(s, 0, i * h, w, h));
    out.toBlob((b) => b && !cancelled && opts.onDone(b, "image/jpeg"), "image/jpeg", 0.88);
  };

  if (!opts.fallback) {
    const mime = pickMime();
    const chunks: Blob[] = [];
    try {
      recorder = new MediaRecorder(opts.stream, { ...(mime ? { mimeType: mime } : {}), videoBitsPerSecond: 1_200_000, audioBitsPerSecond: 64_000 });
    } catch {
      recorder = new MediaRecorder(opts.stream);
    }
    const rec = recorder;
    rec.ondataavailable = (e) => e.data && e.data.size > 0 && chunks.push(e.data);
    rec.onstop = () => {
      if (cancelled) return;
      const type = (rec.mimeType || mime || "video/mp4").split(";")[0];
      opts.onDone(new Blob(chunks, { type }), type);
    };
    rec.start(1000);
  }

  let i = 0;
  const step = () => {
    if (cancelled) return;
    if (i >= opts.promptCount) {
      if (opts.fallback) finishStills();
      else if (recorder && recorder.state !== "inactive") recorder.stop();
      return;
    }
    const dur = i === opts.promptCount - 1 ? CODE_MS : ACTION_MS;
    let left = Math.ceil(dur / 1000);
    opts.onPrompt(i, left);
    if (opts.fallback) grabStill();
    const iv = setInterval(() => opts.onTick(--left > 0 ? left : 0), 1000);
    timers.push(iv);
    timers.push(
      setTimeout(() => {
        clearInterval(iv);
        i += 1;
        step();
      }, dur),
    );
  };
  step();

  return () => {
    cancelled = true;
    timers.forEach((t) => {
      clearTimeout(t);
      clearInterval(t);
    });
    if (recorder && recorder.state !== "inactive") recorder.stop();
  };
}
