import Link from "next/link";
import { Bell, ChevronRight } from "lucide-react";
import { getViewer } from "@/lib/auth";
import { PageHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { timeAgo } from "@/lib/time";
import { copy } from "@/lib/copy";
import { MarkRead } from "./MarkRead";

export const metadata = { title: "Activity" };

export default async function NotificationsPage() {
  const { supabase, user } = await getViewer();
  const { data } = await supabase
    .from("notification_outbox")
    .select("id, kind, gig_id, payload, read_at, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(60);
  const rows = data ?? [];
  const unread = rows.some((r) => !r.read_at);
  const n = copy.notifications;

  function hrefFor(kind: string, gigId: string | null, payload: unknown) {
    const code = (payload as { invite_code?: string } | null)?.invite_code;
    if (kind === "friend_invite" && code) return `/join/${code}`;
    if (kind.startsWith("friend_")) return "/me/friends";
    if (kind.startsWith("verification_") || kind.startsWith("photo_")) return "/me";
    if (kind === "admin_priority_report") return "/admin/reports";
    if (gigId) return `/gigs/${gigId}`;
    return "/me";
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={n.title} action={unread ? <MarkRead /> : null} />
      {rows.length === 0 ? (
        <EmptyState title={n.empty} />
      ) : (
        <ul className="glass divide-y divide-line overflow-hidden rounded-[1.75rem]">
          {rows.map((r) => (
            <li key={r.id}>
              <Link href={hrefFor(r.kind, r.gig_id, r.payload)} className={`flex items-center gap-3 px-4 py-3.5 transition hover:bg-white/60 ${r.read_at ? "" : "bg-coral-50/60"}`}>
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${r.read_at ? "bg-plum-50 text-plum" : "bg-coral text-white"}`}>
                  <Bell className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-[0.9375rem] ${r.read_at ? "text-ink/80" : "font-semibold text-plum"}`}>{n.kinds[r.kind] ?? r.kind}</span>
                  <span className="text-[0.75rem] text-muted">{timeAgo(r.created_at)}</span>
                </span>
                <ChevronRight className="h-4.5 w-4.5 shrink-0 text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
