import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Mints a 60-second signed URL for a verification recording, per view.
 * (docs/05, docs/07). The URL is never stored in page props or cached — it's
 * fetched fresh each time the reviewer opens an item.
 *
 * Two checks: the caller must be authenticated AND is_admin (re-checked here,
 * server-side — the admin layout guard is not authorisation). Media itself is
 * read via the service role; the bucket is private with no client read policy.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) {
    // 404, not 403 — don't confirm the route exists (docs/07)
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const admin = createAdminClient();
  const { data: reqRow } = await admin
    .from("verification_requests")
    .select("media_path, media_purged_at")
    .eq("id", id)
    .maybeSingle();

  if (!reqRow?.media_path || reqRow.media_purged_at) {
    return NextResponse.json({ error: "no media" }, { status: 404 });
  }

  const { data: signed, error } = await admin.storage
    .from("verification")
    .createSignedUrl(reqRow.media_path, 60);

  if (error || !signed) {
    return NextResponse.json({ error: "sign failed" }, { status: 500 });
  }

  return NextResponse.json(
    { url: signed.signedUrl },
    { headers: { "Cache-Control": "no-store" } },
  );
}
