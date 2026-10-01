import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatGigTime } from "@/lib/time";
import { copy } from "@/lib/copy";
import { ids } from "../_lib";
import { CancelGigButton } from "./CancelGigButton";

export const metadata = { title: "Gigs — Admin" };

const TABS = [
  ["upcoming", "Upcoming"],
  ["past", "Past"],
  ["cancelled", "Cancelled"],
] as const;

export default async function AdminGigsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = "upcoming" } = await searchParams;
  const db = createAdminClient();
  const now = new Date().toISOString();
  let q = db
    .from("gigs")
    .select("id, title, code, status, starts_at, capacity, claimed_count, reserved_slots, host_guests, age_min, age_max, gender_pref, host_id, place_label, activities(name, emoji)")
    .limit(100);
  if (tab === "upcoming") q = q.in("status", ["open", "locked"]).gte("starts_at", now).order("starts_at");
  else if (tab === "past") q = q.in("status", ["completed", "expired"]).order("starts_at", { ascending: false });
  else q = q.eq("status", "cancelled").order("starts_at", { ascending: false });
  const { data } = await q;
  const rows = data ?? [];
  const { data: hosts } = await db.from("profiles").select("id, display_name").in("id", ids(rows.map((r) => r.host_id)));
  const hostName = new Map((hosts ?? []).map((h) => [h.id, h.display_name]));

  return (
    <div>
      <PageHeader title="Gigs" sub="Everything posted. Cancel anything that breaks the rules — the crew is told and nobody's reliability is affected." />
      <div className="mb-5 flex gap-2">
        {TABS.map(([k, l]) => (
          <Link key={k} href={`/admin/gigs?tab=${k}`} className={`rounded-full px-4 py-2 text-[0.875rem] font-semibold ${tab === k ? "bg-plum text-white" : "glass text-plum"}`}>{l}</Link>
        ))}
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No gigs here." />
      ) : (
        <ul className="space-y-2">
          {rows.map((g) => {
            const act = g.activities as unknown as { name: string; emoji: string } | null;
            return (
              <li key={g.id} className="glass flex flex-wrap items-center gap-3 rounded-2xl p-4">
                <span className="text-2xl" aria-hidden>{act?.emoji}</span>
                <div className="min-w-0 flex-1">
                  <Link href={`/gigs/${g.id}`} className="block truncate font-bold text-plum hover:underline">{g.title}</Link>
                  <p className="text-[0.75rem] text-muted tabular">
                    {g.code} · {formatGigTime(g.starts_at)} · {g.place_label} · host{" "}
                    <Link href={`/admin/users/${g.host_id}`} className="font-semibold text-coral-600 hover:underline">{hostName.get(g.host_id) ?? "?"}</Link>
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <Badge tone="white">{g.claimed_count + g.reserved_slots}/{g.capacity}</Badge>
                    {g.host_guests > 0 && <Badge tone="sun">{copy.guests.badge(g.host_guests)}</Badge>}
                    {g.gender_pref !== "everyone" && <Badge tone="plum">{g.gender_pref === "women" ? copy.audience.women : copy.audience.men}</Badge>}
                    <Badge tone="muted">{copy.audience.ages(g.age_min, g.age_max)}</Badge>
                    <Badge tone={g.status === "cancelled" ? "coral" : "white"}>{g.status}</Badge>
                  </div>
                </div>
                {(g.status === "open" || g.status === "locked") && <CancelGigButton gigId={g.id} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
