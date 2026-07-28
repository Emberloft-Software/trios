import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * SERVICE ROLE client. Bypasses RLS. SERVER-ONLY.
 *
 * CLAUDE.md hard rule #2: the service role key never reaches the browser.
 * The `server-only` import above makes this file un-importable from a client
 * component — the build fails if you try. Use only in route handlers, admin
 * server actions (after an is_admin re-check), and Edge Functions.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
