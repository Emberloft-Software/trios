import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/Card";
import { ResolveForm } from "./ResolveForm";
import { copy } from "@/lib/copy";
import { formatGigTime } from "@/lib/time";

export const metadata = { title: "Reports — Trio admin" };

const PRIORITY = new Set(["threat_or_violence", "underage", "sexual_advance"]);

/**
 * Report queue (docs/07). Priority categories pinned to the top with a
 * --color-tape marker; everything else FIFO. Reports are never attributed to
 * the reporter in any user-facing surface — this is admin-only.
 */
export default async function ReportsPage() {
  const admin = createAdminClient();
  const { data: reports } = await admin
    .from("reports")
    .select("id, reporter_id, target_id, gig_id, category, details, created_at")
    .eq("status", "open")
    .order("created_at", { ascending: true })
    .limit(100);

  const rows = reports ?? [];
  const userIds = [...new Set(rows.flatMap((r) => [r.reporter_id, r.target_id]))];
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, display_name, handle")
    .in("id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));

  // priority first, then FIFO
  const sorted = [...rows].sort((a, b) => {
    const pa = PRIORITY.has(a.category) ? 0 : 1;
    const pb = PRIORITY.has(b.category) ? 0 : 1;
    if (pa !== pb) return pa - pb;
    return a.created_at.localeCompare(b.created_at);
  });

  return (
    <div>
      <h1 className="mb-2 font-display text-[2rem] font-700">Reports</h1>
      <p className="mb-6 text-[0.875rem] text-[var(--color-dust)]">
        Priority categories are pinned to the top. {sorted.length} open.
      </p>

      {sorted.length === 0 ? (
        <Card className="p-6 text-[0.9375rem] text-[var(--color-dust)]">Queue is clear.</Card>
      ) : (
        <div className="space-y-4">
          {sorted.map((r) => {
            const priority = PRIORITY.has(r.category);
            return (
              <Card key={r.id} className="p-5">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {priority && (
                    <span className="font-data rounded-[var(--radius-tile)] border-2 border-[var(--color-ink)] bg-[var(--color-tape)] px-2 py-0.5 text-[0.6875rem] uppercase text-[var(--color-chalk)]">
                      Priority
                    </span>
                  )}
                  <span className="font-500">
                    {copy.trust.report.categories[r.category] ?? r.category}
                  </span>
                  <span className="font-data ml-auto text-[0.75rem] text-[var(--color-dust)]">
                    {formatGigTime(r.created_at)}
                  </span>
                </div>
                <p className="text-[0.9375rem]">
                  <span className="text-[var(--color-dust)]">About</span>{" "}
                  <span className="font-500">{nameById.get(r.target_id) ?? "Unknown"}</span>
                  <span className="text-[var(--color-dust)]"> · reported by </span>
                  <span>{nameById.get(r.reporter_id) ?? "Unknown"}</span>
                </p>
                <p className="mt-2 rounded-[var(--radius-chip)] border-2 border-[var(--color-ink)] bg-[var(--color-court)] p-3 text-[0.9375rem]">
                  {r.details}
                </p>
                <ResolveForm reportId={r.id} targetId={r.target_id} />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
