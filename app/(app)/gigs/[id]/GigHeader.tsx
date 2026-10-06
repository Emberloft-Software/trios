/* eslint-disable @next/next/no-img-element */
import { CalendarClock, Hash, Lock, MessageCircle, Wallet } from "lucide-react";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Notice } from "@/components/ui/Notice";
import { VenueMedia } from "@/components/gig/VenueMedia";
import { AudienceBadges } from "@/components/gig/GigCard";
import { formatGigTime, timeUntil } from "@/lib/time";
import { copy } from "@/lib/copy";
import type { LoadedGig } from "./_data";
import { ActivityIcon } from "@/components/ui/ActivityIcon";

/** Photo banner with activity, status, title and time. */
export function GigHeader({ g }: { g: LoadedGig }) {
  const { gig, venue, activity } = g;
  const active = gig.status === "open" || gig.status === "locked";
  const full = gig.claimed_count + (gig.is_private ? 0 : gig.reserved_slots) >= gig.capacity;
  const photo = venue?.photo_refs?.[0] ? `/api/place-photo?ref=${encodeURIComponent(venue.photo_refs[0])}&w=1200` : null;
  return (
    <div className="relative -mx-4 -mt-5 mb-5 overflow-hidden sm:mx-0 sm:mt-0 sm:rounded-[2rem]">
      <div className="bg-hero relative h-48 sm:h-56">
        {photo && <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />}
        <div className="absolute inset-0 bg-gradient-to-t from-plum-800/90 via-plum-800/30 to-transparent" />
        {!photo && <ActivityIcon slug={activity?.slug} className="absolute -right-6 -top-6 h-48 w-48 text-white/15" />}
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="glass-dark inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.75rem] font-semibold text-white">
              <ActivityIcon slug={activity?.slug} className="h-3.5 w-3.5" /> {activity?.name}
            </span>
            <Badge tone={gig.status === "cancelled" ? "coral" : "white"}>
              {gig.status === "open" && full ? copy.feed.full : copy.gig.status[gig.status]}
            </Badge>
            {gig.is_private && <Badge tone="plum" icon={<Lock className="h-3 w-3" />}>{copy.privacy.badge}</Badge>}
            {gig.chat_opened_at && active && <Badge tone="mint" icon={<MessageCircle className="h-3 w-3" />}>{copy.slots.on}</Badge>}
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
}

/** Venue, audience, cost, notes. */
export function GigDetails({ g, showCode }: { g: LoadedGig; showCode: boolean }) {
  const { gig, venue } = g;
  const everyone = !gig.is_private && gig.gender_pref === "everyone" && gig.age_min === 18 && gig.age_max === 99;
  return (
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
        {everyone && <Badge tone="muted">{copy.audience.everyone} · 18+</Badge>}
        <Badge tone="white">{gig.duration_min} {copy.newGig.minutes}</Badge>
        {gig.cost_note && <Badge tone="white" icon={<Wallet className="h-3 w-3" />}>{gig.cost_note}</Badge>}
        {showCode && <Badge tone="white" icon={<Hash className="h-3 w-3" />}>{gig.code}</Badge>}
      </div>
      {gig.notes && <p className="mt-4 whitespace-pre-line text-[0.9375rem] text-ink/90">{gig.notes}</p>}
    </Card>
  );
}

/**
 * "The host is bringing people they know" — shown whenever guests were
 * declared OR anyone in the crew actually joined through a host's link.
 */
export function GuestsNotice({ g }: { g: LoadedGig }) {
  if (g.gig.is_private) return <Notice tone="info" title={copy.privacy.badge}>{copy.privacy.lobbyNote}</Notice>;
  const joined = g.crew.filter((r) => r.joined_via === "invite").length;
  const n = Math.max(g.gig.host_guests, joined);
  if (n === 0) return null;
  return (
    <Notice tone="warn" title={copy.guests.badge(n)}>
      {copy.guests.lobbyNote(n)}
      {joined > 0 && <span className="mt-1 block font-semibold">{copy.guests.joinedSoFar(joined)}</span>}
    </Notice>
  );
}
