/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ModerationForm } from "./ModerationForm";
import { publicAvatarUrl } from "@/lib/avatar";
import { ageFrom, formatDay, timeAgo } from "@/lib/time";
import { copy } from "@/lib/copy";
import { ids } from "../../_lib";

export const metadata = { title: "User · Admin" };

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = createAdminClient();
  const { data: p } = await db.from("profiles").select("*").eq("id", id).maybeSingle();
  if (!p) notFound();

  const [{ data: authUser }, hosted, crew, removalsGiven, removedFrom, blocksRecv, reportsAgainst, reportsFiled, friendSent, mod, verifs] = await Promise.all([
    db.auth.admin.getUserById(id),
    db.from("gigs").select("id", { count: "exact", head: true }).eq("host_id", id),
    db.from("gig_crew").select("gig_id, state").eq("user_id", id),
    db.from("crew_removals").select("id, reason, kind, created_at").eq("actor_id", id).order("created_at", { ascending: false }),
    db.from("crew_removals").select("id, kind, reason, created_at").eq("target_id", id).order("created_at", { ascending: false }),
    db.from("blocks").select("id", { count: "exact", head: true }).eq("blocked_id", id),
    db.from("reports").select("id, category, details, status, created_at").eq("target_id", id).order("created_at", { ascending: false }).limit(10),
    db.from("reports").select("id", { count: "exact", head: true }).eq("reporter_id", id),
    db.from("friend_requests").select("status").eq("sender_id", id),
    db.from("moderation_actions").select("action, reason, expires_at, created_at").eq("target_id", id).order("created_at", { ascending: false }),
    db.from("verification_requests").select("id, status, review_note, reviewed_at, created_at, media_purged_at").eq("user_id", id).order("created_at", { ascending: false }).limit(5),
  ]);

  const attended = (crew.data ?? []).filter((c) => c.state === "attended").length;
  const gigIds = (crew.data ?? []).map((c) => c.gig_id);

  // co-occurrence: who keeps ending up in the same gigs as this person
  let co: { userId: string; count: number; name: string }[] = [];
  if (gigIds.length) {
    const { data: mates } = await db.from("gig_crew").select("user_id").in("gig_id", gigIds).neq("user_id", id);
    const m = new Map<string, number>();
    (mates ?? []).forEach((x) => m.set(x.user_id, (m.get(x.user_id) ?? 0) + 1));
    const top = [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
    const { data: names } = await db.from("profiles").select("id, display_name").in("id", ids(top.map(([u]) => u)));
    const nm = new Map((names ?? []).map((n) => [n.id, n.display_name]));
    co = top.map(([u, c]) => ({ userId: u, count: c, name: nm.get(u) ?? "Unknown" }));
  }

  const sent = (friendSent.data ?? []).length;
  const accepted = (friendSent.data ?? []).filter((f) => f.status === "accepted").length;
  const now = new Date();
  const restricted = [p.suspended_until, p.posting_restricted_until, p.joining_restricted_until].some((d) => d && new Date(d) > now);
  const age = p.birth_date ? ageFrom(p.birth_date) : null;

  return (
    <div>
      <Link href="/admin/users" className="inline-flex items-center gap-1 text-[0.875rem] font-semibold text-muted hover:text-plum"><ArrowLeft className="h-4 w-4" /> Users</Link>

      <div className="glass mt-3 flex flex-wrap items-center gap-4 rounded-[1.75rem] p-5">
        <Avatar name={p.display_name} src={publicAvatarUrl(p.avatar_path)} size={72} />
        <div className="min-w-0 flex-1">
          <h1 className="text-[1.75rem] font-extrabold">{p.display_name}</h1>
          <p className="text-[0.875rem] text-muted">
            @{p.handle} · {authUser?.user?.email ?? "n/a"} · {age ?? "?"} · {p.gender ? copy.auth.genders[p.gender] : "n/a"} · joined {formatDay(p.created_at)}
            {authUser?.user?.last_sign_in_at ? ` · last seen ${timeAgo(authUser.user.last_sign_in_at)}` : ""}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {p.is_admin && <Badge tone="plum">admin</Badge>}
            {restricted && <Badge tone="coral">restricted</Badge>}
            <Badge tone={p.verification_status === "verified" ? "mint" : "muted"}>{p.verification_status}</Badge>
            <Badge tone="white">band: {p.reliability_band}</Badge>
            <Badge tone={p.avatar_status === "pending" ? "sun" : "white"}>photo: {p.avatar_status}</Badge>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <div className="glass grid grid-cols-3 gap-3 rounded-[1.5rem] p-5 sm:grid-cols-6">
            <Stat label="Hosted" value={hosted.count ?? 0} />
            <Stat label="Attended" value={attended} />
            <Stat label="Removed others" value={(removalsGiven.data ?? []).length} danger={(removalsGiven.data ?? []).length >= 3} />
            <Stat label="Removed / voted out" value={(removedFrom.data ?? []).length} danger={(removedFrom.data ?? []).length >= 2} />
            <Stat label="Blocked by" value={blocksRecv.count ?? 0} danger={(blocksRecv.count ?? 0) >= 3} />
            <Stat label="Reports against" value={(reportsAgainst.data ?? []).length} danger={(reportsAgainst.data ?? []).length > 0} />
          </div>

          {(p.avatar_path || p.avatar_pending_path) && (
            <Panel title="Photos">
              <div className="flex gap-3">
                {p.avatar_path && <figure><img src={publicAvatarUrl(p.avatar_path)!} alt="" className="h-28 w-28 rounded-2xl object-cover" /><figcaption className="mt-1 text-[0.75rem] text-muted">Live</figcaption></figure>}
                {p.avatar_pending_path && <figure><img src={publicAvatarUrl(p.avatar_pending_path)!} alt="" className="h-28 w-28 rounded-2xl object-cover ring-2 ring-sun" /><figcaption className="mt-1 text-[0.75rem] text-muted">Pending · <Link href="/admin/photos" className="text-coral-600 hover:underline">review</Link></figcaption></figure>}
              </div>
            </Panel>
          )}

          <Panel title="Reports against them">
            {(reportsAgainst.data ?? []).length === 0 ? <Empty /> : (
              <ul className="space-y-2 text-[0.875rem]">
                {(reportsAgainst.data ?? []).map((r) => (
                  <li key={r.id} className="rounded-2xl bg-white/60 p-3 ring-1 ring-line">
                    <span className="font-semibold text-plum">{r.category === "crew_vote_removal" ? "Removed by crew vote" : copy.trust.report.categories[r.category] ?? r.category}</span>{" "}
                    <Badge tone={r.status === "open" ? "coral" : "muted"}>{r.status}</Badge>
                    <span className="float-right text-[0.75rem] text-muted">{timeAgo(r.created_at)}</span>
                    <p className="mt-1 text-muted">{r.details}</p>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-[0.75rem] text-muted">They have filed {reportsFiled.count ?? 0} reports themselves.</p>
          </Panel>

          <Panel title="Removed from gigs">
            {(removedFrom.data ?? []).length === 0 ? <Empty /> : (
              <ul className="space-y-1.5 text-[0.875rem]">
                {(removedFrom.data ?? []).map((r) => (
                  <li key={r.id}><Badge tone={r.kind === "vote" ? "sun" : "white"}>{r.kind === "vote" ? "crew vote" : "by host"}</Badge> <span className="text-muted">{formatDay(r.created_at)}</span>: {r.reason}</li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Shared gigs with">
            {co.length === 0 ? <Empty /> : (
              <ul className="space-y-1 text-[0.875rem]">
                {co.map((c) => (
                  <li key={c.userId} className="flex justify-between">
                    <Link href={`/admin/users/${c.userId}`} className="font-semibold text-plum hover:underline">{c.name}</Link>
                    <span className={`tabular ${c.count >= 3 ? "font-bold text-coral-600" : "text-muted"}`}>{c.count}×</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-[0.75rem] text-muted">Repeated overlap with one person can mean someone is using gigs to get near a specific individual.</p>
          </Panel>

          <Panel title="Friend requests">
            <p className="text-[0.875rem]">Sent <b>{sent}</b>, accepted <b>{accepted}</b>{sent >= 5 && accepted / sent < 0.3 && <span className="text-coral-600">, low acceptance</span>}</p>
          </Panel>

          <Panel title="Verification history">
            {(verifs.data ?? []).length === 0 ? <Empty /> : (
              <ul className="space-y-1 text-[0.875rem]">
                {(verifs.data ?? []).map((v) => (
                  <li key={v.id}><Badge tone={v.status === "verified" ? "mint" : v.status === "pending" ? "sun" : "coral"}>{v.status}</Badge> <span className="text-muted">{formatDay(v.created_at)}</span> {v.review_note ? `: ${v.review_note}` : ""}{v.media_purged_at ? " · media purged" : ""}</li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Moderation history">
            {(mod.data ?? []).length === 0 ? <Empty text="Clean." /> : (
              <ul className="space-y-1.5 text-[0.875rem]">
                {(mod.data ?? []).map((m, i) => (
                  <li key={i}><Badge tone="coral">{m.action}</Badge> <span className="text-muted">{formatDay(m.created_at)}{m.expires_at ? ` → ${formatDay(m.expires_at)}` : ""}</span>: {m.reason}</li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="xl:sticky xl:top-6 xl:self-start">
          <ModerationForm
            targetId={p.id}
            verified={p.verification_status === "verified"}
            isAdmin={p.is_admin}
            hasLivePhoto={!!p.avatar_path}
            birthDate={p.birth_date}
            gender={p.gender}
          />
        </div>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass rounded-[1.5rem] p-5">
      <h2 className="mb-3 text-[1rem] font-bold">{title}</h2>
      {children}
    </section>
  );
}
function Empty({ text = "Nothing yet." }: { text?: string }) {
  return <p className="text-[0.875rem] text-muted">{text}</p>;
}
function Stat({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  return (
    <div className="rounded-xl bg-white/70 p-2 text-center ring-1 ring-line">
      <p className={`text-[1.25rem] font-extrabold tabular ${danger ? "text-coral-600" : "text-plum"}`}>{value}</p>
      <p className="text-[0.625rem] font-semibold leading-tight text-muted">{label}</p>
    </div>
  );
}
