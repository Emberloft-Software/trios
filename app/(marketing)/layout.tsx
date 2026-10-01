import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { brand } from "@/lib/brand";
import { copy } from "@/lib/copy";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 px-3 pt-[calc(0.75rem+var(--safe-top))]">
        <div className="glass-strong mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 rounded-full pl-4 pr-2">
          <Logo size="sm" />
          <nav className="hidden items-center gap-1 text-[0.9375rem] font-semibold text-plum md:flex">
            <Link href="/#how" className="rounded-full px-3 py-2 hover:bg-plum/5">{copy.landing.howTitle}</Link>
            <Link href="/safety" className="rounded-full px-3 py-2 hover:bg-plum/5">Safety</Link>
            <Link href="/about" className="rounded-full px-3 py-2 hover:bg-plum/5">About</Link>
          </nav>
          <div className="flex items-center gap-1.5">
            <ButtonLink href="/sign-in?mode=signin" variant="ghost" size="sm">{copy.nav.signIn}</ButtonLink>
            <ButtonLink href="/sign-in" size="sm">{copy.nav.getStarted}</ButtonLink>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="mt-16 border-t border-line bg-white/50 backdrop-blur">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo size="sm" />
            <p className="mt-3 max-w-sm text-[0.8125rem] leading-relaxed text-muted">{copy.disclaimers.footer}</p>
          </div>
          <div className="text-[0.875rem]">
            <p className="mb-2 font-bold text-plum">{brand.name}</p>
            <ul className="space-y-1.5 text-muted">
              <li><Link href="/about" className="hover:text-plum">About</Link></li>
              <li><Link href="/safety" className="hover:text-plum">Safety</Link></li>
              <li><Link href="/sign-in" className="hover:text-plum">{copy.nav.getStarted}</Link></li>
            </ul>
          </div>
          <div className="text-[0.875rem]">
            <p className="mb-2 font-bold text-plum">Legal</p>
            <ul className="space-y-1.5 text-muted">
              <li><Link href="/terms" className="hover:text-plum">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-plum">Privacy Policy</Link></li>
              <li><a href={`mailto:${brand.supportEmail}`} className="hover:text-plum">{brand.supportEmail}</a></li>
            </ul>
          </div>
        </div>
        <p className="border-t border-line px-5 py-4 text-center text-[0.75rem] text-muted">
          © {new Date().getFullYear()} {brand.name} · {brand.city}, {brand.country} · 18+
        </p>
      </footer>
    </div>
  );
}
