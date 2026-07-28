import { createAdminClient } from "@/lib/supabase/admin";
import { ReviewClient, type ReviewItem } from "./ReviewClient";
import { publicAvatarUrl } from "@/lib/avatar";
import type { Challenge } from "@/app/(app)/me/verify/_actions";

export const metadata = { title: "Verifications — Trio admin" };

/**
 * Liveness review queue (docs/05, docs/07), oldest first. Reads via the service
 * role. The recording itself is NOT loaded here — the client fetches a fresh
 * 60-second signed URL per item from the API route.
 */
export default async function VerificationsPage() {
  const admin = createAdminClient();

  const { data: requests } = await admin
    .from("verification_requests")
    .select("id, user_id, challenge, media_mime, created_at")
    .eq("status", "pending")
    .not("media_path", "is", null)
    .order("created_at", { ascending: true })
    .limit(50);

  const rows = requests ?? [];
  const userIds = [...new Set(rows.map((r) => r.user_id))];

  const [{ data: profiles }, { data: attendedRows }, { data: reportRows }] = await Promise.all([
    admin.from("profiles").select("id, display_name, avatar_path, created_at").in("id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]),
    admin.from("gig_crew").select("user_id").in("user_id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]).eq("state", "attended"),
    admin.from("reports").select("target_id").in("target_id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]),
  ]);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const gigCount = new Map<string, number>();
  (attendedRows ?? []).forEach((r) => gigCount.set(r.user_id, (gigCount.get(r.user_id) ?? 0) + 1));
  const reportCount = new Map<string, number>();
  (reportRows ?? []).forEach((r) => reportCount.set(r.target_id, (reportCount.get(r.target_id) ?? 0) + 1));

  const items: ReviewItem[] = rows.map((r) => {
    const p = profileById.get(r.user_id);
    const accountDays = p
      ? Math.max(0, Math.floor((Date.now() - new Date(p.created_at).getTime()) / 86400000))
      : 0;
    return {
      id: r.id,
      userId: r.user_id,
      name: p?.display_name ?? "Someone",
      photoUrl: publicAvatarUrl(p?.avatar_path),
      accountDays,
      gigCount: gigCount.get(r.user_id) ?? 0,
      reportCount: reportCount.get(r.user_id) ?? 0,
      isVideo: (r.media_mime ?? "").startsWith("video"),
      challenge: r.challenge as unknown as Challenge,
    };
  });

  return (
    <div>
      <h1 className="mb-2 font-display text-[2rem] font-700">Verifications</h1>
      <p className="mb-6 text-[0.875rem] text-[var(--color-dust)]">
        Oldest first. Shortcuts: <span className="font-data">A</span> approve ·{" "}
        <span className="font-data">R</span> reject · <span className="font-data">J</span>/
        <span className="font-data">K</span> next/previous.
      </p>
      <ReviewClient items={items} />
    </div>
  );
}
