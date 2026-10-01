import "server-only";
import type { createClient } from "@/lib/supabase/server";
import { firstName, publicAvatarUrl } from "@/lib/avatar";
import { getSiteURL } from "@/lib/site-url";
import type { CrewRow } from "./CrewList";
import type { GuestInvite } from "./InvitePanel";

type Supa = Awaited<ReturnType<typeof createClient>>;

export type VenueJoin = {
  name: string;
  photo_refs: string[];
  photo_attribution: string[];
  maps_url: string | null;
  rating: number | null;
  user_rating_count: number | null;
  is_partner: boolean;
  partner_perk: string | null;
} | null;

/** The gig (RLS: host, crew, or someone inside its audience) + crew rows. */
export async function loadGig(supabase: Supa, id: string) {
  const [{ data: gig }, { data: crewRows }] = await Promise.all([
    supabase
      .from("gigs")
      .select(
        "*, activities(name, emoji, category), venues(name, photo_refs, photo_attribution, maps_url, rating, user_rating_count, is_partner, partner_perk)",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("gig_crew").select("user_id, position, state, joined_via").eq("gig_id", id).order("position"),
  ]);
  if (!gig) return null;
  return {
    gig,
    venue: gig.venues as unknown as VenueJoin,
    activity: gig.activities as unknown as { name: string; emoji: string; category: string } | null,
    // every row the viewer can see (only crew can see any); active = still in
    allCrew: crewRows ?? [],
    crew: (crewRows ?? []).filter((r) => ["claimed", "attended", "no_show"].includes(r.state)),
  };
}

export type LoadedGig = NonNullable<Awaited<ReturnType<typeof loadGig>>>;

/** Everything the crew lobby needs, fetched in parallel. */
export async function loadLobby(supabase: Supa, g: LoadedGig, me: string) {
  const { gig, crew, allCrew } = g;
  const isHost = gig.host_id === me;
  const chatOpen = !!gig.chat_opened_at;
  const active = gig.status === "open" || gig.status === "locked";
  const allIds = [...new Set(allCrew.map((r) => r.user_id))];
  const none = Promise.resolve({ data: null });

  const [profiles, tallies, checkins, redemption, invites, friendships] = await Promise.all([
    supabase.from("profiles_public").select("id, display_name, avatar_path, reliability_band, verification_status, age").in("id", allIds),
    chatOpen && active ? supabase.rpc("kick_vote_tallies", { p_gig_id: gig.id }) : none,
    gig.status === "locked" ? supabase.from("checkins").select("subject_id").eq("gig_id", gig.id).eq("confirmer_id", me) : none,
    g.venue?.is_partner ? supabase.from("perk_redemptions").select("id").eq("gig_id", gig.id).maybeSingle() : none,
    isHost ? supabase.from("gig_invites").select("id, code, label, used_by, used_at, revoked_at").eq("gig_id", gig.id).order("label") : none,
    isHost && gig.status === "open" ? supabase.from("friendships").select("user_a, user_b") : none,
  ]);

  const byId = new Map((profiles.data ?? []).map((p) => [p.id, p]));
  const tallyById = new Map((tallies.data ?? []).map((t) => [t.target_id, t]));
  const names = Object.fromEntries((profiles.data ?? []).map((p) => [p.id, firstName(p.display_name)]));
  const avatars = Object.fromEntries((profiles.data ?? []).map((p) => [p.id, publicAvatarUrl(p.avatar_path)]));

  const crewUi: CrewRow[] = crew.map((r) => {
    const p = byId.get(r.user_id);
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

  const guestInvites: GuestInvite[] = (invites.data ?? []).map((i) => ({
    id: i.id,
    label: i.label,
    url: `${getSiteURL()}/join/${i.code}`,
    usedBy: i.used_by ? names[i.used_by] ?? null : null,
    used: !!i.used_at,
    revoked: !!i.revoked_at,
  }));

  // Tremigos friends not already in the crew, for in-app nudges
  let friends: { id: string; name: string }[] = [];
  const fids = (friendships.data ?? []).map((x) => (x.user_a === me ? x.user_b : x.user_a)).filter((f) => !allIds.includes(f));
  if (fids.length) {
    const { data: fp } = await supabase.from("profiles_public").select("id, display_name").in("id", fids);
    friends = (fp ?? []).map((p) => ({ id: p.id, name: firstName(p.display_name) }));
  }

  return {
    crewUi,
    names,
    avatars,
    guestInvites,
    friends,
    myCheckins: (checkins.data ?? []).map((c) => c.subject_id),
    perkRedeemed: !!redemption.data,
  };
}
