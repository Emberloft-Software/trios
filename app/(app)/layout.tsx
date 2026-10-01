import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth";
import { publicAvatarUrl } from "@/lib/avatar";
import { AppNav } from "@/components/app/AppNav";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user, profile } = await getViewer();
  if (!user) redirect("/sign-in");
  // Age + gender drive what gigs you can see — get them before anything else.
  if (!profile?.birth_date || !profile.gender) redirect("/onboarding");

  const { count: unread } = await supabase
    .from("notification_outbox")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);

  return (
    <div className="min-h-dvh pb-[calc(5.5rem+var(--safe-bottom))] md:pb-10">
      <AppNav
        name={profile.display_name}
        avatarUrl={publicAvatarUrl(profile.avatar_path)}
        isAdmin={profile.is_admin}
        unread={unread ?? 0}
      />
      <main className="mx-auto w-full max-w-6xl px-4 pt-5 sm:px-6 md:pt-8">{children}</main>
      <InstallPrompt />
    </div>
  );
}
