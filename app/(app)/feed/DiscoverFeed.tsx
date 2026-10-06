"use client";

import { useMemo, useState } from "react";
import { GigCard } from "@/components/gig/GigCard";
import { DiscoverControls } from "@/components/gig/DiscoverControls";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CATEGORY_ICON } from "@/components/ui/ActivityIcon";
import { areaBySlug, feedHref, placeGigs, type FeedParams, type LatLng } from "@/lib/geo";
import { copy } from "@/lib/copy";
import type { FeedGig, FriendGig } from "@/lib/database.types";

const CATEGORIES = [
  { key: "", label: copy.feed.all },
  { key: "Sports", label: "Sports" },
  { key: "Chill", label: "Food & chill" },
  { key: "Outdoors", label: "Outdoors" },
  { key: "Making", label: "Learn & make" },
];

/**
 * Category / area / distance filtering happens here, on the gigs the server
 * already sent (RLS-filtered, max 200). Changing a filter is instant and only
 * rewrites the URL in place, so there's no server round trip per tap.
 */
export function DiscoverFeed({
  gigs,
  friendGigs,
  initial,
  initialLoc,
}: {
  gigs: FeedGig[];
  friendGigs: FriendGig[];
  initial: FeedParams;
  initialLoc: LatLng | null;
}) {
  const [params, setParams] = useState<FeedParams>(initial);
  const [me, setMe] = useState<LatLng | null>(initialLoc);

  function update(next: Partial<FeedParams>, loc?: LatLng) {
    const p = { ...params, ...next };
    if (loc) setMe(loc);
    setParams(p);
    window.history.replaceState(window.history.state, "", feedHref(p));
  }

  const { list, friends, area } = useMemo(() => {
    const area = areaBySlug(params.area);
    const place = { area, me, near: params.sort === "near" && !!me };
    const byCat = <T extends { activity_category: string }>(rows: T[]) =>
      params.cat ? rows.filter((g) => g.activity_category === params.cat) : rows;
    const friendIds = new Set(friendGigs.map((g) => g.id));
    return {
      area,
      friends: placeGigs(byCat(friendGigs), place),
      list: placeGigs(byCat(gigs.filter((g) => !friendIds.has(g.id))), place),
    };
  }, [gigs, friendGigs, params, me]);

  return (
    <>
      <div role="group" aria-label={copy.feed.title} className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {CATEGORIES.map((c) => {
          const active = c.key === params.cat;
          const Icon = CATEGORY_ICON[c.key];
          return (
            <button
              key={c.key || "all"}
              type="button"
              onClick={() => update({ cat: c.key })}
              aria-pressed={active}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[0.875rem] font-semibold transition ${
                active ? "bg-plum text-white shadow-[0_6px_16px_rgba(54,2,83,0.25)]" : "glass text-plum hover:bg-white"
              }`}
            >
              {Icon && <Icon aria-hidden className="h-4 w-4" />} {c.label}
            </button>
          );
        })}
      </div>

      <DiscoverControls params={params} onChange={update} />

      {friends.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-[1.0625rem] font-bold">{copy.feed.fromFriends}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {friends.map((g) => (
              <GigCard key={g.id} gig={g} friend km={g.km} />
            ))}
          </div>
        </section>
      )}

      {list.length === 0 ? (
        <EmptyState
          title={area ? copy.nearby.emptyArea(area.name) : params.cat ? copy.feed.emptyFiltered : copy.feed.empty}
          action={<ButtonLink href="/gigs/new">{copy.feed.emptyCta}</ButtonLink>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((g, i) => (
            <div key={g.id} className="animate-rise" style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}>
              <GigCard gig={g} km={g.km} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
