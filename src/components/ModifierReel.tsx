"use client";

import { Modifier, weightedModifierList } from "@/lib/wheelModifiers";

const DISPLAY_LIST = weightedModifierList();

export default function ModifierReel({
  phase,
  result,
}: {
  phase: "idle" | "cycling" | "revealed";
  result: Modifier | null;
}) {
  if (phase === "idle") {
    return (
      <div className="h-14 flex items-center justify-center text-xs text-zinc-500 border border-zinc-700 rounded-lg">
        Bonus / malus reveals after the wheel lands
      </div>
    );
  }

  if (phase === "cycling") {
    const loop = [...DISPLAY_LIST, ...DISPLAY_LIST];
    return (
      <div className="h-14 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800/50 relative">
        <div className="animate-reel-scroll">
          {loop.map((m, i) => (
            <div key={i} className="h-14 flex items-center justify-center text-sm text-zinc-300">
              {m.label}
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-zinc-900 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-3 bg-gradient-to-t from-zinc-900 to-transparent pointer-events-none" />
      </div>
    );
  }

  const golden = result?.kind === "golden";
  return (
    <div
      className={`h-14 flex flex-col items-center justify-center rounded-lg border animate-pop-in ${
        golden
          ? "border-yellow-400 bg-yellow-400/10 animate-golden-glow"
          : result?.kind === "none"
          ? "border-zinc-700 bg-zinc-800/50"
          : "border-orange-500 bg-orange-500/10"
      }`}
    >
      <div className={`text-sm font-medium ${golden ? "text-yellow-300" : "text-zinc-100"}`}>{result?.label}</div>
    </div>
  );
}
