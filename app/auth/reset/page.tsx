import { AuthShell } from "@/components/app/AuthShell";
import { ButtonLink } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { copy } from "@/lib/copy";
import { ConfirmResetButton } from "./ConfirmResetButton";

export const metadata = { title: "Reset password" };
export const dynamic = "force-dynamic";

/**
 * Landing for password-reset emails. Opening it does NOT use the link: email
 * scanners and link previews open URLs automatically, which would burn a
 * one-time link before the person clicks. Only pressing the button (a POST)
 * verifies it. Also shows failed links that Supabase bounces back.
 */
export default async function ResetLandingPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; token_hash?: string; type?: string; error_code?: string }>;
}) {
  const sp = await searchParams;
  const c = copy.auth;
  const code = sp.code && sp.code.length < 200 ? sp.code : null;
  const tokenHash = sp.token_hash && sp.token_hash.length < 200 && sp.type === "recovery" ? sp.token_hash : null;

  return (
    <AuthShell>
      {!sp.error_code && (code || tokenHash) ? (
        <div className="animate-rise">
          <h1 className="text-[1.875rem] font-extrabold">{c.resetConfirmTitle}</h1>
          <p className="mt-1 text-[0.9375rem] text-muted">{c.resetConfirmSub}</p>
          <ConfirmResetButton code={code} tokenHash={tokenHash} />
        </div>
      ) : (
        <div className="animate-rise">
          <h1 className="text-[1.875rem] font-extrabold">{c.linkErrorTitle}</h1>
          <Notice tone="warn" className="mt-5">{c.linkError}</Notice>
          <ButtonLink href="/sign-in?mode=reset" size="lg" block className="mt-5">{c.resetAgain}</ButtonLink>
          <ButtonLink href="/sign-in?mode=signin" variant="ghost" block className="mt-2">{c.signInInstead}</ButtonLink>
        </div>
      )}
    </AuthShell>
  );
}
