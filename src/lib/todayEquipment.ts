import type { TrainingEquipment } from "./types";

// ---------------------------------------------------------------------------
// Equipment for today only: "indoors, floor only" when it rains, or the kit
// at a bar park you chose. Kept for the rest of the day in this tab, so the
// Today screen and the session page build the same session.
// ---------------------------------------------------------------------------

export interface TodayEquipment {
  day: string;
  equipment: TrainingEquipment;
  label: string; // "Indoors" or the park's name
  kind: "indoors" | "park";
}

const KEY = "barquests:equipmentOverride";
const EVENT = "barquests:equipment-override";
const day = () => new Date().toDateString();

export function floorOnly(own: TrainingEquipment): TrainingEquipment {
  return {
    pullUpBar: false,
    parallelBars: false,
    rings: false,
    wallSpace: true,
    verticalPole: false,
    monkeyBars: false,
    weights: own.weights,
    resistanceBands: own.resistanceBands,
  };
}

export function readTodayEquipment(): TodayEquipment | null {
  try {
    const v = JSON.parse(sessionStorage.getItem(KEY) ?? "null") as TodayEquipment | null;
    return v && v.day === day() ? v : null;
  } catch {
    return null;
  }
}

export function setTodayEquipment(v: Omit<TodayEquipment, "day"> | null) {
  try {
    if (v) sessionStorage.setItem(KEY, JSON.stringify({ ...v, day: day() }));
    else sessionStorage.removeItem(KEY);
  } catch {
    // storage blocked
  }
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

export function onTodayEquipment(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}
