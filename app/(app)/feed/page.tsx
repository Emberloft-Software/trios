import { createClient } from "@/lib/supabase/server";
import { GigCard } from "@/components/gig/GigCard";
import { FriendGigCard } from "@/components/gig/FriendGigCard";
import { FeedStagger } from "@/components/gig/FeedStagger";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { copy } from "@/lib/copy";

export const metadata = { title: "Feed — Trio" };

/**
 * The blind feed (R5). Reads gig_feed — a view that carries activity, time,
 * place, and slot counts, and NOTHING about crew identity. Chronological,
 * soonest first.
 */
export default async function FeedPage() {
  const supabase = await createClient();
  const [{ data: gigs }, { data: friendGigs }] = await Promise.all([
    supabase
      .from("gig_feed")
      .select("*")
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(60),
    supabase
      .from("friend_hosted_gigs")
      .select("*")
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(12),
  ]);

  const list = gigs ?? [];
  const friends = friendGigs ?? [];

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <h1 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] font-700">
          {copy.feed.title}
        </h1>
        <ButtonLink href="/gigs/new">{copy.nav.newGig}</ButtonLink>
      </div>

      {friends.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 font-display text-[1.25rem] font-700 text-[var(--color-net)]">
            {copy.friends.fromFriends}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeedStagger>
              {friends.map((gig, i) => (
                <FriendGigCard key={gig.id} gig={gig} tiltIndex={i} />
              ))}
            </FeedStagger>
          </div>
        </section>
      )}

      {list.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="mx-auto max-w-md text-[1.0625rem]">{copy.feed.empty}</p>
          <div className="mt-5">
            <ButtonLink href="/gigs/new">{copy.feed.emptyCta}</ButtonLink>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeedStagger>
            {list.map((gig, i) => (
              <GigCard key={gig.id} gig={gig} tiltIndex={i} />
            ))}
          </FeedStagger>
        </div>
      )}
    </div>
  );
}
