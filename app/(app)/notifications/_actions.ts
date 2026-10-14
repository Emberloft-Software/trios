"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markNotificationsReadAction() {
  const supabase = await createClient();
  await supabase.rpc("mark_notifications_read");
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
}

const pushSchema = z.object({
  endpoint: z.string().url().startsWith("https://").max(1000),
  keys: z.object({ p256dh: z.string().min(10).max(200), auth: z.string().min(8).max(100) }),
});

/** Saves this device's push subscription for the signed-in user. */
export async function savePushSubscriptionAction(sub: unknown, userAgent: string): Promise<{ ok: boolean }> {
  const parsed = pushSchema.safeParse(sub);
  if (!parsed.success) return { ok: false };
  const supabase = await createClient();
  const { error } = await supabase.rpc("save_push_subscription", {
    p_endpoint: parsed.data.endpoint,
    p_p256dh: parsed.data.keys.p256dh,
    p_auth: parsed.data.keys.auth,
    p_user_agent: userAgent.slice(0, 300),
  });
  if (error) console.error("save_push_subscription failed:", error.message);
  return { ok: !error };
}

export async function deletePushSubscriptionAction(endpoint: string): Promise<{ ok: boolean }> {
  if (typeof endpoint !== "string" || endpoint.length > 1000) return { ok: false };
  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_push_subscription", { p_endpoint: endpoint });
  return { ok: !error };
}
