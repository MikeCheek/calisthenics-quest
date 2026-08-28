"use client";

import { useState } from "react";
import { SKILL_CATEGORIES } from "@/lib/skillCategories";
import { STAGE_ORDER, stageIndex } from "@/lib/stageOrder";
import { SkillProfile, StagedSkillKey, SkillMastery, DEFAULT_MASTERY } from "@/lib/types";
import SkillInfoModal from "@/components/SkillInfoModal";

const ALL_SKILLS: StagedSkillKey[] = SKILL_CATEGORIES.flatMap((c) => c.skills);

// 0 = untouched, 1-4 = increasingly filled in — same idea as a GitHub
// contribution square, but the "activity" being shaded is how far into a
// skill's stage ladder you are, discounted by how solid your claim on it
// actually is (mastery). A skill you've barely attempted at an advanced
// stage lights up dimmer than one you've genuinely consolidated.
function intensity(skill: StagedSkillKey, skills: SkillProfile, mastery: Partial<Record<StagedSkillKey, SkillMastery>>): number {
  const stage = skills[skill] as string;
  const idx = stageIndex(skill, stage);
  if (idx <= 0) return 0;
  const order = STAGE_ORDER[skill] ?? [];
  const maxIdx = Math.max(1, order.length - 1);
  const stageFraction = idx / maxIdx;
  const m = mastery[skill] ?? DEFAULT_MASTERY;
  const combined = stageFraction * (m / 5);
  return Math.min(4, Math.max(1, Math.ceil(combined * 4)));
}

const LEVEL_CLASS: Record<number, string> = {
  0: "bg-zinc-800",
  1: "bg-emerald-950 border border-emerald-900",
  2: "bg-emerald-800",
  3: "bg-emerald-600",
  4: "bg-emerald-400",
};

export default function SkillWall({
  skills,
  mastery,
  playerLevel,
}: {
  skills: SkillProfile;
  mastery: Partial<Record<StagedSkillKey, SkillMastery>>;
  playerLevel?: number;
}) {
  const [activeSkill, setActiveSkill] = useState<StagedSkillKey | null>(null);
  const startedCount = ALL_SKILLS.filter((s) => intensity(s, skills, mastery) > 0).length;

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between mb-1">
        <div className="heading text-base text-zinc-100">Skill wall</div>
        <div className="text-xs text-zinc-500">{startedCount}/50 lit</div>
      </div>
      <p className="text-xs text-zinc-500 mb-3">
        Every skill, one square each — brighter means further into its progression and more solidly
        claimed. Tap a square for details.
      </p>

      <div className="grid grid-cols-10 gap-1.5">
        {ALL_SKILLS.map((skill) => {
          const level = intensity(skill, skills, mastery);
          return (
            <button
              key={skill}
              onClick={() => setActiveSkill(skill)}
              aria-label={skill}
              className={`aspect-square rounded-sm ${LEVEL_CLASS[level]} hover:ring-1 hover:ring-orange-400 transition-shadow`}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-1.5 mt-3 text-xs text-zinc-500">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((lvl) => (
          <span key={lvl} className={`w-3 h-3 rounded-sm ${LEVEL_CLASS[lvl]}`} />
        ))}
        <span>More</span>
      </div>

      <SkillInfoModal
        skill={activeSkill}
        onClose={() => setActiveSkill(null)}
        playerLevel={playerLevel}
        skills={skills}
        skillMastery={mastery}
        showTrainCta={false}
      />
    </div>
  );
}
