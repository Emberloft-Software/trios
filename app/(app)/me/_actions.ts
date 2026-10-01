"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { errorCopy, copy } from "@/lib/copy";

type Result = { ok: true } | { ok: false; error: string };

const profileSchema = z.object({
  displayName: z.string().trim().min(1).max(40),
  bio: z.string().trim().max(280).optional().default(""),
});

export async function updateProfileAction(input: unknown): Promise<Result> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: copy.auth.errors.name_required };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: errorCopy("not_authenticated") };
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: parsed.data.displayName, bio: parsed.data.bio || null })
    .eq("id", user.id);
  if (error) return { ok: false, error: errorCopy("generic") };
  revalidatePath("/me");
  return { ok: true };
}

const MAX_PHOTO = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Profile photo upload. The browser has already resized it and run face
 * detection; we store it as PENDING (service role — no client storage policy
 * exists) and it only shows once an admin approves it.
 */
export async function uploadAvatarAction(form: FormData): Promise<Result> {
  const file = form.get("file");
  const score = Number(form.get("score"));
  const faces = Number(form.get("faces"));
  if (!(file instanceof File)) return { ok: false, error: errorCopy("generic") };
  if (file.size > MAX_PHOTO) return { ok: false, error: copy.photo.tooBig };
  if (!TYPES.includes(file.type)) return { ok: false, error: copy.photo.badType };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: errorCopy("not_authenticated") };

  const admin = createAdminClient();
  const { data: prof } = await admin.from("profiles").select("avatar_pending_path").eq("id", user.id).single();

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await admin.storage.from("avatars").upload(path, file, { contentType: file.type, upsert: false });
  if (upErr) {
    console.error("avatar upload failed", upErr.message);
    return { ok: false, error: errorCopy("generic") };
  }
  if (prof?.avatar_pending_path) await admin.storage.from("avatars").remove([prof.avatar_pending_path]);

  await admin
    .from("profiles")
    .update({
      avatar_pending_path: path,
      avatar_status: "pending",
      avatar_face_score: Number.isFinite(score) ? score : null,
      avatar_faces_found: Number.isFinite(faces) ? faces : null,
      avatar_reject_reason: null,
    })
    .eq("id", user.id);

  revalidatePath("/me");
  return { ok: true };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

/** Permanently deletes the account. Audit rows survive with the person nulled. */
export async function deleteAccountAction(confirmText: string): Promise<Result> {
  if (confirmText.trim().toUpperCase() !== "DELETE") return { ok: false, error: copy.profile.deleteType };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: errorCopy("not_authenticated") };

  const admin = createAdminClient();
  // remove stored files first (avatars + any verification media)
  for (const bucket of ["avatars", "verification"] as const) {
    const { data: files } = await admin.storage.from(bucket).list(user.id, { limit: 100 });
    if (files?.length) await admin.storage.from(bucket).remove(files.map((f) => `${user.id}/${f.name}`));
  }
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("delete account failed", error.message);
    return { ok: false, error: errorCopy("generic") };
  }
  await supabase.auth.signOut();
  return { ok: true };
}
