"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * router.refresh() that can't storm: calls within `gapMs` of the last refresh
 * collapse into one trailing refresh. Each refresh re-renders the whole server
 * page, and a new one cancels the one in flight — so back-to-back triggers
 * (several realtime events from one join, app switching) would otherwise keep
 * restarting it and nothing would ever land.
 */
export function useCalmRefresh(gapMs = 3000) {
  const router = useRouter();
  const last = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return useCallback(() => {
    if (timer.current) return; // a trailing refresh is already queued
    const wait = Math.max(0, last.current + gapMs - Date.now());
    timer.current = setTimeout(() => {
      timer.current = null;
      last.current = Date.now();
      router.refresh();
    }, Math.max(wait, 300));
  }, [router, gapMs]);
}

/** Refresh when the app comes back to the foreground after a real absence. */
export function useRefreshOnReturn(refresh: () => void, minAwayMs = 5000, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    let hiddenAt = 0;
    const onChange = () => {
      if (document.visibilityState === "hidden") hiddenAt = Date.now();
      else if (hiddenAt && Date.now() - hiddenAt > minAwayMs) refresh();
    };
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, [refresh, minAwayMs, enabled]);
}
