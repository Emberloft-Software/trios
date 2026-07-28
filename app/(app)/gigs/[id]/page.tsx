import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SlotStrip, type CrewMember } from "@/components/ui/SlotStrip";
import { Card } from "@/components/ui/Card";
import { ReliabilityMark, VerifiedBadge } from "@/components/gig/Badges";
import { JoinPanel } from "./JoinPanel";
import { LeavePanel } from "./LeavePanel";
import { LobbyChat } from "./LobbyChat";
import { formatGigTime } from "@/lib/time";
import { publicAvatarUrl, firstName } from "@/lib/avatar";
import { copy } from "@/lib/copy";

export default async function GigPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: gig } = await supabase
    .from("gigs")
    .select("*, activities(name, emoji)")
    .eq("id", id)
    .maybeSingle();
  if (!gig) notFound();

  // RLS only returns crew rows if the viewer is themselves crew. So if we get
  // rows back, the viewer is in the crew and this is the lobby; otherwise it's
  // the blind preview.
  const { data: crewRows } = await supabase
    .from("gig_crew")
    .select("user_id, position, state")
    .eq("gig_id", id)
    .in("state", ["claimed", "attended", "no_show"])
    .order("position", { ascending: true });

  const isCrew = (crewRows ?? []).some((r) => r.user_id === user?.id);
  const confirmed = gig.claimed_count >= gig.min_to_confirm;
  const locked = gig.status === "locked";

  const activity = gig.activities as { name: string; emoji: string } | null;

  // ── Preview (not crew): activity, time, place, host first name + band only ──
  if (!isCrew) {
    const { data: host } = await supabase
      .from("profiles_public")
      .select("display_name, reliability_band, verification_status")
      .eq("id", gig.host_id)
      .maybeSingle();

    return (
      <div className="mx-auto max-w-2xl">
        <PreviewHeader activity={activity} gig={gig} />
        <Card className="mt-5 p-5">
          <SlotStrip variant="blind" capacity={gig.capacity} filled={gig.claimed_count}
            minToConfirm={gig.min_to_confirm} locked={locked} />
          {host && (
            <p className="mt-4 flex items-center gap-2 text-[0.9375rem]">
              <span className="text-[var(--color-dust)]">Host</span>
              <span className="font-500">{firstName(host.display_name)}</span>
              <ReliabilityMark band={host.reliability_band} />
              {host.verification_status === "verified" && <VerifiedBadge />}
            </p>
          )}
        </Card>
        <div className="mt-5">
          <JoinPanel gigId={gig.id} status={gig.status} />
        </div>
      </div>
    );
  }

  // ── Lobby (crew): faces reveal, chat, leave doors ──────────────────────────
  const crewIds = (crewRows ?? []).map((r) => r.user_id);
  const { data: profiles } = await supabase
    .from("profiles_public")
    .select("id, display_name, avatar_path, reliability_band, verification_status")
    .in("id", crewIds);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const crew: CrewMember[] = (crewRows ?? []).map((r) => {
    const p = profileById.get(r.user_id);
    return {
      userId: r.user_id,
      name: p ? firstName(p.display_name) : "Someone",
      avatarUrl: publicAvatarUrl(p?.avatar_path),
      isHost: r.position === 1,
    };
  });

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PreviewHeader activity={activity} gig={gig} showCode />

      <Card className="p-5">
        <SlotStrip variant="crew" capacity={gig.capacity} crew={crew}
          minToConfirm={gig.min_to_confirm} locked={locked} />
      </Card>

      {/* When & where — full address shown once locked (docs/03) */}
      <Card className="p-5">
        <h2 className="mb-2 font-display text-[1.125rem] font-600">When &amp; where</h2>
        <p className="font-data text-[0.9375rem]">{formatGigTime(gig.starts_at)}</p>
        <p className="mt-1 text-[0.9375rem]">{gig.place_label}</p>
        {locked && (
          <p className="mt-3 rounded-[var(--radius-chip)] border-2 border-[var(--color-ink)] bg-[var(--color-line)] p-3 text-[0.875rem]">
            {copy.safetyReminder}
          </p>
        )}
      </Card>

      {/* Crew cards */}
      <Card className="p-5">
        <h2 className="mb-3 font-display text-[1.125rem] font-600">Crew</h2>
        <ul className="space-y-2">
          {crew.map((m) => {
            const p = profileById.get(m.userId);
            return (
              <li key={m.userId} className="flex items-center gap-2 text-[0.9375rem]">
                <span className="font-500">{m.name}</span>
                {m.isHost && (
                  <span className="font-data text-[0.6875rem] uppercase tracking-[0.06em] text-[var(--color-dust)]">Host</span>
                )}
                {p && <ReliabilityMark band={p.reliability_band} />}
                {p?.verification_status === "verified" && <VerifiedBadge />}
              </li>
            );
          })}
        </ul>
      </Card>

      {/* Chat — realtime, opens at confirmation (R8) */}
      <LobbyChat gigId={gig.id} confirmed={confirmed} completed={gig.status === "completed"}
        minToConfirm={gig.min_to_confirm} claimedCount={gig.claimed_count} currentUserId={user!.id} />

      {/* Leave doors (host can't leave — they cancel instead) */}
      {gig.host_id !== user!.id && gig.status !== "completed" && (
        <LeavePanel gigId={gig.id} />
      )}
    </div>
  );
}

function PreviewHeader({
  activity,
  gig,
  showCode,
}: {
  activity: { name: string; emoji: string } | null;
  gig: { title: string; code: string; starts_at: string; place_label: string };
  showCode?: boolean;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <span aria-hidden className="text-2xl">{activity?.emoji}</span>
        <span className="font-data text-[0.75rem] uppercase tracking-[0.06em] text-[var(--color-dust)]">
          {activity?.name}
        </span>
        {showCode && (
          <span className="font-data ml-auto rounded-[var(--radius-chip)] border-2 border-[var(--color-ink)] bg-[var(--color-line)] px-2 py-0.5 text-[0.75rem]">
            {gig.code}
          </span>
        )}
      </div>
      <h1 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] font-700">{gig.title}</h1>
      <p className="font-data mt-1 text-[0.9375rem] text-[var(--color-dust)]">
        {formatGigTime(gig.starts_at)} · {gig.place_label}
      </p>
    </div>
  );
}
