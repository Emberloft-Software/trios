import type { LegalSection } from "@/lib/legal";

/** Long-form legal page with a sticky table of contents on desktop. */
export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-10 pt-12">
      <header className="max-w-3xl">
        <h1 className="text-[clamp(2rem,5vw,3rem)] font-extrabold">{title}</h1>
        <p className="mt-2 text-[0.875rem] font-semibold text-muted">Last updated {updated}</p>
        <p className="mt-5 text-[1.0625rem] leading-relaxed text-ink/85">{intro}</p>
      </header>
      <div className="mt-10 grid gap-8 lg:grid-cols-[240px_1fr]">
        <nav aria-label="Contents" className="hidden lg:block">
          <ol className="glass sticky top-24 space-y-1 rounded-3xl p-4 text-[0.8125rem]">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="block rounded-xl px-2 py-1.5 font-medium text-muted hover:bg-white/70 hover:text-plum">
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <article className="glass space-y-8 rounded-[2rem] p-6 sm:p-10">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="text-[1.25rem] font-bold">{s.title}</h2>
              <div className="mt-3 space-y-3 text-[0.9375rem] leading-relaxed text-ink/85">
                {s.body.map((b, i) =>
                  Array.isArray(b) ? (
                    <ul key={i} className="list-disc space-y-1.5 pl-5 marker:text-coral">
                      {b.map((li) => <li key={li}>{li}</li>)}
                    </ul>
                  ) : (
                    <p key={i}>{b}</p>
                  ),
                )}
              </div>
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
