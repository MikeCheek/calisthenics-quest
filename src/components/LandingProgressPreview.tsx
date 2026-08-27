"use client";

import { SkillProfile, DEFAULT_SKILLS } from "@/lib/types";
import SkillRadarChart from "@/components/SkillRadarChart";
import { Flame, Check, Lock } from "lucide-react";

// Fabricated, clearly-labeled example data — not tied to any real account.
// Shows a mid-progress athlete so the radar chart actually has a shape.
const MOCK_SKILLS: SkillProfile = {
  ...DEFAULT_SKILLS,
  frontLever: "straddle",
  backLever: "advancedTuck",
  planche: "tuck",
  muscleUp: "single",
  handstand: "freestanding",
  humanFlag: "tuck",
  pistolSquat: "full",
  lSit: "advanced",
  dragonFlag: "tuck",
  toesToBar: "developing",
};

const MOCK_LEVEL = 14;
const MOCK_RANK = "Skill Chaser";
const MOCK_STREAK = 12;
const MOCK_XP_PCT = 62;

const MOCK_MILESTONES: { level: number; title: string; done: boolean; current: boolean }[] = [
  { level: 10, title: "Bar Athlete unlocked", done: true, current: false },
  { level: 16, title: "Tuck Front Lever", done: false, current: true },
  { level: 21, title: "Tuck Planche", done: false, current: false },
];

export default function LandingProgressPreview() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="panel p-4">
          <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Example — Level</div>
          <div className="heading text-2xl text-zinc-100">Lv {MOCK_LEVEL}</div>
          <div className="text-xs text-orange-400 stat-mono mb-2">{MOCK_RANK}</div>
          <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
            <div className="h-full bg-gradient-to-r from-orange-600 to-orange-400" style={{ width: `${MOCK_XP_PCT}%` }} />
          </div>
        </div>
        <div className="panel p-4">
          <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Example — Streak</div>
          <div className="heading text-2xl text-zinc-100 flex items-center gap-1.5">
            {MOCK_STREAK} <Flame size={18} className="text-orange-400" />
          </div>
          <div className="text-xs text-zinc-500">days in a row</div>
        </div>
      </div>

      <div className="panel p-4">
        <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Example — skill radar</div>
        <SkillRadarChart skills={MOCK_SKILLS} />
      </div>

      <div className="panel p-4">
        <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Example — trophy road</div>
        <div className="space-y-2">
          {MOCK_MILESTONES.map((m) => (
            <div
              key={m.level}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm ${
                m.done
                  ? "border-emerald-800 bg-emerald-600/5 text-emerald-400"
                  : m.current
                  ? "border-orange-500 bg-orange-500/10 text-zinc-100"
                  : "border-zinc-800 text-zinc-500"
              }`}
            >
              {m.done ? <Check size={14} /> : <Lock size={12} />}
              <span className="stat-mono text-xs">Lv {m.level}</span>
              <span className="flex-1">{m.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
