import { notFound } from "next/navigation";
import { getViewer } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Notice } from "@/components/ui/Notice";
import { SlotStrip } from "@/components/ui/SlotStrip";
import { copy } from "@/lib/copy";
import { loadGig, loadLobby } from "./_data";
import { GigDetails, GigHeader, GuestsNotice } from "./GigHeader";
import { GigPreview } from "./GigPreview";
import { CrewList } from "./CrewList";
import { LobbyChat } from "./LobbyChat";
import { InvitePanel } from "./InvitePanel";
import { LeavePanel, HostControls } from "./LeavePanel";
import { CheckinPanel } from "./CheckinPanel";
import { PerkCard } from "./PerkCard";

export const metadata = { title: "Gig" };

export default async function GigPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const [{ id }, { created }, { supabase, user }] = await Promise.all([params, searchParams, getViewer()]);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const g = await loadGig(supabase, id);
  if (!g) notFound();
  const me = user!.id;
  if (!g.crew.some((r) => r.user_id === me)) return <GigPreview g={g} supabase={supabase} />;

  const { gig, venue } = g;
  const L = await loadLobby(supabase, g, me);
  const isHost = gig.host_id === me;
  const locked = gig.status === "locked";
  const active = gig.status === "open" || locked;
  const chatOpen = !!gig.chat_opened_at;
  const now = Date.now();
  const start = new Date(gig.starts_at).getTime();
  const checkinOpen = locked && now >= start - 30 * 60e3 && now <= start + (gig.duration_min + 180) * 60e3;

  return (
    <div className="mx-auto max-w-5xl">
      <GigHeader g={g} />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="min-w-0 space-y-4">
          {isHost && active && <Notice tone="safe" compact>{copy.lobby.youAreHost}</Notice>}
          {gig.status === "cancelled" && <Notice tone="danger">{copy.gig.cancelled}</Notice>}
          <GuestsNotice g={g} />

          <Card className="p-5">
            <SlotStrip
              capacity={gig.capacity}
              claimed={gig.claimed_count}
              reserved={gig.reserved_slots}
              minToConfirm={gig.min_to_confirm}
              crew={L.crewUi.map((m) => ({ userId: m.userId, name: m.name, avatarUrl: m.avatarUrl, isHost: m.isHost }))}
              locked={locked}
            />
            {!chatOpen && active && <p className="mt-3 text-[0.8125rem] text-muted">{copy.lobby.unlockHint}</p>}
          </Card>

          {isHost && gig.status === "open" && (
            <InvitePanel
              gigId={gig.id}
              title={gig.title}
              invites={L.guestInvites}
              friends={L.friends}
              highlight={created === "1" && L.guestInvites.length > 0}
            />
          )}

          <GigDetails g={g} showCode />
          {locked && <Notice tone="info">{copy.safetyReminder}</Notice>}

          <CrewList
            gigId={gig.id}
            viewerId={me}
            viewerIsHost={isHost}
            crew={L.crewUi}
            canVote={chatOpen && active}
            canRemove={isHost && active}
            isCompleted={gig.status === "completed"}
            viewerAttended={g.crew.find((r) => r.user_id === me)?.state === "attended"}
          />

          {checkinOpen && (
            <CheckinPanel
              gigId={gig.id}
              members={L.crewUi.filter((m) => m.userId !== me).map((m) => ({ userId: m.userId, name: m.name, avatarUrl: m.avatarUrl }))}
              confirmed={L.myCheckins}
            />
          )}

          {gig.venue_id && venue?.is_partner && venue.partner_perk && (locked || gig.status === "completed") && (
            <PerkCard gigId={gig.id} venueId={gig.venue_id} perk={venue.partner_perk} code={gig.code} isHost={isHost} alreadyRedeemed={L.perkRedeemed} />
          )}
        </div>

        <div className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:self-start">
          <LobbyChat
            gigId={gig.id}
            confirmed={chatOpen}
            completed={!active}
            needed={Math.max(gig.capacity - gig.claimed_count, 1)}
            currentUserId={me}
            crewNames={L.names}
            crewAvatars={L.avatars}
            memberCount={gig.claimed_count}
          />
          {active && (isHost ? <HostControls gigId={gig.id} /> : <LeavePanel gigId={gig.id} />)}
        </div>
      </div>
    </div>
  );
}
