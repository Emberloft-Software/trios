"use client";

import { useEffect, useRef } from "react";
import { markChatSeenAction } from "./_actions";

/**
 * While the open chat is on screen, tell the server "I'm reading this" so
 * chat pushes for this gig are skipped and the pending count is cleared.
 * Pinged on open, every 30s, when the tab comes back and when a message
 * arrives; at most once per 10s.
 */
export function useChatSeen(gigId: string, enabled: boolean, lastMessageId: string | undefined) {
  const last = useRef(0);
  const ping = useRef(() => {});
  ping.current = () => {
    if (!enabled || document.visibilityState !== "visible" || Date.now() - last.current < 10000) return;
    last.current = Date.now();
    void markChatSeenAction(gigId);
  };

  useEffect(() => {
    if (!enabled) return;
    const fire = () => ping.current();
    fire();
    const t = setInterval(fire, 30000);
    document.addEventListener("visibilitychange", fire);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", fire);
    };
  }, [enabled]);

  useEffect(() => {
    if (lastMessageId) ping.current();
  }, [lastMessageId]);
}
