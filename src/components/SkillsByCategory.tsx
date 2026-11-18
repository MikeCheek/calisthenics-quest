"use client";

import { useRouter } from "next/navigation";
import InfoIconButton from "@/components/InfoIconButton";
import { SKILL_CATEGORIES } from "@/lib/skillCategories";
import { SKILL_FIELD_LABEL, StagedSkillKey, MASTERY_LABEL, UserDoc } from "@/lib/types";
import { STAGE_LABEL } from "@/lib/stageOrder";
import { useLanguage } from "@/context/LanguageContext";
import { BadgeCheck } from "lucide-react";

// All 50 skills grouped by category (formerly the Skills page). Tapping a
// skill opens the bonus wheel on it; the info icon explains the skill.
export default function SkillsByCategory({
  userDoc,
  onInfo,
}: {
  userDoc: UserDoc;
  onInfo: (skill: StagedSkillKey) => void;
}) {
  const router = useRouter();
  const { tx } = useLanguage();
  return (
    <div className="space-y-6">
        {SKILL_CATEGORIES.map((cat) => (
        <div key={cat.name}>
          <div className="text-xs uppercase tracking-wide text-emerald-400 mb-2">{tx(cat.name)}</div>
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
                    {userDoc.claims?.[skill]?.status === "verified" && (
                      <BadgeCheck size={13} className="text-emerald-400 shrink-0" aria-label={tx("verified")} />
                    )}
                    <span className="text-xs text-zinc-500 shrink-0 ml-auto">
                      {tx(STAGE_LABEL[stage] ?? stage)}
                      {started && m && ` · ${tx(MASTERY_LABEL[m])}`}
                    </span>
                  </button>
                  <InfoIconButton
                    onClick={() => onInfo(skill)}
                    label={`About ${SKILL_FIELD_LABEL[skill]}`}
                    size={16}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
