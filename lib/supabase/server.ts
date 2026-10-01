import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";

/**
 * Server client bound to the request's auth cookie. Use in Server Components,
 * server actions, and route handlers. Respects RLS as the signed-in user.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — cookie writes happen in
            // middleware instead. Safe to ignore.
          }
        },
      },
    },
  );
}

/**
 * The signed-in user, verified locally from the JWT (the project uses
 * asymmetric signing keys, so this is a signature check — no network round
 * trip to Supabase Auth). RLS still re-validates the token on every query.
 */
export async function currentUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<{ id: string; email: string | null } | null> {
  const { data } = await supabase.auth.getClaims();
  const sub = data?.claims?.sub;
  if (!sub) return null;
  return { id: sub, email: (data.claims.email as string | undefined) ?? null };
}
