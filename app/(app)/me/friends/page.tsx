import { MessageCircleOff } from "lucide-react";
import { getViewer } from "@/lib/auth";
import { Card, PageHeader, SectionTitle } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { AcceptButton, UnfriendButton } from "./FriendButtons";
import { firstName, publicAvatarUrl } from "@/lib/avatar";
import { formatDay } from "@/lib/time";
import { copy } from "@/lib/copy";

export const metadata = { title: "Friends" };

const NONE = ["00000000-0000-0000-0000-000000000000"];

export default async function FriendsPage() {
  const { supabase, user } = await getViewer();
  const me = user!.id;

  const [{ data: friendships }, { data: incoming }, { data: outgoing }] = await Promise.all([
    supabase.from("friendships").select("user_a, user_b, created_at"),
    supabase.from("friend_requests").select("id, sender_id, gig_id, created_at").eq("recipient_id", me).eq("status", "pending"),
    supabase.from("friend_requests").select("id, recipient_id, created_at").eq("sender_id", me).eq("status", "pending"),
  ]);

  const friendIds = (friendships ?? []).map((f) => (f.user_a === me ? f.user_b : f.user_a));
  const ids = [...new Set([...friendIds, ...(incoming ?? []).map((r) => r.sender_id), ...(outgoing ?? []).map((r) => r.recipient_id)])];
  const gigIds = (incoming ?? []).map((r) => r.gig_id);

  const [{ data: profiles }, { data: gigs }] = await Promise.all([
    supabase.from("profiles_public").select("id, display_name, avatar_path").in("id", ids.length ? ids : NONE),
    supabase.from("gigs").select("id, starts_at, activities(name)").in("id", gigIds.length ? gigIds : NONE),
  ]);
  const byId = new Map((profiles ?? []).map((p) => [p.id, p]));
  const gigById = new Map(
    (gigs ?? []).map((g) => [g.id, { starts_at: g.starts_at, activity: (g.activities as unknown as { name: string } | null)?.name ?? "a gig" }]),
  );
  const f = copy.friends;

  const Person = ({ id, children }: { id: string; children?: React.ReactNode }) => {
    const p = byId.get(id);
    return (
      <li className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
        <Avatar name={p?.display_name ?? "?"} src={publicAvatarUrl(p?.avatar_path)} size={44} />
        <span className="min-w-0 flex-1 truncate font-bold text-plum">{firstName(p?.display_name)}</span>
        {children}
      </li>
    );
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader title={f.title} />

      {(incoming ?? []).length > 0 && (
        <Card className="p-5 ring-2 ring-coral/30">
          <SectionTitle>{f.incoming}</SectionTitle>
          <ul className="divide-y divide-line">
            {(incoming ?? []).map((r) => {
              const g = gigById.get(r.gig_id);
              const p = byId.get(r.sender_id);
              return (
                <li key={r.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <Avatar name={p?.display_name ?? "?"} src={publicAvatarUrl(p?.avatar_path)} size={44} />
                  <span className="min-w-0 flex-1 text-[0.9375rem]">
                    {f.requestReceived(firstName(p?.display_name), g?.activity ?? "a gig", g ? formatDay(g.starts_at) : "")}
                  </span>
                  <AcceptButton requestId={r.id} />
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <Card className="p-5">
        <SectionTitle>{f.yourFriends}</SectionTitle>
        {friendIds.length === 0 ? (
          <EmptyState title={f.listEmpty} className="!bg-transparent !shadow-none !ring-0 py-4" />
        ) : (
          <ul className="divide-y divide-line">
            {friendIds.map((id) => (
              <Person key={id} id={id}>
                <UnfriendButton otherId={id} />
              </Person>
            ))}
          </ul>
        )}
      </Card>

      {(outgoing ?? []).length > 0 && (
        <Card className="p-5">
          <SectionTitle>{f.outgoing}</SectionTitle>
          <p className="-mt-1 mb-3 text-[0.8125rem] text-muted">{f.outgoingHint}</p>
          <ul className="divide-y divide-line">
            {(outgoing ?? []).map((r) => (
              <Person key={r.id} id={r.recipient_id} />
            ))}
          </ul>
        </Card>
      )}

      <Card tone="tint" className="p-5">
        <p className="flex items-center gap-2 font-bold text-plum"><MessageCircleOff className="h-5 w-5" /> {f.whyNoDms.heading}</p>
        <p className="mt-2 text-[0.875rem] text-ink/80">{f.whyNoDms.body}</p>
        <p className="mt-2 text-[0.875rem] text-ink/80">{f.whyNoDms.body2}</p>
      </Card>
    </div>
  );
}
