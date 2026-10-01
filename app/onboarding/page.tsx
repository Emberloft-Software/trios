import { redirect } from "next/navigation";
import { AuthShell } from "@/components/app/AuthShell";
import { getViewer } from "@/lib/auth";
import { OnboardingForm } from "./OnboardingForm";

export const metadata = { title: "Finish setting up" };

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { user, profile } = await getViewer();
  if (!user) redirect("/sign-in");
  const { next } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/feed";
  if (profile?.birth_date && profile.gender) redirect(safeNext);
  return (
    <AuthShell>
      <OnboardingForm next={safeNext} />
    </AuthShell>
  );
}
