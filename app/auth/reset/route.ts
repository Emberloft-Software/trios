import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { issueResetTicket } from "@/lib/reset-ticket";

export const dynamic = "force-dynamic";

/**
 * Landing for password-reset emails. Verifies the link (PKCE `code`, or
 * `token_hash` if the email template is switched to it), then immediately
 * signs that session out and gives the browser a single-use 15-minute reset
 * ticket. Opening the link never signs anyone into the app.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const fail = () => NextResponse.redirect(`${url.origin}/reset-password?expired=1`);

  const supabase = await createClient();
  let userId: string | null = null;
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) userId = data.user?.id ?? null;
  } else if (tokenHash && url.searchParams.get("type") === "recovery") {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
    if (!error) userId = data.user?.id ?? null;
  }
  if (!userId) return fail();

  await supabase.auth.signOut({ scope: "local" }); // discard the link's login session
  try {
    await issueResetTicket(userId, url.protocol === "https:");
  } catch (e) {
    console.error(e);
    return fail();
  }
  return NextResponse.redirect(`${url.origin}/reset-password`);
}
