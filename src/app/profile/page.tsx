"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Nav from "@/components/Nav";
import SkillRadarChart from "@/components/SkillRadarChart";
import SkillWall from "@/components/SkillWall";
import XPHistoryChart from "@/components/XPHistoryChart";
import SkillInfoModal from "@/components/SkillInfoModal";
import DeclareSkillModal from "@/components/DeclareSkillModal";
import { rankTitle } from "@/lib/xp";
import { effectiveXpProgress, effectiveLevel } from "@/lib/levelPath";
import { TRACK_LABEL, SKILL_FIELD_LABEL, StagedSkillKey, Locale } from "@/lib/types";
import { STAGE_LABEL } from "@/lib/stageOrder";
import ReminderSettings from "@/components/ReminderSettings";
import { updateProgress } from "@/lib/store";
import VerifiedSkillsCard from "@/components/VerifiedSkillsCard";
import DangerZone from "@/components/DangerZone";
import { claimCounts, syncClaims } from "@/lib/verification";
import { Globe, Info, Flame, Dumbbell, Zap, BadgeCheck, Pencil, ChevronRight, Sparkles, Ruler, MapPin, Target } from "lucide-react";

const ALL_SKILL_KEYS: StagedSkillKey[] = [
  "frontLever", "backLever", "planche", "muscleUp", "handstand", "humanFlag", "pistolSquat", "lSit",
  "oneArmPullUp", "oneArmPushUp", "oneArmHandstand", "handstandPushUp",
  "dragonFlag", "elbowLever", "manna", "nordicCurl", "shrimpSquat",
  "ironCross", "maltese", "impossibleDip",
  "chestToBarPullUp", "wideGripPullUp", "typewriterPullUp", "toesToBar", "lSitPullUp",
  "skinTheCat", "germanHang", "flagPullUp", "ringMuscleUp", "ninetyDegreePushUp",
  "clapPushUp", "kipUp", "handstandWalk", "wallWalk", "pikePress",
  "supermanHold", "sidePlank", "copenhagenPlank", "bridge", "turkishGetUp",
  "jumpPistol", "sissySquat", "cossackSquat", "ropeClimb",
  "backFlip", "frontFlip", "windmill", "aroundTheWorld",
  "invertedCross", "victorianCross",
];

