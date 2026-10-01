import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";

/**
 * Refreshes the auth session on every request and enforces route gates.
 * Two gates for /admin (docs/07): unauthenticated → redirected here; the
 * is_admin check + 404 lives in app/admin/layout.tsx (and every admin action
 * re-checks server-side — the layout guard is not authorisation).
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: getUser() revalidates the token against Supabase Auth.
  // Do not trust getSession() in server code.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected = ["/feed", "/gigs", "/me", "/admin", "/notifications", "/onboarding"].some(
    (p) => path === p || path.startsWith(`${p}/`),
  );

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.search = "";
    url.searchParams.set("next", path + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  // Signed-in people hitting the auth page go straight to the app.
  if (user && path === "/sign-in") {
    const url = request.nextUrl.clone();
    const next = request.nextUrl.searchParams.get("next");
    url.pathname = next && next.startsWith("/") && !next.startsWith("//") ? next.split("?")[0] : "/feed";
    url.search = next && next.includes("?") ? next.slice(next.indexOf("?")) : "";
    return NextResponse.redirect(url);
  }

  return response;
}
