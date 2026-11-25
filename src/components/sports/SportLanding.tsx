"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import ExerciseDemo from "@/components/ExerciseDemo";
import { LANDING, pick } from "@/lib/landingCopy";
import { SPORT_COPY, SPORT_PAGE } from "@/lib/sportLandingCopy";
import { SPORTS, SPORT_META, EXTRA_SPORTS } from "@/lib/sports";
import { rememberSportIntent } from "@/lib/sports/intent";
import type { ExtraSport } from "@/lib/sports/types";
import type { Locale } from "@/lib/types";

// A small landing page for one of the sports beyond calisthenics: what it
// teaches, how a session works, the moves, and a way in. Starting from here
// remembers the sport, so the first-login sport picker suggests it.
export default function SportLanding({
  sport,
  locale,
}: {
  sport: ExtraSport;
  locale: Locale;
}) {
  const { user, userDoc, loading, signIn, startAsGuest, setupFailures } =
    useAuth();
  const { locale: chosen, setLocale } = useLanguage();
  const router = useRouter();
  const [going, setGoing] = useState(false);
  const p = (
    t: { en: string; it: string },
    vars: Record<string, string | number> = {},
  ) =>
    Object.entries(vars).reduce(
      (s, [k, v]) => s.replace(`{${k}}`, String(v)),
      pick(locale, t),
    );
  const copy = SPORT_COPY[sport];
  const def = SPORTS[sport];
  const home = locale === "it" ? "/it" : "/";
  const pathFor = (l: Locale, s: ExtraSport = sport) =>
    l === "it" ? `/it${SPORT_COPY[s].path}` : SPORT_COPY[s].path;

  // the app follows the page's language
  useEffect(() => {
    if (locale === "it" && chosen !== "it") setLocale("it");
    // only on arrival
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // after a start from here: into the app (onboarding first if new)
  useEffect(() => {
    if (!going || loading || !user || !userDoc) return;
    router.replace(userDoc.onboarded ? "/dashboard" : "/onboarding");
  }, [going, loading, user, userDoc, router]);
  useEffect(() => {
    if (setupFailures > 0) setGoing(false);
  }, [setupFailures]);

  const start = async () => {
    rememberSportIntent(sport);
    setGoing(true);
    if (user && userDoc) return; // already in: the effect above takes them there
    if (!(await startAsGuest())) setGoing(false);
  };
  const google = () => {
    rememberSportIntent(sport);
    setGoing(true);
    signIn();
  };

  const ctas = (
    <div className="flex flex-col sm:flex-row gap-2">
      <button
        onClick={start}
        disabled={going && !user}
        className="sm:whitespace-nowrap py-3 px-5 rounded-lg heading tracking-wide bg-orange-500 hover:bg-orange-400 text-zinc-950 disabled:opacity-60"
      >
        {going && !user
          ? p(LANDING.hero.starting)
          : p(SPORT_PAGE.start, { sport: copy.name })}
      </button>
      {!user && (
        <button
          onClick={google}
          className="sm:whitespace-nowrap py-3 px-5 rounded-lg border border-zinc-600 text-zinc-100 hover:border-zinc-400 text-sm"
        >
          {p(LANDING.hero.google)}
        </button>
      )}
    </div>
  );

  const others = EXTRA_SPORTS.filter((s) => s !== sport);

  return (
    <div lang={locale} className="min-h-screen">
      <header className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          href={home}
          className="heading text-lg text-zinc-100 flex items-center gap-1.5"
        >
          <span className="text-orange-400" aria-hidden="true">
            ▲
          </span>{" "}
          BarQuests
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <Link
            href={pathFor(locale === "it" ? "en" : "it")}
            hrefLang={locale === "it" ? "en" : "it"}
            onClick={() => setLocale(locale === "it" ? "en" : "it")}
            className="text-zinc-400 hover:text-zinc-100 px-2 py-1"
          >
            {locale === "it" ? "EN" : "IT"}
            <span className="sr-only">
              {locale === "it" ? " — English" : " — Italiano"}
            </span>
          </Link>
          {!user && (
            <button
              onClick={() => signIn()}
              className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-200 hover:border-zinc-500"
            >
              {p(LANDING.nav.signIn)}
            </button>
          )}
        </div>
      </header>

      <main id="main" tabIndex={-1} className="px-4 pb-16">
        {/* hero */}
        <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center pt-4 pb-14">
          <div>
            <Link
              href={home}
              className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-orange-300 mb-4"
            >
              <ArrowLeft size={14} aria-hidden /> {p(SPORT_PAGE.back)}
            </Link>
            <h1 className="heading text-5xl sm:text-6xl text-zinc-100 flex items-center gap-3">
              <span aria-hidden="true">{SPORT_META[sport].emoji}</span>{" "}
              {copy.name}
            </h1>
            <p className="heading text-2xl text-orange-400 mt-1 mb-4">
              {p(copy.tagline)}
            </p>
            <p className="text-zinc-300 text-lg leading-relaxed mb-6">
              {p(copy.lead)}
            </p>
            {ctas}
          </div>
          <div className="panel p-4 aspect-[4/3] overflow-hidden">
            <ExerciseDemo
              exerciseName={copy.demo}
              width={360}
              decorative
              className="h-full w-full [&_svg]:h-full [&_svg]:w-full"
            />
          </div>
        </section>

        {/* how it works */}
        <section className="max-w-5xl mx-auto mb-20" aria-labelledby="how">
          <h2 id="how" className="heading text-3xl text-zinc-100 mb-6">
            {p(SPORT_PAGE.how)}
          </h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {copy.points.map((pt, i) => (
              <li key={pt.en} className="panel p-5 flex gap-3">
                <span className="stat-mono text-2xl text-orange-400 leading-none">
                  {i + 1}
                </span>
                <p className="text-sm text-zinc-300 leading-relaxed">{p(pt)}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* the skills */}
        <section className="max-w-5xl mx-auto mb-20" aria-labelledby="skills">
          <h2 id="skills" className="heading text-3xl text-zinc-100 mb-6">
            {p(SPORT_PAGE.skills)}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {def.skills.map((sk) => (
              <li key={sk.key} className="panel p-4">
                <h3 className="heading text-base text-zinc-100">{sk.name}</h3>
                <p className="text-xs text-orange-300 mb-1">
                  {p(SPORT_PAGE.stages, { n: sk.stages.length })}
                </p>
                <p className="text-sm text-zinc-400">
                  {p(copy.skills[sk.key])}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* the moves */}
        <section className="max-w-5xl mx-auto mb-20" aria-labelledby="moves">
          <h2 id="moves" className="heading text-3xl text-zinc-100 mb-6">
            {p(SPORT_PAGE.moves)}
          </h2>
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {copy.showcase.map((name) => (
              <li key={name} className="panel p-3">
                <div className="aspect-[4/3] overflow-hidden rounded-lg">
                  <ExerciseDemo
                    exerciseName={name}
                    width={240}
                    decorative
                    className="h-full w-full [&_svg]:h-full [&_svg]:w-full"
                  />
                </div>
                <p className="text-sm text-zinc-200 text-center mt-2">{name}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* questions */}
        <section className="max-w-3xl mx-auto mb-20" aria-labelledby="faq">
          <h2 id="faq" className="heading text-3xl text-zinc-100 mb-4">
            {p(SPORT_PAGE.faq)}
          </h2>
          <div className="space-y-2">
            {copy.faq.map((f) => (
              <details key={f.q.en} className="panel group">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-3 p-4 text-zinc-100">
                  <h3 className="text-base font-medium">{p(f.q)}</h3>
                  <ChevronDown
                    size={18}
                    className="text-muted shrink-0 transition-transform group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <p className="px-4 pb-4 text-sm text-zinc-300 leading-relaxed">
                  {p(f.a)}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section className="max-w-xl mx-auto text-center mb-20">
          <h2 className="heading text-3xl text-zinc-100 mb-5">
            {p(copy.tagline)}
          </h2>
          <div className="flex justify-center">{ctas}</div>
        </section>

        {/* the other tracks */}
        <section className="max-w-5xl mx-auto" aria-labelledby="also">
          <h2 id="also" className="heading text-xl text-zinc-100 mb-3">
            {p(SPORT_PAGE.also)}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href={home}
              className="panel p-4 flex items-center gap-3 hover:border-orange-500/60"
            >
              <span className="text-3xl" aria-hidden="true">
                {SPORT_META.calisthenics.emoji}
              </span>
              <span className="flex-1">
                <span className="block heading text-zinc-100">
                  Calisthenics
                </span>
                <span className="block text-sm text-zinc-400">
                  {p(LANDING.hero.tagline)}
                </span>
              </span>
              <ChevronRight size={18} className="text-zinc-400" aria-hidden />
            </Link>
            {others.map((s) => (
              <Link
                key={s}
                href={pathFor(locale, s)}
                className="panel p-4 flex items-center gap-3 hover:border-orange-500/60"
              >
                <span className="text-3xl" aria-hidden="true">
                  {SPORT_META[s].emoji}
                </span>
                <span className="flex-1">
                  <span className="block heading text-zinc-100">
                    {SPORT_COPY[s].name}
                  </span>
                  <span className="block text-sm text-zinc-400">
                    {p(SPORT_COPY[s].card)}
                  </span>
                </span>
                <ChevronRight size={18} className="text-zinc-400" aria-hidden />
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-800 py-6 px-4">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-400">
          <Link href="/about" className="hover:text-zinc-100">
            {p(LANDING.footer.about)}
          </Link>
          <nav aria-label={p(LANDING.footer.language)} className="flex gap-3">
            <Link
              href={pathFor("en")}
              hrefLang="en"
              onClick={() => setLocale("en")}
              aria-current={locale === "en" ? "page" : undefined}
              className={
                locale === "en" ? "text-zinc-100" : "hover:text-zinc-100"
              }
            >
              English
            </Link>
            <Link
              href={pathFor("it")}
              hrefLang="it"
              onClick={() => setLocale("it")}
              aria-current={locale === "it" ? "page" : undefined}
              className={
                locale === "it" ? "text-zinc-100" : "hover:text-zinc-100"
              }
            >
              Italiano
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