type Tab = "progress" | "skills" | "settings" | "account";
const TABS: { id: Tab; label: string }[] = [
  { id: "progress", label: "Progress" },
  { id: "skills", label: "Skills" },
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
  const { t, locale, setLocale } = useLanguage();
  const [activeSkill, setActiveSkill] = useState<StagedSkillKey | null>(null);
  const [declareOpen, setDeclareOpen] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("progress");

  // open the tab named in the URL (e.g. /profile?tab=account)
  useEffect(() => {
    const urlTab = new URLSearchParams(window.location.search).get("tab");
    if (urlTab && TABS.some((x) => x.id === urlTab)) setTab(urlTab as Tab);
  }, []);

  const selectTab = (next: Tab) => {
    setTab(next);
    // deep-linkable (e.g. /profile?tab=account) without adding history entries
    router.replace(next === "progress" ? "/profile" : `/profile?tab=${next}`, { scroll: false });
  };

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/");
    else if (userDoc && !userDoc.onboarded) router.replace("/onboarding");
  }, [loading, user, userDoc, router]);

  if (loading || !userDoc) {
    return <main className="min-h-screen flex items-center justify-center text-zinc-400">{t("common", "loading")}</main>;
  }

  const progress = effectiveXpProgress(userDoc.xp, userDoc.skills, userDoc.skillMastery);
  const counts = claimCounts(syncClaims(userDoc.claims, userDoc.skills));
  const startedKeys = ALL_SKILL_KEYS.filter((k) => (userDoc.skills[k] as string) !== "none");
  const shownKeys = showAllSkills ? ALL_SKILL_KEYS : startedKeys;

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
      <main className="max-w-3xl mx-auto px-4 py-6 pb-24 sm:pb-6 space-y-4">
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
              <span className="absolute -bottom-1.5 -right-1.5 stat-mono text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-orange-500 text-zinc-950 border-2 border-zinc-900">
                {progress.level}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="heading text-xl text-zinc-100 truncate">{userDoc.displayName}</h1>
              <div className="text-sm text-orange-400">{rankTitle(progress.level)}</div>
              <div className="mt-2 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-700" style={{ width: `${progress.pct}%` }} />
              </div>
              <div className="text-[11px] text-zinc-500 mt-1 stat-mono">
                {progress.catchingUp ? `${progress.pct}% to match your skill level` : `${progress.into} / ${progress.span} XP to level ${progress.level + 1}`}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-4 relative">
            <HeroStat icon={<Flame size={14} className="text-orange-400" />} value={userDoc.streak} label={t("profile", "daysStreak")} />
            <HeroStat icon={<Dumbbell size={14} className="text-sky-400" />} value={userDoc.totalSessionsCompleted} label="sessions" />
            <HeroStat icon={<Zap size={14} className="text-amber-400" />} value={userDoc.xp} label="XP" />
            <HeroStat icon={<BadgeCheck size={14} className="text-emerald-400" />} value={counts.total ? `${counts.verified}/${counts.total}` : "–"} label="verified" />
          </div>
        </section>

        {/* tabs */}
        <div className="sticky top-0 z-20 -mx-4 px-4 py-2 bg-zinc-950/85 backdrop-blur">
          <div role="tablist" className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
            {TABS.map((x) => (
              <button
                key={x.id}
                role="tab"
                aria-selected={tab === x.id}
                onClick={() => selectTab(x.id)}
                className={`py-2 rounded-lg text-xs sm:text-sm transition-colors ${
                  tab === x.id ? "bg-zinc-800 text-zinc-100 shadow" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {x.label}
              </button>
            ))}
          </div>
        </div>

        {tab === "progress" && (
          <div className="space-y-4 animate-overlay-fade-in">
            <div className="panel p-4">
              <div className="heading text-base text-zinc-100 mb-3">{t("profile", "xpOverTime")}</div>
              <XPHistoryChart history={userDoc.xpHistory ?? []} />
            </div>
            <VerifiedSkillsCard userDoc={userDoc} />
            <div className="panel p-4">
              <div className="heading text-base text-zinc-100 mb-2">{t("profile", "skillRadar")}</div>
              <SkillRadarChart skills={userDoc.skills} />
            </div>
          </div>
        )}

        {tab === "skills" && (
          <div className="space-y-4 animate-overlay-fade-in">
            <div className="panel p-4 bg-gradient-to-br from-orange-500/10 to-transparent">
              <div className="heading text-base text-zinc-100 mb-1 flex items-center gap-2">
                <Sparkles size={16} className="text-orange-400" /> {t("profile", "updateSkills")}
              </div>
              <p className="text-xs text-zinc-400 mb-3">{t("profile", "updateSkillsHint")}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeclareOpen(true)}
                  className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 text-sm font-medium"
                >
                  {t("profile", "declareSkill")}
                </button>
                <Link
                  href="/onboarding"
                  className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-zinc-100 text-sm text-center"
                >
                  {t("profile", "retakeAssessment")}
                </Link>
              </div>
            </div>

            {userDoc.goalTracks?.length > 0 && (
              <div className="panel p-4">
                <div className="heading text-base text-zinc-100 mb-2 flex items-center gap-2">
                  <Target size={16} className="text-orange-400" /> Your goals
                </div>
                <div className="flex flex-wrap gap-2">
                  {userDoc.goalTracks.map((track) => (
                    <span key={track} className="text-xs px-2.5 py-1 rounded-full border border-orange-500/50 bg-orange-500/10 text-orange-300">
                      {TRACK_LABEL[track]}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="panel p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="heading text-base text-zinc-100">
                  {t("profile", "allSkills")} <span className="text-zinc-500 text-sm font-normal">· {startedKeys.length} started</span>
                </div>
                <div className="flex p-0.5 rounded-lg bg-zinc-800 text-xs">
                  {[false, true].map((all) => (
                    <button
                      key={String(all)}
                      onClick={() => setShowAllSkills(all)}
                      className={`px-2.5 py-1 rounded-md ${showAllSkills === all ? "bg-zinc-950 text-zinc-100" : "text-zinc-400"}`}
                    >
                      {all ? "All 50" : "Started"}
                    </button>
                  ))}
                </div>
              </div>
              {shownKeys.length === 0 ? (
                <p className="text-xs text-zinc-500">No skills started yet — switch to “All 50” to explore them.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {shownKeys.map((key) => {
                    const stage = userDoc.skills[key] as string;
                    const started = stage !== "none";
                    const m = userDoc.skillMastery?.[key];
                    const verified = userDoc.claims?.[key]?.status === "verified";
                    return (
                      <button
                        key={key}
                        onClick={() => setActiveSkill(key)}
                        className={`text-left px-3 py-2.5 rounded-xl border transition-colors ${
                          started ? "border-emerald-700/70 bg-emerald-600/5 hover:border-emerald-500" : "border-zinc-800 hover:border-zinc-600"
                        }`}
                      >
                        <div className="text-xs text-zinc-200 truncate flex items-center gap-1">
                          {SKILL_FIELD_LABEL[key]}
                          {verified && <BadgeCheck size={11} className="text-emerald-400 shrink-0" aria-label="verified" />}
                        </div>
                        <div className={`stat-mono text-[11px] mt-0.5 ${started ? "text-emerald-400" : "text-zinc-600"}`}>
                          {STAGE_LABEL[stage] ?? stage}
                        </div>
                        {started && m && (
                          <div className="flex gap-0.5 mt-1.5">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <span key={i} className={`h-1 flex-1 rounded-full ${i <= m ? "bg-emerald-500" : "bg-zinc-800"}`} />
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="text-[11px] text-zinc-600 mt-2 flex items-center gap-1">
                <Info size={11} /> Tap a skill for its description and progression.
              </div>
            </div>

            <SkillWall skills={userDoc.skills} mastery={userDoc.skillMastery} playerLevel={progress.level} />
          </div>
        )}

        {tab === "settings" && (
          <div className="space-y-4 animate-overlay-fade-in">
            <Link href="/onboarding" className="panel p-4 block hover:border-orange-500/60 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="heading text-base text-zinc-100 flex items-center gap-2">
                  <Ruler size={16} className="text-orange-400" /> Body &amp; schedule
                </div>
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <Pencil size={12} /> Edit
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <Stat label="Age" value={`${userDoc.body.ageYears} yrs`} />
                <Stat label="Height" value={`${userDoc.body.heightCm} cm`} />
                <Stat label="Weight" value={`${userDoc.body.weightKg} kg`} />
              </div>
              <div className="text-xs text-zinc-500 mt-2">
                {userDoc.body.trainingDaysPerWeek ?? 3} days/week · ~{userDoc.body.sessionLengthMinutes ?? 45} min sessions
              </div>
            </Link>

            <Link href="/onboarding" className="panel p-4 block hover:border-orange-500/60 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="heading text-base text-zinc-100 flex items-center gap-2">
                  <MapPin size={16} className="text-orange-400" /> Where you train
                </div>
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <Pencil size={12} /> Edit
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {EQUIPMENT_LABEL.map(([k, label]) => (
                  <span
                    key={k}
                    className={`text-xs px-2.5 py-1 rounded-full border ${
                      userDoc.equipment[k] ? "border-emerald-600 text-emerald-400 bg-emerald-600/10" : "border-zinc-800 text-zinc-600 line-through"
                    }`}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </Link>

            <div className="panel p-4">
              <div className="heading text-base text-zinc-100 mb-1 flex items-center gap-2">
                <Globe size={16} className="text-orange-400" /> {t("profile", "language")}
              </div>
              <p className="text-xs text-zinc-500 mb-3">{t("profile", "languageHint")}</p>
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

            <Link href="/about" className="panel p-4 flex items-center justify-between hover:border-orange-500/60 transition-colors">
              <span className="text-sm text-zinc-200 flex items-center gap-2">
                <Info size={16} className="text-zinc-500" /> About, privacy &amp; support the developer
              </span>
              <ChevronRight size={16} className="text-zinc-500" />
            </Link>
          </div>
        )}

        {tab === "account" && (
          <div className="animate-overlay-fade-in">
            <DangerZone />
          </div>
        )}
      </main>

      <SkillInfoModal
        skill={activeSkill}
        onClose={() => setActiveSkill(null)}
        playerLevel={progress.level}
        skills={userDoc.skills}
        skillMastery={userDoc.skillMastery}
      />
      <DeclareSkillModal
        open={declareOpen}
        onClose={() => setDeclareOpen(false)}
        userDoc={userDoc}
        onSaved={refreshUserDoc}
      />
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
      <div className="text-[10px] text-zinc-500 truncate">{label}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-zinc-950/60 border border-zinc-800 p-2.5 text-center">
      <div className="text-[11px] text-zinc-500">{label}</div>
      <div className="text-zinc-100 stat-mono">{value}</div>
    </div>
  );
}
