import "server-only";
import webpush, { WebPushError } from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";
import { notificationHref, notificationText } from "@/lib/notifications";
import { copy } from "@/lib/copy";

type Db = ReturnType<typeof createAdminClient>;
let configured = false;

/** VAPID keys come from env (see push-keys.local.env / Vercel). */
export function pushConfigured(): boolean {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  if (!configured) {
    webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:hello@tremigos.app", pub, priv);
    configured = true;
  }
  return true;
}

export interface DispatchResult {
  claimed: number;
  chats: number;
  sent: number;
  removed: number;
  failed: number;
}

interface Push {
  userId: string;
  title: string;
  body: string;
  url: string;
  tag: string;
}

/**
 * Claims unsent Activity notifications and pending chat counters (both
 * atomically, so concurrent pings never double send) and pushes them to every
 * device the user subscribed. Payloads carry only generic text, the gig title
 * and a link: never chat content or other people's details.
 */
export async function dispatchPendingPushes(limit = 100): Promise<DispatchResult> {
  const db = createAdminClient();
  const [notes, chats] = await Promise.all([
    db.rpc("claim_push_batch", { p_limit: limit }),
    db.rpc("claim_chat_push_batch", { p_limit: limit * 2 }),
  ]);
  if (notes.error) throw new Error(`claim_push_batch: ${notes.error.message}`);
  if (chats.error) throw new Error(`claim_chat_push_batch: ${chats.error.message}`);
  const rows = notes.data ?? [];
  const chatRows = chats.data ?? [];

  const gigIds = [...new Set(rows.map((r) => r.gig_id).filter((g): g is string => !!g))];
  const { data: gigs } = gigIds.length ? await db.from("gigs").select("id, title").in("id", gigIds) : { data: [] };
  const titleOf = new Map((gigs ?? []).map((g) => [g.id, g.title]));

  const pushes: Push[] = [
    ...rows.map((n) => ({
      userId: n.user_id,
      title: (n.gig_id && titleOf.get(n.gig_id)) || "Trimegos",
      body: notificationText(n.kind),
      url: notificationHref(n.kind, n.gig_id),
      tag: `${n.kind}:${n.gig_id ?? n.id}`,
    })),
    ...chatRows.map((c) => ({
      userId: c.user_id,
      title: c.gig_title,
      body: copy.chat.pushNew(c.pending),
      url: `/gigs/${c.gig_id}`,
      tag: `chat:${c.gig_id}`, // replaces the previous chat ping for this gig
    })),
  ];
  const result = await deliver(db, pushes);
  return { claimed: rows.length, chats: chatRows.length, ...result };
}

async function deliver(db: Db, pushes: Push[]) {
  const out = { sent: 0, removed: 0, failed: 0 };
  if (!pushes.length) return out;
  const { data: subs } = await db
    .from("push_subscriptions")
    .select("id, user_id, endpoint, p256dh, auth")
    .in("user_id", [...new Set(pushes.map((p) => p.userId))]);
  if (!subs?.length) return out;

  const dead = new Set<string>();
  const used = new Set<string>();
  await Promise.all(
    pushes.flatMap((p) =>
      subs
        .filter((s) => s.user_id === p.userId)
        .map(async (s) => {
          const payload = JSON.stringify({ title: p.title, body: p.body, url: p.url, tag: p.tag });
          try {
            await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, {
              TTL: 60 * 60 * 24,
              urgency: p.tag.startsWith("chat:") ? "high" : "normal",
            });
            out.sent++;
            used.add(s.id);
          } catch (e) {
            // 404/410: the browser dropped this subscription for good.
            if (e instanceof WebPushError && (e.statusCode === 404 || e.statusCode === 410)) dead.add(s.id);
            else {
              out.failed++;
              console.error("push send failed:", e instanceof WebPushError ? e.statusCode : e);
            }
          }
        }),
    ),
  );

  if (dead.size) {
    await db.from("push_subscriptions").delete().in("id", [...dead]);
    out.removed = dead.size;
  }
  if (used.size) await db.from("push_subscriptions").update({ last_used_at: new Date().toISOString() }).in("id", [...used]);
  return out;
}
