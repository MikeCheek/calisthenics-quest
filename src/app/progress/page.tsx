"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Nav from "@/components/Nav";
import XPHistoryChart from "@/components/XPHistoryChart";
import VerifiedSkillsCard from "@/components/VerifiedSkillsCard";
import CoachInsightsCard from "@/components/CoachInsightsCard";
import SkillRadarChart from "@/components/SkillRadarChart";
import SkillWall from "@/components/SkillWall";
import SkillTree from "@/components/SkillTree";
import NextMilestones from "@/components/NextMilestones";
import TrophyRoad from "@/components/TrophyRoad";
import SessionHistory from "@/components/SessionHistory";
import SkillInfoModal from "@/components/SkillInfoModal";
import DeclareSkillModal from "@/components/DeclareSkillModal";
import { effectiveXpProgress } from "@/lib/levelPath";
import { rankTitle } from "@/lib/xp";
import { StagedSkillKey, TRACK_LABEL } from "@/lib/types";
import { Sparkles, Target } from "lucide-react";

// One home for everything about how the athlete is doing — previously
// spread over the Skills page, the Trophy road page and the profile.
type Tab = "overview" | "skills" | "road" | "history";
const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "skills", label: "Skills" },
  { id: "road", label: "Road" },
  { id: "history", label: "History" },
];

export default function ProgressPage() {
  const { user, userDoc, loading, refreshUserDoc } = useAuth();
  const { t, tx } = useLanguage();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [activeSkill, setActiveSkill] = useState<StagedSkillKey | null>(null);
  const [declareOpen, setDeclareOpen] = useState(false);
  const [fullRoad, setFullRoad] = useState(false);

  useEffect(() => {
    const urlTab = new URLSearchParams(window.location.search).get("tab");
    if (urlTab && TABS.some((x) => x.id === urlTab)) setTab(urlTab as Tab);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/");
    else if (userDoc && !userDoc.onboarded) router.replace("/onboarding");
  }, [loading, user, userDoc, router]);

  if (loading || !userDoc) {
    return <main className="min-h-screen flex items-center justify-center text-zinc-400">{t("common", "loading")}</main>;
  }

  const progress = effectiveXpProgress(userDoc.xp, userDoc.skills, userDoc.skillMastery);

  const selectTab = (next: Tab) => {
    setTab(next);
    router.replace(next === "overview" ? "/progress" : `/progress?tab=${next}`, { scroll: false });
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <Nav />
      <main className="max-w-3xl mx-auto px-4 py-6 pb-24 sm:pb-6 space-y-4">
        <div>
          <h1 className="heading text-2xl text-zinc-100">{tx("Progress")}</h1>
          <p className="text-sm text-zinc-400">
            {tx("Level {n}", { n: progress.level })} · <span className="text-orange-400">{tx(rankTitle(progress.level))}</span>
          </p>
        </div>

        <div className="sticky top-0 z-20 -mx-4 px-4 py-2 bg-zinc-950/85 backdrop-blur">
          <div role="tablist" className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
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

        {tab === "overview" && (
          <div className="space-y-4 animate-overlay-fade-in">
            <div className="panel p-4">
              <div className="heading text-base text-zinc-100 mb-3">{t("profile", "xpOverTime")}</div>
              <XPHistoryChart history={userDoc.xpHistory ?? []} />
            </div>
            <VerifiedSkillsCard userDoc={userDoc} />
            <CoachInsightsCard userDoc={userDoc} />
            <div className="panel p-4">
              <div className="heading text-base text-zinc-100 mb-2">{t("profile", "skillRadar")}</div>
              <SkillRadarChart skills={userDoc.skills} />
            </div>
            <SkillWall skills={userDoc.skills} mastery={userDoc.skillMastery} playerLevel={progress.level} />
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
                  <Target size={16} className="text-orange-400" /> {tx("Your goals")}
                </div>
                <div className="flex flex-wrap gap-2">
                  {userDoc.goalTracks.map((track) => (
                    <span key={track} className="text-xs px-2.5 py-1 rounded-full border border-orange-500/50 bg-orange-500/10 text-orange-300">
                      {tx(TRACK_LABEL[track])}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <SkillTree userDoc={userDoc} playerLevel={progress.level} onInfo={setActiveSkill} />
          </div>
        )}

        {tab === "road" && (
          <div className="space-y-4 animate-overlay-fade-in">
            <NextMilestones playerLevel={progress.level} />
            <button
              onClick={() => setFullRoad((v) => !v)}
              aria-expanded={fullRoad}
              className="w-full py-2.5 rounded-xl border border-zinc-700 text-sm text-zinc-300 hover:border-zinc-500"
            >
              {fullRoad ? tx("Hide the full road") : tx("Show the full road")}
            </button>
            {fullRoad && <TrophyRoad userDoc={userDoc} />}
          </div>
        )}

        {tab === "history" && (
          <div className="animate-overlay-fade-in">
            <SessionHistory userDoc={userDoc} />
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
      <DeclareSkillModal open={declareOpen} onClose={() => setDeclareOpen(false)} userDoc={userDoc} onSaved={refreshUserDoc} />
    </>
  );
}
