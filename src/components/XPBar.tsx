"use client";

import { xpProgress, rankTitle } from "@/lib/xp";

export default function XPBar({ xp, streak }: { xp: number; streak: number }) {
  const p = xpProgress(xp);
  return (
    <div className="panel rounded-lg p-4">
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <div className="heading text-2xl text-zinc-100">Level {p.level}</div>
          <div className="text-xs text-zinc-400 stat-mono">{rankTitle(p.level)}</div>
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
        {p.into} / {p.span} XP to level {p.level + 1}
      </div>
    </div>
  );
}
