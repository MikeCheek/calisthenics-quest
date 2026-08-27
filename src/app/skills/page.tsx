"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Nav from "@/components/Nav";
import Modal from "@/components/Modal";
import { SKILL_CATEGORIES } from "@/lib/skillCategories";
import { SKILL_DESCRIPTIONS } from "@/lib/skillDescriptions";
import { SKILL_FIELD_LABEL, StagedSkillKey, SkillProfile } from "@/lib/types";
import { STAGE_LABEL } from "@/lib/stageOrder";
import { pathNodesForSkill, isSkillAStretch, suggestEasierSkill } from "@/lib/levelPath";
import { xpProgress } from "@/lib/xp";
import { Info, Sparkles } from "lucide-react";

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

  const level = xpProgress(userDoc.xp).level;

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
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveSkill(skill)}
                      className="p-1.5 text-zinc-500 hover:text-orange-400 shrink-0"
                      aria-label={`About ${SKILL_FIELD_LABEL[skill]}`}
                    >
                      <Info size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </main>

      <SkillInfoModal skill={activeSkill} onClose={() => setActiveSkill(null)} playerLevel={level} skills={userDoc.skills} />
    </>
  );
}

function SkillInfoModal({
  skill,
  onClose,
  playerLevel,
  skills,
}: {
  skill: StagedSkillKey | null;
  onClose: () => void;
  playerLevel: number;
  skills: SkillProfile;
}) {
  const router = useRouter();

  if (!skill) {
    return null;
  }

  const stage = skills[skill] as string;
  const arc = pathNodesForSkill(skill);
  const stretch = isSkillAStretch(skill, playerLevel);
  const suggestion = stretch ? suggestEasierSkill(playerLevel, skills) : null;

  const goTrain = (target: StagedSkillKey) => {
    onClose();
    router.push(`/wheel?skill=${target}`);
  };

  return (
    <Modal open={!!skill} onClose={onClose} title={SKILL_FIELD_LABEL[skill]}>
      <p className="text-sm text-zinc-300 mb-3">{SKILL_DESCRIPTIONS[skill]}</p>

      <div className="text-xs text-zinc-500 mb-3">
        Your stage: <span className="text-zinc-200">{STAGE_LABEL[stage] ?? stage}</span>
      </div>

      {arc.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-zinc-500 mb-1.5">Suggested arc on the trophy road</div>
          <div className="flex flex-wrap gap-1.5">
            {arc.map((n) => (
              <span
                key={n.level}
                className={`text-xs px-2 py-1 rounded-full border ${
                  playerLevel >= n.level ? "border-emerald-700 text-emerald-400" : "border-zinc-700 text-zinc-500"
                }`}
              >
                Lv {n.level} · {STAGE_LABEL[n.stage ?? ""] ?? n.stage}
              </span>
            ))}
          </div>
        </div>
      )}

      {stretch && suggestion?.skill && suggestion.skill !== skill ? (
        <div className="panel p-3 border-orange-500/40 mb-1">
          <div className="flex items-start gap-2">
            <Sparkles size={14} className="text-orange-400 mt-0.5 shrink-0" />
            <div className="text-xs text-zinc-300">
              This one&apos;s a stretch for level {playerLevel} — the road doesn&apos;t suggest it until
              around level {arc[0]?.level}.{" "}
              <span className="text-zinc-100">{SKILL_FIELD_LABEL[suggestion.skill]}</span> might be a
              better fit right now.
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => goTrain(suggestion.skill!)}
              className="flex-1 py-2 rounded-lg text-xs bg-orange-500 hover:bg-orange-400 text-zinc-950"
            >
              Train {SKILL_FIELD_LABEL[suggestion.skill]} instead
            </button>
            <button
              onClick={() => goTrain(skill)}
              className="flex-1 py-2 rounded-lg text-xs border border-zinc-700 text-zinc-300 hover:border-orange-500"
            >
              Train this anyway
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => goTrain(skill)}
          className="w-full py-2.5 rounded-lg heading text-sm bg-orange-500 hover:bg-orange-400 text-zinc-950"
        >
          Train this skill →
        </button>
      )}
    </Modal>
  );
}
