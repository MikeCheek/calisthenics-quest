import type { Exercise, TrainingSession, TrainingSet } from "../types";
import type { SportDef, SportTrack } from "./types";

// ---------------------------------------------------------------------------
// Today's session in a sport: a warm-up, the focus of the day (its skills at
// your current stage, with a step back when a stage isn't solid yet), one
// exercise from another part of the sport, and a cool-down. The focus
// rotates day by day, leaning on your goals.
// ---------------------------------------------------------------------------

const dayOfYear = (d: Date) => Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);

export function focusOptions(def: SportDef): string[] {
  return def.groups.map((g) => g.key);
}

export const groupLabel = (def: SportDef, key: string) => def.groups.find((g) => g.key === key)?.label ?? key;

// goals' groups come round twice as often
export function pickSportFocus(def: SportDef, track: SportTrack, date: Date, offset = 0): string {
  const goalGroups = new Set(def.skills.filter((s) => track.goals.includes(s.key)).map((s) => s.group));
  const cycle = def.groups.flatMap((g) => (goalGroups.has(g.key) ? [g.key, g.key] : [g.key]));
  // spread repeats apart: interleave in order of appearance
  const order = [...cycle.filter((_, i) => i % 2 === 0), ...cycle.filter((_, i) => i % 2 === 1)];
  return order[(dayOfYear(date) + offset) % order.length];
}

const copy = (e: Exercise): Exercise => {
  const { it: _it, ...rest } = e as Exercise & { it?: unknown };
  return { ...rest };
};

export function generateSportSession(def: SportDef, track: SportTrack, focus: string, date = new Date()): TrainingSession {
  const main: Exercise[] = [];
  for (const sk of def.skills.filter((s) => s.group === focus)) {
    const i = Math.min(track.stage[sk.key] ?? 0, sk.stages.length - 1);
    // a stage that isn't solid yet starts with one exercise from the one before
    if (i > 0 && (track.mastery[sk.key] ?? 2) <= 2) main.push(copy(sk.stages[i - 1].exercises[0]));
    for (const e of sk.stages[i].exercises) main.push(copy(e));
  }
  // one exercise from another part of the sport, rotating
  const others = def.skills.filter((s) => s.group !== focus);
  const sets: TrainingSet[] = [{ track: "warmup", title: "Warm-Up", exercises: def.warmup.map(copy) }, { track: "sport", title: groupLabel(def, focus), exercises: main }];
  if (others.length) {
    const sk = others[dayOfYear(date) % others.length];
    const i = Math.min(track.stage[sk.key] ?? 0, sk.stages.length - 1);
    sets.push({ track: "sport", title: "Supporting work", exercises: [copy(sk.stages[i].exercises[0])] });
  }
  sets.push({ track: "finisher", title: "Cool-Down", exercises: def.cooldown.map(copy) });
  return {
    id: `${def.id}-${date.toISOString().slice(0, 10)}-${focus}`,
    dateISO: date.toISOString(),
    focusLabel: groupLabel(def, focus),
    sets,
    estXp: 0,
    sport: def.id,
  };
}
