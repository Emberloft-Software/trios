import { TriangleAlert } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { copy } from "@/lib/copy";
import { formatClock } from "@/lib/time";
import { flagsFor, type Msg } from "./chat-utils";

/** The scrolling message list. Links never render clickable. */
export function ChatMessages({
  messages,
  currentUserId,
  names,
  avatars,
}: {
  messages: Msg[];
  currentUserId: string;
  names: Record<string, string>;
  avatars: Record<string, string | null>;
}) {
  const name = (uid: string | null) => (!uid ? copy.chat.someone : uid === currentUserId ? copy.chat.you : names[uid] ?? copy.chat.someone);

  if (messages.length === 0) return <p className="py-8 text-center text-[0.875rem] text-muted">{copy.chat.opens}</p>;

  return (
    <>
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
                {startsRun && <Avatar name={name(m.user_id)} src={m.user_id ? avatars[m.user_id] : null} size={28} />}
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
    </>
  );
}
