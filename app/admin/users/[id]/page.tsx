import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/Card";
import { ModerationForm } from "./ModerationForm";
import { formatDay } from "@/lib/time";

export const metadata = { title: "User — Trio admin" };

/**
 * Full user view (docs/07). One page, everything — with the panels that
 * actually catch problems: co-occurrence, removals given, blocks received,
 * friend-request ratio. Read via the service role.
 */
export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: p } = await admin.from("profiles").select("*").eq("id", id).maybeSingle();
  if (!p) notFound();

  const [
    hosted,
    myCrew,
    removalsGiven,
    removalsReceived,
    blocksReceived,
    reportsAgainst,
    reportsFiled,
    friendSent,
    modHistory,
  ] = await Promise.all([
    admin.from("gigs").select("id", { count: "exact", head: true }).eq("host_id", id),
    admin.from("gig_crew").select("gig_id, state").eq("user_id", id),
    admin.from("crew_removals").select("id, target_id, reason, created_at").eq("actor_id", id).order("created_at", { ascending: false }),
    admin.from("crew_removals").select("id, created_at", { count: "exact" }).eq("target_id", id),
    admin.from("blocks").select("id", { count: "exact", head: true }).eq("blocked_id", id),
    admin.from("reports").select("id", { count: "exact", head: true }).eq("target_id", id),
    admin.from("reports").select("id", { count: "exact", head: true }).eq("reporter_id", id),
    admin.from("friend_requests").select("status").eq("sender_id", id),
    admin.from("moderation_actions").select("action, reason, expires_at, created_at").eq("target_id", id).order("created_at", { ascending: false }),
  ]);

  const attended = (myCrew.data ?? []).filter((c) => c.state === "attended").length;
  const gigIds = (myCrew.data ?? []).map((c) => c.gig_id);

  // Co-occurrence: other users who shared these gigs, ranked by count.
  let coOccurrence: { userId: string; count: number; name: string }[] = [];
  if (gigIds.length) {
    const { data: mates } = await admin
      .from("gig_crew")
      .select("user_id")
      .in("gig_id", gigIds)
      .neq("user_id", id);
    const counts = new Map<string, number>();
    (mates ?? []).forEach((m) => counts.set(m.user_id, (counts.get(m.user_id) ?? 0) + 1));
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
    const ids = top.map(([uid]) => uid);
    const { data: names } = await admin
      .from("profiles")
      .select("id, display_name")
      .in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
    const nameById = new Map((names ?? []).map((n) => [n.id, n.display_name]));
    coOccurrence = top.map(([uid, c]) => ({ userId: uid, count: c, name: nameById.get(uid) ?? "Unknown" }));
  }

  const sent = (friendSent.data ?? []).length;
  const accepted = (friendSent.data ?? []).filter((f) => f.status === "accepted").length;
  const acceptRate = sent > 0 ? Math.round((accepted / sent) * 100) : null;

  const restricted =
    (p.suspended_until && new Date(p.suspended_until) > new Date()) ||
    (p.posting_restricted_until && new Date(p.posting_restricted_until) > new Date()) ||
    (p.joining_restricted_until && new Date(p.joining_restricted_until) > new Date());

  return (
    <div>
      <Link href="/admin/users" className="text-[0.875rem] text-[var(--color-net)] hover:underline">
        ← Users
      </Link>
      <h1 className="mt-2 font-display text-[2rem] font-700">{p.display_name}</h1>
      <p className="font-data mb-6 text-[0.9375rem] text-[var(--color-dust)]">
        @{p.handle} · joined {formatDay(p.created_at)} · band {p.reliability_band} · {p.verification_status}
        {restricted ? " · RESTRICTED" : ""}
      </p>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {/* Counts */}
          <Card className="p-5">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              <Stat label="Hosted" value={hosted.count ?? 0} />
              <Stat label="Attended" value={attended} />
              <Stat label="Removals given" value={(removalsGiven.data ?? []).length} danger={(removalsGiven.data ?? []).length >= 3} />
              <Stat label="Removed" value={removalsReceived.count ?? 0} />
              <Stat label="Blocks recv" value={blocksReceived.count ?? 0} danger={(blocksReceived.count ?? 0) >= 3} />
              <Stat label="Reported" value={reportsAgainst.count ?? 0} danger={(reportsAgainst.count ?? 0) > 0} />
            </div>
          </Card>

          {/* Friend-request ratio */}
          <Card className="p-5">
            <h2 className="mb-2 font-display text-[1.125rem] font-600">Friend requests</h2>
            <p className="text-[0.9375rem]">
              Sent <span className="font-data">{sent}</span>, accepted{" "}
              <span className="font-data">{accepted}</span>
              {acceptRate != null && (
                <span className={acceptRate < 30 && sent >= 5 ? "text-[var(--color-tape)]" : "text-[var(--color-dust)]"}>
                  {" "}({acceptRate}% accepted)
                </span>
              )}
            </p>
            <p className="mt-1 text-[0.8125rem] text-[var(--color-dust)]">
              High send rate with low acceptance is the clearest tell someone&apos;s working the room.
            </p>
          </Card>

          {/* Co-occurrence */}
          <Card className="p-5">
            <h2 className="mb-2 font-display text-[1.125rem] font-600">Shared gigs with</h2>
            {coOccurrence.length === 0 ? (
              <p className="text-[0.875rem] text-[var(--color-dust)]">No shared gigs yet.</p>
            ) : (
              <ul className="space-y-1">
                {coOccurrence.map((c) => (
                  <li key={c.userId} className="flex items-center justify-between text-[0.9375rem]">
                    <Link href={`/admin/users/${c.userId}`} className="hover:underline">{c.name}</Link>
                    <span className={`font-data ${c.count >= 3 ? "text-[var(--color-tape)]" : "text-[var(--color-dust)]"}`}>
                      {c.count}×
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-[0.8125rem] text-[var(--color-dust)]">
              Repeated overlap with one person is the clearest signal of someone using the app to get near a specific individual.
            </p>
          </Card>

          {/* Removals given detail */}
          {(removalsGiven.data ?? []).length > 0 && (
            <Card className="p-5">
              <h2 className="mb-2 font-display text-[1.125rem] font-600">Removals given</h2>
              <ul className="space-y-2 text-[0.875rem]">
                {(removalsGiven.data ?? []).map((r) => (
                  <li key={r.id} className="border-b border-[var(--color-dust)]/40 pb-1">
                    <span className="font-data text-[0.75rem] text-[var(--color-dust)]">{formatDay(r.created_at)}</span>{" "}
                    {r.reason}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Moderation history */}
          <Card className="p-5">
            <h2 className="mb-2 font-display text-[1.125rem] font-600">Moderation history</h2>
            {(modHistory.data ?? []).length === 0 ? (
              <p className="text-[0.875rem] text-[var(--color-dust)]">Clean.</p>
            ) : (
              <ul className="space-y-2 text-[0.875rem]">
                {(modHistory.data ?? []).map((m, i) => (
                  <li key={i}>
                    <span className="font-data uppercase text-[var(--color-tape)]">{m.action}</span>{" "}
                    <span className="text-[var(--color-dust)]">{formatDay(m.created_at)}</span> — {m.reason}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-[0.8125rem] text-[var(--color-dust)]">
              Filed {reportsFiled.count ?? 0} reports.
            </p>
          </Card>
        </div>

        {/* Moderation actions */}
        <div>
          <ModerationForm targetId={p.id} verified={p.verification_status === "verified"} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  return (
    <div className="rounded-[var(--radius-tile)] border-2 border-[var(--color-ink)] p-2 text-center">
      <p className={`font-data text-lg ${danger ? "text-[var(--color-tape)]" : ""}`}>{value}</p>
      <p className="text-[0.625rem] text-[var(--color-dust)]">{label}</p>
    </div>
  );
}
