import { BoardHero } from "@/components/marketing/BoardHero";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { copy } from "@/lib/copy";

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-16">
      {/* Board hero — headline left, live board does the explaining */}
      <section className="grid items-center gap-10 py-8 lg:grid-cols-2 lg:py-14">
        <div>
          <h1 className="whitespace-pre-line font-display text-[clamp(2.75rem,7vw,4.5rem)] font-800 leading-[0.95] tracking-[-0.03em]">
            {copy.landing.heroTitle}
          </h1>
          <p className="mt-5 max-w-md text-[1.0625rem] text-[var(--color-ink)]">
            {copy.landing.heroSub}
          </p>
          <div className="mt-7">
            <ButtonLink href="/sign-in">{copy.landing.signUpCta}</ButtonLink>
          </div>
        </div>
        <BoardHero />
      </section>

      {/* How it works — three pinned index cards, numbered (it is a sequence) */}
      <section className="py-12">
        <h2 className="mb-6 font-display text-[clamp(1.75rem,4vw,2.5rem)] font-700">
          How it works
        </h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {copy.landing.howItWorks.map((step, i) => (
            <Card key={step.n} pinned tiltIndex={i} className="p-5">
              <span className="font-data mb-2 inline-block rounded-[var(--radius-tile)] border-2 border-[var(--color-ink)] bg-[var(--color-line)] px-2 text-lg">
                {step.n}
              </span>
              <h3 className="mb-1 font-display text-[1.25rem] font-600">{step.title}</h3>
              <p className="text-[0.9375rem]">{step.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* The three-person rule — honest safety design */}
      <section className="py-12">
        <Card className="p-7">
          <h2 className="mb-3 font-display text-[clamp(1.5rem,3.5vw,2rem)] font-700">
            Three people minimum. Always.
          </h2>
          <p className="max-w-2xl text-[1rem]">
            Three people can&apos;t be a date, and the third person is a witness. It&apos;s the
            rule everything else hangs off — no host picks who joins, slots go first-come, and
            faces only reveal once three are in.
          </p>
        </Card>
      </section>

      {/* What it's not — the platonic clause, with humour */}
      <section className="py-12">
        <Card pinned className="p-7">
          <h2 className="mb-3 font-display text-[clamp(1.5rem,3.5vw,2rem)] font-700">
            {copy.platonicClause.heading}
          </h2>
          <div className="max-w-2xl space-y-3 text-[1rem]">
            <p>{copy.platonicClause.body}</p>
            <p>{copy.platonicClause.body2}</p>
            <p>{copy.platonicClause.body3}</p>
          </div>
        </Card>
      </section>

      {/* Honest about being new — no fabricated social proof (docs/04) */}
      <section className="py-12">
        <p className="mb-6 max-w-2xl text-[1rem] text-[var(--color-dust)]">
          {copy.landing.noUsersYet}
        </p>
        <ButtonLink href="/sign-in">{copy.landing.signUpCta}</ButtonLink>
      </section>
    </div>
  );
}
