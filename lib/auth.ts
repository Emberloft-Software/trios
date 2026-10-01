import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * The signed-in user + their own profile row, memoised per request so layouts
 * and pages can both ask without a second round trip.
 */
export const getViewer = cache(async () => {
  const supabase = await createClient();
  // Local JWT verification (no Auth server round trip); RLS still validates
  // the token on every database query.
  const { data: claimsData } = await supabase.auth.getClaims();
  const sub = claimsData?.claims?.sub;
  if (!sub) return { supabase, user: null, profile: null } as const;
  const user = { id: sub, email: (claimsData.claims.email as string | undefined) ?? null };

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, handle, display_name, bio, birth_date, gender, city, interests, avatar_path, avatar_pending_path, avatar_status, avatar_reject_reason, verification_status, reliability_band, is_admin, suspended_until, created_at",
    )
    .eq("id", user.id)
    .maybeSingle();

  return { supabase, user, profile } as const;
});

/** Server-side admin re-check for actions/route handlers. Returns the admin's id or null. */
export async function requireAdminId(): Promise<string | null> {
  const { user, profile } = await getViewer();
  if (!user || !profile?.is_admin) return null;
  return user.id;
}
