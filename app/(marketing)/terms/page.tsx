import { copy } from "@/lib/copy";

export const metadata = { title: "Terms — Trio" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="font-display text-[clamp(2rem,5vw,2.75rem)] font-700">{copy.legal.termsTitle}</h1>
      <p className="mt-3 text-[1rem] text-[var(--color-dust)]">{copy.legal.termsIntro}</p>
      <ol className="mt-8 space-y-6">
        {copy.legal.termsSections.map(([heading, body], i) => (
          <li key={heading}>
            <h2 className="font-display text-[1.25rem] font-600">
              {i + 1}. {heading}
            </h2>
            <p className="mt-1 text-[1rem]">{body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
