"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BellRing, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { copy } from "@/lib/copy";
import { enablePush, readPushState } from "@/lib/push/client";

const KEY = "tm_push_prompt_dismissed";
const QUIET_DAYS = 14;

/**
 * Asks everyone to turn push on (browsers only allow it after a tap, so this
 * is as close to "on by default" as the web gets). Hidden once push is on,
 * when the browser blocks it, or for two weeks after "Not now".
 */
export function PushPrompt() {
  const t = copy.notifications.push;
  const path = usePathname();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let dismissedAt = 0;
    try {
      dismissedAt = Number(localStorage.getItem(KEY) ?? 0);
    } catch {}
    if (Date.now() - dismissedAt < QUIET_DAYS * 864e5) return;
    readPushState().then((s) => setShow(s === "off"), () => {});
  }, []);

  if (!show || path === "/notifications") return null; // Activity has its own switch

  function dismiss() {
    try {
      localStorage.setItem(KEY, String(Date.now()));
    } catch {}
    setShow(false);
  }

  return (
    <section className="glass mb-5 flex flex-wrap items-center gap-3 rounded-2xl p-4 animate-rise" aria-live="polite">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border-2 border-plum bg-sun text-plum">
        <BellRing className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1 basis-56">
        <p className="font-bold text-plum">{t.promptTitle}</p>
        <p className="text-[0.8125rem] text-muted">{error ?? t.promptBody}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          loading={busy}
          onClick={async () => {
            setBusy(true);
            setError(null);
            try {
              const s = await enablePush();
              if (s === "on" || s === "denied") setShow(false);
            } catch {
              setError(t.failed);
            } finally {
              setBusy(false);
            }
          }}
        >
          {t.turnOn}
        </Button>
        <Button size="sm" variant="ghost" onClick={dismiss}>{t.notNow}</Button>
        <button onClick={dismiss} aria-label={t.notNow} className="hidden rounded-md p-1.5 text-muted hover:bg-plum/5 sm:block">
          <X className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
