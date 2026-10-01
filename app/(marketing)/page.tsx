/* eslint-disable @next/next/no-img-element */
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Download,
  HeartOff,
  Link2,
  MapPin,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  Vote,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { SlotStrip } from "@/components/ui/SlotStrip";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { getViewer } from "@/lib/auth";
import { copy } from "@/lib/copy";
import { ActivityIcon } from "@/components/ui/ActivityIcon";

const FEATURE_ICONS = [Users, BadgeCheck, SlidersHorizontal, Vote, Link2, Download];

const DEMO = [
  { slug: "futsal", activity: "Futsal", title: "Friday night futsal, all levels", place: "Sports complex, Colombo 7", time: "FRI · 7:30 PM", cap: 10, claimed: 5, reserved: 2, badge: "Host +2" },
  { slug: "coffee", activity: "Coffee", title: "Slow Sunday coffee & chat", place: "Café, Colombo 3", time: "SUN · 10:00 AM", cap: 4, claimed: 2, reserved: 0, badge: "Women only" },
  { slug: "hike", activity: "Hike", title: "Sunrise hike, easy pace", place: "Trailhead meet-up", time: "SAT · 5:30 AM", cap: 6, claimed: 3, reserved: 0, badge: "25–35" },
];

const ACTIVITIES: [string, string][] = [
  ["futsal", "Futsal"], ["badminton", "Badminton"], ["cricket", "Cricket"], ["padel", "Padel"],
  ["coffee", "Coffee"], ["board-games", "Board games"], ["hike", "Hikes"], ["surfing", "Surfing"],
  ["karaoke", "Karaoke"], ["quiz-night", "Quiz night"], ["study-group", "Study group"], ["dinner", "Dinner"],
  ["yoga", "Yoga"], ["movie", "Movies"], ["running", "Running"], ["art-class", "Art & craft"],
];

