"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Bell,
  Check,
  ChevronDown,
  Flame,
  Lock,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Target,
  Trees,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { LANDING, pick } from "@/lib/landingCopy";
import type { Locale } from "@/lib/types";

const ICONS: Record<string, LucideIcon> = {
  target: Target,
  adapt: RefreshCw,
  verified: BadgeCheck,
  park: Trees,
  install: Smartphone,
  bell: Bell,
  flame: Flame,
  lock: Lock,
  undo: Undo2,
  shield: ShieldCheck,
};

// A real screen of the app, in a phone outline.
function Phone({ src, alt, priority = false, className = "" }: { src: string; alt: string; priority?: boolean; className?: string }) {
  return (
    <div className={`mx-auto w-[min(64vw,270px)] rounded-[2.2rem] border border-zinc-700 bg-zinc-900 p-2 shadow-2xl shadow-orange-950/40 ${className}`}>
      {/* two prepared sizes (480 and 600 px wide): phones take the smaller one.
          The hero image isn't lazy, so it's preloaded by the server render. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        srcSet={`${src.replace(".webp", "-480.webp")} 480w, ${src} 600w`}
        sizes="(min-width: 768px) 270px, 64vw"
        alt={alt}
        width={600}
        height={1298}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className="w-full h-auto rounded-[1.7rem]"
      />
    </div>
  );
}

export default function LandingPage({ locale }: { locale: Locale }) {
  const { user, userDoc, loading, signIn, startAsGuest, setupFailures } = useAuth();
  const { locale: chosen, setLocale } = useLanguage();
  const router = useRouter();
  const [startingGuest, setStartingGuest] = useState(false);
  const p = (t: { en: string; it: string }) => pick(locale, t);
  const shot = (id: string) => `/landing/${locale}-${id}.webp`;

  // the app follows the page's language: someone arriving on /it keeps
  // Italian after signing in; someone who chose Italian before lands on /it
  useEffect(() => {
    if (locale === "it") {
      if (chosen !== "it") setLocale("it");
      return;
    }
    // read the preference directly: this runs before the language
    // provider has picked it up
    let preferred: string | null = null;
    try {
      preferred = localStorage.getItem("barquests:locale");
    } catch {
      /* storage blocked */
    }
    if (preferred === "it" || (!preferred && navigator.language?.toLowerCase().startsWith("it"))) router.replace("/it");
    // only on arrival
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tryAsGuest = async () => {
    setStartingGuest(true);
    if (!(await startAsGuest())) setStartingGuest(false);
    // on success the redirect below sends the new guest to onboarding
  };

  // the account was created but its data couldn't be saved: let them retry
  useEffect(() => {
    if (setupFailures > 0) setStartingGuest(false);
  }, [setupFailures]);

  useEffect(() => {
    if (loading) return;
    if (user && userDoc) router.replace(userDoc.onboarded ? "/dashboard" : "/onboarding");
  }, [loading, user, userDoc, router]);

  const ctas = (
    <div className="flex flex-col sm:flex-row gap-2">
      <button
        onClick={tryAsGuest}
        disabled={startingGuest}
        className="sm:whitespace-nowrap py-3 px-5 rounded-lg heading tracking-wide bg-orange-500 hover:bg-orange-400 text-zinc-950 disabled:opacity-60"
      >
        {startingGuest ? p(LANDING.hero.starting) : p(LANDING.hero.start)}
      </button>
      <button
        onClick={() => signIn()}
        className="sm:whitespace-nowrap py-3 px-5 rounded-lg border border-zinc-600 text-zinc-100 hover:border-zinc-400 text-sm"
      >
        {p(LANDING.hero.google)}
      </button>
    </div>
  );

  const switchTo = (target: Locale) => () => setLocale(target);

  return (
    <div lang={locale} className="min-h-screen">
      <header className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <span className="heading text-lg text-zinc-100 flex items-center gap-1.5">
          <span className="text-orange-400" aria-hidden="true">
            ▲
          </span>{" "}
          BarQuests
        </span>
        <div className="flex items-center gap-3 text-sm">
          <Link
            href={locale === "it" ? "/" : "/it"}
            hrefLang={locale === "it" ? "en" : "it"}
            onClick={switchTo(locale === "it" ? "en" : "it")}
            className="text-zinc-400 hover:text-zinc-100 px-2 py-1"
          >
            {locale === "it" ? "EN" : "IT"}
            <span className="sr-only">{locale === "it" ? " — English" : " — Italiano"}</span>
          </Link>
          <button onClick={() => signIn()} className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-200 hover:border-zinc-500">
            {p(LANDING.nav.signIn)}
          </button>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="px-4 pb-16">
        {/* hero */}
        <section className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center pt-4 pb-12">
          <div>
            <p className="inline-block text-xs text-orange-300 border border-orange-500/30 bg-orange-500/10 rounded-full px-3 py-1 mb-4">
              {p(LANDING.hero.eyebrow)}
            </p>
            <h1 className="heading text-5xl sm:text-6xl text-zinc-100">BarQuests</h1>
            <p className="heading text-2xl text-orange-400 mt-1 mb-4">{p(LANDING.hero.tagline)}</p>
            <p className="text-zinc-300 text-lg leading-relaxed mb-6">{p(LANDING.hero.lead)}</p>
            {ctas}
            <p className="text-xs text-muted mt-3">{p(LANDING.hero.note)}</p>
          </div>
          {/* three screens fanned out on wide screens; just Today on phones */}
          <div className="relative flex justify-center md:h-[600px] md:items-center">
            <div className="hidden lg:block absolute left-0 top-12 -rotate-6 opacity-70" aria-hidden="true">
              <Phone src={shot("skills")} alt="" className="!w-[220px]" />
            </div>
            <div className="hidden lg:block absolute right-0 top-12 rotate-6 opacity-70" aria-hidden="true">
              <Phone src={shot("crew")} alt="" className="!w-[220px]" />
            </div>
            <Phone src={shot("today")} alt={p(LANDING.hero.shotAlt)} priority className="relative z-10" />
          </div>
        </section>

        {/* numbers */}
        <section className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 mb-16">
          {LANDING.stats.map((s) => (
            <div key={s.value} className="panel p-4 text-center">
              <div className="stat-mono text-3xl text-orange-400">{s.value}</div>
              <div className="text-sm text-zinc-400">{p(s.label)}</div>
            </div>
          ))}
        </section>

        {/* why */}
        <section className="max-w-5xl mx-auto mb-20">
          <h2 className="heading text-3xl text-zinc-100 mb-2">{p(LANDING.why.title)}</h2>
          <p className="text-zinc-400 max-w-2xl mb-6">{p(LANDING.why.intro)}</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {LANDING.why.items.map((it) => {
              const Icon = ICONS[it.icon];
              return (
                <div key={it.icon} className="panel p-5">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/15 flex items-center justify-center mb-3">
                    <Icon size={20} className="text-orange-400" />
                  </div>
                  <h3 className="heading text-lg text-zinc-100 mb-1">{p(it.title)}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{p(it.body)}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* the app, screen by screen */}
        <div className="max-w-5xl mx-auto space-y-20 mb-20">
          {LANDING.showcase.map((s, i) => (
            <section key={s.id} className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className={i % 2 ? "md:order-2" : ""}>
                <p className="text-xs uppercase tracking-widest text-orange-400 mb-2">{p(s.eyebrow)}</p>
                <h2 className="heading text-3xl text-zinc-100 mb-3">{p(s.title)}</h2>
                <p className="text-zinc-300 leading-relaxed mb-4">{p(s.body)}</p>
                <ul className="space-y-2">
                  {s.points.map((pt) => (
                    <li key={pt.en} className="flex items-start gap-2 text-sm text-zinc-300">
                      <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      {p(pt)}
                    </li>
                  ))}
                </ul>
              </div>
              <Phone src={shot(s.id)} alt={p(s.alt)} />
            </section>
          ))}
        </div>

        {/* everything else */}
        <section className="max-w-5xl mx-auto mb-20">
          <h2 className="heading text-3xl text-zinc-100 mb-6">{p(LANDING.more.title)}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {LANDING.more.items.map((it) => {
              const Icon = ICONS[it.icon];
              return (
                <div key={it.icon} className="panel p-4 flex gap-3">
                  <Icon size={20} className="text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm heading text-zinc-100 mb-0.5">{p(it.title)}</h3>
                    <p className="text-sm text-zinc-400">{p(it.body)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* honest note */}
        <section className="max-w-3xl mx-auto mb-20 panel p-6 border-l-4 border-l-orange-500">
          <h2 className="heading text-xl text-zinc-100 mb-2">{p(LANDING.honest.title)}</h2>
          <p className="text-sm text-zinc-300 leading-relaxed mb-3">{p(LANDING.honest.body)}</p>
          <Link href="/about" className="text-sm text-orange-400 underline underline-offset-2">
            {p(LANDING.honest.link)}
          </Link>
        </section>

        {/* questions */}
        <section className="max-w-3xl mx-auto mb-20">
          <h2 className="heading text-3xl text-zinc-100 mb-4">{p(LANDING.faq.title)}</h2>
          <div className="space-y-2">
            {LANDING.faq.items.map((f) => (
              <details key={f.q.en} className="panel group">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-3 p-4 text-zinc-100">
                  <h3 className="text-base font-medium">{p(f.q)}</h3>
                  <ChevronDown size={18} className="text-muted shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <p className="px-4 pb-4 text-sm text-zinc-300 leading-relaxed">{p(f.a)}</p>
              </details>
            ))}
          </div>
        </section>

        {/* last call */}
        <section className="max-w-xl mx-auto text-center">
          <h2 className="heading text-3xl text-zinc-100 mb-2">{p(LANDING.final.title)}</h2>
          <p className="text-zinc-400 mb-5">{p(LANDING.final.body)}</p>
          {ctas}
        </section>
      </main>

      <footer className="border-t border-zinc-800 py-6 px-4">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-400">
          <Link href="/about" className="hover:text-zinc-100">
            {p(LANDING.footer.about)}
          </Link>
          <nav aria-label={p(LANDING.footer.language)} className="flex gap-3">
            <Link href="/" hrefLang="en" onClick={switchTo("en")} aria-current={locale === "en" ? "page" : undefined} className={locale === "en" ? "text-zinc-100" : "hover:text-zinc-100"}>
              English
            </Link>
            <Link href="/it" hrefLang="it" onClick={switchTo("it")} aria-current={locale === "it" ? "page" : undefined} className={locale === "it" ? "text-zinc-100" : "hover:text-zinc-100"}>
              Italiano
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
