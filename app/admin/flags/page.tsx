import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { timeAgo } from "@/lib/time";
import { ids } from "../_lib";

export const metadata = { title: "Red flags — Admin" };

const KIND: Record<string, string> = {
  host_removals: "Removing lots of people",
  vote_removed: "Voted out repeatedly",
  blocks_received: "Blocked by several people",
  friend_spam: "Friend-request spray",
};

export default async function FlagsPage() {
  const db = createAdminClient();
  const { data } = await db.from("admin_flags").select("*").order("count", { ascending: false });
  const rows = data ?? [];
  const { data: profiles } = await db.from("profiles").select("id, display_name, handle").in("id", ids(rows.map((r) => r.subject_id)));
  const byId = new Map((profiles ?? []).map((p) => [p.id, p]));

  return (
    <div>
      <PageHeader title="Red flags" sub="Cross-gig patterns worth a look. Nothing here is a punishment — a person decides." />
      {rows.length === 0 ? (
        <EmptyState title="No patterns flagged." />
      ) : (
        <ul className="space-y-2">
          {rows.map((f) => {
            const p = f.subject_id ? byId.get(f.subject_id) : null;
            return (
              <li key={`${f.kind}-${f.subject_id}`}>
                <Link href={`/admin/users/${f.subject_id}`} className="glass flex items-center gap-3 rounded-2xl p-4 hover:bg-white/80">
                  <span className="min-w-0 flex-1">
                    <span className="font-bold text-plum">{p?.display_name ?? "Unknown"}</span>
                    <span className="ml-2 text-[0.75rem] text-muted">@{p?.handle}</span>
                    <span className="block text-[0.8125rem] text-muted">{f.detail}{f.last_at ? ` · last ${timeAgo(f.last_at)}` : ""}</span>
                  </span>
                  <Badge tone="coral">{KIND[f.kind ?? ""] ?? f.kind}</Badge>
                  <ChevronRight className="h-4.5 w-4.5 text-muted" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
