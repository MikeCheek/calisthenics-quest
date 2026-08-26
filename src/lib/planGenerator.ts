import {
  BodyProfile,
  SkillProfile,
  SkillTrack,
  TrainingEquipment,
  TrainingSession,
} from "./types";
import { generateSession, pickFocus } from "./trainingGenerator";

export interface PlanDay {
  dateISO: string;
  weekday: string;
  isRestDay: boolean;
  session: TrainingSession | null;
}

export type PlanRange = "day" | "week" | "month";

const RANGE_DAYS: Record<PlanRange, number> = { day: 1, week: 7, month: 30 };

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Spreads `daysPerWeek` training days as evenly as possible across a 7-day
// block (e.g. 3/week -> roughly every other day) and marks the rest as
// rest days. The pattern repeats for every 7-day chunk of the plan.
function isTrainingDay(indexInWeek: number, daysPerWeek: number): boolean {
  if (daysPerWeek >= 7) return true;
  if (daysPerWeek <= 0) return false;
  const slot = Math.round((indexInWeek * daysPerWeek) / 7);
  const nextSlot = Math.round(((indexInWeek + 1) * daysPerWeek) / 7);
  return nextSlot > slot;
}

export function generatePlan(
  skills: SkillProfile,
  equipment: TrainingEquipment,
  goalTracks: SkillTrack[],
  body: BodyProfile,
  range: PlanRange,
  startDate: Date = new Date()
): PlanDay[] {
  const totalDays = RANGE_DAYS[range];
  const daysPerWeek =
    range === "day" ? 7 : Math.min(7, Math.max(1, body.trainingDaysPerWeek ?? 3));

  const days: PlanDay[] = [];
  let trainingCounter = 0;

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateISO = date.toISOString().slice(0, 10);
    const weekday = WEEKDAYS[date.getDay()];

    const training = range === "day" ? true : isTrainingDay(i % 7, daysPerWeek);

    if (!training) {
      days.push({ dateISO, weekday, isRestDay: true, session: null });
      continue;
    }

    const focus = pickFocus(date, equipment, goalTracks, trainingCounter);
    const session = generateSession(skills, equipment, focus, date);
    trainingCounter++;
    days.push({ dateISO, weekday, isRestDay: false, session });
  }

  return days;
}
