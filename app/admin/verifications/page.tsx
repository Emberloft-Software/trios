import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ReviewClient, type ReviewItem } from "./ReviewClient";
import { publicAvatarUrl } from "@/lib/avatar";
import { ageFrom, timeAgo } from "@/lib/time";
import { copy } from "@/lib/copy";
import { ids } from "../_lib";
import type { Challenge } from "@/app/(app)/me/verify/_actions";

export const metadata = { title: "Face verification — Admin" };

export default async function VerificationsPage() {
  const db = createAdminClient();
  const [{ data: requests }, { data: history }] = await Promise.all([
    db
      .from("verification_requests")
      .select("id, user_id, challenge, media_mime, media_bytes, device_hint, submitted_at, created_at")
      .eq("status", "pending")
      .not("media_path", "is", null)
      .order("submitted_at", { ascending: true })
      .limit(50),
    db
      .from("verification_requests")
      .select("id, user_id, status, review_note, reviewed_at, reviewer_id")
      .in("status", ["verified", "rejected"])
      .not("reviewed_at", "is", null)
      .order("reviewed_at", { ascending: false })
      .limit(20),
  ]);

  const rows = requests ?? [];
  const userIds = ids([...rows.map((r) => r.user_id), ...(history ?? []).map((h) => h.user_id), ...(history ?? []).map((h) => h.reviewer_id)]);
  const [{ data: profiles }, { data: crew }, { data: reports }, { data: priorAttempts }] = await Promise.all([
    db.from("profiles").select("id, display_name, handle, birth_date, gender, avatar_path, avatar_pending_path, avatar_status, created_at").in("id", userIds),
    db.from("gig_crew").select("user_id").in("user_id", userIds).in("state", ["attended", "claimed"]),
    db.from("reports").select("target_id").in("target_id", userIds),
    db.from("verification_requests").select("user_id").in("user_id", userIds).not("media_path", "is", null),
  ]);

  const byId = new Map((profiles ?? []).map((p) => [p.id, p]));
  const countBy = (list: { [k: string]: unknown }[] | null, key: string) => {
    const m = new Map<string, number>();
    (list ?? []).forEach((r) => m.set(r[key] as string, (m.get(r[key] as string) ?? 0) + 1));
    return m;
  };
  const gigs = countBy(crew, "user_id");
  const reps = countBy(reports, "target_id");
  const attempts = countBy(priorAttempts, "user_id");

  const items: ReviewItem[] = rows.map((r) => {
    const p = byId.get(r.user_id);
    return {
      id: r.id,
      userId: r.user_id,
      name: p?.display_name ?? "Unknown",
      handle: p?.handle ?? "",
      age: p?.birth_date ? ageFrom(p.birth_date) : null,
      gender: p?.gender ? copy.auth.genders[p.gender] : null,
      photoUrl: publicAvatarUrl(p?.avatar_path) ?? publicAvatarUrl(p?.avatar_pending_path),
      photoPending: !p?.avatar_path && p?.avatar_status === "pending",
      accountDays: p ? Math.floor((Date.now() - new Date(p.created_at).getTime()) / 864e5) : 0,
      gigCount: gigs.get(r.user_id) ?? 0,
      reportCount: reps.get(r.user_id) ?? 0,
      attempts: attempts.get(r.user_id) ?? 1,
      isVideo: (r.media_mime ?? "").startsWith("video"),
      mime: r.media_mime ?? "",
      bytes: r.media_bytes,
      device: r.device_hint,
      submittedAgo: r.submitted_at ? timeAgo(r.submitted_at) : timeAgo(r.created_at),
      challenge: r.challenge as unknown as Challenge,
    };
  });

  return (
    <div>
      <PageHeader
        title="Face verification"
        sub="Does the person do the two actions, read the code, and match their profile photo? Oldest first."
      />
      <ReviewClient items={items} />

      <section className="mt-12">
        <h2 className="mb-3 text-[1.125rem] font-bold">Recent decisions</h2>
        <ul className="glass divide-y divide-line rounded-3xl">
          {(history ?? []).length === 0 && <li className="p-5 text-[0.875rem] text-muted">No decisions yet.</li>}
          {(history ?? []).map((h) => (
            <li key={h.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-[0.875rem]">
              <Link href={`/admin/users/${h.user_id}`} className="font-semibold text-plum hover:underline">{byId.get(h.user_id)?.display_name ?? "Deleted user"}</Link>
              <Badge tone={h.status === "verified" ? "mint" : h.review_note?.startsWith("retake") ? "sun" : "coral"}>
                {h.status === "verified" ? "Approved" : h.review_note?.startsWith("retake") ? "Retake" : "Rejected"}
              </Badge>
              {h.review_note && h.status !== "verified" && (
                <span className="text-muted">{copy.verification.rejectReasons[h.review_note.replace("retake:", "").trim()] ?? h.review_note}</span>
              )}
              <span className="ml-auto text-[0.75rem] text-muted">
                {byId.get(h.reviewer_id ?? "")?.display_name ?? "—"} · {h.reviewed_at ? timeAgo(h.reviewed_at) : ""}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
