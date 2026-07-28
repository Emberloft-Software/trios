import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { brand } from "@/lib/brand";
import { copy } from "@/lib/copy";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/" className="font-display text-2xl font-800 tracking-[-0.03em]">
          {brand.name}
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/safety" className="text-[0.9375rem] text-[var(--color-net)] hover:underline">
            Safety
          </Link>
          <ButtonLink href="/sign-in" variant="secondary">
            {copy.nav.signIn}
          </ButtonLink>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="mx-auto max-w-6xl px-5 py-10 text-[0.875rem] text-[var(--color-dust)]">
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/about" className="hover:underline">About</Link>
          <Link href="/safety" className="hover:underline">Safety</Link>
          <Link href="/terms" className="hover:underline">Terms</Link>
          <span>·</span>
          <span>{brand.city} only, for now.</span>
        </div>
      </footer>
    </div>
  );
}
