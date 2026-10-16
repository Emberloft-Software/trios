import { notFound, redirect } from "next/navigation";
import { AuthShell } from "@/components/app/AuthShell";
import { getViewer } from "@/lib/auth";
import { AdminMfa } from "./AdminMfa";

export const metadata = { title: "Admin verification" };
export const dynamic = "force-dynamic";

/**
 * Second factor for admins. /admin redirects here until this session has been
 * verified with an authenticator app (aal2). First visit enrols the app.
 */
export default async function AdminVerifyPage() {
  const { supabase, user, profile } = await getViewer();
  if (!user) redirect("/sign-in?mode=signin&next=/admin");
  if (!profile?.is_admin) notFound();
  if (user.aal === "aal2") redirect("/admin");

  const { data } = await supabase.auth.mfa.listFactors();
  const factor = data?.totp?.find((f) => f.status === "verified") ?? null;

  return (
    <AuthShell>
      <AdminMfa mode={factor ? "challenge" : "enroll"} factorId={factor?.id ?? null} />
    </AuthShell>
  );
}
