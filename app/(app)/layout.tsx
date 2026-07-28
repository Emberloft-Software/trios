import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { brand } from "@/lib/brand";
import { copy } from "@/lib/copy";
import { SignOutButton } from "@/components/app/SignOutButton";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b-2 border-[var(--color-ink)] bg-[var(--color-court)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
          <Link href="/feed" className="font-display text-xl font-800 tracking-[-0.03em]">
            {brand.name}
          </Link>
          <nav className="flex items-center gap-4 text-[0.9375rem]">
            <Link href="/feed" className="hover:underline">{copy.nav.feed}</Link>
            <Link href="/gigs/new" className="hover:underline">{copy.nav.newGig}</Link>
            <Link href="/me/friends" className="hover:underline">{copy.friends.title}</Link>
            <Link href="/me" className="hover:underline">{copy.nav.me}</Link>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-6">{children}</main>
    </div>
  );
}
