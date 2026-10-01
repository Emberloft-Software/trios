"use client";

import { useState } from "react";
import { SendHorizontal, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { copy } from "@/lib/copy";
import { flagsFor } from "./chat-utils";

/**
 * Message box. Warns before sending a phone number or link; the person can
 * edit or send anyway (it's their call, at their own risk).
 */
export function ChatComposer({ onSend, error }: { onSend: (body: string) => Promise<boolean>; error: string | null }) {
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [warn, setWarn] = useState<null | "phone" | "link">(null);

  async function send(force = false) {
    const body = draft.trim();
    if (!body) return;
    if (!force) {
      const f = flagsFor(body);
      if (f.phone || f.link) return setWarn(f.phone ? "phone" : "link");
    }
    setWarn(null);
    setSending(true);
    setDraft("");
    const ok = await onSend(body);
    setSending(false);
    if (!ok) setDraft(body);
  }

  return (
    <div className="border-t border-line p-3">
      {warn && (
        <div className="mb-2 rounded-2xl bg-sun-100 p-3 text-[0.8125rem] text-[#6b4400] ring-1 ring-sun/40">
          <p className="flex gap-2">
            <TriangleAlert className="mt-px h-4 w-4 shrink-0" />
            {warn === "phone" ? copy.disclaimers.phoneWarning : copy.disclaimers.linkWarning}
          </p>
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
  );
}
