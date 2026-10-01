import { createAdminClient } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/ui/Card";
import { publicAvatarUrl } from "@/lib/avatar";
import { ageFrom, timeAgo } from "@/lib/time";
import { copy } from "@/lib/copy";
import { PhotoQueue, type PhotoItem } from "./PhotoQueue";

export const metadata = { title: "Profile photos · Admin" };

export default async function PhotosPage() {
  const db = createAdminClient();
  const { data } = await db
    .from("profiles")
    .select("id, display_name, handle, birth_date, gender, avatar_path, avatar_pending_path, avatar_face_score, avatar_faces_found, created_at")
    .eq("avatar_status", "pending")
    .not("avatar_pending_path", "is", null)
    .order("created_at", { ascending: true })
    .limit(60);

  const items: PhotoItem[] = (data ?? []).map((p) => ({
    userId: p.id,
    name: p.display_name,
    handle: p.handle,
    age: p.birth_date ? ageFrom(p.birth_date) : null,
    gender: p.gender ? copy.auth.genders[p.gender] : null,
    pendingUrl: publicAvatarUrl(p.avatar_pending_path)!,
    currentUrl: publicAvatarUrl(p.avatar_path),
    faceScore: p.avatar_face_score,
    faces: p.avatar_faces_found,
    joined: timeAgo(p.created_at),
  }));

  return (
    <div>
      <PageHeader
        title="Profile photos"
        sub="Approve only a clear, real photo of one person's face that looks like a genuine photo of the account holder. The on-device face check score is a hint, not a verdict."
      />
      <PhotoQueue items={items} />
    </div>
  );
}
