"use client";

import Link from "next/link";
import { CheckSpec, MASTERY_LABEL, SKILL_FIELD_LABEL, UserDoc } from "@/lib/types";
import { STAGE_LABEL } from "@/lib/stageOrder";
import { nextUnlocks } from "@/lib/skillTree";
import { useLanguage } from "@/context/LanguageContext";
import { BadgeCheck, Target, ChevronRight } from "lucide-react";

// One thing to aim at: today's Skill Check when there is one (proving a
// claim is the fastest way forward), otherwise the top "Up next" unlock.
export default function NextGoalCard({ userDoc, check, playerLevel }: { userDoc: UserDoc; check: CheckSpec | null; playerLevel: number }) {
  const { tx } = useLanguage();

  if (check) {
    const target =
      check.kind === "hold" ? tx("{n}s hold", { n: check.target }) : check.kind === "reps" ? tx("{n} reps", { n: check.target }) : tx("one clean attempt");
    return (
      <Link href="/training" className="panel p-4 flex items-center gap-3 border-sky-500/30 hover:border-sky-500/60 transition-colors">
        <span className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center shrink-0">
          <BadgeCheck size={19} className="text-sky-400" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-xs text-sky-400 uppercase tracking-wide">{tx("Prove it today")}</span>
          <span className="block text-sm text-zinc-100 truncate">{tx(check.label)}</span>
          <span className="block text-xs text-muted">{tx("Skill Check in today's session · {t}", { t: target })}</span>
        </span>
        <ChevronRight size={16} className="text-muted shrink-0" />
      </Link>
    );
  }

  const next = nextUnlocks(userDoc.skills, userDoc.skillMastery ?? {}, userDoc.goalTracks ?? [], userDoc.claims, playerLevel, 1)[0];
  if (!next) return null;
  return (
    <Link href="/progress?tab=skills" className="panel p-4 flex items-center gap-3 hover:border-orange-500/50 transition-colors">
      <span className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0">
        <Target size={19} className="text-orange-400" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-xs text-orange-400 uppercase tracking-wide">{tx("Next goal")}</span>
        <span className="block text-sm text-zinc-100 truncate">
          {tx(SKILL_FIELD_LABEL[next.skill])} · {tx(STAGE_LABEL[next.toStage] ?? next.toStage)}
        </span>
        <span className="block text-xs text-muted">
          {next.fromStage === "none"
            ? tx("A good place to start at your level")
            : tx("Now: {stage}, {mastery}", { stage: tx(STAGE_LABEL[next.fromStage] ?? next.fromStage), mastery: tx(MASTERY_LABEL[next.mastery]).toLowerCase() })}
        </span>
      </span>
      <ChevronRight size={16} className="text-muted shrink-0" />
    </Link>
  );
}
