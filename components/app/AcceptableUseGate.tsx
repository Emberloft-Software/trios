"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Field";
import { copy } from "@/lib/copy";
import { acceptConductAction } from "@/app/(app)/conduct-actions";

/**
 * One-time acceptable-use agreement. Blocks the app (no close button, no
 * backdrop dismiss) until the account agrees; stored on the profile so it's
 * asked once per account, not per device.
 */
export function AcceptableUseGate() {
  const t = copy.conduct;
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState(false);
  const [pending, start] = useTransition();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panel.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-plum-800/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="aup-title"
        tabIndex={-1}
        className="glass-strong max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-[1.75rem] p-5 pb-[calc(1.25rem+var(--safe-bottom))] outline-none sm:rounded-[1.75rem] sm:p-6"
      >
        <div className="mb-3 flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-plum text-white">
            <ShieldCheck className="h-5.5 w-5.5" />
          </span>
          <h2 id="aup-title" className="text-[1.25rem] font-extrabold">{t.title}</h2>
        </div>
        <p className="text-[0.9375rem] text-ink/90">{t.intro}</p>
        <p className="mt-4 text-[0.875rem] font-bold text-plum">{t.listTitle}</p>
        <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[0.875rem] text-ink/85">
          {t.rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <p className="mt-4 rounded-2xl bg-plum/5 p-3 text-[0.8125rem] text-ink/85">{t.monitoring}</p>
        <p className="mt-2 text-[0.8125rem] text-muted">
          {t.reporting}{" "}
          <Link href="/terms" target="_blank" className="font-semibold text-coral-600 underline-offset-2 hover:underline">
            {t.termsLink}
          </Link>
        </p>
        <div className="mt-5">
          <Checkbox id="aup-agree" checked={agree} onChange={setAgree}>{t.agree}</Checkbox>
        </div>
        {error && <p role="alert" className="mt-2 text-[0.8125rem] font-semibold text-coral-600">{t.failed}</p>}
        <Button
          className="mt-4"
          block
          disabled={!agree}
          loading={pending}
          onClick={() =>
            start(async () => {
              setError(false);
              const r = await acceptConductAction();
              if (!r.ok) setError(true);
            })
          }
        >
          {t.continue}
        </Button>
      </div>
    </div>
  );
}
