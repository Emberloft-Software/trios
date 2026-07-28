import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { autocomplete } from "@/lib/places";

/**
 * Places Autocomplete proxy. Keeps the Maps key server-side and forwards the
 * caller's session token so the whole search bills as one session. Auth-gated —
 * only signed-in users pick venues.
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q") ?? "";
  const token = req.nextUrl.searchParams.get("token") ?? "";
  if (!token) return NextResponse.json({ suggestions: [] });

  try {
    const suggestions = await autocomplete(q, token);
    return NextResponse.json({ suggestions }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
