"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, MessageCircle, SendHorizontal, ShieldAlert, TriangleAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { copy } from "@/lib/copy";
import { formatClock } from "@/lib/time";
import { sendMessageAction } from "./_actions";

interface Msg {
  id: string;
  user_id: string | null;
  body: string;
  system_kind: string | null;
  created_at: string;
}

// Phone numbers (Sri Lankan and international formats) and anything link-like.
// A run of digits/separators counts as a phone number once it holds 9+ digits
// (so dates and prices don't trip it).
const PHONE_RE = /\+?\d[\d\s().-]{7,}\d/g;
const LINK_RE = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(?:com|lk|net|org|io|me|app|link|ly|co|gg|xyz|info|biz)\b|wa\.me|t\.me|bit\.ly)/i;

function flagsFor(body: string) {
  const phone = (body.match(PHONE_RE) ?? []).some((m) => m.replace(/\D/g, "").length >= 9);
  return { phone, link: LINK_RE.test(body) };
}

/**
 * Realtime group chat. Locked until the gig is on; RLS enforces it. Always
 * shows the "keep it on Tremigos" disclaimer, warns before sending a number or
 * link, and labels received messages that contain one. Links never render as
 * clickable.
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
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [warn, setWarn] = useState<null | "phone" | "link">(null);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!confirmed) return;
    let active = true;
    supabase
      .from("gig_messages")
      .select("id, user_id, body, system_kind, created_at")
      .eq("gig_id", gigId)
      .order("created_at", { ascending: true })
      .limit(300)
      .then(({ data }) => {
        if (active && data) setMessages(data);
      });

    const channel = supabase
      .channel(`gig:${gigId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "gig_messages", filter: `gig_id=eq.${gigId}` },
        (payload) => {
          const incoming = payload.new as Msg;
          setMessages((m) => {
            if (m.some((x) => x.id === incoming.id)) return m;
            const tmp = m.findIndex((x) => x.id.startsWith("tmp-") && x.user_id === incoming.user_id && x.body === incoming.body);
            if (tmp !== -1) {
              const next = [...m];
              next[tmp] = incoming;
              return next;
            }
            return [...m, incoming];
          });
          // membership changed — refresh the crew list / slot strip
          if (incoming.system_kind && ["left", "removed", "vote_removed", "locked", "cancelled"].includes(incoming.system_kind)) {
            router.refresh();
          }
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [confirmed, gigId, supabase, router]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(force = false) {
    const body = draft.trim();
    if (!body || completed) return;
    if (!force) {
      const f = flagsFor(body);
      if (f.phone || f.link) {
        setWarn(f.phone ? "phone" : "link");
        return;
      }
    }
    setWarn(null);
    setError(null);
    setSending(true);
    const optimistic: Msg = { id: `tmp-${Date.now()}`, user_id: currentUserId, body, system_kind: null, created_at: new Date().toISOString() };
    setMessages((m) => [...m, optimistic]);
    setDraft("");
    const res = await sendMessageAction({ gigId, body });
    setSending(false);
    if (!res.ok) {
      setMessages((m) => m.filter((x) => x.id !== optimistic.id));
      setDraft(body);
      setError(res.error);
      return;
    }
    setMessages((m) => {
      if (m.some((x) => x.id === res.id)) return m.filter((x) => x.id !== optimistic.id);
      return m.map((x) => (x.id === optimistic.id ? { ...x, id: res.id, created_at: res.created_at } : x));
    });
  }

  const disclaimer = (
    <div className="flex gap-2 rounded-2xl bg-sun-100/70 px-3 py-2.5 text-[0.75rem] leading-snug text-[#6b4400] ring-1 ring-sun/30">
      <ShieldAlert className="mt-px h-4 w-4 shrink-0" />
      <span>{copy.disclaimers.chat}</span>
    </div>
  );

  if (!confirmed) {
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

  const name = (uid: string | null) => (!uid ? copy.chat.someone : uid === currentUserId ? copy.chat.you : crewNames[uid] ?? copy.chat.someone);

  return (
    <section className="glass flex flex-col overflow-hidden rounded-[1.75rem]">
      <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
        <MessageCircle className="h-5 w-5 text-plum" />
        <h2 className="text-[1.0625rem] font-bold">{copy.chat.heading}</h2>
        <span className="ml-auto inline-flex items-center gap-1.5 text-[0.75rem] font-semibold text-mint">
          <span className="h-2 w-2 rounded-full bg-mint" style={{ animation: completed ? undefined : "rec-pulse 2s infinite" }} />
          {memberCount}
        </span>
      </div>
      <div className="px-4 pt-3">{disclaimer}</div>

      <div ref={listRef} className="h-[min(26rem,55dvh)] space-y-1 overflow-y-auto px-4 py-3" aria-live="polite">
        {messages.length === 0 && <p className="py-8 text-center text-[0.875rem] text-muted">{copy.chat.opens}</p>}
        {messages.map((m, i) => {
          if (m.system_kind) {
            return (
              <p key={m.id} className="my-2 text-center">
                <span className="inline-block rounded-full bg-plum/5 px-3 py-1 text-[0.75rem] font-semibold text-muted">
                  {copy.chat.system[m.system_kind] ?? m.body}
                </span>
              </p>
            );
          }
          const mine = m.user_id === currentUserId;
          const prev = messages[i - 1];
          const startsRun = !prev || prev.system_kind != null || prev.user_id !== m.user_id;
          const f = flagsFor(m.body);
          return (
            <div key={m.id} className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : ""} ${startsRun ? "mt-3" : ""}`}>
              {!mine && (
                <span className="w-7 shrink-0">
                  {startsRun && <Avatar name={name(m.user_id)} src={m.user_id ? crewAvatars[m.user_id] : null} size={28} />}
                </span>
              )}
              <div className={`flex max-w-[78%] flex-col ${mine ? "items-end" : "items-start"}`}>
                {startsRun && !mine && <span className="mb-0.5 pl-1 text-[0.75rem] font-semibold text-muted">{name(m.user_id)}</span>}
                <div
                  className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-[0.9375rem] leading-snug ${
                    mine ? "rounded-br-md bg-coral text-white" : "rounded-bl-md bg-white text-ink ring-1 ring-line"
                  } ${m.id.startsWith("tmp-") ? "opacity-70" : ""}`}
                >
                  {m.body}
                </div>
                {(f.phone || f.link) && (
                  <span className="mt-1 inline-flex items-center gap-1 text-[0.6875rem] font-semibold text-[#8a5a00]">
                    <TriangleAlert className="h-3 w-3" /> {f.link ? copy.disclaimers.receivedLink : copy.disclaimers.receivedPhone}
                  </span>
                )}
                <span className="mt-0.5 px-1 text-[0.625rem] text-muted tabular">{formatClock(m.created_at)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {completed ? (
        <p className="border-t border-line px-5 py-4 text-[0.8125rem] text-muted">{copy.chat.readOnly}</p>
      ) : (
        <div className="border-t border-line p-3">
          {warn && (
            <div className="mb-2 rounded-2xl bg-sun-100 p-3 text-[0.8125rem] text-[#6b4400] ring-1 ring-sun/40">
              <p className="flex gap-2"><TriangleAlert className="mt-px h-4 w-4 shrink-0" />{warn === "phone" ? copy.disclaimers.phoneWarning : copy.disclaimers.linkWarning}</p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setWarn(null)}>{copy.disclaimers.editMessage}</Button>
                <Button size="sm" variant="dark" onClick={() => send(true)}>{copy.disclaimers.sendAnyway}</Button>
              </div>
            </div>
          )}
          {error && <p className="mb-2 px-1 text-[0.8125rem] font-medium text-coral-600">{error}</p>}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-end gap-2"
          >
            <textarea
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                if (warn) setWarn(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              maxLength={1000}
              placeholder={copy.chat.placeholder}
              aria-label={copy.chat.placeholder}
              className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl bg-white px-4 py-2.5 text-[0.9375rem] outline-none ring-1 ring-line focus:ring-2 focus:ring-coral/40"
            />
            <button
              type="submit"
              disabled={sending || !draft.trim()}
              aria-label={copy.chat.send}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-coral text-white shadow-[var(--shadow-coral)] transition hover:bg-coral-600 disabled:opacity-40"
            >
              <SendHorizontal className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
