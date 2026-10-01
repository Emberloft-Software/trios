import Link from "next/link";
import { ChevronRight, Crown } from "lucide-react";
import { getViewer } from "@/lib/auth";
import { PageHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { dateTile, formatClock } from "@/lib/time";
import { copy } from "@/lib/copy";

export const metadata = { title: "My gigs" };

type Row = {
  state: string;
  joined_via: string;
  gigs: {
    id: string;
    title: string;
    status: string;
    starts_at: string;
    place_label: string;
    capacity: number;
    claimed_count: number;
    reserved_slots: number;
    min_to_confirm: number;
    host_id: string;
    activities: { name: string; emoji: string } | null;
  } | null;
};

export default async function MyGigsPage() {
  const { supabase, user } = await getViewer();
  const { data } = await supabase
    .from("gig_crew")
    .select(
      "state, joined_via, gigs(id, title, status, starts_at, place_label, capacity, claimed_count, reserved_slots, min_to_confirm, host_id, activities(name, emoji))",
    )
    .eq("user_id", user!.id)
    .in("state", ["claimed", "attended", "no_show"]);

  const rows = ((data ?? []) as unknown as Row[]).filter((r) => r.gigs);
  const now = Date.now();
  const upcoming = rows
    .filter((r) => ["open", "locked"].includes(r.gigs!.status) && new Date(r.gigs!.starts_at).getTime() > now - 6 * 3600e3)
    .sort((a, b) => +new Date(a.gigs!.starts_at) - +new Date(b.gigs!.starts_at));
  const past = rows
    .filter((r) => !upcoming.includes(r))
    .sort((a, b) => +new Date(b.gigs!.starts_at) - +new Date(a.gigs!.starts_at))
    .slice(0, 30);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={copy.myGigs.title} />

      <section>
        <h2 className="mb-3 text-[1.0625rem] font-bold">{copy.myGigs.upcoming}</h2>
        {upcoming.length === 0 ? (
          <EmptyState title={copy.myGigs.emptyUpcoming} action={<ButtonLink href="/feed">{copy.myGigs.findGig}</ButtonLink>} />
        ) : (
          <ul className="space-y-3">
            {upcoming.map((r) => (
              <GigRow key={r.gigs!.id} row={r} isHost={r.gigs!.host_id === user!.id} />
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-[1.0625rem] font-bold">{copy.myGigs.past}</h2>
        {past.length === 0 ? (
          <p className="text-[0.875rem] text-muted">{copy.myGigs.emptyPast}</p>
        ) : (
          <ul className="space-y-3 opacity-90">
            {past.map((r) => (
              <GigRow key={r.gigs!.id} row={r} isHost={r.gigs!.host_id === user!.id} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function GigRow({ row, isHost }: { row: Row; isHost: boolean }) {
  const g = row.gigs!;
  const t = dateTile(g.starts_at);
  const head = g.claimed_count + g.reserved_slots;
  const on = head >= g.min_to_confirm && g.claimed_count >= 2;
  return (
    <li>
      <Link href={`/gigs/${g.id}`} className="glass flex items-center gap-4 rounded-3xl p-3 pr-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
        <div className="flex w-14 shrink-0 flex-col items-center rounded-2xl bg-white/80 py-2 leading-none ring-1 ring-line">
          <span className="text-[0.625rem] font-bold tracking-wider text-coral">{t.dow}</span>
          <span className="text-[1.375rem] font-extrabold text-plum">{t.day}</span>
          <span className="text-[0.625rem] font-bold tracking-wider text-muted">{t.mon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[0.75rem] font-semibold text-muted">
            <span aria-hidden>{g.activities?.emoji}</span> {g.activities?.name} · <span className="tabular">{formatClock(g.starts_at)}</span>
          </p>
          <p className="truncate text-[1rem] font-bold text-plum">{g.title}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {isHost && <Badge tone="sun" icon={<Crown className="h-3 w-3" />}>{copy.myGigs.hosting}</Badge>}
            <Badge tone={g.status === "cancelled" ? "coral" : on ? "mint" : "muted"}>
              {g.status === "open" && on ? copy.slots.on : copy.gig.status[g.status]}
            </Badge>
            <Badge tone="white">{head}/{g.capacity}</Badge>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted" />
      </Link>
    </li>
  );
}
