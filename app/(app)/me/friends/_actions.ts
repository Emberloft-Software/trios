"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { errorCopy } from "@/lib/copy";

const uuid = z.string().uuid();
export type FriendResult = { ok: true } | { ok: false; error: string };

/** Send a friend request. R9 (shared attended gig) + the 90-day rule are
 *  enforced in send_friend_request(). The only entry point is a completed
 *  gig's summary — there is no Add button anywhere else. */
export async function sendFriendRequestAction(recipientId: string, gigId: string): Promise<FriendResult> {
  if (!uuid.safeParse(recipientId).success || !uuid.safeParse(gigId).success) {
    return { ok: false, error: errorCopy("generic") };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("send_friend_request", {
    p_recipient: recipientId,
    p_gig_id: gigId,
  });
  if (error) return { ok: false, error: errorCopy(error.message) };
  revalidatePath(`/gigs/${gigId}`);
  return { ok: true };
}

/** Accept an incoming request. There is deliberately no decline action —
 *  ignoring expires it at 14 days and looks identical to a decline. */
export async function acceptFriendRequestAction(requestId: string): Promise<FriendResult> {
  if (!uuid.safeParse(requestId).success) return { ok: false, error: errorCopy("generic") };
  const supabase = await createClient();
  const { error } = await supabase.rpc("accept_friend_request", { p_request_id: requestId });
  if (error) return { ok: false, error: errorCopy(error.message) };
  revalidatePath("/me/friends");
  revalidatePath("/feed");
  return { ok: true };
}

/** Unfriend — silent and immediate. RLS lets a user delete their own
 *  friendship row (either side). */
export async function unfriendAction(otherId: string): Promise<FriendResult> {
  if (!uuid.safeParse(otherId).success) return { ok: false, error: errorCopy("generic") };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: errorCopy("not_authenticated") };

  const [a, b] = user.id < otherId ? [user.id, otherId] : [otherId, user.id];
  const { error } = await supabase.from("friendships").delete().eq("user_a", a).eq("user_b", b);
  if (error) return { ok: false, error: errorCopy("generic") };
  revalidatePath("/me/friends");
  revalidatePath("/feed");
  return { ok: true };
}

/** Invite a friend to a gig you host. A notification only — holds no slot (R10). */
export async function inviteFriendAction(gigId: string, friendId: string): Promise<FriendResult> {
  if (!uuid.safeParse(gigId).success || !uuid.safeParse(friendId).success) {
    return { ok: false, error: errorCopy("generic") };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("invite_friend", { p_gig_id: gigId, p_friend: friendId });
  if (error) return { ok: false, error: errorCopy(error.message) };
  return { ok: true };
}
