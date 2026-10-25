import { AuthShell } from "@/components/app/AuthShell";
import { ButtonLink } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { copy } from "@/lib/copy";
import { maskEmail, peekResetTicket } from "@/lib/reset-ticket";
import { ResetForm } from "./ResetForm";

export const metadata = { title: "New password" };
export const dynamic = "force-dynamic";

/** Only usable with a valid reset ticket from /auth/reset; a login session isn't enough. */
export default async function ResetPasswordPage() {
  const ticket = await peekResetTicket();
  const c = copy.auth;
  return (
    <AuthShell>
      {ticket ? (
        <ResetForm email={maskEmail(ticket.email)} />
      ) : (
        <div className="animate-rise">
          <h1 className="text-[1.875rem] font-extrabold">{c.resetExpiredTitle}</h1>
          <Notice tone="warn" className="mt-5">{c.resetExpired}</Notice>
          <ButtonLink href="/sign-in?mode=reset" size="lg" block className="mt-5">{c.resetAgain}</ButtonLink>
        </div>
      )}
    </AuthShell>
  );
}
