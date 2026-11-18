"use client";

import { nextMilestones } from "@/lib/skillTree";
import { SKILL_FIELD_LABEL } from "@/lib/types";
import { STAGE_LABEL } from "@/lib/stageOrder";
import { useLanguage } from "@/context/LanguageContext";
import { Flag, Dumbbell, Hash, Crown } from "lucide-react";
import { RANK_TITLES, rankTitle } from "@/lib/xp";

// The trophy road's next three stops, so the next goal is visible without
// scrolling a 50-node road.
export default function NextMilestones({ playerLevel }: { playerLevel: number }) {
  const { tx } = useLanguage();
  const next = nextMilestones(playerLevel);
  if (next.length === 0) {
    return <div className="panel p-4 text-sm text-zinc-300">{tx("You've passed every milestone on the road. Legendary.")}</div>;
  }
  // the rank title lives here, as the chapter you're in — not in headers
  const chapter = rankTitle(playerLevel);
  const blurb = RANK_TITLES.find((r) => r.title === chapter)?.blurb;
  return (
    <section className="panel p-4 border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-transparent">
      <div className="mb-3 pb-3 border-b border-zinc-800">
        <div className="text-xs uppercase tracking-wide text-muted flex items-center gap-1.5">
          <Crown size={12} className="text-amber-400" /> {tx("Your chapter")}
        </div>
        <div className="heading text-lg text-zinc-100">{tx(chapter)}</div>
        {blurb && <div className="text-xs text-zinc-400">{tx(blurb)}</div>}
      </div>
      <div className="heading text-base text-zinc-100 mb-3 flex items-center gap-2">
        <Flag size={16} className="text-orange-400" /> {tx("Next milestones")}
      </div>
      <ol className="space-y-2">
        {next.map((n, i) => {
          const away = n.level - playerLevel;
          return (
            <li key={n.level + n.title} className="flex items-center gap-3 rounded-xl bg-zinc-950/50 border border-zinc-800 p-3">
              <span
                className={`w-9 h-9 shrink-0 rounded-lg flex flex-col items-center justify-center stat-mono ${
                  i === 0 ? "bg-orange-500 text-zinc-950" : "bg-zinc-800 text-zinc-300"
                }`}
              >
                <span className="text-xs leading-none opacity-80">LV</span>
                <span className="text-sm font-bold leading-none">{n.level}</span>
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm text-zinc-100 truncate">{n.title}</span>
                <span className="block text-xs text-muted flex items-center gap-1">
                  {n.isStat ? <Hash size={11} /> : <Dumbbell size={11} />}
                  {n.skill && n.stage ? `${SKILL_FIELD_LABEL[n.skill]} — ${tx(STAGE_LABEL[n.stage] ?? n.stage)}` : tx("Strength target")}
                </span>
              </span>
              <span className="text-xs text-zinc-400 shrink-0">{tx(away === 1 ? "next level" : "in {n} levels", { n: away })}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
