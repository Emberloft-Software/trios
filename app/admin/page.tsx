import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/Card";
import { formatGigTime } from "@/lib/time";

export const metadata = { title: "Admin — Trio" };

/**
 * Dashboard (docs/07). Five big mono numbers + the operationally useful list:
 * "gigs at risk" (open, locking within 6h, below minimum) — the list a human
 * works every day during seeding. Reads via the service role (server-only).
 */
export default async function AdminDashboard() {
  const admin = createAdminClient();
  const now = new Date();
  const in6h = new Date(now.getTime() + 6 * 3600_000).toISOString();
  const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now); endOfDay.setHours(23, 59, 59, 999);

  const [pendingV, openR, gigsToday, atRisk] = await Promise.all([
    admin.from("verification_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("reports").select("id", { count: "exact", head: true }).eq("status", "open"),
    admin.from("gigs").select("id", { count: "exact", head: true })
      .gte("starts_at", startOfDay.toISOString()).lte("starts_at", endOfDay.toISOString()),
    admin.from("gigs").select("id, title, code, starts_at, locks_at, claimed_count, min_to_confirm")
      .eq("status", "open").lte("locks_at", in6h).order("locks_at", { ascending: true }),
  ]);

  const risky = (atRisk.data ?? []).filter((g) => g.claimed_count < g.min_to_confirm);

  const stats: [string, number][] = [
    ["Pending verifications", pendingV.count ?? 0],
    ["Open reports", openR.count ?? 0],
    ["Gigs today", gigsToday.count ?? 0],
    ["Gigs at risk", risky.length],
  ];

  return (
    <div>
      <h1 className="mb-6 font-display text-[2rem] font-700">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(([label, n]) => (
          <Card key={label} className="p-5">
            <p className="font-data text-[2.5rem] leading-none">{n}</p>
            <p className="mt-2 text-[0.8125rem] text-[var(--color-dust)]">{label}</p>
          </Card>
        ))}
      </div>

      <h2 className="mb-3 mt-8 font-display text-[1.5rem] font-700">Gigs at risk</h2>
      <p className="mb-4 text-[0.9375rem] text-[var(--color-dust)]">
        Open, locking within 6 hours, still below minimum. Work this list daily during seeding.
      </p>
      {risky.length === 0 ? (
        <Card className="p-5 text-[0.9375rem] text-[var(--color-dust)]">Nothing at risk right now.</Card>
      ) : (
        <ul className="space-y-2">
          {risky.map((g) => (
            <li key={g.id}>
              <Link href={`/gigs/${g.id}`}>
                <Card hover className="flex items-center justify-between p-4">
                  <span>
                    <span className="font-500">{g.title}</span>{" "}
                    <span className="font-data text-[0.8125rem] text-[var(--color-dust)]">{g.code}</span>
                  </span>
                  <span className="font-data text-[0.8125rem]">
                    {g.claimed_count}/{g.min_to_confirm} · locks {formatGigTime(g.locks_at)}
                  </span>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
