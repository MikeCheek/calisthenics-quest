"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CompareLink from "@/components/CompareLink";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Nav from "@/components/Nav";
import PageLoading from "@/components/PageLoading";
import HeadlineCard from "@/components/HeadlineCard";
import VerifiedSkillsCard from "@/components/VerifiedSkillsCard";
import SkillRadarChart from "@/components/SkillRadarChart";
import SkillWall from "@/components/SkillWall";
import SkillTree from "@/components/SkillTree";
import NextMilestones from "@/components/NextMilestones";
import TrophyRoad from "@/components/TrophyRoad";
import SkillInfoModal from "@/components/SkillInfoModal";
import DeclareSkillModal from "@/components/DeclareSkillModal";
import { levelProgress } from "@/lib/levelPath";
import { StagedSkillKey, TRACK_LABEL } from "@/lib/types";
import { Sparkles, Target } from "lucide-react";

// Skills: everything about your level — what to unlock next, what you've
// proven in training, and the trophy road.
type SkillsTab = "tree" | "proven" | "road";
const TABS: { id: SkillsTab; label: string }[] = [
  { id: "tree", label: "Skills" },
  { id: "proven", label: "Proven" },
  { id: "road", label: "Road" },
];

export default function SkillsPage() {
  const { user, userDoc, loading, refreshUserDoc } = useAuth();
  const { t, tx } = useLanguage();
  const router = useRouter();
  const [tab, setTab] = useState<SkillsTab>("tree");
  const [activeSkill, setActiveSkill] = useState<StagedSkillKey | null>(null);
  const [declareOpen, setDeclareOpen] = useState(false);
  const [fullRoad, setFullRoad] = useState(false);

  useEffect(() => {
    const urlTab = new URLSearchParams(window.location.search).get("tab");
    if (urlTab && TABS.some((x) => x.id === urlTab)) setTab(urlTab as SkillsTab);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/");
    else if (userDoc && !userDoc.onboarded) router.replace("/onboarding");
  }, [loading, user, userDoc, router]);

  if (loading || !userDoc) return <PageLoading variant="list" />;

  const level = levelProgress(userDoc.xp).level;

  const selectTab = (next: SkillsTab) => {
    setTab(next);
    router.replace(next === "tree" ? "/skills" : `/skills?tab=${next}`, { scroll: false });
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <Nav />
      <main id="main" tabIndex={-1} className="max-w-3xl mx-auto px-4 py-6 pb-24 sm:pb-6 space-y-4">
        <h1 className="heading text-2xl text-zinc-100">{tx("Skills")}</h1>
        <HeadlineCard userDoc={userDoc} />
        <CompareLink />

        <div className="sticky top-0 z-20 -mx-4 px-4 py-2 bg-zinc-950/85 backdrop-blur">
          <div role="tablist" className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
            {TABS.map((x) => (
              <button
                key={x.id}
                role="tab"
                aria-selected={tab === x.id}
                onClick={() => selectTab(x.id)}
                className={`py-2 rounded-lg text-sm transition-colors ${
                  tab === x.id ? "bg-zinc-800 text-zinc-100 shadow" : "text-muted hover:text-zinc-300"
                }`}
              >
                {tx(x.label)}
              </button>
            ))}
          </div>
        </div>

        {tab === "tree" && (
          <div className="space-y-4 animate-overlay-fade-in">
            <SkillTree userDoc={userDoc} playerLevel={level} onInfo={setActiveSkill} />

            {userDoc.goalTracks?.length > 0 && (
              <div className="panel p-4">
                <h2 className="heading text-base text-zinc-100 mb-2 flex items-center gap-2">
                  <Target size={16} className="text-orange-400" /> {tx("Your goals")}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {userDoc.goalTracks.map((track) => (
                    <span key={track} className="text-xs px-2.5 py-1 rounded-full border border-orange-500/50 bg-orange-500/10 text-orange-300">
                      {tx(TRACK_LABEL[track])}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="panel p-4">
              <h2 className="heading text-base text-zinc-100 mb-1 flex items-center gap-2">
                <Sparkles size={16} className="text-orange-400" /> {t("profile", "updateSkills")}
              </h2>
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
          </div>
        )}

        {tab === "proven" && (
          <div className="space-y-4 animate-overlay-fade-in">
            <VerifiedSkillsCard userDoc={userDoc} />
            <SkillWall skills={userDoc.skills} mastery={userDoc.skillMastery} playerLevel={level} />
            <div className="panel p-4">
              <h2 className="heading text-base text-zinc-100 mb-2">{t("profile", "skillRadar")}</h2>
              <SkillRadarChart skills={userDoc.skills} />
            </div>
          </div>
        )}

        {tab === "road" && (
          <div className="space-y-4 animate-overlay-fade-in">
            <NextMilestones playerLevel={level} />
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
      </main>

      <SkillInfoModal
        skill={activeSkill}
        onClose={() => setActiveSkill(null)}
        playerLevel={level}
        skills={userDoc.skills}
        skillMastery={userDoc.skillMastery}
      />
      <DeclareSkillModal open={declareOpen} onClose={() => setDeclareOpen(false)} userDoc={userDoc} onSaved={refreshUserDoc} />
    </>
  );
}
