/* eslint-disable @next/next/no-img-element */
import { ButtonLink } from "@/components/ui/Button";
import { copy } from "@/lib/copy";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-10 pt-12">
      <img src="/brand/icon-rounded.png" alt="" width={96} height={96} className="rounded-[28%] shadow-[0_16px_40px_rgba(255,52,80,0.35)]" />
      <h1 className="mt-6 text-[clamp(2rem,5vw,3rem)] font-extrabold">{copy.about.title}</h1>
      <div className="glass mt-6 space-y-4 rounded-[2rem] p-7 text-[1.0625rem] leading-relaxed text-ink/85">
        {copy.about.body.map((p) => <p key={p}>{p}</p>)}
      </div>
      <ButtonLink href="/sign-in" size="lg" className="mt-8">{copy.landing.ctaPrimary}</ButtonLink>
    </div>
  );
}
