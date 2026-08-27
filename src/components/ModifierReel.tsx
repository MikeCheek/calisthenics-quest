"use client";

export type ReelPhase = "idle" | "cycling" | "revealed";

// A generic slot-machine style vertical reel: cycles through a list of
// short labels, then locks in on one. Used twice on the wheel screen — once
// for the modifier type, once for its quantity — so the visuals (and the
// golden glow for a golden result) live in one place.
export default function ModifierReel({
  phase,
  cyclingLabels,
  resultLabel,
  golden,
  idleLabel,
}: {
  phase: ReelPhase;
  cyclingLabels: string[];
  resultLabel: string | null;
  golden?: boolean;
  idleLabel: string;
}) {
  if (phase === "idle") {
    return (
      <div className="h-14 flex items-center justify-center text-center text-xs text-zinc-500 border border-zinc-700 rounded-lg px-2">
        {idleLabel}
      </div>
    );
  }

  if (phase === "cycling") {
    const loop = cyclingLabels.length > 0 ? [...cyclingLabels, ...cyclingLabels] : ["..."];
    return (
      <div className="h-14 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800/50 relative">
        <div className="animate-reel-scroll">
          {loop.map((label, i) => (
            <div key={i} className="h-14 flex items-center justify-center text-sm text-zinc-300 px-2 text-center">
              {label}
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-zinc-900 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-3 bg-gradient-to-t from-zinc-900 to-transparent pointer-events-none" />
      </div>
    );
  }

  return (
    <div
      className={`h-14 flex flex-col items-center justify-center rounded-lg border animate-pop-in px-2 text-center ${
        golden
          ? "border-yellow-400 bg-yellow-400/10 animate-golden-glow"
          : resultLabel === "No Bonus" || resultLabel === "as prescribed"
          ? "border-zinc-700 bg-zinc-800/50"
          : "border-orange-500 bg-orange-500/10"
      }`}
    >
      <div className={`text-sm font-medium ${golden ? "text-yellow-300" : "text-zinc-100"}`}>{resultLabel}</div>
    </div>
  );
}
