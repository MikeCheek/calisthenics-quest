"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CompareLink from "@/components/CompareLink";
import { AchievementsCard } from "@/components/Achievements";
import BodyweightCard from "@/components/BodyweightCard";
import PageLoading from "@/components/PageLoading";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Nav from "@/components/Nav";
import { levelProgress } from "@/lib/levelPath";
import { Locale } from "@/lib/types";
import ReminderSettings from "@/components/ReminderSettings";
import HapticsToggle from "@/components/HapticsToggle";
import { updateProgress } from "@/lib/store";
import DangerZone from "@/components/DangerZone";
import { claimCounts, syncClaims } from "@/lib/verification";
import { Globe, Info, Flame, Dumbbell, Zap, BadgeCheck, Pencil, ChevronRight, Ruler, MapPin } from "lucide-react";
import XPHistoryChart from "@/components/XPHistoryChart";
import SessionHistory from "@/components/SessionHistory";
import VolumeTotalsCard from "@/components/VolumeTotalsCard";


type Tab = "activity" | "settings" | "account";
const TABS: { id: Tab; label: string }[] = [
  { id: "activity", label: "Activity" },
  { id: "settings", label: "Settings" },
  { id: "account", label: "Account" },
];

const EQUIPMENT_LABEL: [keyof import("@/lib/types").TrainingEquipment, string][] = [
  ["pullUpBar", "Pull-up bar"],
  ["parallelBars", "Dip bars"],
  ["rings", "Rings"],
  ["wallSpace", "Wall"],
  ["verticalPole", "Pole"],
  ["monkeyBars", "Monkey bars"],
  ["weights", "Weights"],
  ["resistanceBands", "Bands"],
];

