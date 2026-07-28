import { copy } from "@/lib/copy";

export const metadata = { title: "About — Trio" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="font-display text-[clamp(2rem,5vw,2.75rem)] font-700">{copy.about.title}</h1>
      <div className="mt-5 space-y-4 text-[1.0625rem]">
        {copy.about.body.map((p) => <p key={p}>{p}</p>)}
      </div>
    </div>
  );
}
