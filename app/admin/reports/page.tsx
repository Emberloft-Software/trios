import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ResolveForm } from "./ResolveForm";
import { copy } from "@/lib/copy";
import { timeAgo } from "@/lib/time";
import { ids } from "../_lib";

export const metadata = { title: "Reports — Admin" };

const PRIORITY = new Set(["threat_or_violence", "underage", "sexual_advance"]);
const LABELS: Record<string, string> = { ...copy.trust.report.categories, crew_vote_removal: "Removed by crew vote" };

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = "open" } = await searchParams;
  const db = createAdminClient();
  let q = db.from("reports").select("id, reporter_id, target_id, gig_id, category, details, status, resolution, created_at").order("created_at", { ascending: tab === "open" }).limit(100);
  q = tab === "open" ? q.eq("status", "open") : q.neq("status", "open");
  const { data } = await q;
  const rows = data ?? [];

  const [{ data: profiles }, { data: gigs }] = await Promise.all([
    db.from("profiles").select("id, display_name, handle").in("id", ids(rows.flatMap((r) => [r.reporter_id, r.target_id]))),
    db.from("gigs").select("id, title, code").in("id", ids(rows.map((r) => r.gig_id))),
  ]);
  const byId = new Map((profiles ?? []).map((p) => [p.id, p]));
  const gigById = new Map((gigs ?? []).map((g) => [g.id, g]));

  const sorted = tab === "open"
    ? [...rows].sort((a, b) => (PRIORITY.has(a.category) ? 0 : 1) - (PRIORITY.has(b.category) ? 0 : 1) || a.created_at.localeCompare(b.created_at))
    : rows;

  return (
    <div>
      <PageHeader title="Reports" sub="Priority categories are pinned to the top. Reporters are never revealed to the person reported." />
      <div className="mb-5 flex gap-2">
        {[["open", "Open"], ["closed", "Resolved"]].map(([k, l]) => (
          <Link key={k} href={`/admin/reports?tab=${k}`} className={`rounded-full px-4 py-2 text-[0.875rem] font-semibold ${tab === k ? "bg-plum text-white" : "glass text-plum"}`}>{l}</Link>
        ))}
      </div>

      {sorted.length === 0 ? (
        <EmptyState title={tab === "open" ? "Queue is clear." : "Nothing resolved yet."} />
      ) : (
        <div className="space-y-4">
          {sorted.map((r) => {
            const priority = PRIORITY.has(r.category);
            const target = r.target_id ? byId.get(r.target_id) : null;
            const reporter = r.reporter_id ? byId.get(r.reporter_id) : null;
            const gig = r.gig_id ? gigById.get(r.gig_id) : null;
            return (
              <article key={r.id} className={`glass rounded-[1.5rem] p-5 ${priority && r.status === "open" ? "ring-2 ring-coral" : ""}`}>
                <div className="flex flex-wrap items-center gap-2">
                  {priority && <Badge tone="coral">Priority</Badge>}
                  {r.category === "crew_vote_removal" && <Badge tone="sun">Crew vote</Badge>}
                  <span className="font-bold text-plum">{LABELS[r.category] ?? r.category}</span>
                  <span className="ml-auto text-[0.75rem] text-muted">{timeAgo(r.created_at)}</span>
                </div>
                <p className="mt-2 text-[0.875rem]">
                  <span className="text-muted">About </span>
                  {target ? <Link href={`/admin/users/${r.target_id}`} className="font-semibold text-coral-600 hover:underline">{target.display_name} (@{target.handle})</Link> : <span>Deleted user</span>}
                  <span className="text-muted"> · from </span>
                  {reporter ? <Link href={`/admin/users/${r.reporter_id}`} className="font-semibold text-plum hover:underline">{reporter.display_name}</Link> : <span>Deleted user</span>}
                  {gig && <><span className="text-muted"> · gig </span><Link href={`/gigs/${r.gig_id}`} className="font-semibold text-plum hover:underline">{gig.title} ({gig.code})</Link></>}
                </p>
                <p className="mt-3 whitespace-pre-line rounded-2xl bg-white/70 p-3 text-[0.9375rem] ring-1 ring-line">{r.details}</p>
                {r.status === "open" ? (
                  <ResolveForm reportId={r.id} />
                ) : (
                  <p className="mt-3 text-[0.8125rem] text-muted"><Badge tone={r.status === "actioned" ? "mint" : "muted"}>{r.status}</Badge> {r.resolution}</p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
