import { createClient } from "@/lib/supabase/server";
import { GigCard } from "@/components/gig/GigCard";
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
  const { data: gigs } = await supabase
    .from("gig_feed")
    .select("*")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(60);

  const list = gigs ?? [];

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <h1 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] font-700">
          {copy.feed.title}
        </h1>
        <ButtonLink href="/gigs/new">{copy.nav.newGig}</ButtonLink>
      </div>

      {list.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="mx-auto max-w-md text-[1.0625rem]">{copy.feed.empty}</p>
          <div className="mt-5">
            <ButtonLink href="/gigs/new">{copy.feed.emptyCta}</ButtonLink>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((gig, i) => (
            <GigCard key={gig.id} gig={gig} tiltIndex={i} />
          ))}
        </div>
      )}
    </div>
  );
}
