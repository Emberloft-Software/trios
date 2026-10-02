/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { copy } from "@/lib/copy";
import { MadeBy } from "@/components/marketing/MadeBy";

/** Split layout for auth screens: plum brand panel on desktop, form on glass. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="bg-hero relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <Logo tone="white" href="/" />
        <div className="relative z-10 max-w-md">
          <img src="/brand/icon-rounded.png" alt="" width={120} height={120} className="mb-8 rounded-[28%] shadow-[0_20px_60px_rgba(255,52,80,0.45)] animate-float" />
          <h2 className="text-[2.5rem] font-extrabold leading-tight text-white">
            {copy.landing.heroTitle}
            <br />
            <span className="text-gradient">{copy.landing.heroAccent}</span>
          </h2>
          <p className="mt-4 text-[1.0625rem] text-white/75">{copy.platonicClause.body}</p>
        </div>
        <p className="relative z-10 text-[0.8125rem] text-white/50">{copy.disclaimers.meetPublic}</p>
      </aside>
      <main className="flex flex-col px-4 pb-10 pt-[calc(1.25rem+var(--safe-top))] sm:px-8">
        <div className="lg:hidden">
          <Logo href="/" />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">{children}</div>
        <nav className="flex justify-center gap-5 text-[0.8125rem] text-muted">
          <Link href="/terms" className="hover:text-plum">Terms</Link>
          <Link href="/privacy" className="hover:text-plum">Privacy</Link>
          <Link href="/safety" className="hover:text-plum">Safety</Link>
        </nav>
        <div className="mt-3 flex justify-center"><MadeBy /></div>
      </main>
    </div>
  );
}
