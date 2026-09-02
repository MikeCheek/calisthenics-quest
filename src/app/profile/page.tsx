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
import InfoIconButton from "@/components/InfoIconButton";
import DeclareSkillModal from "@/components/DeclareSkillModal";
import { rankTitle } from "@/lib/xp";
import { effectiveXpProgress, effectiveLevel } from "@/lib/levelPath";
import { TRACK_LABEL, SKILL_FIELD_LABEL, StagedSkillKey, Locale } from "@/lib/types";
import { STAGE_LABEL } from "@/lib/stageOrder";
import ReminderSettings from "@/components/ReminderSettings";
import { updateProgress } from "@/lib/store";
import { Globe, Info } from "lucide-react";

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

export default function ProfilePage() {
  const { user, userDoc, loading, refreshUserDoc } = useAuth();
  const { t, locale, setLocale } = useLanguage();
  const [activeSkill, setActiveSkill] = useState<StagedSkillKey | null>(null);
  const [declareOpen, setDeclareOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/");
    else if (userDoc && !userDoc.onboarded) router.replace("/onboarding");
  }, [loading, user, userDoc, router]);

  if (loading || !userDoc) {
    return <main className="min-h-screen flex items-center justify-center text-zinc-400">{t("common", "loading")}</main>;
  }

  const progress = effectiveXpProgress(userDoc.xp, userDoc.skills, userDoc.skillMastery);

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
      <main className="max-w-3xl mx-auto px-4 py-6 pb-24 sm:pb-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading text-2xl text-zinc-100">{userDoc.displayName}</h1>
            <p className="text-zinc-400 text-sm">
              Level {progress.level} · {rankTitle(progress.level)} · {userDoc.streak} {t("profile", "daysStreak")}
            </p>
          </div>
          <Link
            href="/onboarding"
            className="text-xs px-3 py-1.5 border border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-zinc-100 rounded-lg shrink-0"
          >
            {t("profile", "editProfile")}
          </Link>
        </div>

        <div className="panel p-4">
          <div className="heading text-base text-zinc-100 mb-2">{t("profile", "skillRadar")}</div>
          <SkillRadarChart skills={userDoc.skills} />
        </div>

        <SkillWall skills={userDoc.skills} mastery={userDoc.skillMastery} playerLevel={progress.level} />

        <div className="panel p-4">
          <div className="heading text-base text-zinc-100 mb-3">{t("profile", "xpOverTime")}</div>
          <XPHistoryChart history={userDoc.xpHistory ?? []} />
        </div>

        <div className="panel p-4">
          <div className="heading text-base text-zinc-100 mb-2 flex items-center gap-2">
            <Globe size={16} className="text-orange-400" /> {t("profile", "language")}
          </div>
          <p className="text-xs text-zinc-500 mb-3">{t("profile", "languageHint")}</p>
          <div className="flex gap-2">
            {(["en", "it"] as Locale[]).map((l) => (
              <button
                key={l}
                onClick={() => changeLocale(l)}
                className={`flex-1 py-2 rounded-lg text-sm border ${
                  locale === l
                    ? "border-orange-500 bg-orange-500/10 text-zinc-100"
                    : "border-zinc-700 text-zinc-400"
                }`}
              >
                {l === "en" ? "English" : "Italiano"}
              </button>
            ))}
          </div>
        </div>

        {userDoc.goalTracks?.length > 0 && (
          <div className="panel p-4">
            <div className="heading text-base text-zinc-100 mb-2">Your goals</div>
            <div className="flex flex-wrap gap-2">
              {userDoc.goalTracks.map((track) => (
                <span
                  key={track}
                  className="text-xs px-2.5 py-1 rounded-full border border-orange-500/50 bg-orange-500/10 text-orange-300"
                >
                  {TRACK_LABEL[track]}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="panel p-4">
          <div className="heading text-base text-zinc-100 mb-2">{t("profile", "updateSkills")}</div>
          <p className="text-xs text-zinc-500 mb-3">{t("profile", "updateSkillsHint")}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setDeclareOpen(true)}
              className="flex-1 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-zinc-950 text-sm font-medium"
            >
              {t("profile", "declareSkill")}
            </button>
            <Link
              href="/onboarding"
              className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-zinc-100 text-sm text-center"
            >
              {t("profile", "retakeAssessment")}
            </Link>
          </div>
        </div>

        <div className="panel p-4">
          <div className="heading text-base text-zinc-100 mb-2">All skills</div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
            {ALL_SKILL_KEYS.map((key) => {
              const stage = userDoc.skills[key] as string;
              const started = stage !== "none";
              const m = userDoc.skillMastery?.[key];
              return (
                <div
                  key={key}
                  className={`shrink-0 px-3 py-2 rounded-lg border text-center min-w-[92px] relative ${
                    started ? "border-emerald-700 bg-emerald-600/5" : "border-zinc-700"
                  }`}
                >
                  <div className="absolute top-1 right-1">
                    <InfoIconButton onClick={() => setActiveSkill(key)} label={`About ${SKILL_FIELD_LABEL[key]}`} size={11} />
                  </div>
                  <div className="text-xs text-zinc-300 whitespace-nowrap pr-2">{SKILL_FIELD_LABEL[key]}</div>
                  <div className={`stat-mono text-xs mt-0.5 ${started ? "text-emerald-400" : "text-zinc-600"}`}>
                    {STAGE_LABEL[stage] ?? stage}
                  </div>
                  {started && m && <div className="text-[10px] text-zinc-500 mt-0.5">{"●".repeat(m)}{"○".repeat(5 - m)}</div>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel p-4">
          <div className="heading text-base text-zinc-100 mb-2">Body</div>
          <div className="grid grid-cols-3 gap-2.5 text-sm">
            <Stat label="Age" value={`${userDoc.body.ageYears} yrs`} />
            <Stat label="Height" value={`${userDoc.body.heightCm} cm`} />
            <Stat label="Weight" value={`${userDoc.body.weightKg} kg`} />
          </div>
        </div>

        <div className="panel p-4">
          <div className="heading text-base text-zinc-100 mb-2">Where you train</div>
          <div className="flex flex-wrap gap-2">
            {[
              ["Pull-up bar", userDoc.equipment.pullUpBar],
              ["Parallel bars / dip station", userDoc.equipment.parallelBars],
              ["Rings", userDoc.equipment.rings],
              ["Wall space", userDoc.equipment.wallSpace],
              ["Vertical pole", userDoc.equipment.verticalPole],
              ["Monkey bars", userDoc.equipment.monkeyBars],
              ["Weights (vest/belt/plates)", userDoc.equipment.weights],
              ["Resistance bands", userDoc.equipment.resistanceBands],
            ].map(([label, has]) => (
              <span
                key={label as string}
                className={`text-xs px-2.5 py-1 rounded-full border ${
                  has ? "border-emerald-600 text-emerald-400 bg-emerald-600/10" : "border-zinc-700 text-zinc-500"
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <ReminderSettings />

        <Link
          href="/about"
          className="panel p-4 flex items-center justify-between hover:border-orange-500 border border-transparent"
        >
          <span className="text-sm text-zinc-200 flex items-center gap-2">
            <Info size={16} className="text-zinc-500" /> About, privacy &amp; support the developer
          </span>
          <span className="text-zinc-500">›</span>
        </Link>
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-zinc-700 rounded-lg p-2.5 text-center">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="text-zinc-100 stat-mono">{value}</div>
    </div>
  );
}
