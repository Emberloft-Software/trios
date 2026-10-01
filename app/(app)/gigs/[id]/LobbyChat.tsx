"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCalmRefresh, useRefreshOnReturn } from "@/lib/useCalmRefresh";
import { Lock, MessageCircle, ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { copy } from "@/lib/copy";
import { sendMessageAction } from "./_actions";
import { MEMBERSHIP_EVENTS, mergeIncoming, type Msg } from "./chat-utils";
import { ChatMessages } from "./ChatMessages";
import { ChatComposer } from "./ChatComposer";

/**
 * Realtime group chat. Locked until every spot is filled (or the gig locks);
 * RLS enforces it. While locked, a realtime listener on the gig row flips the
 * lobby open for everyone the moment the last person joins.
 */
export function LobbyChat({
  gigId,
  confirmed,
  completed,
  needed,
  currentUserId,
  crewNames,
  crewAvatars,
  memberCount,
}: {
  gigId: string;
  confirmed: boolean;
  completed: boolean;
  needed: number;
  currentUserId: string;
  crewNames: Record<string, string>;
  crewAvatars: Record<string, string | null>;
  memberCount: number;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const refresh = useCalmRefresh();
  // flips to true the instant the realtime row update says chat unlocked,
  // before the page refresh lands
  const [unlockedLive, setUnlockedLive] = useState(false);
  const open = confirmed || unlockedLive;
  useRefreshOnReturn(refresh, 5000, !completed);

  // While locked: listen for this gig's row changing (the last spot filling
  // sets chat_opened_at) and refresh; poll slowly as a fallback.
  useEffect(() => {
    if (confirmed || completed) return;
    const channel = supabase
      .channel(`gig-row:${gigId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "gigs", filter: `id=eq.${gigId}` }, (payload) => {
        if ((payload.new as { chat_opened_at?: string | null }).chat_opened_at) setUnlockedLive(true);
        refresh();
      })
      .subscribe();
    const t = setInterval(() => document.visibilityState === "visible" && refresh(), 30000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(t);
    };
  }, [confirmed, completed, gigId, supabase, refresh]);

  useEffect(() => {
    if (!open) return;
    let live = true;
    supabase
      .from("gig_messages")
      .select("id, user_id, body, system_kind, created_at")
      .eq("gig_id", gigId)
      .order("created_at", { ascending: true })
      .limit(300)
      .then(({ data }) => live && data && setMessages(data));

    const channel = supabase
      .channel(`gig:${gigId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "gig_messages", filter: `gig_id=eq.${gigId}` }, (payload) => {
        const incoming = payload.new as Msg;
        setMessages((m) => mergeIncoming(m, incoming));
        if (incoming.system_kind && MEMBERSHIP_EVENTS.includes(incoming.system_kind)) refresh();
      })
      .subscribe();
    return () => {
      live = false;
      supabase.removeChannel(channel);
    };
  }, [open, gigId, supabase, refresh]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(body: string) {
    setError(null);
    const tmp: Msg = { id: `tmp-${Date.now()}`, user_id: currentUserId, body, system_kind: null, created_at: new Date().toISOString() };
    setMessages((m) => [...m, tmp]);
    const res = await sendMessageAction({ gigId, body });
    if (!res.ok) {
      setMessages((m) => m.filter((x) => x.id !== tmp.id));
      setError(res.error);
      return false;
    }
    setMessages((m) =>
      m.some((x) => x.id === res.id) ? m.filter((x) => x.id !== tmp.id) : m.map((x) => (x.id === tmp.id ? { ...x, id: res.id, created_at: res.created_at } : x)),
    );
    return true;
  }

  const disclaimer = (
    <div className="flex gap-2 rounded-2xl bg-sun-100/70 px-3 py-2.5 text-[0.75rem] leading-snug text-[#6b4400] ring-1 ring-sun/30">
      <ShieldAlert className="mt-px h-4 w-4 shrink-0" />
      <span>{copy.disclaimers.chat}</span>
    </div>
  );

  if (!open) {
    return (
      <section className="glass rounded-[1.75rem] p-5">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-plum" />
          <h2 className="text-[1.0625rem] font-bold">{copy.chat.heading}</h2>
        </div>
        <div className="my-5 flex flex-col items-center text-center">
          <span className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-plum-50 text-plum">
            <Lock className="h-6 w-6" />
          </span>
          <p className="font-bold text-plum">{copy.chat.lockedTitle}</p>
          <p className="mt-1 max-w-xs text-[0.875rem] text-muted">{copy.chat.beforeConfirm(needed)}</p>
        </div>
        {disclaimer}
      </section>
    );
  }

  return (
    <section className="glass flex flex-col overflow-hidden rounded-[1.75rem]">
      <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
        <MessageCircle className="h-5 w-5 text-plum" />
        <h2 className="text-[1.0625rem] font-bold">{copy.chat.heading}</h2>
        <span className="ml-auto inline-flex items-center gap-1.5 text-[0.75rem] font-semibold text-mint">
          <span className="h-2 w-2 rounded-full bg-mint" />
          {memberCount}
        </span>
      </div>
      <div className="px-4 pt-3">{disclaimer}</div>
      <div ref={listRef} className="h-[min(26rem,55dvh)] space-y-1 overflow-y-auto px-4 py-3" aria-live="polite">
        <ChatMessages messages={messages} currentUserId={currentUserId} names={crewNames} avatars={crewAvatars} />
      </div>
      {completed ? (
        <p className="border-t border-line px-5 py-4 text-[0.8125rem] text-muted">{copy.chat.readOnly}</p>
      ) : (
        <ChatComposer onSend={send} error={error} />
      )}
    </section>
  );
}
