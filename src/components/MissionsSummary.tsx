"use client";

import { useState } from "react";
import { Mission } from "@/lib/types";
import { currentWeekKey } from "@/lib/missions";
import MissionList from "@/components/MissionList";
import { useLanguage } from "@/context/LanguageContext";
import { ChevronDown, ListChecks } from "lucide-react";

// Missions as one line on the dashboard; the full list is a tap away.
export default function MissionsSummary({ missions }: { missions: Mission[] }) {
  const { tx } = useLanguage();
  const [open, setOpen] = useState(false);
  const active = missions.filter((m) => m.weekKey === currentWeekKey());
  const done = active.filter((m) => m.completed).length;
  const xpLeft = active.filter((m) => !m.completed).reduce((n, m) => n + m.xpReward, 0);

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full panel px-4 py-3 flex items-center gap-3 text-left hover:border-zinc-600 transition-colors"
      >
        <ListChecks size={18} className="text-emerald-400 shrink-0" />
        <span className="flex-1 min-w-0">
          <span className="block text-sm text-zinc-100">{tx("Weekly missions")}</span>
          <span className="block text-xs text-muted">
            {active.length
              ? tx("{a} of {b} done", { a: done, b: active.length }) + (xpLeft ? ` · ${tx("+{n} XP up for grabs", { n: xpLeft })}` : "")
              : tx("Complete a session to roll this week's missions")}
          </span>
        </span>
        <ChevronDown size={16} className={`text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-2 animate-overlay-fade-in">
          <MissionList missions={missions} />
        </div>
      )}
    </div>
  );
}
