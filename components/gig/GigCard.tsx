/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Clock, MapPin, UserPlus, Users, Wallet } from "lucide-react";
import { SlotStrip } from "@/components/ui/SlotStrip";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { dateTile, formatClock } from "@/lib/time";
import { firstName, publicAvatarUrl } from "@/lib/avatar";
import { copy } from "@/lib/copy";
import type { FeedGig, FriendGig } from "@/lib/database.types";
import { ActivityIcon } from "@/components/ui/ActivityIcon";

const CATEGORY_TINT: Record<string, string> = {
  Sports: "from-coral/90 to-[#ff7a59]",
  Chill: "from-plum-700 to-plum",
  Outdoors: "from-[#12a26b] to-[#0e7a52]",
  Making: "from-sun to-[#ff9a3d]",
};

export function AudienceBadges({ ageMin, ageMax, gender }: { ageMin: number; ageMax: number; gender: string }) {
  return (
    <>
      {gender !== "everyone" && (
        <Badge tone="plum">{gender === "women" ? copy.audience.women : copy.audience.men}</Badge>
      )}
      {(ageMin !== 18 || ageMax !== 99) && <Badge tone="muted">{copy.audience.ages(ageMin, ageMax)}</Badge>}
    </>
  );
}

/**
 * Feed card. Blind by construction: activity, time, place and how full it is —
 * never who's in it (friend-hosted cards add only the host's name).
 */
export function GigCard({ gig, friend }: { gig: FeedGig | FriendGig; friend?: boolean }) {
  const tile = dateTile(gig.starts_at);
  const locked = gig.status === "locked";
  const photo = gig.venue_photo_ref ? `/api/place-photo?ref=${encodeURIComponent(gig.venue_photo_ref)}&w=640` : null;
  const host = friend ? (gig as FriendGig) : null;

  return (
    <Link
      href={`/gigs/${gig.id}`}
      className="group glass block overflow-hidden rounded-[1.75rem] transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
    >
      <div className={`relative h-36 overflow-hidden bg-gradient-to-br ${CATEGORY_TINT[gig.activity_category] ?? "from-plum-700 to-plum"}`}>
        {photo ? (
          <img src={photo} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <ActivityIcon slug={gig.activity_slug} className="absolute -bottom-3 -right-3 h-28 w-28 text-white/35" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
        <div className="glass-strong absolute left-3 top-3 flex w-14 flex-col items-center rounded-2xl py-1.5 leading-none">
          <span className="text-[0.625rem] font-bold tracking-wider text-coral">{tile.dow}</span>
          <span className="text-[1.375rem] font-extrabold text-plum">{tile.day}</span>
          <span className="text-[0.625rem] font-bold tracking-wider text-muted">{tile.mon}</span>
        </div>
        <span className="glass-strong absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.75rem] font-semibold text-plum">
          <ActivityIcon slug={gig.activity_slug} className="h-3.5 w-3.5" /> {gig.activity_name}
        </span>
        {gig.host_guests > 0 && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-sun px-2.5 py-1 text-[0.75rem] font-bold text-plum shadow">
            <UserPlus className="h-3.5 w-3.5" /> {copy.guests.badge(gig.host_guests)}
          </span>
        )}
      </div>

      <div className="p-4 pt-3.5">
        {host && (
          <p className="mb-1.5 flex items-center gap-2 text-[0.8125rem] font-semibold text-coral-600">
            <Avatar name={host.host_name} src={publicAvatarUrl(host.host_avatar)} size={20} />
            {firstName(host.host_name)} · {copy.feed.fromFriends.toLowerCase()}
          </p>
        )}
        <h3 className="line-clamp-2 text-[1.0625rem] font-bold leading-snug">{gig.title}</h3>
        <div className="mt-2 space-y-1 text-[0.8125rem] text-muted">
          <p className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span className="tabular">{formatClock(gig.starts_at)}</span>
            <span aria-hidden>·</span>
            <span>{gig.duration_min} {copy.newGig.minutes}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{gig.venue_name ?? gig.place_label}</span>
          </p>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <AudienceBadges ageMin={gig.age_min} ageMax={gig.age_max} gender={gig.gender_pref} />
          {gig.cost_note && <Badge tone="white" icon={<Wallet className="h-3 w-3" />}>{gig.cost_note}</Badge>}
          {gig.host_guests === 0 && gig.gender_pref === "everyone" && gig.age_min === 18 && gig.age_max === 99 && (
            <Badge tone="muted" icon={<Users className="h-3 w-3" />}>{copy.audience.everyone}</Badge>
          )}
        </div>
        <div className="mt-3.5 border-t border-line pt-3">
          <SlotStrip
            size="sm"
            capacity={gig.capacity}
            claimed={gig.claimed_count}
            reserved={gig.reserved_slots}
            minToConfirm={gig.min_to_confirm}
            locked={locked}
          />
        </div>
      </div>
    </Link>
  );
}
