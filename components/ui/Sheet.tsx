"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Bottom sheet on phones, centred dialog on desktop. Closes on Escape and on
 * backdrop tap; focus moves into the panel when it opens.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  closeLabel = "Close",
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  closeLabel?: string;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" role="presentation">
      <button
        aria-label={closeLabel}
        onClick={onClose}
        className="absolute inset-0 bg-plum-800/40 backdrop-blur-[2px] animate-[rise_.2s_ease-out]"
      />
      <div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        className="glass-strong relative max-h-[88dvh] w-full overflow-y-auto rounded-t-[1.75rem] p-5 pb-[calc(1.25rem+var(--safe-bottom))] outline-none animate-rise sm:max-w-md sm:rounded-[1.75rem] sm:pb-5"
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-plum/15 sm:hidden" aria-hidden />
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="text-[1.125rem] font-bold">{title}</h2>
          <button onClick={onClose} aria-label={closeLabel} className="-m-1 rounded-full p-1.5 text-muted hover:bg-plum/5">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
