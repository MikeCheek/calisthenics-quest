"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Nav from "@/components/Nav";
import SkillInfoModal from "@/components/SkillInfoModal";
import InfoIconButton from "@/components/InfoIconButton";
import { SKILL_CATEGORIES } from "@/lib/skillCategories";
import { SKILL_FIELD_LABEL, StagedSkillKey, MASTERY_LABEL } from "@/lib/types";
import { STAGE_LABEL } from "@/lib/stageOrder";
import { effectiveLevel } from "@/lib/levelPath";

export default function SkillsPage() {
  const { user, userDoc, loading } = useAuth();
  const router = useRouter();
  const [activeSkill, setActiveSkill] = useState<StagedSkillKey | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/");
    else if (userDoc && !userDoc.onboarded) router.replace("/onboarding");
  }, [loading, user, userDoc, router]);

  if (loading || !userDoc) {
    return <main className="min-h-screen flex items-center justify-center text-zinc-400">Loading...</main>;
  }

  const level = effectiveLevel(userDoc.xp, userDoc.skills, userDoc.skillMastery);

  return (
    <>
      <Nav />
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 sm:pb-6 space-y-6">
        <div>
          <h1 className="heading text-2xl text-zinc-100">Skills</h1>
          <p className="text-zinc-400 text-sm">
            All 50, grouped by category. Tap the info icon for what a skill is and where you&apos;re
            at; tap a skill to head to the bonus wheel and train it.
          </p>
        </div>

        {SKILL_CATEGORIES.map((cat) => (
          <div key={cat.name}>
            <div className="text-xs uppercase tracking-wide text-emerald-400 mb-2">{cat.name}</div>
            <div className="space-y-1.5">
              {cat.skills.map((skill) => {
                const stage = userDoc.skills[skill] as string;
                const started = stage !== "none";
                const m = userDoc.skillMastery?.[skill];
                return (
                  <div key={skill} className="panel px-3 py-2.5 flex items-center justify-between gap-2">
                    <button
                      onClick={() => router.push(`/wheel?skill=${skill}`)}
                      className="flex-1 text-left flex items-center gap-2 min-w-0"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${started ? "bg-emerald-500" : "bg-zinc-700"}`} />
                      <span className="text-sm text-zinc-100 truncate">{SKILL_FIELD_LABEL[skill]}</span>
                      <span className="text-xs text-zinc-500 shrink-0 ml-auto">
                        {STAGE_LABEL[stage] ?? stage}
                        {started && m && ` · ${MASTERY_LABEL[m]}`}
                      </span>
                    </button>
                    <InfoIconButton
                      onClick={() => setActiveSkill(skill)}
                      label={`About ${SKILL_FIELD_LABEL[skill]}`}
                      size={16}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </main>

      <SkillInfoModal
        skill={activeSkill}
        onClose={() => setActiveSkill(null)}
        playerLevel={level}
        skills={userDoc.skills}
        skillMastery={userDoc.skillMastery}
      />
    </>
  );
}
