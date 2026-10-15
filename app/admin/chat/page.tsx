import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatGigTime, timeAgo } from "@/lib/time";
import { ids } from "../_lib";
import { FlagActions } from "./FlagActions";

export const metadata = { title: "Chat flags · Admin" };

const TABS = [
  ["open", "To review"],
  ["actioned", "Actioned"],
  ["dismissed", "Dismissed"],
] as const;

const SEVERITY: Record<number, { label: string; tone: "muted" | "sun" | "coral" }> = {
  1: { label: "Rude", tone: "muted" },
  2: { label: "Serious", tone: "sun" },
  3: { label: "Severe", tone: "coral" },
};

type Msg = { id: string; gig_id: string; user_id: string | null; body: string; system_kind: string | null; deleted_at: string | null; created_at: string };

/**
 * Chat messages that matched the moderation word list. Nothing is blocked
 * automatically; a person reviews each one here.
 */
export default async function ChatFlagsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab: raw } = await searchParams;
  const tab = TABS.some(([k]) => k === raw) ? (raw as string) : "open";
  const db = createAdminClient();
  const { data } = await db
    .from("chat_flags")
    .select("*")
    .eq("status", tab)
    .order("severity", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);
  const flags = data ?? [];

  const gigIds = ids(flags.map((f) => f.gig_id));
  const [{ data: gigs }, { data: msgs }, { data: crew }] = await Promise.all([
    db.from("gigs").select("id, title, status, starts_at").in("id", gigIds),
    db.from("gig_messages").select("id, gig_id, user_id, body, system_kind, deleted_at, created_at").in("gig_id", gigIds).order("created_at").limit(2000),
    db.from("gig_crew").select("gig_id, user_id, state").in("gig_id", gigIds),
  ]);
  const people = ids([...flags.map((f) => f.user_id), ...(msgs ?? []).map((m) => m.user_id)]);
  const { data: profiles } = await db.from("profiles").select("id, display_name, handle").in("id", people);
  const who = new Map((profiles ?? []).map((p) => [p.id, p]));
  const gigOf = new Map((gigs ?? []).map((g) => [g.id, g]));
  const byGig = new Map<string, Msg[]>();
  for (const m of (msgs ?? []) as Msg[]) byGig.set(m.gig_id, [...(byGig.get(m.gig_id) ?? []), m]);

  return (
    <div>
      <PageHeader title="Chat flags" sub="Group chat messages that matched the moderation word list. Check the context before acting: it can be friendly banter or a false match." />
      <div className="mb-5 flex gap-2">
        {TABS.map(([k, l]) => (
          <Link key={k} href={`/admin/chat?tab=${k}`} className={`rounded-full px-4 py-2 text-[0.875rem] font-semibold ${tab === k ? "bg-plum text-white" : "glass text-plum"}`}>{l}</Link>
        ))}
      </div>
      {flags.length === 0 ? (
        <EmptyState title={tab === "open" ? "Nothing to review. Chats look clean." : "Nothing here."} />
      ) : (
        <ul className="space-y-3">
          {flags.map((f) => {
            const g = gigOf.get(f.gig_id);
            const p = f.user_id ? who.get(f.user_id) : null;
            const thread = byGig.get(f.gig_id) ?? [];
            const at = thread.findIndex((m) => m.id === f.message_id);
            const context = at >= 0 ? thread.slice(Math.max(0, at - 3), at + 3) : [];
            const message = at >= 0 ? thread[at] : null;
            const inGig = (crew ?? []).some((c) => c.gig_id === f.gig_id && c.user_id === f.user_id && c.state === "claimed");
            const sev = SEVERITY[f.severity] ?? SEVERITY[1];
            return (
              <li key={f.id} className="glass rounded-[1.5rem] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={sev.tone}>{sev.label}</Badge>
                  {f.categories.map((c: string) => <Badge key={c} tone="white">{c}</Badge>)}
                  <span className="text-[0.75rem] text-muted">{timeAgo(f.created_at)}</span>
                  {f.action && <Badge tone="mint">{f.action}</Badge>}
                </div>
                <p className="mt-2 text-[0.8125rem] text-muted">
                  <Link href={`/admin/users/${f.user_id}`} className="font-bold text-plum hover:underline">{p?.display_name ?? "Deleted user"}</Link>
                  {p && <span> @{p.handle}</span>} in{" "}
                  <Link href={`/gigs/${f.gig_id}`} className="font-semibold text-coral-600 hover:underline">{g?.title ?? "a gig"}</Link>
                  {g && <span> · {formatGigTime(g.starts_at)} · {g.status}</span>}
                </p>
                <blockquote className="mt-2 rounded-2xl bg-coral-50 px-3 py-2 text-[0.9375rem] text-ink ring-1 ring-coral/15">{f.body}</blockquote>
                <p className="mt-1 text-[0.75rem] text-muted">Matched: {f.matched.join(", ")}</p>
                {context.length > 1 && (
                  <details className="mt-2 text-[0.8125rem]">
                    <summary className="cursor-pointer font-semibold text-plum">Conversation around it</summary>
                    <ul className="mt-1.5 space-y-1 border-l-2 border-line pl-3">
                      {context.map((m) => (
                        <li key={m.id} className={m.id === f.message_id ? "font-semibold text-ink" : "text-ink/75"}>
                          <span className="text-muted">{m.system_kind ? "System" : who.get(m.user_id ?? "")?.display_name ?? "Someone"}: </span>
                          {m.deleted_at ? <em>(removed)</em> : m.body}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
                {tab === "open" || (tab === "actioned" && (inGig || !message?.deleted_at)) ? (
                  <FlagActions
                    flagId={f.id}
                    userId={f.user_id}
                    messageRemoved={!message || !!message.deleted_at}
                    canRemoveUser={inGig && !!g && (g.status === "open" || g.status === "locked")}
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
