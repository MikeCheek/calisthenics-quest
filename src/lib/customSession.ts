import type { Exercise, SkillTrack, TrainingEquipment, TrainingSession, TrainingSet } from "./types";
import { findEntry, type LibraryEntry } from "./exerciseLibrary";
import { pickWarmupFor } from "./warmupFinisher";
import type { Area } from "./compare";

// ---------------------------------------------------------------------------
// Sessions you put together yourself: one exercise "right now" from the
// library, or a saved session of your own. They run in guided mode like
// any other — timers, logging, XP, the cool-down — and are logged under
// their own name.
// ---------------------------------------------------------------------------

export interface CustomItem {
  name: string; // a library exercise
  sets?: number; // instead of the exercise's own
}

export interface CustomWorkout {
  id: string;
  name: string;
  items: CustomItem[];
  warmup: boolean;
  createdAt: string;
}

export const MAX_SAVED_WORKOUTS = 20;
export const MAX_ITEMS = 12;

// "3 x 8-10 reps" with 5 sets -> "5 x 8-10 reps"
export function withSets(detail: string, sets: number): string {
  const n = Math.max(1, Math.min(10, Math.round(sets)));
  return /^\d+(?:-\d+)?\s*x/i.test(detail) ? detail.replace(/^\d+(?:-\d+)?(\s*x)/i, `${n}$1`) : `${n} x ${detail}`;
}

export const setsOf = (detail: string) => {
  const m = detail.match(/^(\d+)(?:-\d+)?\s*x/i);
  return m ? parseInt(m[1], 10) : 1;
};

const AREA_TRACK: Record<Area, SkillTrack> = {
  pull: "pullStrength",
  push: "pushStrength",
  statics: "frontLever",
  balance: "handstand",
  core: "core",
  legs: "legs",
  mobility: "core",
};
const SKILL_TRACKS = new Set<string>(["frontLever", "backLever", "planche", "muscleUp", "handstand", "humanFlag"]);

// the session's track: the first exercise's skill if it has one, else its muscle group
function trackFor(entries: LibraryEntry[]): SkillTrack {
  const first = entries.find((e) => e.kind === "skill" || e.kind === "strength") ?? entries[0];
  if (first?.skill && SKILL_TRACKS.has(first.skill)) return first.skill as SkillTrack;
  return AREA_TRACK[first?.area ?? "core"];
}

export function buildCustomSession(
  name: string,
  items: CustomItem[],
  opts: { warmup: boolean; equipment: TrainingEquipment; now?: Date }
): TrainingSession | null {
  const entries = items.map((i) => ({ item: i, entry: findEntry(i.name) })).filter((x) => x.entry) as { item: CustomItem; entry: LibraryEntry }[];
  if (!entries.length) return null;
  const now = opts.now ?? new Date();
  const dateISO = now.toISOString().slice(0, 10);
  const exercises: Exercise[] = entries.map(({ item, entry }) => ({
    ...entry.exercise,
    detail: item.sets ? withSets(entry.exercise.detail, item.sets) : entry.exercise.detail,
  }));
  const main: TrainingSet = { track: trackFor(entries.map((e) => e.entry)), title: "Your session", exercises };
  const sets: TrainingSet[] = [];
  if (opts.warmup) {
    const w = pickWarmupFor(exercises.map((e) => ({ name: e.name, detail: e.detail, setTitle: "Your session" })), opts.equipment, dateISO);
    if (w.length) sets.push({ track: "warmup", title: "Warm-Up", exercises: w });
  }
  sets.push(main);
  return {
    id: `custom-${now.getTime()}`,
    dateISO,
    focusLabel: name.trim().slice(0, 40) || "Your session",
    sets,
    estXp: 15 + exercises.length * 8,
  };
}

export const newWorkoutId = () => `w-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
