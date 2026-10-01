"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { errorCopy } from "@/lib/copy";

export interface Challenge {
  code: string;
  actions: string[];
  issuedAt: string;
  expiresAt: string;
}

export type StartResult = { ok: true; requestId: string; challenge: Challenge } | { ok: false; error: string };

/** Server-generated challenge; rate limit + cooldown live in start_verification(). */
export async function startVerificationAction(): Promise<StartResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("start_verification");
  if (error || !data) {
    console.error("start_verification failed:", error?.code, error?.message);
    return { ok: false, error: errorCopy(error?.message) };
  }
  return { ok: true, requestId: data.id, challenge: data.challenge as unknown as Challenge };
}

const uploadSchema = z.object({
  requestId: z.string().uuid(),
  mime: z.string().min(3).max(120),
});

function extFor(mime: string) {
  if (mime.startsWith("video/webm")) return "webm";
  if (mime.startsWith("video/mp4")) return "mp4";
  if (mime.startsWith("video/quicktime")) return "mov";
  if (mime.startsWith("image/png")) return "png";
  if (mime.startsWith("image/jpeg")) return "jpg";
  return "bin";
}

/**
 * Mints a one-shot signed upload URL for exactly this request's object.
 * The browser PUTs the recording straight to storage with it — no bucket
 * policies involved, which is what made phone uploads fail before.
 */
export async function createVerificationUploadAction(
  input: unknown,
): Promise<{ ok: true; signedUrl: string; path: string } | { ok: false; error: string }> {
  const parsed = uploadSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: errorCopy("generic") };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: errorCopy("not_authenticated") };

  const { data: req } = await supabase
    .from("verification_requests")
    .select("id, user_id, status, media_path, challenge")
    .eq("id", parsed.data.requestId)
    .maybeSingle();
  if (!req || req.user_id !== user.id) return { ok: false, error: errorCopy("request_not_found") };
  if (req.media_path) return { ok: false, error: errorCopy("already_submitted") };
  const exp = new Date((req.challenge as unknown as Challenge).expiresAt).getTime();
  if (Date.now() > exp + 10 * 60e3) return { ok: false, error: errorCopy("challenge_expired") };

  const base = parsed.data.mime.split(";")[0];
  const path = `${user.id}/${req.id}-${Date.now()}.${extFor(base)}`;
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from("verification").createSignedUploadUrl(path, { upsert: true });
  if (error || !data) {
    console.error("signed upload url failed:", error?.message);
    return { ok: false, error: errorCopy("generic") };
  }
  return { ok: true, signedUrl: data.signedUrl, path };
}

const submitSchema = z.object({
  requestId: z.string().uuid(),
  mediaPath: z.string().min(1).max(300),
  mediaMime: z.string().min(1).max(120),
  bytes: z.number().int().nonnegative().optional(),
  deviceHint: z.string().max(200).optional(),
});

export type SubmitResult = { ok: true } | { ok: false; error: string };

export async function submitVerificationAction(input: unknown): Promise<SubmitResult> {
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: errorCopy("generic") };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: errorCopy("not_authenticated") };

  // the object must actually exist before we hand it to a reviewer
  const admin = createAdminClient();
  const folder = parsed.data.mediaPath.split("/")[0];
  if (folder !== user.id) return { ok: false, error: errorCopy("bad_media_path") };
  const { data: files } = await admin.storage.from("verification").list(user.id, { limit: 100 });
  const name = parsed.data.mediaPath.slice(folder.length + 1);
  if (!files?.some((f) => f.name === name)) return { ok: false, error: errorCopy("bad_media_path") };

  const { error } = await supabase.rpc("submit_verification", {
    p_request_id: parsed.data.requestId,
    p_media_path: parsed.data.mediaPath,
    p_media_mime: parsed.data.mediaMime.split(";")[0],
    p_media_bytes: parsed.data.bytes,
    p_device_hint: parsed.data.deviceHint,
  });
  if (error) {
    console.error("submit_verification failed:", error.code, error.message);
    return { ok: false, error: errorCopy(error.message) };
  }

  // tidy up abandoned retakes for this request
  const stale = (files ?? []).filter((f) => f.name.startsWith(parsed.data.requestId) && f.name !== name).map((f) => `${user.id}/${f.name}`);
  if (stale.length) await admin.storage.from("verification").remove(stale);
  return { ok: true };
}
