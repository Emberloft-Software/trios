import Link from "next/link";
import { Plus } from "lucide-react";
import { getViewer } from "@/lib/auth";
import { GigCard } from "@/components/gig/GigCard";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/Card";
import { firstName } from "@/lib/avatar";
import { copy } from "@/lib/copy";

export const metadata = { title: "Discover" };

const CATEGORIES = [
  { key: "", label: copy.feed.all, emoji: "✨" },
  { key: "Sports", label: "Sports", emoji: "⚽" },
  { key: "Chill", label: "Food & chill", emoji: "☕" },
  { key: "Outdoors", label: "Outdoors", emoji: "🥾" },
  { key: "Making", label: "Learn & make", emoji: "🎨" },
];

/**
 * The blind feed. RLS on gigs already removes anything outside the viewer's
 * age range / audience and anything hosted by someone in a block relationship.
 */
export default async function FeedPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat = "" } = await searchParams;
  const { supabase, profile } = await getViewer();
  const nowIso = new Date().toISOString();

  let q = supabase.from("gig_feed").select("*").gte("starts_at", nowIso).order("starts_at", { ascending: true }).limit(60);
  if (cat) q = q.eq("activity_category", cat);

  const [{ data: gigs }, { data: friendGigs }] = await Promise.all([
    q,
    supabase.from("friend_hosted_gigs").select("*").gte("starts_at", nowIso).order("starts_at", { ascending: true }).limit(12),
  ]);

  const friendIds = new Set((friendGigs ?? []).map((g) => g.id));
  const list = (gigs ?? []).filter((g) => !friendIds.has(g.id));
  const friends = cat ? (friendGigs ?? []).filter((g) => g.activity_category === cat) : friendGigs ?? [];

  return (
    <div>
      <PageHeader
        title={<>{copy.feed.greeting(firstName(profile?.display_name))} <span aria-hidden>👋</span></>}
        sub={copy.feed.sub}
        action={
          <div className="hidden sm:block">
            <ButtonLink href="/gigs/new">
              <Plus className="h-4 w-4" strokeWidth={2.5} /> {copy.nav.newGig}
            </ButtonLink>
          </div>
        }
      />

      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {CATEGORIES.map((c) => {
          const active = c.key === cat;
          return (
            <Link
              key={c.key || "all"}
              href={c.key ? `/feed?cat=${c.key}` : "/feed"}
              scroll={false}
              aria-current={active ? "true" : undefined}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[0.875rem] font-semibold transition ${
                active ? "bg-plum text-white shadow-[0_6px_16px_rgba(54,2,83,0.25)]" : "glass text-plum hover:bg-white"
              }`}
            >
              <span aria-hidden>{c.emoji}</span> {c.label}
            </Link>
          );
        })}
      </div>

      {friends.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-[1.0625rem] font-bold">{copy.feed.fromFriends}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {friends.map((g, i) => (
              <div key={g.id} className="animate-rise" style={{ animationDelay: `${i * 40}ms` }}>
                <GigCard gig={g} friend />
              </div>
            ))}
          </div>
        </section>
      )}

      {list.length === 0 ? (
        <EmptyState
          title={cat ? copy.feed.emptyFiltered : copy.feed.empty}
          action={<ButtonLink href="/gigs/new">{copy.feed.emptyCta}</ButtonLink>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((g, i) => (
            <div key={g.id} className="animate-rise" style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}>
              <GigCard gig={g} />
            </div>
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-[0.8125rem] text-muted">{copy.feed.audienceNote}</p>
    </div>
  );
}
