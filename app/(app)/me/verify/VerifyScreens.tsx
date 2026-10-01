"use client";

import Link from "next/link";
import { Camera, CheckCircle2, RotateCcw, ScanFace } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { copy } from "@/lib/copy";

const v = copy.verification;

export function ExplainerScreen({ error, starting, onStart }: { error: string | null; starting: boolean; onStart: () => void }) {
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
      <Button size="lg" block onClick={onStart} loading={starting}>
        <Camera className="h-5 w-5" /> {v.explainer.start}
      </Button>
    </div>
  );
}

export function BlockedScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  const ios = typeof navigator !== "undefined" && /iPhone|iPad/.test(navigator.userAgent);
  return (
    <div className="glass rounded-[1.75rem] p-6">
      <Notice tone="danger" title={message}>{ios ? v.cameraIosHint : null}</Notice>
      <Button variant="secondary" className="mt-4" onClick={onRetry}>
        <RotateCcw className="h-4 w-4" /> {v.tryAgain}
      </Button>
    </div>
  );
}

export function DoneScreen() {
  return (
    <div className="glass rounded-[1.75rem] p-8 text-center animate-rise">
      <span className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-mint-50 text-mint"><CheckCircle2 className="h-8 w-8" /></span>
      <h2 className="text-[1.25rem] font-bold">{v.sent}</h2>
      <ButtonLink href="/me" variant="secondary" className="mt-5">{v.backToProfile}</ButtonLink>
      <Link href="/feed" className="sr-only">{copy.nav.feed}</Link>
    </div>
  );
}
