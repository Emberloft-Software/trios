import { CheckCircle2, Phone, ShieldCheck, ShieldX, XCircle } from "lucide-react";
import { Notice } from "@/components/ui/Notice";
import { copy } from "@/lib/copy";

export const metadata = { title: "Safety" };

export default function SafetyPage() {
  const s = copy.safety;
  return (
    <div className="mx-auto max-w-4xl px-5 pb-10 pt-12">
      <h1 className="text-[clamp(2rem,5vw,3rem)] font-extrabold">{s.title}</h1>
      <p className="mt-3 max-w-2xl text-[1.0625rem] text-muted">{s.intro}</p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <section className="glass rounded-[1.75rem] p-6">
          <h2 className="flex items-center gap-2 text-[1.125rem] font-bold"><ShieldCheck className="h-5 w-5 text-mint" /> {s.weCheckTitle}</h2>
          <ul className="mt-4 space-y-2.5 text-[0.9375rem]">
            {s.weCheck.map((x) => (
              <li key={x} className="flex gap-2.5"><CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-mint" />{x}</li>
            ))}
          </ul>
        </section>
        <section className="glass rounded-[1.75rem] p-6">
          <h2 className="flex items-center gap-2 text-[1.125rem] font-bold"><ShieldX className="h-5 w-5 text-coral" /> {s.weDontTitle}</h2>
          <ul className="mt-4 space-y-2.5 text-[0.9375rem]">
            {s.weDont.map((x) => (
              <li key={x} className="flex gap-2.5"><XCircle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-coral" />{x}</li>
            ))}
          </ul>
          <p className="mt-4 text-[0.8125rem] text-muted">{copy.verification.meaning}</p>
        </section>
      </div>

      <section className="bg-hero mt-5 rounded-[1.75rem] p-7 text-white">
        <h2 className="text-[1.375rem] font-bold text-white">{s.tipsTitle}</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {s.meetingTips.map((x) => (
            <li key={x} className="glass-dark rounded-2xl p-4 text-[0.9375rem] text-white/90">{x}</li>
          ))}
        </ul>
      </section>

      <section className="glass mt-5 rounded-[1.75rem] p-7">
        <h2 className="text-[1.375rem] font-bold">{s.rulesTitle}</h2>
        <ol className="mt-4 space-y-2.5 text-[0.9375rem]">
          {s.rules.map((x, i) => (
            <li key={x} className="flex gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-coral text-[0.75rem] font-bold text-white">{i + 1}</span>
              {x}
            </li>
          ))}
        </ol>
      </section>

      <Notice tone="danger" className="mt-5" title={<span className="inline-flex items-center gap-1.5"><Phone className="h-4 w-4" /> Emergency</span>}>
        {s.emergency}
      </Notice>
      <Notice tone="warn" className="mt-3">{copy.disclaimers.chat}</Notice>
    </div>
  );
}
