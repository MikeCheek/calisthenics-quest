"use client";

import { Mission } from "@/lib/types";
import { currentWeekKey } from "@/lib/missions";
import { Check } from "lucide-react";

export default function MissionList({ missions }: { missions: Mission[] }) {
  const wk = currentWeekKey();
  const active = missions.filter((m) => m.weekKey === wk);

  if (active.length === 0) {
    return (
      <div className="panel rounded-lg p-4 text-sm text-zinc-400">
        No missions yet — complete a session to roll this week&apos;s missions.
      </div>
    );
  }

  return (
    <div className="panel rounded-lg p-4">
      <div className="heading text-lg text-zinc-100 mb-3">Missions — This Week</div>
      <ul className="space-y-3">
        {active.map((m) => (
          <li key={m.id} className="flex items-start gap-3">
            <div
              className={`mt-0.5 w-5 h-5 shrink-0 rounded-lg border flex items-center justify-center ${
                m.completed
                  ? "bg-emerald-500 border-emerald-500"
                  : "border-zinc-600"
              }`}
            >
              {m.completed && <Check size={14} className="text-zinc-950" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${m.completed ? "text-zinc-400 line-through" : "text-zinc-100"}`}>
                  {m.label}
                </span>
                <span className="text-xs stat-mono text-orange-400">+{m.xpReward} XP</span>
              </div>
              <div className="text-xs text-zinc-400">{m.description}</div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-lg mt-1 overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${Math.min(100, (m.progress / m.targetCount) * 100)}%` }}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
