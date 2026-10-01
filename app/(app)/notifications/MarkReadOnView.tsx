"use client";

import { useEffect, useRef } from "react";
import { markNotificationsReadAction } from "./_actions";

/** Opening Activity counts as reading it, so the bell badge clears. */
export function MarkReadOnView({ hasUnread }: { hasUnread: boolean }) {
  const done = useRef(false);
  useEffect(() => {
    if (!hasUnread || done.current) return;
    done.current = true;
    const t = setTimeout(() => markNotificationsReadAction(), 1500); // let the highlights register first
    return () => clearTimeout(t);
  }, [hasUnread]);
  return null;
}
