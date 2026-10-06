import { cookies } from "next/headers";
import { Plus } from "lucide-react";
import { getViewer } from "@/lib/auth";
import { ButtonLink } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/Card";
import { firstName } from "@/lib/avatar";
import { copy } from "@/lib/copy";
import { LOC_COOKIE, areaBySlug, parseLoc } from "@/lib/geo";
import { DiscoverFeed } from "./DiscoverFeed";

export const metadata = { title: "Discover" };

const CATS = new Set(["Sports", "Chill", "Outdoors", "Making"]);

/**
 * The blind feed. RLS on gigs already removes anything outside the viewer's
 * age range / audience, anything hosted by someone in a block relationship,
 * and every private gig. Filtering by category / area / distance is done on
 * the client over this list (see DiscoverFeed).
 */
export default async function FeedPage({ searchParams }: { searchParams: Promise<{ cat?: string; area?: string; sort?: string }> }) {
  const [sp, { supabase, profile }, jar] = await Promise.all([searchParams, getViewer(), cookies()]);
  const nowIso = new Date().toISOString();
  const loc = parseLoc(jar.get(LOC_COOKIE)?.value);

  const [{ data: gigs }, { data: friendGigs }] = await Promise.all([
    supabase.from("gig_feed").select("*").gte("starts_at", nowIso).order("starts_at", { ascending: true }).limit(200),
    supabase.from("friend_hosted_gigs").select("*").gte("starts_at", nowIso).order("starts_at", { ascending: true }).limit(12),
  ]);

  const initial = {
    cat: sp.cat && CATS.has(sp.cat) ? sp.cat : "",
    area: areaBySlug(sp.area)?.slug ?? "",
    sort: sp.sort === "near" && loc ? "near" : "",
  };

  return (
    <div>
      <PageHeader
        title={copy.feed.greeting(firstName(profile?.display_name))}
        sub={copy.feed.sub}
        action={
          <div className="hidden sm:block">
            <ButtonLink href="/gigs/new">
              <Plus className="h-4 w-4" strokeWidth={2.5} /> {copy.nav.newGig}
            </ButtonLink>
          </div>
        }
      />
      <DiscoverFeed gigs={gigs ?? []} friendGigs={friendGigs ?? []} initial={initial} initialLoc={loc} />
      <p className="mt-8 text-center text-[0.8125rem] text-muted">{copy.feed.audienceNote}</p>
    </div>
  );
}
