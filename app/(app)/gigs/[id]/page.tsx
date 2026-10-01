/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import { CalendarClock, Hash, Wallet } from "lucide-react";
import { getViewer } from "@/lib/auth";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Notice } from "@/components/ui/Notice";
import { SlotStrip, type CrewMember } from "@/components/ui/SlotStrip";
import { ReliabilityMark, VerifiedBadge } from "@/components/gig/Badges";
import { VenueMedia } from "@/components/gig/VenueMedia";
import { AudienceBadges } from "@/components/gig/GigCard";
import { JoinPanel } from "./JoinPanel";
import { CrewList, type CrewRow } from "./CrewList";
import { LobbyChat } from "./LobbyChat";
import { InvitePanel } from "./InvitePanel";
import { LeavePanel, HostControls } from "./LeavePanel";
import { CheckinPanel } from "./CheckinPanel";
import { PerkCard } from "./PerkCard";
import { formatGigTime, timeUntil } from "@/lib/time";
import { firstName, publicAvatarUrl } from "@/lib/avatar";
import { getSiteURL } from "@/lib/site-url";
import { copy } from "@/lib/copy";

export const metadata = { title: "Gig" };

type VenueJoin = {
  name: string;
  photo_refs: string[];
  photo_attribution: string[];
  maps_url: string | null;
  rating: number | null;
  user_rating_count: number | null;
  is_partner: boolean;
  partner_perk: string | null;
} | null;

