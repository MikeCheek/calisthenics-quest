"use client";

import { useState } from "react";
import { SkillProfile, StagedSkillKey, SkillMastery, MASTERY_LABEL, MASTERY_HINT, DEFAULT_MASTERY, SKILL_FIELD_LABEL } from "@/lib/types";
import { STAGE_ORDER, STAGE_LABEL } from "@/lib/stageOrder";
import { levelForSkillStage, requiredLevelForMastery, canClaimMastery } from "@/lib/levelPath";
import SkillInfoModal from "@/components/SkillInfoModal";
import InfoIconButton from "@/components/InfoIconButton";
import { Lock } from "lucide-react";

const SKILL_ORDER: StagedSkillKey[] = [
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

const MASTERY_VALUES: SkillMastery[] = [1, 2, 3, 4, 5];

export default function SkillTabPicker({
  skills,
  mastery,
  liveLevel,
  onStageChange,
  onMasteryChange,
}: {
  skills: SkillProfile;
  mastery: Partial<Record<StagedSkillKey, SkillMastery>>;
  liveLevel: number;
  onStageChange: (skill: StagedSkillKey, stage: string) => void;
  onMasteryChange: (skill: StagedSkillKey, mastery: SkillMastery) => void;
}) {
  const [active, setActive] = useState<StagedSkillKey>("frontLever");
  const [infoSkill, setInfoSkill] = useState<StagedSkillKey | null>(null);
  const stages = STAGE_ORDER[active] ?? ["none"];
  const currentStage = skills[active] as string;
  const currentMastery = mastery[active] ?? DEFAULT_MASTERY;
  const nodeLevel = levelForSkillStage(active, currentStage);

  return (
    <div>
      {/* horizontal scroller — the fix for a 50-skill list on mobile */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar">
        {SKILL_ORDER.map((s) => {
          const isSet = skills[s] !== "none";
          return (
            <button
              key={s}
              type="button"
              onClick={() => setActive(s)}
              className={`shrink-0 px-3 py-2 rounded-lg text-sm border whitespace-nowrap transition-colors ${
                active === s
                  ? "border-orange-500 bg-orange-500/10 text-zinc-100"
                  : isSet
                  ? "border-emerald-700 text-emerald-400"
                  : "border-zinc-700 text-zinc-400"
              }`}
            >
              {SKILL_FIELD_LABEL[s]}
            </button>
          );
        })}
      </div>

      <div className="panel p-3 mt-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className="heading text-sm text-zinc-100">{SKILL_FIELD_LABEL[active]}</div>
            <InfoIconButton onClick={() => setInfoSkill(active)} label={`About ${SKILL_FIELD_LABEL[active]}`} />
          </div>
          <div className="stat-mono text-xs text-orange-400">{STAGE_LABEL[currentStage] ?? currentStage}</div>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
          {stages.map((stage) => (
            <button
              key={stage}
              type="button"
              onClick={() => onStageChange(active, stage)}
              className={`shrink-0 px-3 py-2 rounded-lg text-sm border whitespace-nowrap ${
                currentStage === stage
                  ? "border-orange-500 bg-orange-500/10 text-zinc-100"
                  : "border-zinc-700 text-zinc-400"
              }`}
            >
              {STAGE_LABEL[stage] ?? stage}
            </button>
          ))}
        </div>

        {currentStage !== "none" && (
          <div className="mt-3 pt-3 border-t border-zinc-800">
            <div className="text-xs text-zinc-400 mb-1.5">
              How solid is your {STAGE_LABEL[currentStage] ?? currentStage}?
            </div>
            <div className="flex gap-1.5">
              {MASTERY_VALUES.map((m) => {
                const allowed = canClaimMastery(nodeLevel, m, liveLevel);
                const selected = currentMastery === m;
                return (
                  <button
                    key={m}
                    type="button"
                    disabled={!allowed}
                    onClick={() => onMasteryChange(active, m)}
                    className={`flex-1 py-2 rounded-lg text-xs border flex flex-col items-center gap-0.5 ${
                      selected
                        ? "border-orange-500 bg-orange-500/10 text-zinc-100"
                        : allowed
                        ? "border-zinc-700 text-zinc-400"
                        : "border-zinc-800 text-zinc-700 cursor-not-allowed"
                    }`}
                  >
                    {!allowed && <Lock size={10} />}
                    <span>{m}</span>
                  </button>
                );
              })}
            </div>
            <div className="text-xs text-zinc-500 mt-1.5">
              {MASTERY_LABEL[currentMastery]} — {MASTERY_HINT[currentMastery]}
            </div>
            {(() => {
              const nextLocked = MASTERY_VALUES.find((m) => !canClaimMastery(nodeLevel, m, liveLevel));
              if (!nextLocked) return null;
              const req = requiredLevelForMastery(nodeLevel, nextLocked);
              return (
                <div className="text-xs text-zinc-600 mt-1">
                  {MASTERY_LABEL[nextLocked]} and above unlock around level {req}.
                </div>
              );
            })()}
          </div>
        )}
      </div>

      <SkillInfoModal
        skill={infoSkill}
        onClose={() => setInfoSkill(null)}
        playerLevel={liveLevel}
        skills={skills}
        skillMastery={mastery}
        showTrainCta={false}
      />
    </div>
  );
}
