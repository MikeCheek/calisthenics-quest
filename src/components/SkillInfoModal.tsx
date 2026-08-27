"use client";

import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import { SKILL_DESCRIPTIONS } from "@/lib/skillDescriptions";
import {
  StagedSkillKey,
  SkillProfile,
  SkillMastery,
  MASTERY_LABEL,
  DEFAULT_MASTERY,
  SKILL_FIELD_LABEL,
} from "@/lib/types";
import { STAGE_LABEL } from "@/lib/stageOrder";
import { pathNodesForSkill, isSkillAStretch, suggestEasierSkill } from "@/lib/levelPath";
import { Sparkles } from "lucide-react";

export default function SkillInfoModal({
  skill,
  onClose,
  playerLevel,
  skills,
  skillMastery,
  showTrainCta = true,
}: {
  skill: StagedSkillKey | null;
  onClose: () => void;
  // Player context is optional — the landing page and mid-onboarding show
  // this same modal without a real account/level to compare against, in
  // which case the stage/mastery/stretch-suggestion sections just don't render.
  playerLevel?: number;
  skills?: SkillProfile;
  skillMastery?: Partial<Record<StagedSkillKey, SkillMastery>>;
  showTrainCta?: boolean;
}) {
  const router = useRouter();

  if (!skill) return null;

  const stage = skills ? (skills[skill] as string) : null;
  const mastery = skillMastery?.[skill] ?? DEFAULT_MASTERY;
  const arc = pathNodesForSkill(skill);
  const stretch = playerLevel !== undefined ? isSkillAStretch(skill, playerLevel) : false;
  const suggestion = stretch && skills && playerLevel !== undefined ? suggestEasierSkill(playerLevel, skills) : null;

  const goTrain = (target: StagedSkillKey) => {
    onClose();
    router.push(`/wheel?skill=${target}`);
  };

  return (
    <Modal open={!!skill} onClose={onClose} title={SKILL_FIELD_LABEL[skill]}>
      <p className="text-sm text-zinc-300 mb-3">{SKILL_DESCRIPTIONS[skill]}</p>

      {stage !== null && (
        <div className="text-xs text-zinc-500 mb-3">
          Your stage: <span className="text-zinc-200">{STAGE_LABEL[stage] ?? stage}</span>
          {stage !== "none" && (
            <>
              {" "}· <span className="text-zinc-200">{MASTERY_LABEL[mastery]}</span>{" "}
              <span className="text-zinc-600">
                ({"●".repeat(mastery)}
                {"○".repeat(5 - mastery)})
              </span>
            </>
          )}
        </div>
      )}

      {arc.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-zinc-500 mb-1.5">Suggested arc on the trophy road</div>
          <div className="flex flex-wrap gap-1.5">
            {arc.map((n) => (
              <span
                key={n.level}
                className={`text-xs px-2 py-1 rounded-full border ${
                  playerLevel !== undefined && playerLevel >= n.level
                    ? "border-emerald-700 text-emerald-400"
                    : "border-zinc-700 text-zinc-500"
                }`}
              >
                Lv {n.level} · {STAGE_LABEL[n.stage ?? ""] ?? n.stage}
              </span>
            ))}
          </div>
        </div>
      )}

      {!showTrainCta ? null : stretch && suggestion?.skill && suggestion.skill !== skill ? (
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
