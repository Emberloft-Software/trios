import { NextResponse, type NextRequest } from "next/server";
import { requireAdminId } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Mints a 60-second signed URL for one verification recording. Admin
 * re-checked here (the layout guard isn't authorisation); non-admins get a
 * 404 so the route isn't confirmed. Never cached.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const adminId = await requireAdminId();
  if (!adminId) return NextResponse.json({ error: "not found" }, { status: 404 });

  const db = createAdminClient();
  const { data: row } = await db.from("verification_requests").select("media_path, media_purged_at").eq("id", id).maybeSingle();
  if (!row?.media_path || row.media_purged_at) return NextResponse.json({ error: "no media" }, { status: 404 });

  const { data: signed, error } = await db.storage.from("verification").createSignedUrl(row.media_path, 60);
  if (error || !signed) return NextResponse.json({ error: "sign failed" }, { status: 500 });

  await db.from("admin_audit").insert({ admin_id: adminId, action: "verification.view_media", target_type: "verification", target_id: id });
  return NextResponse.json({ url: signed.signedUrl }, { headers: { "Cache-Control": "no-store" } });
}
