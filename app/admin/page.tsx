import Link from "next/link";
import { ArrowRight, CalendarDays, Flag, ImageIcon, ScanFace, UserPlus, Users } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatGigTime, timeAgo } from "@/lib/time";

export const metadata = { title: "Admin" };

export default async function AdminDashboard() {
  const db = createAdminClient();
  const now = new Date();
  const in6h = new Date(now.getTime() + 6 * 3600e3).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 864e5).toISOString();

  const [pendingV, pendingP, openR, users, newUsers, upcoming, atRisk, recent] = await Promise.all([
    db.from("verification_requests").select("id", { count: "exact", head: true }).eq("status", "pending").not("media_path", "is", null),
    db.from("profiles").select("id", { count: "exact", head: true }).eq("avatar_status", "pending"),
    db.from("reports").select("id", { count: "exact", head: true }).eq("status", "open"),
    db.from("profiles").select("id", { count: "exact", head: true }),
    db.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    db.from("gigs").select("id", { count: "exact", head: true }).in("status", ["open", "locked"]).gte("starts_at", now.toISOString()),
    db.from("gigs").select("id, title, code, locks_at, claimed_count, reserved_slots, min_to_confirm").eq("status", "open").lte("locks_at", in6h).order("locks_at"),
    db.from("admin_audit").select("id, action, target_type, created_at, reason").order("created_at", { ascending: false }).limit(8),
  ]);

  const risky = (atRisk.data ?? []).filter((g) => g.claimed_count + g.reserved_slots < g.min_to_confirm || g.claimed_count < 2);

  const queues = [
    { href: "/admin/verifications", label: "Face verifications", n: pendingV.count ?? 0, icon: ScanFace, tint: "bg-coral-50 text-coral" },
    { href: "/admin/photos", label: "Profile photos", n: pendingP.count ?? 0, icon: ImageIcon, tint: "bg-sun-100 text-[#a86b00]" },
    { href: "/admin/reports", label: "Open reports", n: openR.count ?? 0, icon: Flag, tint: "bg-plum-50 text-plum" },
  ];
  const stats = [
    { label: "Users", n: users.count ?? 0, icon: Users },
    { label: "New this week", n: newUsers.count ?? 0, icon: UserPlus },
    { label: "Upcoming gigs", n: upcoming.count ?? 0, icon: CalendarDays },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" sub="Work the queues top to bottom. Every action you take is logged." />

      <div className="grid gap-4 md:grid-cols-3">
        {queues.map((q) => {
          const Icon = q.icon;
          return (
            <Link key={q.href} href={q.href} className="glass group rounded-[1.5rem] p-5 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
              <div className="flex items-center justify-between">
                <span className={`grid h-11 w-11 place-items-center rounded-2xl ${q.tint}`}><Icon className="h-5.5 w-5.5" /></span>
                <ArrowRight className="h-5 w-5 text-muted transition group-hover:translate-x-1" />
              </div>
              <p className="mt-4 text-[2.25rem] font-extrabold leading-none text-plum tabular">{q.n}</p>
              <p className="mt-1 text-[0.875rem] font-semibold text-muted">{q.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="glass rounded-[1.5rem] p-4">
              <Icon className="h-4.5 w-4.5 text-muted" />
              <p className="mt-2 text-[1.5rem] font-extrabold text-plum tabular">{s.n}</p>
              <p className="text-[0.75rem] font-semibold text-muted">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-1 text-[1.125rem] font-bold">Gigs at risk</h2>
          <p className="mb-3 text-[0.8125rem] text-muted">Open, locking within 6 hours, still under minimum.</p>
          {risky.length === 0 ? (
            <div className="glass rounded-3xl p-5 text-[0.875rem] text-muted">Nothing at risk right now.</div>
          ) : (
            <ul className="space-y-2">
              {risky.map((g) => (
                <li key={g.id}>
                  <Link href={`/gigs/${g.id}`} className="glass flex items-center justify-between gap-3 rounded-2xl p-4 hover:bg-white/80">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-plum">{g.title}</span>
                      <span className="text-[0.75rem] text-muted tabular">{g.code} · locks {formatGigTime(g.locks_at)}</span>
                    </span>
                    <Badge tone="coral">{g.claimed_count + g.reserved_slots}/{g.min_to_confirm}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section>
          <h2 className="mb-1 text-[1.125rem] font-bold">Recent admin activity</h2>
          <p className="mb-3 text-[0.8125rem] text-muted">From the audit log.</p>
          <ul className="glass divide-y divide-line rounded-3xl">
            {(recent.data ?? []).length === 0 && <li className="p-5 text-[0.875rem] text-muted">No actions yet.</li>}
            {(recent.data ?? []).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-3 text-[0.875rem]">
                <span className="min-w-0 truncate"><span className="font-semibold text-plum">{a.action}</span> <span className="text-muted">· {a.target_type}</span></span>
                <span className="shrink-0 text-[0.75rem] text-muted">{timeAgo(a.created_at)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
