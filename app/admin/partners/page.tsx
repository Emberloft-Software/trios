import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";

export const metadata = { title: "Partners — Trio admin" };

interface PartnerRow {
  id: string;
  name: string;
  slug: string;
  crewsSent: number;
  peopleSent: number;
  perksRedeemed: number;
  trend: number[]; // last 8 weeks of redemptions
}

/**
 * Partner performance (docs/07, docs/08) — the report you show a venue owner at
 * renewal. This IS the product being sold. Crews sent, people sent, perks
 * redeemed, 8-week trend. Exportable as CSV.
 */
export default async function PartnersPage() {
  const admin = createAdminClient();
  const { data: venues } = await admin
    .from("venues")
    .select("id, name, slug")
    .eq("is_partner", true)
    .order("name");

  const now = Date.now();
  const rows: PartnerRow[] = [];

  for (const v of venues ?? []) {
    const [{ data: gigs }, { data: redemptions }] = await Promise.all([
      admin.from("gigs").select("claimed_count").eq("venue_id", v.id).in("status", ["locked", "completed"]),
      admin.from("perk_redemptions").select("crew_size, redeemed_at").eq("venue_id", v.id),
    ]);

    const crewsSent = (gigs ?? []).length;
    const peopleSent = (gigs ?? []).reduce((s, g) => s + (g.claimed_count ?? 0), 0);

    const trend = Array(8).fill(0) as number[];
    (redemptions ?? []).forEach((r) => {
      const weeksAgo = Math.floor((now - new Date(r.redeemed_at).getTime()) / (7 * 86400000));
      if (weeksAgo >= 0 && weeksAgo < 8) trend[7 - weeksAgo] += 1;
    });

    rows.push({
      id: v.id,
      name: v.name,
      slug: v.slug,
      crewsSent,
      peopleSent,
      perksRedeemed: (redemptions ?? []).length,
      trend,
    });
  }

  const maxTrend = Math.max(1, ...rows.flatMap((r) => r.trend));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-[2rem] font-700">Partners</h1>
        <ButtonLink href="/api/admin/partners/export" variant="secondary">
          Export CSV
        </ButtonLink>
      </div>

      {rows.length === 0 ? (
        <Card className="p-6 text-[0.9375rem] text-[var(--color-dust)]">No partner venues yet.</Card>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => (
            <Card key={r.id} className="p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-display text-[1.25rem] font-600">{r.name}</h2>
                <a href={`/spot/${r.slug}`} className="font-data text-[0.8125rem] text-[var(--color-net)] hover:underline">
                  /spot/{r.slug}
                </a>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <Metric label="Crews sent" value={r.crewsSent} />
                <Metric label="People sent" value={r.peopleSent} />
                <Metric label="Perks redeemed" value={r.perksRedeemed} />
              </div>
              {/* 8-week trend — flat bars, no gradient */}
              <div className="mt-4">
                <p className="mb-1 text-[0.75rem] uppercase tracking-[0.06em] text-[var(--color-dust)]">
                  Last 8 weeks
                </p>
                <div className="flex items-end gap-1 h-16">
                  {r.trend.map((n, i) => (
                    <div
                      key={i}
                      title={`${n} redemptions`}
                      className="flex-1 border-2 border-[var(--color-ink)] bg-[var(--color-line)]"
                      style={{ height: `${Math.max(6, (n / maxTrend) * 100)}%` }}
                    />
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[var(--radius-tile)] border-2 border-[var(--color-ink)] p-3 text-center">
      <p className="font-data text-2xl">{value}</p>
      <p className="text-[0.6875rem] text-[var(--color-dust)]">{label}</p>
    </div>
  );
}
