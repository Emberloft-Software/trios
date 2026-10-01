import { Minus, Plus } from "lucide-react";

/** Numbered card wrapping one step of the create-gig form. */
export function Step({ n, title, sub, children }: { n: number; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="glass rounded-[1.75rem] p-5 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-coral text-[0.8125rem] font-bold text-white">{n}</span>
        <div>
          <h2 className="text-[1.0625rem] font-bold">{title}</h2>
          {sub && <p className="text-[0.8125rem] text-muted">{sub}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

/** −/+ number control. */
export function Stepper({
  value,
  min,
  max,
  onChange,
  label,
  zeroLabel,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  label: string;
  zeroLabel?: string;
}) {
  return (
    <div className="flex items-center gap-4" role="group" aria-label={label}>
      <button type="button" aria-label="Fewer" disabled={value <= min} onClick={() => onChange(value - 1)}
        className="grid h-11 w-11 place-items-center rounded-full bg-white text-plum ring-1 ring-line transition hover:bg-plum-50 disabled:opacity-40">
        <Minus className="h-5 w-5" />
      </button>
      <span className="min-w-16 text-center text-[1.75rem] font-extrabold text-plum tabular" aria-live="polite">
        {value === 0 && zeroLabel ? <span className="text-[1rem] font-bold">{zeroLabel}</span> : value}
      </span>
      <button type="button" aria-label="More" disabled={value >= max} onClick={() => onChange(value + 1)}
        className="grid h-11 w-11 place-items-center rounded-full bg-white text-plum ring-1 ring-line transition hover:bg-plum-50 disabled:opacity-40">
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );
}
