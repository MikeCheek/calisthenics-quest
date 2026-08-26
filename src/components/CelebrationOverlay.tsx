"use client";

import { useEffect, useState } from "react";
import { Celebration, StreakEvent } from "@/lib/sessionComplete";
import { Flame, Snowflake, Sparkles, TrendingUp } from "lucide-react";

type Item = { kind: "levelup"; level: number } | { kind: "streak"; event: StreakEvent; streak: number };

const CONFETTI_COLORS = ["#f97316", "#fb923c", "#34d399", "#e4e4e7", "#facc15"];

export default function CelebrationOverlay({ celebration }: { celebration: Celebration | null }) {
  const [queue, setQueue] = useState<Item[]>([]);
  const [current, setCurrent] = useState<Item | null>(null);

  useEffect(() => {
    if (!celebration) return;
    const items: Item[] = [];
    if (celebration.leveledUp) items.push({ kind: "levelup", level: celebration.newLevel });
    if (celebration.streakEvent !== "none") {
      items.push({ kind: "streak", event: celebration.streakEvent, streak: celebration.newStreak });
    }
    if (items.length > 0) setQueue(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebration]);

  useEffect(() => {
    if (current || queue.length === 0) return;
    const [next, ...rest] = queue;
    setCurrent(next);
    setQueue(rest);
    const t = setTimeout(() => setCurrent(null), 2600);
    return () => clearTimeout(t);
  }, [queue, current]);

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center px-6 bg-zinc-950/60 animate-overlay-fade-in"
      onClick={() => setCurrent(null)}
    >
      {current.kind === "levelup" ? <LevelUpCard level={current.level} /> : <StreakCard event={current.event} streak={current.streak} />}
    </div>
  );
}

function LevelUpCard({ level }: { level: number }) {
  return (
    <div className="relative panel px-8 py-7 text-center animate-pop-in border-orange-500/50">
      <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className="absolute top-0 w-2 h-2 rounded-sm animate-confetti"
            style={{
              left: `${(i * 137) % 100}%`,
              backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              animationDelay: `${(i % 5) * 0.12}s`,
            }}
          />
        ))}
      </div>
      <Sparkles size={32} className="text-orange-400 mx-auto mb-2" />
      <div className="heading text-xl text-zinc-100 mb-1">Level Up!</div>
      <div className="stat-mono text-5xl text-orange-400">{level}</div>
    </div>
  );
}

function StreakCard({ event, streak }: { event: StreakEvent; streak: number }) {
  if (event === "unfrozen") {
    return (
      <div className="panel px-8 py-7 text-center animate-pop-in border-orange-500/50">
        <Flame size={40} className="text-orange-400 mx-auto mb-2 animate-thaw" />
        <div className="heading text-lg text-zinc-100 mb-1">Streak unfrozen!</div>
        <div className="text-xs text-zinc-400 mb-2">Rest days don&apos;t break it — welcome back.</div>
        <div className="stat-mono text-4xl text-orange-400 flex items-center justify-center gap-1">
          {streak} <Snowflake size={18} className="text-zinc-500" />
        </div>
      </div>
    );
  }
  if (event === "restarted") {
    return (
      <div className="panel px-8 py-7 text-center animate-pop-in animate-gentle-shake border-zinc-700">
        <Flame size={40} className="text-zinc-500 mx-auto mb-2" />
        <div className="heading text-lg text-zinc-100 mb-1">Fresh start</div>
        <div className="text-xs text-zinc-400 mb-2">The streak reset — let&apos;s build it back up.</div>
        <div className="stat-mono text-4xl text-zinc-100">{streak}</div>
      </div>
    );
  }
  const label = event === "started" ? "Streak started!" : "Streak up!";
  return (
    <div className="panel px-8 py-7 text-center animate-pop-in border-orange-500/50">
      <Flame size={40} className="text-orange-400 mx-auto mb-2 animate-flame-pulse" />
      <div className="heading text-lg text-zinc-100 mb-1">{label}</div>
      <div className="stat-mono text-4xl text-orange-400 flex items-center justify-center gap-1">
        {streak} <TrendingUp size={18} className="text-emerald-400" />
      </div>
    </div>
  );
}
