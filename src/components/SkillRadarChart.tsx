"use client";

import { SkillProfile } from "@/lib/types";

const STAGE_ORDER: Record<string, string[]> = {
  frontLever: ["none", "tuck", "advancedTuck", "oneLeg", "straddle", "full"],
  backLever: ["none", "tuck", "advancedTuck", "straddle", "full"],
  planche: ["none", "tuck", "advancedTuck", "straddle", "full"],
  muscleUp: ["none", "band", "single", "multiple"],
  handstand: ["none", "wall", "freestanding"],
  humanFlag: ["none", "tuck", "straddle", "full"],
  pistolSquat: ["none", "assisted", "full"],
  lSit: ["none", "tuck", "advanced", "full"],
};

const AXES: { key: keyof SkillProfile; label: string }[] = [
  { key: "frontLever", label: "Front Lever" },
  { key: "backLever", label: "Back Lever" },
  { key: "planche", label: "Planche" },
  { key: "muscleUp", label: "Muscle-Up" },
  { key: "handstand", label: "Handstand" },
  { key: "humanFlag", label: "Human Flag" },
  { key: "pistolSquat", label: "Pistol Squat" },
  { key: "lSit", label: "L-Sit" },
];

function level(key: string, stage: string): number {
  const order = STAGE_ORDER[key];
  const idx = order.indexOf(stage);
  if (idx < 0) return 0;
  return idx / (order.length - 1); // 0..1
}

export default function SkillRadarChart({ skills }: { skills: SkillProfile }) {
  const size = 240;
  const center = size / 2;
  const maxR = size / 2 - 34;
  const n = AXES.length;

  const point = (i: number, r: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)] as const;
  };

  const rings = [0.25, 0.5, 0.75, 1];
  const dataPoints = AXES.map((a, i) => point(i, level(a.key, skills[a.key] as string) * maxR));
  const polygon = dataPoints.map((p) => p.join(",")).join(" ");

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {rings.map((r) => {
          const ringPts = AXES.map((_, i) => point(i, r * maxR).join(",")).join(" ");
          return (
            <polygon key={r} points={ringPts} fill="none" stroke="#27272a" strokeWidth={1} />
          );
        })}
        {AXES.map((a, i) => {
          const [x, y] = point(i, maxR);
          return (
            <line key={a.key} x1={center} y1={center} x2={x} y2={y} stroke="#27272a" strokeWidth={1} />
          );
        })}
        <polygon points={polygon} fill="#f97316" fillOpacity={0.25} stroke="#f97316" strokeWidth={2} />
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={3} fill="#f97316" />
        ))}
        {AXES.map((a, i) => {
          const [x, y] = point(i, maxR + 18);
          return (
            <text
              key={a.key}
              x={x}
              y={y}
              fontSize={9}
              fill="#a1a1aa"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {a.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
