import { redirect } from "next/navigation";
import { AuthShell } from "@/components/app/AuthShell";
import { getViewer } from "@/lib/auth";
import { ResetForm } from "./ResetForm";

export const metadata = { title: "New password" };

export default async function ResetPasswordPage() {
  const { user } = await getViewer();
  if (!user) redirect("/sign-in?mode=reset");
  return (
    <AuthShell>
      <ResetForm />
    </AuthShell>
  );
}