export default function ProfilePage() {
  const { user, userDoc, loading, refreshUserDoc } = useAuth();
  const { t, tx, locale, setLocale } = useLanguage();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("activity");

  // open the tab named in the URL (e.g. /profile?tab=account)
  useEffect(() => {
    const urlTab = new URLSearchParams(window.location.search).get("tab");
    if (urlTab && TABS.some((x) => x.id === urlTab)) setTab(urlTab as Tab);
  }, []);

  const selectTab = (next: Tab) => {
    setTab(next);
    // deep-linkable (e.g. /profile?tab=account) without adding history entries
    router.replace(next === "activity" ? "/profile" : `/profile?tab=${next}`, { scroll: false });
  };

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/");
    else if (userDoc && !userDoc.onboarded) router.replace("/onboarding");
  }, [loading, user, userDoc, router]);

  if (loading || !userDoc) {
    return <PageLoading variant="profile" />;
  }

  const progress = levelProgress(userDoc.xp);
  const counts = claimCounts(syncClaims(userDoc.claims, userDoc.skills));

  const changeLocale = async (next: Locale) => {
    setLocale(next);
    try {
      await updateProgress(userDoc.uid, { locale: next });
    } catch {
      // locale is still applied locally via localStorage even if the
      // cross-device sync write fails — not worth alarming the user over
    }
  };

  return (
    <>
      <Nav />
      <main id="main" tabIndex={-1} className="max-w-3xl mx-auto px-4 py-6 pb-24 sm:pb-6 space-y-4">
        {/* hero */}
        <section className="panel p-4 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
          <div className="flex items-center gap-3.5 relative">
            <div className="relative shrink-0">
              {userDoc.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={userDoc.photoURL} alt="" referrerPolicy="no-referrer" className="w-16 h-16 rounded-2xl object-cover border border-zinc-700" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center heading text-2xl text-zinc-950">
                  {userDoc.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute -bottom-1.5 -right-1.5 stat-mono text-xs font-bold px-1.5 py-0.5 rounded-md bg-orange-500 text-zinc-950 border-2 border-zinc-900">
                {progress.level}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="heading text-xl text-zinc-100 truncate">{userDoc.displayName}</h1>
              <div className="text-sm text-zinc-400">{tx("Level {n}", { n: progress.level })}</div>
              <div className="mt-2 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-700" style={{ width: `${progress.pct}%` }} />
              </div>
              <div className="text-xs text-muted mt-1 stat-mono">
                {tx("{a} / {b} XP to level {n}", { a: progress.into, b: progress.span, n: progress.level + 1 })}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-4 relative">
            <HeroStat icon={<Flame size={14} className="text-orange-400" />} value={userDoc.streak} label={t("profile", "daysStreak")} />
            <HeroStat icon={<Dumbbell size={14} className="text-sky-400" />} value={userDoc.totalSessionsCompleted} label={tx("sessions")} />
            <HeroStat icon={<Zap size={14} className="text-amber-400" />} value={userDoc.xp} label="XP" />
            <HeroStat icon={<BadgeCheck size={14} className="text-emerald-400" />} value={counts.total ? `${counts.verified}/${counts.total}` : "–"} label={tx("verified")} />
          </div>
        </section>

        {/* tabs */}
        <div className="sticky top-0 z-20 -mx-4 px-4 py-2 bg-zinc-950/85 backdrop-blur">
          <div role="tablist" className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
            {TABS.map((x) => (
              <button
                key={x.id}
                role="tab"
                aria-selected={tab === x.id}
                onClick={() => selectTab(x.id)}
                className={`py-2 rounded-lg text-xs sm:text-sm transition-colors ${
                  tab === x.id ? "bg-zinc-800 text-zinc-100 shadow" : "text-muted hover:text-zinc-300"
                }`}
              >
                {tx(x.label)}
              </button>
            ))}
          </div>
        </div>

        {tab === "activity" && (
          <div className="space-y-4 animate-overlay-fade-in">
            <CompareLink />
            <AchievementsCard />
            <BodyweightCard />
            <VolumeTotalsCard userDoc={userDoc} />
            <div className="panel p-4">
              <h2 className="heading text-base text-zinc-100 mb-3">{t("profile", "xpOverTime")}</h2>
              <XPHistoryChart history={userDoc.xpHistory ?? []} />
            </div>
            <SessionHistory userDoc={userDoc} />
          </div>
        )}

        {tab === "settings" && (
          <div className="space-y-4 animate-overlay-fade-in">
            <Link href="/onboarding" className="panel p-4 block hover:border-orange-500/60 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h2 className="heading text-base text-zinc-100 flex items-center gap-2">
                  <Ruler size={16} className="text-orange-400" /> {tx("Body & schedule")}
                </h2>
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <Pencil size={12} /> {tx("Edit")}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <Stat label={tx("Age")} value={`${userDoc.body.ageYears} ${tx("yrs")}`} />
                <Stat label={tx("Height")} value={`${userDoc.body.heightCm} cm`} />
                <Stat label={tx("Weight")} value={`${userDoc.body.weightKg} kg`} />
              </div>
              <div className="text-xs text-muted mt-2">
                {tx("{a} days/week · ~{b} min sessions", { a: userDoc.body.trainingDaysPerWeek ?? 3, b: userDoc.body.sessionLengthMinutes ?? 45 })}
              </div>
            </Link>

            <Link href="/onboarding" className="panel p-4 block hover:border-orange-500/60 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h2 className="heading text-base text-zinc-100 flex items-center gap-2">
                  <MapPin size={16} className="text-orange-400" /> {tx("Where you train")}
                </h2>
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <Pencil size={12} /> {tx("Edit")}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {EQUIPMENT_LABEL.map(([k, label]) => (
                  <span
                    key={k}
                    className={`text-xs px-2.5 py-1 rounded-full border ${
                      userDoc.equipment[k] ? "border-emerald-600 text-emerald-400 bg-emerald-600/10" : "border-zinc-800 text-muted line-through"
                    }`}
                  >
                    {tx(label)}
                  </span>
                ))}
              </div>
            </Link>

            <div className="panel p-4">
              <h2 className="heading text-base text-zinc-100 mb-1 flex items-center gap-2">
                <Globe size={16} className="text-orange-400" /> {t("profile", "language")}
              </h2>
              <p className="text-xs text-muted mb-3">{t("profile", "languageHint")}</p>
              <div className="flex p-1 rounded-xl bg-zinc-800/60 gap-1">
                {(["en", "it"] as Locale[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => changeLocale(l)}
                    className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                      locale === l ? "bg-orange-500 text-zinc-950 font-medium" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {l === "en" ? "🇬🇧 English" : "🇮🇹 Italiano"}
                  </button>
                ))}
              </div>
            </div>

            <ReminderSettings />
            <HapticsToggle />

            <Link href="/about" className="panel p-4 flex items-center justify-between hover:border-orange-500/60 transition-colors">
              <span className="text-sm text-zinc-200 flex items-center gap-2">
                <Info size={16} className="text-muted" /> {tx("About, privacy & support the developer")}
              </span>
              <ChevronRight size={16} className="text-muted" />
            </Link>
          </div>
        )}

        {tab === "account" && (
          <div className="animate-overlay-fade-in">
            <DangerZone />
          </div>
        )}
      </main>

    </>
  );
}

function HeroStat({ icon, value, label }: { icon: React.ReactNode; value: number | string; label: string }) {
  return (
    <div className="rounded-xl bg-zinc-950/60 border border-zinc-800 px-2 py-2 text-center">
      <div className="flex items-center justify-center gap-1 stat-mono text-sm text-zinc-100">
        {icon}
        {value}
      </div>
      <div className="text-xs text-muted leading-tight">{label}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-zinc-950/60 border border-zinc-800 p-2.5 text-center">
      <div className="text-xs text-muted">{label}</div>
      <div className="text-zinc-100 stat-mono">{value}</div>
    </div>
  );
}
