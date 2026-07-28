"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { errorCopy } from "@/lib/copy";

export interface Challenge {
  code: string;
  actions: string[];
  issuedAt: string;
  expiresAt: string;
}

export type StartResult =
  | { ok: true; requestId: string; challenge: Challenge }
  | { ok: false; error: string };

/** Issue a server-generated challenge. Rate limit + cooldown are enforced in
 *  start_verification() (security definer), never here. */
export async function startVerificationAction(): Promise<StartResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: errorCopy("not_authenticated") };

  const { data, error } = await supabase.rpc("start_verification");
  if (error || !data) {
    // Surface the real reason — a swallowed error here just reads as "generic".
    console.error("start_verification failed:", {
      code: error?.code,
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
    });
    if (error?.code === "23503") return { ok: false, error: errorCopy("profile_missing") };
    if (error?.code === "PGRST202" || error?.message?.includes("function"))
      return { ok: false, error: "Verification isn't set up on the database yet (migration 0010)." };
    return { ok: false, error: errorCopy(error?.message ?? "generic") };
  }
  return {
    ok: true,
    requestId: data.id,
    challenge: data.challenge as unknown as Challenge,
  };
}

const submitSchema = z.object({
  requestId: z.string().uuid(),
  mediaPath: z.string().min(1),
  mediaMime: z.string().min(1).max(120),
});

export type SubmitResult = { ok: true } | { ok: false; error: string };

/** Record the uploaded media path + mime and hand the request to review. */
export async function submitVerificationAction(input: unknown): Promise<SubmitResult> {
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: errorCopy("generic") };

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_verification", {
    p_request_id: parsed.data.requestId,
    p_media_path: parsed.data.mediaPath,
    p_media_mime: parsed.data.mediaMime,
  });
  if (error) {
    console.error("submit_verification failed:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return { ok: false, error: errorCopy(error.message) };
  }
  return { ok: true };
}
