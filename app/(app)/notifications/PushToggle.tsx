"use client";

import { useEffect, useState } from "react";
import { BellOff, BellRing } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { copy } from "@/lib/copy";
import { disablePush, enablePush, readPushState, type PushState } from "@/lib/push/client";

/** Per-device push notification switch shown at the top of Activity. */
export function PushToggle() {
  const t = copy.notifications.push;
  const [state, setState] = useState<PushState>("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    readPushState().then(setState, () => setState("unsupported"));
  }, []);

  if (state === "loading") return null;
  const on = state === "on";
  const hint =
    state === "ios-install" ? t.iosInstall : state === "denied" ? t.denied : state === "unsupported" ? t.unsupported : on ? t.onHint : t.offHint;
  const canToggle = state === "on" || state === "off";

  async function toggle() {
    setBusy(true);
    setError(null);
    try {
      setState(on ? await disablePush() : await enablePush());
    } catch {
      setError(t.failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="glass mb-5 flex flex-wrap items-center gap-3 rounded-[1.75rem] p-4" aria-live="polite">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${on ? "bg-mint-50 text-mint" : "bg-plum-50 text-plum"}`}>
        {on ? <BellRing className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
      </span>
      <div className="min-w-0 flex-1 basis-48">
        <p className="font-bold text-plum">{t.title}</p>
        <p className="text-[0.8125rem] text-muted">{error ?? hint}</p>
      </div>
      {canToggle && (
        <Button size="sm" variant={on ? "secondary" : "primary"} loading={busy} onClick={toggle}>
          {on ? t.turnOff : t.turnOn}
        </Button>
      )}
    </section>
  );
}
