/* eslint-disable @next/next/no-img-element */
import { redirect } from "next/navigation";
import { ArrowRight, BadgeCheck, Download, HeartOff, Link2, ShieldCheck, SlidersHorizontal, Users, Vote } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { ActivityIcon } from "@/components/ui/ActivityIcon";
import { Hero } from "@/components/marketing/Hero";
import { PhoneCollage } from "@/components/marketing/PhoneCollage";
import { DesktopIcon, Window } from "@/components/marketing/Window";
import { getViewer } from "@/lib/auth";
import { copy } from "@/lib/copy";

const FEATURE_ICONS = [Users, BadgeCheck, SlidersHorizontal, Vote, Link2, Download];
const FEATURE_TONES = ["bg-coral text-white", "bg-sun text-plum", "bg-plum text-white"];
const STEP_TONES = ["bg-coral text-white", "bg-sun text-plum", "bg-plum text-white"];

const ACTIVITIES: [string, string][] = [
  ["futsal", "futsal"], ["badminton", "badminton"], ["cricket", "cricket"], ["padel", "padel"],
  ["coffee", "coffee"], ["board-games", "games"], ["hike", "hikes"], ["surfing", "surfing"],
  ["karaoke", "karaoke"], ["quiz-night", "quiz"], ["study-group", "study"], ["dinner", "dinner"],
  ["yoga", "yoga"], ["movie", "movies"], ["running", "running"], ["art-class", "art"],
];

export default async function LandingPage() {
  const { user } = await getViewer();
  if (user) redirect("/feed");
  const l = copy.landing;

  return (
    <div>
      <Hero />

      {/* ── How it works: three little windows ── */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16">
        <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold">{l.howTitle}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {l.howItWorks.map((s, i) => (
            <Window key={s.title} bodyClassName="p-5" className={i === 1 ? "md:translate-y-4" : ""}>
              <span className={`grid h-11 w-11 place-items-center rounded-lg border-2 border-plum font-mono text-[1.125rem] font-bold ${STEP_TONES[i]}`}>{i + 1}</span>
              <h3 className="mt-4 text-[1.25rem] font-extrabold">{s.title}</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink/75">{s.body}</p>
            </Window>
          ))}
        </div>
      </section>

      {/* ── Phones + activities ── */}
      <section className="border-y-2 border-plum bg-sun-100/70 py-14">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-center text-[clamp(1.6rem,4vw,2.25rem)] font-extrabold">{l.activitiesTitle}</h2>
          <PhoneCollage />
          <div className="mx-auto mt-6 grid max-w-3xl grid-cols-4 justify-items-center gap-x-2 gap-y-5 sm:grid-cols-8">
            {ACTIVITIES.map(([slug, label], i) => (
              <DesktopIcon key={slug} label={label} tone={i % 5 === 0 ? "coral" : i % 7 === 3 ? "plum" : "paper"} icon={<ActivityIcon slug={slug} className="h-6 w-6" />} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="max-w-xl text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold">{l.featuresTitle}</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {l.features.map((f, i) => {
            const Icon = FEATURE_ICONS[i] ?? Users;
            return (
              <div key={f.title} className="glass rounded-2xl p-5 transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
                <span className={`grid h-11 w-11 place-items-center rounded-lg border-2 border-plum ${FEATURE_TONES[i % 3]}`}>
                  <Icon className="h-5.5 w-5.5" />
                </span>
                <h3 className="mt-4 text-[1.125rem] font-extrabold">{f.title}</h3>
                <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink/75">{f.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Safety + not-a-dating-app ── */}
      <section className="mx-auto grid max-w-6xl gap-6 px-5 lg:grid-cols-2">
        <Window dark bodyClassName="p-7">
          <ShieldCheck className="h-9 w-9 text-sun" />
          <h2 className="mt-4 text-[1.75rem] font-extrabold text-white">{l.safetyTitle}</h2>
          <p className="mt-3 text-white/80">{l.safetyBody}</p>
          <ButtonLink href="/safety" variant="secondary" className="mt-6">{l.safetyCta}</ButtonLink>
        </Window>
        <Window bodyClassName="p-7">
          <span className="grid h-12 w-12 place-items-center rounded-lg border-2 border-plum bg-coral-50 text-coral"><HeartOff className="h-6 w-6" /></span>
          <h2 className="mt-4 text-[1.75rem] font-extrabold">{copy.platonicClause.heading}</h2>
          <p className="mt-3 text-ink/75">{copy.platonicClause.body}</p>
        </Window>
      </section>

      {/* ── Install ── */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <Window bodyClassName="grid items-center gap-6 p-7 md:grid-cols-[1fr_340px]">
          <div>
            <h2 className="text-[1.75rem] font-extrabold">{copy.install.title}</h2>
            <p className="mt-2 max-w-lg text-ink/75">{copy.install.body}</p>
          </div>
          <div><InstallPrompt variant="card" /></div>
        </Window>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-5">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl border-2 border-plum bg-coral px-8 py-14 text-center text-white shadow-[6px_6px_0_var(--color-plum)]">
          <img src="/brand/mark-256.png" alt="" width={84} height={84} className="mx-auto -rotate-3 rounded-[26%] border-2 border-plum shadow-[4px_4px_0_var(--color-plum)]" />
          <h2 className="mx-auto mt-6 max-w-2xl text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold text-white">{l.finalTitle}</h2>
          <p className="mt-3 font-mono text-[0.875rem] text-white/90">{l.finalSub}</p>
          <ButtonLink href="/sign-in" size="lg" variant="dark" className="mt-7">
            {l.ctaPrimary} <ArrowRight className="h-4.5 w-4.5" />
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
