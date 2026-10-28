import { ActivityIcon } from "@/components/ui/ActivityIcon";

const PHONES = [
  { slug: "coffee", title: "Coffee, then a bookshop wander", meta: "SUN 10:00 · 2 of 4", bg: "bg-coral", ink: "text-white", rot: "-rotate-6" },
  { slug: "futsal", title: "5-a-side, friendly, all levels", meta: "FRI 7:30 · 7 of 10", bg: "bg-sun", ink: "text-plum", rot: "rotate-3" },
  { slug: "board-games", title: "Board games and kottu night", meta: "WED 6:30 · 3 of 6", bg: "bg-plum", ink: "text-white", rot: "-rotate-2" },
  { slug: "hike", title: "Sunrise hike, slow pace", meta: "SAT 5:30 · 4 of 6", bg: "bg-cream", ink: "text-plum", rot: "rotate-6" },
];

/** Tilted phone cards with doodle lines: the "fun" break in the landing page. */
export function PhoneCollage() {
  return (
    <div aria-hidden className="relative flex justify-center gap-3 py-6 sm:gap-5">
      {PHONES.map((p, i) => (
        <div
          key={p.slug}
          className={`${p.rot} ${i > 1 ? "hidden sm:block" : ""} w-36 shrink-0 rounded-[1.6rem] border-2 border-plum bg-[var(--color-paper)] p-2 shadow-[5px_5px_0_var(--color-plum)] transition-transform duration-300 hover:rotate-0 sm:w-44`}
        >
          <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-plum/80" />
          <div className={`${p.bg} ${p.ink} relative h-40 overflow-hidden rounded-[1.1rem] border-2 border-plum sm:h-48`}>
            <ActivityIcon slug={p.slug} className="absolute -bottom-3 -right-3 h-24 w-24 opacity-90" />
            <svg viewBox="0 0 120 60" className="absolute left-3 top-3 h-12 w-24 opacity-80" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M4 10 q8 -8 16 0 t16 0 t16 0 t16 0" />
              <path d="M4 28 q8 -8 16 0 t16 0 t16 0" />
              <path d="M4 46 q8 -8 16 0 t16 0" />
            </svg>
          </div>
          <p className="mt-2 px-1 text-[0.75rem] font-bold leading-snug text-plum">{p.title}</p>
          <p className="px-1 pb-1 font-mono text-[0.625rem] font-bold text-coral-600">{p.meta}</p>
        </div>
      ))}
    </div>
  );
}
