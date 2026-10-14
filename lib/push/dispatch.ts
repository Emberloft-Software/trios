import "server-only";
import webpush, { WebPushError } from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";
import { notificationHref, notificationText } from "@/lib/notifications";

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
  sent: number;
  removed: number;
  failed: number;
}

/**
 * Claims unsent notifications (atomically, so concurrent pings never double
 * send) and pushes each to every device its user subscribed. Payloads carry
 * only generic text + a link, never chat content or other people's details.
 */
export async function dispatchPendingPushes(limit = 100): Promise<DispatchResult> {
  const result: DispatchResult = { claimed: 0, sent: 0, removed: 0, failed: 0 };
  const db = createAdminClient();
  const { data: rows, error } = await db.rpc("claim_push_batch", { p_limit: limit });
  if (error) throw new Error(`claim_push_batch: ${error.message}`);
  if (!rows?.length) return result;
  result.claimed = rows.length;

  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const gigIds = [...new Set(rows.map((r) => r.gig_id).filter((g): g is string => !!g))];
  const [{ data: subs }, { data: gigs }] = await Promise.all([
    db.from("push_subscriptions").select("id, user_id, endpoint, p256dh, auth").in("user_id", userIds),
    gigIds.length ? db.from("gigs").select("id, title").in("id", gigIds) : Promise.resolve({ data: [] as { id: string; title: string }[] }),
  ]);
  if (!subs?.length) return result;
  const titleOf = new Map((gigs ?? []).map((g) => [g.id, g.title]));

  const dead: string[] = [];
  const used: string[] = [];
  await Promise.all(
    rows.flatMap((n) =>
      subs
        .filter((s) => s.user_id === n.user_id)
        .map(async (s) => {
          const payload = JSON.stringify({
            title: (n.gig_id && titleOf.get(n.gig_id)) || "Tremigos",
            body: notificationText(n.kind),
            url: notificationHref(n.kind, n.gig_id),
            tag: `${n.kind}:${n.gig_id ?? n.id}`,
          });
          try {
            await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, {
              TTL: 60 * 60 * 24,
              urgency: "normal",
            });
            result.sent++;
            used.push(s.id);
          } catch (e) {
            // 404/410: the browser dropped this subscription for good.
            if (e instanceof WebPushError && (e.statusCode === 404 || e.statusCode === 410)) dead.push(s.id);
            else {
              result.failed++;
              console.error("push send failed:", e instanceof WebPushError ? e.statusCode : e);
            }
          }
        }),
    ),
  );

  if (dead.length) {
    await db.from("push_subscriptions").delete().in("id", [...new Set(dead)]);
    result.removed = new Set(dead).size;
  }
  if (used.length) await db.from("push_subscriptions").update({ last_used_at: new Date().toISOString() }).in("id", [...new Set(used)]);
  return result;
}
