import { AuthShell } from "@/components/app/AuthShell";
import { SignInForm } from "./SignInForm";

export const metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; mode?: string; error?: string }>;
}) {
  const { next, mode } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/feed";

  return (
    <AuthShell>
      <SignInForm next={safeNext} initialMode={mode === "signin" ? "signin" : mode === "reset" ? "reset" : "signup"} />
    </AuthShell>
  );
}
