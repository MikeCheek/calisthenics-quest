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
  kind: "indoors" | "park" | "indoorPlan";
  until?: string; // indoor plan: last local day (yyyy-mm-dd)
  parkId?: string;
  auto?: "wet" | "weekday"; // preselected from your habits (trainingHabits.ts), not chosen today
}

// ---- the indoor plan: several rainy days in a row (kept on this device) ----

const PLAN_KEY = "barquests:indoorPlan";
const pad = (n: number) => String(n).padStart(2, "0");
const localDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function readIndoorPlan(now = new Date()): TodayEquipment | null {
  try {
    const v = JSON.parse(localStorage.getItem(PLAN_KEY) ?? "null") as { until: string; equipment: TrainingEquipment } | null;
    if (!v || v.until < localDay(now)) return null;
    return { day: now.toDateString(), kind: "indoorPlan", label: "Indoors", until: v.until, equipment: v.equipment };
  } catch {
    return null;
  }
}

export function setIndoorPlan(v: { until: string; equipment: TrainingEquipment } | null) {
  try {
    if (v) localStorage.setItem(PLAN_KEY, JSON.stringify(v));
    else localStorage.removeItem(PLAN_KEY);
  } catch {
    // storage blocked
  }
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

const KEY = "barquests:equipmentOverride";
const EVENT = "barquests:equipment-override";
const day = () => new Date().toDateString();

// Training at home: the floor and a wall, plus the kit you own — a doorway
// bar and parallettes count here, rings need somewhere to hang so they don't.
export function atHome(own: TrainingEquipment): TrainingEquipment {
  return {
    pullUpBar: !!own.homeBar,
    parallelBars: !!own.parallettes,
    rings: false,
    wallSpace: true,
    verticalPole: false,
    monkeyBars: false,
    weights: own.weights,
    resistanceBands: own.resistanceBands,
    homeBar: own.homeBar,
    parallettes: own.parallettes,
  };
}

// today's choice first (a park, or indoors just today), else the indoor plan
export function readTodayEquipment(): TodayEquipment | null {
  try {
    const v = JSON.parse(sessionStorage.getItem(KEY) ?? "null") as TodayEquipment | null;
    if (v && v.day === day()) return v;
  } catch {
    // fall through
  }
  return readIndoorPlan();
}

export function setTodayEquipment(v: Omit<TodayEquipment, "day"> | null) {
  try {
    if (v) sessionStorage.setItem(KEY, JSON.stringify({ ...v, day: day() }));
    else sessionStorage.removeItem(KEY);
    // a choice you made yourself today: habits don't override it
    if (!v?.auto) sessionStorage.setItem(CHOSE_KEY, day());
  } catch {
    // storage blocked
  }
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

// ---- for the habits (trainingHabits.ts) ----

const CHOSE_KEY = "barquests:whereChosen";
const WET_KEY = "barquests:wetToday";

/** you picked where today (any chip, or a park) */
export function choseWhereToday(): boolean {
  try {
    return sessionStorage.getItem(CHOSE_KEY) === day();
  } catch {
    return false;
  }
}

/** the weather card's verdict for today's training time */
export function markWetToday(wet: boolean) {
  try {
    if (sessionStorage.getItem(WET_KEY) === `${day()}:${wet}`) return;
    sessionStorage.setItem(WET_KEY, `${day()}:${wet}`);
  } catch {
    return;
  }
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

export function readWetToday(): boolean {
  try {
    return sessionStorage.getItem(WET_KEY) === `${day()}:true`;
  } catch {
    return false;
  }
}

export function onTodayEquipment(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}
