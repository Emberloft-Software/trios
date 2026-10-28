import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { brand } from "@/lib/brand";
import { copy } from "@/lib/copy";
import { MadeBy } from "@/components/marketing/MadeBy";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      {/* retro menubar */}
      <header className="sticky top-0 z-40 border-b-2 border-plum bg-cream pt-[var(--safe-top)]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-5">
          <Logo size="sm" />
          <nav className="hidden items-center gap-1 font-mono text-[0.8125rem] font-bold text-plum md:flex">
            <Link href="/#how" className="rounded-md border-2 border-transparent px-2.5 py-1 hover:border-plum hover:bg-sun-100">{copy.landing.howTitle}</Link>
            <Link href="/safety" className="rounded-md border-2 border-transparent px-2.5 py-1 hover:border-plum hover:bg-sun-100">Safety</Link>
            <Link href="/about" className="rounded-md border-2 border-transparent px-2.5 py-1 hover:border-plum hover:bg-sun-100">About</Link>
          </nav>
          <div className="flex items-center gap-2">
            <ButtonLink href="/sign-in?mode=signin" variant="ghost" size="sm">{copy.nav.signIn}</ButtonLink>
            <ButtonLink href="/sign-in" size="sm">{copy.nav.getStarted}</ButtonLink>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="mt-16 border-t-2 border-plum bg-cream">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo size="sm" />
            <p className="mt-3 max-w-sm text-[0.8125rem] leading-relaxed text-muted">{copy.disclaimers.footer}</p>
          </div>
          <div className="text-[0.875rem]">
            <p className="eyebrow mb-2 text-plum">{brand.name}</p>
            <ul className="space-y-1.5 text-muted">
              <li><Link href="/about" className="hover:text-plum">About</Link></li>
              <li><Link href="/safety" className="hover:text-plum">Safety</Link></li>
              <li><Link href="/sign-in" className="hover:text-plum">{copy.nav.getStarted}</Link></li>
            </ul>
          </div>
          <div className="text-[0.875rem]">
            <p className="eyebrow mb-2 text-plum">Legal</p>
            <ul className="space-y-1.5 text-muted">
              <li><Link href="/terms" className="hover:text-plum">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-plum">Privacy Policy</Link></li>
              <li><a href={`mailto:${brand.email}`} className="hover:text-plum">{brand.email}</a></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 border-t-2 border-plum/15 px-5 py-4 text-center font-mono text-[0.6875rem] text-muted sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {brand.name} · {brand.city}, {brand.country} · 18+</p>
          <MadeBy />
        </div>
      </footer>
    </div>
  );
}
