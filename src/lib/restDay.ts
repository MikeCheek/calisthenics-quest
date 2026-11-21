import type { SessionRecord, TrainingEquipment } from "./types";
import { MOBILITY_POOL } from "./warmupFinisher";
import { fitsEquipment } from "./equipmentNeeds";
import { coverLoad, sessionLoad, type CoolDown, type Load, type Muscle, type RoutineItem } from "./stretching";

// ---------------------------------------------------------------------------
// A rest-day mobility routine, about 10 minutes: a few movement drills to
// loosen up, then longer holds. Half of it eases what the last few days of
// training loaded; the other half keeps the whole body moving (hips, upper
// back, shoulders, hamstrings), so it's useful even after a long break.
// ---------------------------------------------------------------------------

const WHOLE_BODY: Load = { hipFlexors: 0.16, hamstrings: 0.16, lats: 0.14, shoulders: 0.14, lowerBack: 0.12, chest: 0.1, glutes: 0.1, wrists: 0.08 };

// drills by what they open up (their first area), for the muscles that need it
const DRILL_FOR: Partial<Record<Muscle, string[]>> = {
  shoulders: ["shoulders", "thoracic"],
  lats: ["scapula", "thoracic"],
  chest: ["chest"],
  lowerBack: ["thoracic"],
  hipFlexors: ["hips"],
  glutes: ["hips"],
  hamstrings: ["hamstrings", "hips"],
  wrists: ["wrists"],
  quads: ["hips"],
  calves: ["ankles"],
};

const DAY = 86400000;

export function recentLoad(sessions: Pick<SessionRecord, "finishedAt" | "exercises">[], now = new Date(), days = 3): Load {
  const since = new Date(now.getTime() - days * DAY).toISOString();
  return sessionLoad(sessions.filter((s) => s.finishedAt >= since).flatMap((s) => (s.exercises ?? []).filter((e) => e.outcome === "done")));
}

export function planRestDay(recent: Load, equipment: TrainingEquipment, seed = 0): CoolDown {
  const load: Load = {};
  const hasRecent = Object.keys(recent).length > 0;
  for (const [m, w] of Object.entries(WHOLE_BODY) as [Muscle, number][]) load[m] = (load[m] ?? 0) + w * (hasRecent ? 0.5 : 1);
  for (const [m, w] of Object.entries(recent) as [Muscle, number][]) load[m] = (load[m] ?? 0) + w * 0.5;

  // 1. three movement drills for the top areas (no pulse raisers: it's a rest day)
  const ranked = (Object.entries(load) as [Muscle, number][]).sort((a, b) => b[1] - a[1]).map(([m]) => m);
  const pool = MOBILITY_POOL.filter((d) => fitsEquipment(d, equipment) && !d.areas.includes("general"));
  const drills: RoutineItem[] = [];
  for (const m of ranked) {
    if (drills.length >= 3) break;
    const options = pool.filter((d) => (DRILL_FOR[m] ?? []).includes(d.areas[0]) && !drills.some((x) => x.name === d.name));
    if (!options.length) continue;
    const d = options[(seed + drills.length) % options.length];
    drills.push({ id: `drill-${d.name}`, name: d.name, detail: d.detail, perSide: /each side|each leg|per side/i.test(d.detail), targets: [m], description: d.description, for: [m] });
  }

  // 2. then the stretches that best cover the rest
  const holds = coverLoad(load, 6, 5);
  const stretches = holds?.stretches ?? [];
  const items = [...drills, ...stretches];
  const seconds = drills.length * 60 + stretches.reduce((a, s) => a + (s.perSide ? 70 : 45), 0);
  return { stretches: items, minutes: Math.max(6, Math.round(seconds / 60)), focus: holds?.focus ?? ranked.slice(0, 3) };
}
