"use client";

import { useState } from "react";
import { SkillProfile, StagedSkillKey, SKILL_FIELD_LABEL } from "@/lib/types";
import { STAGE_ORDER, STAGE_LABEL } from "@/lib/stageOrder";

const SKILL_ORDER: StagedSkillKey[] = [
  "frontLever", "backLever", "planche", "muscleUp", "handstand", "humanFlag", "pistolSquat", "lSit",
  "oneArmPullUp", "oneArmPushUp", "oneArmHandstand", "handstandPushUp",
  "dragonFlag", "elbowLever", "manna", "nordicCurl", "shrimpSquat",
  "ironCross", "maltese", "impossibleDip",
];

export default function SkillTabPicker({
  skills,
  onChange,
}: {
  skills: SkillProfile;
  onChange: (skill: StagedSkillKey, stage: string) => void;
}) {
  const [active, setActive] = useState<StagedSkillKey>("frontLever");
  const stages = STAGE_ORDER[active] ?? ["none"];
  const currentStage = skills[active] as string;

  return (
    <div>
      {/* horizontal scroller — the fix for a 20-skill list on mobile */}
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
          <div className="heading text-sm text-zinc-100">{SKILL_FIELD_LABEL[active]}</div>
          <div className="stat-mono text-xs text-orange-400">{STAGE_LABEL[currentStage] ?? currentStage}</div>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
          {stages.map((stage) => (
            <button
              key={stage}
              type="button"
              onClick={() => onChange(active, stage)}
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
      </div>
    </div>
  );
}
