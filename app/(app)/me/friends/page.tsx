import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { AcceptButton, UnfriendButton } from "./FriendButtons";
import { firstName } from "@/lib/avatar";
import { formatDay } from "@/lib/time";
import { copy } from "@/lib/copy";

export const metadata = { title: "Friends — Trio" };

/**
 * Friends (M5). Friendships, incoming requests (accept only — no decline),
 * outgoing pending (shown vaguely; expired and declined look identical to the
 * sender). No 1:1 messaging surface anywhere — see the explainer at the bottom.
 */
export default async function FriendsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const me = user!.id;

  const [{ data: friendships }, { data: incoming }, { data: outgoing }] = await Promise.all([
    supabase.from("friendships").select("user_a, user_b, created_at"),
    supabase
      .from("friend_requests")
      .select("id, sender_id, gig_id, created_at")
      .eq("recipient_id", me)
      .eq("status", "pending"),
    supabase
      .from("friend_requests")
      .select("id, recipient_id, created_at")
      .eq("sender_id", me)
      .eq("status", "pending"),
  ]);

  const friendIds = (friendships ?? []).map((f) => (f.user_a === me ? f.user_b : f.user_a));
  const otherIds = [
    ...new Set([
      ...friendIds,
      ...(incoming ?? []).map((r) => r.sender_id),
      ...(outgoing ?? []).map((r) => r.recipient_id),
    ]),
  ];

  const { data: profiles } = await supabase
    .from("profiles_public")
    .select("id, display_name")
    .in("id", otherIds.length ? otherIds : ["00000000-0000-0000-0000-000000000000"]);
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));

  // activity/date context for incoming requests
  const gigIds = (incoming ?? []).map((r) => r.gig_id);
  const { data: gigs } = await supabase
    .from("gigs")
    .select("id, starts_at, activities(name)")
    .in("id", gigIds.length ? gigIds : ["00000000-0000-0000-0000-000000000000"]);
  const gigById = new Map(
    (gigs ?? []).map((g) => [g.id, { starts_at: g.starts_at, activity: (g.activities as { name: string } | null)?.name ?? "a gig" }]),
  );

  const f = copy.friends;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] font-700">{f.title}</h1>

      {/* Incoming */}
      {(incoming ?? []).length > 0 && (
        <section>
          <h2 className="mb-2 font-display text-[1.25rem] font-600">{f.incoming}</h2>
          <ul className="space-y-2">
            {(incoming ?? []).map((r) => {
              const g = gigById.get(r.gig_id);
              return (
                <li key={r.id}>
                  <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <span className="text-[0.9375rem]">
                      {f.requestReceived(
                        firstName(nameById.get(r.sender_id) ?? "Someone"),
                        g?.activity ?? "a gig",
                        g ? formatDay(g.starts_at) : "",
                      )}
                    </span>
                    <AcceptButton requestId={r.id} />
                  </Card>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Friends */}
      <section>
        <h2 className="mb-2 font-display text-[1.25rem] font-600">{f.yourFriends}</h2>
        {friendIds.length === 0 ? (
          <Card className="p-5 text-[0.9375rem] text-[var(--color-dust)]">{f.listEmpty}</Card>
        ) : (
          <ul className="space-y-2">
            {friendIds.map((fid) => (
              <li key={fid}>
                <Card className="flex items-center justify-between p-4">
                  <span className="font-500">{firstName(nameById.get(fid) ?? "Friend")}</span>
                  <UnfriendButton otherId={fid} />
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Outgoing — deliberately vague */}
      {(outgoing ?? []).length > 0 && (
        <section>
          <h2 className="mb-2 font-display text-[1.25rem] font-600">{f.outgoing}</h2>
          <p className="mb-2 text-[0.875rem] text-[var(--color-dust)]">{f.outgoingHint}</p>
          <ul className="space-y-2">
            {(outgoing ?? []).map((r) => (
              <li key={r.id}>
                <Card className="p-4 text-[0.9375rem]">
                  {firstName(nameById.get(r.recipient_id) ?? "Someone")}
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Why no DMs */}
      <Card className="p-5">
        <h2 className="mb-2 font-display text-[1.125rem] font-600">{f.whyNoDms.heading}</h2>
        <div className="space-y-2 text-[0.9375rem]">
          <p>{f.whyNoDms.body}</p>
          <p>{f.whyNoDms.body2}</p>
          <p>{f.whyNoDms.body3}</p>
        </div>
      </Card>
    </div>
  );
}
