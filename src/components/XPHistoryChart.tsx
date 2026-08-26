"use client";

import { XPHistoryPoint } from "@/lib/types";

export default function XPHistoryChart({ history }: { history: XPHistoryPoint[] }) {
  if (history.length < 2) {
    return (
      <div className="text-sm text-zinc-500 py-8 text-center">
        Complete a few more sessions to see your XP trend here.
      </div>
    );
  }

  const width = 320;
  const height = 120;
  const pad = 8;
  const xs = history.map((_, i) => i);
  const ys = history.map((p) => p.xp);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanY = Math.max(1, maxY - minY);

  const x = (i: number) => pad + (i / (xs.length - 1)) * (width - pad * 2);
  const y = (v: number) => height - pad - ((v - minY) / spanY) * (height - pad * 2);

  const linePoints = history.map((p, i) => `${x(i)},${y(p.xp)}`).join(" ");
  const areaPoints = `${x(0)},${height - pad} ${linePoints} ${x(xs.length - 1)},${height - pad}`;

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#xpFill)" />
        <polyline points={linePoints} fill="none" stroke="#f97316" strokeWidth={2} strokeLinejoin="round" />
        {history.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.xp)} r={2} fill="#f97316" />
        ))}
      </svg>
      <div className="flex justify-between text-xs text-zinc-500 mt-1">
        <span>{new Date(history[0].dateISO).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
        <span>{maxY} XP</span>
        <span>{new Date(history[history.length - 1].dateISO).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
      </div>
    </div>
  );
}