export default async function GigPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const { created } = await searchParams;
  const { supabase, user } = await getViewer();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  // RLS: visible only to host, crew, or people inside the gig's audience.
  const { data: gig } = await supabase
    .from("gigs")
    .select(
      "*, activities(name, emoji, category), venues(name, photo_refs, photo_attribution, maps_url, rating, user_rating_count, is_partner, partner_perk)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!gig) notFound();

  const venue = gig.venues as unknown as VenueJoin;
  const activity = gig.activities as unknown as { name: string; emoji: string; category: string } | null;

  const { data: crewRows } = await supabase
    .from("gig_crew")
    .select("user_id, position, state, joined_via")
    .eq("gig_id", id)
    .in("state", ["claimed", "attended", "no_show"])
    .order("position", { ascending: true });

  const me = user!.id;
  const isHost = gig.host_id === me;
  const isCrew = (crewRows ?? []).some((r) => r.user_id === me);
  const confirmed = gig.claimed_count + gig.reserved_slots >= gig.min_to_confirm && gig.claimed_count >= 2;
  const locked = gig.status === "locked";
  const active = gig.status === "open" || gig.status === "locked";
  const photo = venue?.photo_refs?.[0] ? `/api/place-photo?ref=${encodeURIComponent(venue.photo_refs[0])}&w=1200` : null;

  const header = (
    <div className="relative -mx-4 -mt-5 mb-5 overflow-hidden sm:mx-0 sm:mt-0 sm:rounded-[2rem]">
      <div className="bg-hero relative h-48 sm:h-56">
        {photo && <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />}
        <div className="absolute inset-0 bg-gradient-to-t from-plum-800/90 via-plum-800/30 to-transparent" />
        {!photo && <span aria-hidden className="absolute -right-4 -top-6 text-[9rem] opacity-30">{activity?.emoji}</span>}
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="glass-dark inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.75rem] font-semibold text-white">
              <span aria-hidden>{activity?.emoji}</span> {activity?.name}
            </span>
            <Badge tone={gig.status === "cancelled" ? "coral" : confirmed && active ? "mint" : "white"}>
              {gig.status === "open" && confirmed ? copy.slots.on : copy.gig.status[gig.status]}
            </Badge>
          </div>
          <h1 className="text-[clamp(1.5rem,5vw,2.25rem)] font-extrabold text-white">{gig.title}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-[0.9375rem] text-white/85">
            <CalendarClock className="h-4 w-4" />
            <span className="tabular">{formatGigTime(gig.starts_at)}</span>
            {active && <span className="text-white/60">· {timeUntil(gig.starts_at)}</span>}
          </p>
        </div>
      </div>
    </div>
  );

  const details = (
    <Card className="p-5">
      <SectionTitle>{copy.lobby.whenWhere}</SectionTitle>
      <VenueMedia
        placeLabel={gig.place_label}
        lat={gig.lat}
        lng={gig.lng}
        venueName={venue?.name}
        photoRef={venue?.photo_refs?.[0]}
        photoAttribution={venue?.photo_attribution?.[0]}
        rating={venue?.rating}
        ratingCount={venue?.user_rating_count}
        mapsUrl={venue?.maps_url}
      />
      <div className="mt-4 flex flex-wrap gap-1.5">
        <AudienceBadges ageMin={gig.age_min} ageMax={gig.age_max} gender={gig.gender_pref} />
        {gig.gender_pref === "everyone" && gig.age_min === 18 && gig.age_max === 99 && <Badge tone="muted">{copy.audience.everyone} · 18+</Badge>}
        <Badge tone="white">{gig.duration_min} {copy.newGig.minutes}</Badge>
        {gig.cost_note && <Badge tone="white" icon={<Wallet className="h-3 w-3" />}>{gig.cost_note}</Badge>}
        {isCrew && <Badge tone="white" icon={<Hash className="h-3 w-3" />}>{gig.code}</Badge>}
      </div>
      {gig.notes && <p className="mt-4 whitespace-pre-line text-[0.9375rem] text-ink/90">{gig.notes}</p>}
    </Card>
  );

  const guestsNotice = gig.host_guests > 0 && (
    <Notice tone="warn" title={copy.guests.badge(gig.host_guests)}>{copy.guests.lobbyNote(gig.host_guests)}</Notice>
  );

  // ── Preview for people who aren't in the crew ─────────────────────────────
  if (!isCrew) {
    const { data: host } = await supabase
      .from("profiles_public")
      .select("display_name, reliability_band, verification_status, age")
      .eq("id", gig.host_id)
      .maybeSingle();

    return (
      <div className="mx-auto max-w-2xl">
        {header}
        <div className="space-y-4">
          {guestsNotice}
          <Card className="p-5">
            <SlotStrip capacity={gig.capacity} claimed={gig.claimed_count} reserved={gig.reserved_slots} minToConfirm={gig.min_to_confirm} locked={locked} />
            {host && (
              <div className="mt-4 flex items-center gap-3 border-t border-line pt-4">
                <Avatar name={host.display_name} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="text-[0.75rem] font-semibold text-muted">{copy.gig.hostedBy}</p>
                  <p className="font-bold text-plum">
                    {firstName(host.display_name)}
                    {host.age ? <span className="font-medium text-muted">, {host.age}</span> : null}
                  </p>
                </div>
                <div className="flex flex-wrap justify-end gap-1.5">
                  {host.verification_status === "verified" && <VerifiedBadge />}
                  <ReliabilityMark band={host.reliability_band} />
                </div>
              </div>
            )}
            <p className="mt-4 text-[0.8125rem] text-muted">{copy.lobby.previewBlind}</p>
          </Card>
          {details}
          <JoinPanel gigId={gig.id} status={gig.status} full={gig.claimed_count + gig.reserved_slots >= gig.capacity} hasGuests={gig.host_guests > 0} />
        </div>
      </div>
    );
  }

  // ── Lobby (crew) ───────────────────────────────────────────────────────────
  const crewIds = (crewRows ?? []).map((r) => r.user_id);
  // everyone who was ever in this gig, so chat history keeps their names
  const { data: everyone } = await supabase.from("gig_crew").select("user_id").eq("gig_id", id);
  const allIds = [...new Set([...crewIds, ...(everyone ?? []).map((r) => r.user_id)])];
  const [{ data: profiles }, { data: tallies }, { data: myCheckins }] = await Promise.all([
    supabase.from("profiles_public").select("id, display_name, avatar_path, reliability_band, verification_status, age").in("id", allIds),
    confirmed && active ? supabase.rpc("kick_vote_tallies", { p_gig_id: gig.id }) : Promise.resolve({ data: [] as { target_id: string; votes: number; needed: number; i_voted: boolean }[] }),
    locked ? supabase.from("checkins").select("subject_id").eq("gig_id", gig.id).eq("confirmer_id", me) : Promise.resolve({ data: [] as { subject_id: string }[] }),
  ]);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const tallyById = new Map((tallies ?? []).map((t) => [t.target_id, t]));
  const stateById = new Map((crewRows ?? []).map((r) => [r.user_id, r.state]));
  const viewerAttended = stateById.get(me) === "attended";
  const isCompleted = gig.status === "completed";

  const crewRowsUi: CrewRow[] = (crewRows ?? []).map((r) => {
    const p = profileById.get(r.user_id);
    const t = tallyById.get(r.user_id);
    return {
      userId: r.user_id,
      name: firstName(p?.display_name),
      age: p?.age ?? null,
      avatarUrl: publicAvatarUrl(p?.avatar_path),
      isHost: r.user_id === gig.host_id,
      viaInvite: r.joined_via === "invite",
      verified: p?.verification_status === "verified",
      band: p?.reliability_band ?? "new",
      attended: r.state === "attended",
      votes: t?.votes ?? 0,
      needed: t?.needed ?? 2,
      iVoted: t?.i_voted ?? false,
    };
  });
  const crewStrip: CrewMember[] = crewRowsUi.map((m) => ({ userId: m.userId, name: m.name, avatarUrl: m.avatarUrl, isHost: m.isHost }));
  const crewNames = Object.fromEntries((profiles ?? []).map((p) => [p.id, firstName(p.display_name)]));
  const crewAvatars = Object.fromEntries((profiles ?? []).map((p) => [p.id, publicAvatarUrl(p.avatar_path)]));

  // Partner perk after lock
  let perk: { venueId: string; text: string; redeemed: boolean } | null = null;
  if (gig.venue_id && venue?.is_partner && venue.partner_perk && (locked || isCompleted)) {
    const { data: redemption } = await supabase.from("perk_redemptions").select("id").eq("gig_id", gig.id).maybeSingle();
    perk = { venueId: gig.venue_id, text: venue.partner_perk, redeemed: !!redemption };
  }

  // Host's Tremigos friends for in-app nudges
  let inviteFriends: { id: string; name: string }[] = [];
  if (isHost && gig.status === "open") {
    const { data: fr } = await supabase.from("friendships").select("user_a, user_b");
    const fids = (fr ?? []).map((x) => (x.user_a === me ? x.user_b : x.user_a)).filter((f) => !crewIds.includes(f));
    if (fids.length) {
      const { data: fp } = await supabase.from("profiles_public").select("id, display_name").in("id", fids);
      inviteFriends = (fp ?? []).map((p) => ({ id: p.id, name: firstName(p.display_name) }));
    }
  }

  const checkinOpen =
    locked &&
    Date.now() >= new Date(gig.starts_at).getTime() - 30 * 60e3 &&
    Date.now() <= new Date(gig.starts_at).getTime() + (gig.duration_min + 180) * 60e3;

  return (
    <div className="mx-auto max-w-5xl">
      {header}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="min-w-0 space-y-4">
          {isHost && active && <Notice tone="safe" compact>{copy.lobby.youAreHost}</Notice>}
          {gig.status === "cancelled" && <Notice tone="danger">{copy.gig.cancelled}</Notice>}
          {guestsNotice}

          <Card className="p-5">
            <SlotStrip capacity={gig.capacity} claimed={gig.claimed_count} reserved={gig.reserved_slots} minToConfirm={gig.min_to_confirm} crew={crewStrip} locked={locked} />
          </Card>

          {isHost && gig.status === "open" && (
            <InvitePanel
              gigId={gig.id}
              inviteUrl={`${getSiteURL()}/join/${gig.invite_code}`}
              title={gig.title}
              reserved={gig.reserved_slots}
              friends={inviteFriends}
              highlight={created === "1" && gig.host_guests > 0}
            />
          )}

          {details}
          {locked && <Notice tone="info">{copy.safetyReminder}</Notice>}

          <CrewList
            gigId={gig.id}
            viewerId={me}
            viewerIsHost={isHost}
            crew={crewRowsUi}
            canVote={confirmed && active}
            canRemove={isHost && active}
            isCompleted={isCompleted}
            viewerAttended={viewerAttended}
          />

          {checkinOpen && (
            <CheckinPanel
              gigId={gig.id}
              members={crewRowsUi.filter((m) => m.userId !== me).map((m) => ({ userId: m.userId, name: m.name, avatarUrl: m.avatarUrl }))}
              confirmed={(myCheckins ?? []).map((c) => c.subject_id)}
            />
          )}

          {perk && (
            <PerkCard gigId={gig.id} venueId={perk.venueId} perk={perk.text} code={gig.code} isHost={isHost} alreadyRedeemed={perk.redeemed} />
          )}
        </div>

        <div className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:self-start">
          <LobbyChat
            gigId={gig.id}
            confirmed={confirmed}
            completed={!active}
            needed={Math.max(gig.min_to_confirm - gig.claimed_count - gig.reserved_slots, 2 - gig.claimed_count, 1)}
            currentUserId={me}
            crewNames={crewNames}
            crewAvatars={crewAvatars}
            memberCount={gig.claimed_count}
          />
          {active && (isHost ? <HostControls gigId={gig.id} /> : <LeavePanel gigId={gig.id} />)}
        </div>
      </div>
    </div>
  );
}
