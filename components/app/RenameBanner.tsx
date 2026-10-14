"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { copy } from "@/lib/copy";

/** The Tremigos -> Trimegos notice runs for 10 days, then disappears on its own. */
const SHOW_UNTIL = Date.parse("2026-10-24T23:59:59+05:30");
const DISMISS_KEY = "tm_rename_dismissed";

export function RenameBanner() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (Date.now() >= SHOW_UNTIL) return setShow(false);
    try {
      if (localStorage.getItem(DISMISS_KEY)) setShow(false);
    } catch {
      // storage blocked: keep showing, dismiss still works for this visit
    }
  }, []);

  if (!show) return null;
  const t = copy.rename;

  function dismiss() {
    setShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  }

  return (
    <div
      role="region"
      aria-label={t.title}
      className="bg-hero relative z-50 px-4 pt-[calc(0.5rem+var(--safe-top))] pb-2 text-white"
    >
      <div className="mx-auto flex max-w-6xl items-start gap-3 text-[0.8125rem] leading-snug sm:items-center">
        <p className="min-w-0 flex-1">
          <span className="font-bold">{t.title}.</span> {t.body}{" "}
          <a
            href={`https://${t.domain}`}
            className="font-bold text-sun underline underline-offset-2 hover:text-white"
          >
            {t.domain}
          </a>
          . <span className="opacity-85">{t.after}</span>
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t.dismiss}
          className="-m-1 shrink-0 rounded-full p-1.5 hover:bg-white/15"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
