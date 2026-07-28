import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * CSV export of the partner report (docs/07). Re-checks admin server-side.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!me?.is_admin) return NextResponse.json({ error: "not found" }, { status: 404 });

  const admin = createAdminClient();
  const { data: venues } = await admin
    .from("venues")
    .select("id, name, slug")
    .eq("is_partner", true)
    .order("name");

  const lines = ["venue,slug,crews_sent,people_sent,perks_redeemed"];
  for (const v of venues ?? []) {
    const [{ data: gigs }, { count: perks }] = await Promise.all([
      admin.from("gigs").select("claimed_count").eq("venue_id", v.id).in("status", ["locked", "completed"]),
      admin.from("perk_redemptions").select("id", { count: "exact", head: true }).eq("venue_id", v.id),
    ]);
    const crews = (gigs ?? []).length;
    const people = (gigs ?? []).reduce((s, g) => s + (g.claimed_count ?? 0), 0);
    const name = `"${v.name.replace(/"/g, '""')}"`;
    lines.push(`${name},${v.slug},${crews},${people},${perks ?? 0}`);
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="trio-partners-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
