"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { copy } from "@/lib/copy";

interface Msg {
  id: string;
  user_id: string | null;
  body: string;
  system_kind: string | null;
  created_at: string;
}

/**
 * Realtime lobby chat (docs/03, R8). Inert before confirmation — the panel is
 * visible but shows how many more people are needed (seeing the locked chat is
 * part of what makes people want the gig to fill). At confirmation, RLS opens
 * the door and Realtime delivers to every connected member. Read-only after
 * completion. Enforcement is in the RLS policy, not here.
 */
export function LobbyChat({
  gigId,
  confirmed,
  completed,
  minToConfirm,
  claimedCount,
  currentUserId,
}: {
  gigId: string;
  confirmed: boolean;
  completed: boolean;
  minToConfirm: number;
  claimedCount: number;
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!confirmed) return;
    let active = true;

    supabase
      .from("gig_messages")
      .select("id, user_id, body, system_kind, created_at")
      .eq("gig_id", gigId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (active && data) setMessages(data);
      });

    const channel = supabase
      .channel(`gig:${gigId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "gig_messages", filter: `gig_id=eq.${gigId}` },
        (payload) => setMessages((m) => [...m, payload.new as Msg]),
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmed, gigId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || completed) return;
    setSending(true);
    // Optimistic insert with rollback on failure.
    const optimistic: Msg = {
      id: `tmp-${Date.now()}`,
      user_id: currentUserId,
      body,
      system_kind: null,
      created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);
    setDraft("");
    const { error } = await supabase
      .from("gig_messages")
      .insert({ gig_id: gigId, user_id: currentUserId, body });
    setSending(false);
    if (error) {
      setMessages((m) => m.filter((x) => x.id !== optimistic.id));
      setDraft(body);
    }
  }

  if (!confirmed) {
    const remaining = minToConfirm - claimedCount;
    return (
      <Card className="p-5">
        <h2 className="mb-2 font-display text-[1.125rem] font-600">Chat</h2>
        <p className="text-[0.9375rem] text-[var(--color-dust)]">
          {remaining <= 1 ? copy.chat.beforeConfirm2 : copy.chat.beforeConfirm1}
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <h2 className="mb-3 font-display text-[1.125rem] font-600">Chat</h2>
      <div className="max-h-80 space-y-2 overflow-y-auto">
        {messages.map((m) =>
          m.system_kind ? (
            <p key={m.id} className="text-center font-data text-[0.75rem] uppercase tracking-[0.06em] text-[var(--color-dust)]">
              {m.body}
            </p>
          ) : (
            <div
              key={m.id}
              className={`max-w-[80%] rounded-[var(--radius-chip)] border-2 border-[var(--color-ink)] px-3 py-2 text-[0.9375rem] ${
                m.user_id === currentUserId
                  ? "ml-auto bg-[var(--color-line)]"
                  : "bg-[var(--color-chalk)]"
              }`}
            >
              {m.body}
            </div>
          ),
        )}
        <div ref={endRef} />
      </div>

      {completed ? (
        <p className="mt-3 text-[0.875rem] text-[var(--color-dust)]">{copy.chat.readOnly}</p>
      ) : (
        <form onSubmit={send} className="mt-3 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={1000}
            placeholder={copy.chat.placeholder}
            className="flex-1 rounded-[var(--radius-chip)] border-2 border-[var(--color-ink)] bg-[var(--color-chalk)] px-3 py-2 text-[0.9375rem] outline-none"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="rounded-[var(--radius-btn)] border-2 border-[var(--color-ink)] bg-[var(--color-tape)] px-4 text-[var(--color-chalk)] disabled:opacity-60"
          >
            Send
          </button>
        </form>
      )}
    </Card>
  );
}
