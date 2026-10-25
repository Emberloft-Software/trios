import { AuthShell } from "@/components/app/AuthShell";
import { Notice } from "@/components/ui/Notice";
import { copy } from "@/lib/copy";
import { SignInForm } from "./SignInForm";

export const metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; mode?: string; error?: string; reset?: string }>;
}) {
  const { next, mode, reset } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/feed";

  return (
    <AuthShell>
      {reset === "done" && <Notice tone="safe" className="mb-4">{copy.auth.newPasswordDone}</Notice>}
      <SignInForm next={safeNext} initialMode={mode === "signin" ? "signin" : mode === "reset" ? "reset" : "signup"} />
    </AuthShell>
  );
}
