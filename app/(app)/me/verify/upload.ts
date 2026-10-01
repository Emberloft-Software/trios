import { createClient } from "@/lib/supabase/client";
import { copy } from "@/lib/copy";
import { createVerificationUploadAction, submitVerificationAction } from "./_actions";
import { deviceHint, putWithProgress, type Captured } from "./capture";

/**
 * Upload through a one-shot signed URL (XHR for a real progress bar; the
 * storage client as a fallback), then hand the request to review.
 */
export async function uploadRecording(
  requestId: string,
  captured: Captured,
  onProgress: (p: number) => void,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const contentType = captured.mime.split(";")[0];
  const signed = await createVerificationUploadAction({ requestId, mime: contentType });
  if (!signed.ok) return signed;

  try {
    await putWithProgress(signed.signedUrl, captured.blob, contentType, onProgress);
  } catch (e) {
    console.warn("xhr upload failed, retrying via storage client", e);
    const token = new URL(signed.signedUrl).searchParams.get("token") ?? "";
    const { error } = await createClient()
      .storage.from("verification")
      .uploadToSignedUrl(signed.path, token, captured.blob, { contentType, upsert: true });
    if (error) {
      console.error("verification upload failed:", error.message);
      return { ok: false, error: copy.verification.uploadFailed };
    }
  }
  onProgress(100);
  return submitVerificationAction({
    requestId,
    mediaPath: signed.path,
    mediaMime: contentType,
    bytes: captured.blob.size,
    deviceHint: deviceHint(captured.faceRatio),
  });
}
