import { Card } from "@/components/ui/Card";
import { copy } from "@/lib/copy";

export const metadata = { title: "Safety — Trio" };

export default function SafetyPage() {
  const s = copy.safety;
  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="font-display text-[clamp(2rem,5vw,2.75rem)] font-700">{s.title}</h1>
      <p className="mt-3 text-[1.0625rem] text-[var(--color-dust)]">{s.intro}</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 font-display text-[1.25rem] font-600">What we check</h2>
          <ul className="space-y-2 text-[0.9375rem]">
            {s.weCheck.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 font-display text-[1.25rem] font-600">What we don&apos;t</h2>
          <ul className="space-y-2 text-[0.9375rem]">
            {s.weDont.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </Card>
      </div>

      <Card className="mt-5 p-5">
        <p className="text-[0.9375rem]">{s.verifiedMeans}</p>
      </Card>

      <h2 className="mt-10 font-display text-[1.5rem] font-700">Meeting someone new</h2>
      <ul className="mt-3 space-y-2 text-[1rem]">
        {s.meetingTips.map((t) => <li key={t}>{t}</li>)}
      </ul>

      <h2 className="mt-10 font-display text-[1.5rem] font-700">The rules</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-[1rem]">
        {s.rules.map((t) => <li key={t}>{t}</li>)}
      </ol>
    </div>
  );
}
