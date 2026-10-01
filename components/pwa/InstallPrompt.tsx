"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { Download, Share, SquarePlus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { copy } from "@/lib/copy";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "tm-install-dismissed";
const DISMISS_DAYS = 14;

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
}

function recentlyDismissed() {
  try {
    const v = localStorage.getItem(DISMISS_KEY);
    return !!v && Date.now() - Number(v) < DISMISS_DAYS * 864e5;
  } catch {
    return false;
  }
}

/**
 * "Install the app" — native prompt on Android/desktop Chrome & Edge, step-by-
 * step Share-sheet instructions on iPhone/iPad. `banner` floats in the app
 * shell and can be dismissed; `card` sits inline (profile, landing).
 */
export function InstallPrompt({ variant = "banner" }: { variant?: "banner" | "card" }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [standalone, setStandalone] = useState(true);
  const [hidden, setHidden] = useState(true);
  const [iosOpen, setIosOpen] = useState(false);

  useEffect(() => {
    setStandalone(isStandalone());
    setIos(isIos());
    setHidden(variant === "banner" ? recentlyDismissed() : false);
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setDeferred(null);
      setStandalone(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [variant]);

  if (standalone) {
    return variant === "card" ? <p className="text-[0.875rem] text-muted">{copy.install.installed}</p> : null;
  }
  const canInstall = !!deferred || ios;
  if (!canInstall || hidden) return null;

  async function install() {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice.catch(() => null);
      setDeferred(null);
    } else if (ios) {
      setIosOpen(true);
    }
  }

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setHidden(true);
  }

  const iosSheet = (
    <Sheet open={iosOpen} onClose={() => setIosOpen(false)} title={copy.install.iosTitle} closeLabel={copy.trust.close}>
      <ol className="space-y-3">
        {copy.install.iosSteps.map((s, i) => (
          <li key={s} className="flex items-center gap-3 rounded-2xl bg-white/70 p-3 ring-1 ring-line">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-plum-50 text-plum">
              {i === 0 ? <Share className="h-5 w-5" /> : i === 1 ? <SquarePlus className="h-5 w-5" /> : <span className="font-bold">✓</span>}
            </span>
            <span className="text-[0.9375rem] font-medium">{s}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-[0.8125rem] text-muted">{copy.install.iosSafariOnly}</p>
    </Sheet>
  );

  if (variant === "card") {
    return (
      <>
        <div className="flex items-center gap-3">
          <img src="/brand/mark-64.png" alt="" width={44} height={44} className="rounded-[28%]" />
          <p className="flex-1 text-[0.875rem] text-muted">{copy.install.body}</p>
        </div>
        <Button className="mt-3" variant="dark" block onClick={install}>
          <Download className="h-4 w-4" />
          {copy.install.cta}
        </Button>
        {iosSheet}
      </>
    );
  }

  return (
    <>
      <div className="glass-strong fixed inset-x-3 bottom-[calc(5.25rem+var(--safe-bottom))] z-40 flex items-center gap-3 rounded-3xl p-3 animate-rise md:bottom-5 md:left-auto md:right-5 md:max-w-sm">
        <img src="/brand/mark-64.png" alt="" width={44} height={44} className="rounded-[28%]" />
        <div className="min-w-0 flex-1">
          <p className="text-[0.9375rem] font-bold text-plum">{copy.install.title}</p>
          <p className="truncate text-[0.8125rem] text-muted">{copy.install.body}</p>
        </div>
        <Button size="sm" onClick={install}>{copy.install.cta}</Button>
        <button onClick={dismiss} aria-label={copy.install.later} className="rounded-full p-1.5 text-muted hover:bg-plum/5">
          <X className="h-4 w-4" />
        </button>
      </div>
      {iosSheet}
    </>
  );
}
