"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { rankTitle } from "@/lib/xp";
import { effectiveXpProgress } from "@/lib/levelPath";
import { SkillProfile, StagedSkillKey, SkillMastery } from "@/lib/types";

export default function XPBar({
  xp,
  streak,
  skills,
  mastery,
}: {
  xp: number;
  streak: number;
  skills: SkillProfile;
  mastery: Partial<Record<StagedSkillKey, SkillMastery>>;
}) {
  const p = effectiveXpProgress(xp, skills, mastery);
  return (
    <Link href="/path" className="panel rounded-lg p-4 block hover:border-orange-500/50 transition-colors">
      <div className="flex items-baseline justify-between mb-2">
        <div className="flex items-center gap-1">
          <div>
            <div className="heading text-2xl text-zinc-100">Level {p.level}</div>
            <div className="text-xs text-zinc-400 stat-mono">{rankTitle(p.level)}</div>
          </div>
          <ChevronRight size={16} className="text-zinc-600" />
        </div>
        <div className="text-right">
          <div className="stat-mono text-lg text-orange-400">{streak}🔥</div>
          <div className="text-xs text-zinc-400">day streak</div>
        </div>
      </div>
      <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
        <div
          className="h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-700"
          style={{ width: `${p.pct}%` }}
        />
      </div>
      <div className="text-xs text-zinc-400 mt-1 stat-mono">
        {p.catchingUp
          ? `${p.into} / ${p.span} XP — catching up to your skill level`
          : `${p.into} / ${p.span} XP to level ${p.level + 1}`}
      </div>
      <div className="text-xs text-orange-400 mt-2">View trophy road →</div>
    </Link>
  );
}