export default async function LandingPage() {
  const { user } = await getViewer();
  if (user) redirect("/feed");
  const l = copy.landing;

  return (
    <div className="-mt-[4.25rem]">
      {/* ── Hero ── */}
      <section className="bg-hero relative overflow-hidden rounded-b-[2.5rem] px-5 pb-20 pt-32 text-white sm:pb-24 sm:pt-36">
        <div aria-hidden className="absolute -left-24 top-40 h-72 w-72 rounded-full bg-sun/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.1fr_1fr]">
          <div className="animate-rise">
            <span className="glass-dark inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.8125rem] font-semibold">
              <span className="h-2 w-2 rounded-full bg-sun" /> {l.eyebrow}
            </span>
            <h1 className="mt-5 text-[clamp(2.6rem,7vw,4.5rem)] font-extrabold leading-[1.02] text-white">
              {l.heroTitle}
              <br />
              <span className="text-gradient">{l.heroAccent}</span>
            </h1>
            <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-white/80">{l.heroSub}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/sign-in" size="lg">
                {l.ctaPrimary} <ArrowRight className="h-4.5 w-4.5" />
              </ButtonLink>
              <ButtonLink href="/#how" size="lg" variant="glass" className="!text-white !bg-white/10 hover:!bg-white/20">
                {l.ctaSecondary}
              </ButtonLink>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[0.8125rem] text-white/70">
              <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4 text-sun" /> 3+ people per gig</span>
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-sun" /> Public places only</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-sun" /> Photos reviewed</span>
            </div>
          </div>

          {/* illustrative board of example gigs */}
          <div className="relative mx-auto w-full max-w-md">
            <img src="/brand/icon-rounded.png" alt="" width={110} height={110} className="absolute -left-6 -top-14 z-10 hidden rounded-[28%] shadow-[0_20px_50px_rgba(255,52,80,0.5)] animate-float sm:block lg:-left-14" />
            <div className="space-y-4">
              {DEMO.map((d, i) => (
                <div
                  key={d.title}
                  className="glass-strong rounded-[1.5rem] p-4 text-ink animate-rise"
                  style={{ animationDelay: `${150 + i * 120}ms`, transform: `translateX(${i === 1 ? 24 : 0}px)` }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[0.75rem] font-bold text-coral">{d.time}</span>
                    <span className="rounded-full bg-sun-100 px-2 py-0.5 text-[0.6875rem] font-bold text-[#6b4400]">{d.badge}</span>
                  </div>
                  <p className="mt-1 flex items-center gap-2 font-bold text-plum">
                    <ActivityIcon slug={d.slug} className="h-4.5 w-4.5 text-coral" /> {d.title}
                  </p>
                  <p className="mb-3 text-[0.75rem] text-muted">{d.place}</p>
                  <SlotStrip size="sm" capacity={d.cap} claimed={d.claimed} reserved={d.reserved} minToConfirm={3} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20">
        <h2 className="text-center text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold">{l.howTitle}</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {l.howItWorks.map((s, i) => (
            <div key={s.title} className="glass rounded-[1.75rem] p-6">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-coral text-[1.125rem] font-extrabold text-white shadow-[var(--shadow-coral)]">{i + 1}</span>
              <h3 className="mt-4 text-[1.25rem] font-bold">{s.title}</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Activities ── */}
      <section className="overflow-hidden py-6">
        <h2 className="mb-6 text-center text-[1.25rem] font-bold">{l.activitiesTitle}</h2>
        <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-2.5 px-5">
          {ACTIVITIES.map(([slug, label]) => (
            <span key={slug} className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.9375rem] font-semibold text-plum">
              <ActivityIcon slug={slug} className="h-4 w-4 text-coral" /> {label}
            </span>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="max-w-xl text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold">{l.featuresTitle}</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {l.features.map((f, i) => {
            const Icon = FEATURE_ICONS[i] ?? Users;
            return (
              <div key={f.title} className="glass rounded-[1.75rem] p-6 transition hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl ${i % 3 === 0 ? "bg-coral-50 text-coral" : i % 3 === 1 ? "bg-sun-100 text-[#a86b00]" : "bg-plum-50 text-plum"}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-[1.125rem] font-bold">{f.title}</h3>
                <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted">{f.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Safety + not-a-dating-app ── */}
      <section className="mx-auto grid max-w-6xl gap-5 px-5 lg:grid-cols-2">
        <div className="bg-hero rounded-[2rem] p-8 text-white">
          <ShieldCheck className="h-9 w-9 text-sun" />
          <h2 className="mt-4 text-[1.75rem] font-extrabold text-white">{l.safetyTitle}</h2>
          <p className="mt-3 text-white/80">{l.safetyBody}</p>
          <ButtonLink href="/safety" variant="secondary" className="mt-6">{l.safetyCta}</ButtonLink>
        </div>
        <div className="glass rounded-[2rem] p-8">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-coral-50 text-coral"><HeartOff className="h-6 w-6" /></span>
          <h2 className="mt-4 text-[1.75rem] font-extrabold">{copy.platonicClause.heading}</h2>
          <p className="mt-3 text-muted">{copy.platonicClause.body}</p>
        </div>
      </section>

      {/* ── Install ── */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="glass grid items-center gap-6 rounded-[2rem] p-8 md:grid-cols-[1fr_340px]">
          <div>
            <h2 className="text-[1.75rem] font-extrabold">{copy.install.title}</h2>
            <p className="mt-2 max-w-lg text-muted">{copy.install.body}</p>
          </div>
          <div><InstallPrompt variant="card" /></div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-5">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-coral to-[#ff7a59] px-8 py-14 text-center text-white shadow-[var(--shadow-coral)]">
          <img src="/brand/mark-256.png" alt="" width={84} height={84} className="mx-auto rounded-[28%] ring-4 ring-white/30" />
          <h2 className="mx-auto mt-5 max-w-2xl text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold text-white">{l.finalTitle}</h2>
          <p className="mt-3 text-white/85">{l.finalSub}</p>
          <ButtonLink href="/sign-in" size="lg" variant="dark" className="mt-7">
            {l.ctaPrimary} <ArrowRight className="h-4.5 w-4.5" />
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
