/* eslint-disable @next/next/no-img-element */
import { ArrowRight, MapPin, ShieldCheck, Users } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { copy } from "@/lib/copy";

/**
 * Landing hero: full-width split. Plum text panel on the left, the rooftop
 * sunset illustration filling the right half (on phones it sits on top).
 * The art is ~735px wide, so it is never stretched wider than about half a
 * desktop screen, which keeps it sharp.
 */
export function Hero() {
  const l = copy.landing;
  return (
    <section className="grid border-b-2 border-plum lg:min-h-[min(86vh,760px)] lg:grid-cols-2">
      <div className="relative order-1 overflow-hidden border-b-2 border-plum bg-[#f3a3c4] lg:order-2 lg:border-b-0 lg:border-l-2">
        <img
          src="/photos/rooftop-sunset.webp"
          alt="Three friends sharing drinks on a rooftop at sunset"
          width={735}
          height={739}
          fetchPriority="high"
          className="aspect-square h-full w-full object-cover sm:aspect-[4/3] lg:absolute lg:inset-0 lg:aspect-auto"
        />
        <img
          src="/brand/icon-rounded.png"
          alt=""
          width={76}
          height={76}
          className="absolute bottom-5 right-5 hidden -rotate-6 rounded-[26%] sm:block border-2 border-plum shadow-[4px_4px_0_var(--color-plum)] lg:bottom-8 lg:right-8 lg:w-[88px]"
        />
      </div>

      <div className="bg-hero order-2 flex items-center px-5 py-12 text-white sm:px-10 lg:order-1 lg:py-16 lg:pl-[max(1.25rem,calc((100vw-72rem)/2+1.25rem))] lg:pr-12">
        <div className="max-w-xl animate-rise">
          <h1 className="text-[clamp(2.6rem,6.4vw,4.6rem)] font-extrabold leading-[1.0] text-white">
            {l.heroTitle}
            <br />
            <span className="text-[#ff7a92]">{l.heroAccent}</span>
          </h1>
          <p className="mt-5 text-[1.0625rem] leading-relaxed text-white/80">{l.heroSub}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/sign-in" size="lg" className="border-cream! shadow-[3px_3px_0_var(--color-sun)]! hover:shadow-[4px_4px_0_var(--color-sun)]!">
              {l.ctaPrimary} <ArrowRight className="h-4.5 w-4.5" />
            </ButtonLink>
            <ButtonLink href="/#how" size="lg" variant="secondary" className="border-cream! shadow-[3px_3px_0_var(--color-coral)]! hover:shadow-[4px_4px_0_var(--color-coral)]!">
              {l.ctaSecondary}
            </ButtonLink>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[0.75rem] font-bold text-white/85">
            <li className="inline-flex items-center gap-1.5"><Users className="h-4 w-4 text-sun" /> 3+ per gig</li>
            <li className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-sun" /> public places only</li>
            <li className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-sun" /> photos reviewed</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
