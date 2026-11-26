import { adaptSession } from "./adaptation";
import type { ExerciseStat } from "./types";
import {
  BodyProfile,
  SkillProfile,
  SkillTrack,
  TrainingEquipment,
  TrainingSession,
} from "./types";
import { generateSession } from "./trainingGenerator";
import { applyDeload, blockWeek, focusWithBlock, isActive, phaseOf, type TrainingBlock } from "./trainingBlock";
import { fitSessionToMinutes } from "./sessionFit";
import { generateSportSession, pickSportFocus } from "./sports/generator";
import type { SportDef, SportTrack } from "./sports/types";

export interface PlanDay {
  dateISO: string;
  weekday: string;
  isRestDay: boolean;
  session: TrainingSession | null;
}

export type PlanRange = "day" | "week" | "month";

const RANGE_DAYS: Record<PlanRange, number> = { day: 1, week: 7, month: 30 };

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Fallback for accounts without explicit trainingDaysOfWeek: spreads
// `daysPerWeek` training days as evenly as possible across a 7-day block
// (e.g. 3/week -> roughly every other day).
function isTrainingDaySpread(indexInWeek: number, daysPerWeek: number): boolean {
  if (daysPerWeek >= 7) return true;
  if (daysPerWeek <= 0) return false;
  const slot = Math.round((indexInWeek * daysPerWeek) / 7);
  const nextSlot = Math.round(((indexInWeek + 1) * daysPerWeek) / 7);
  return nextSlot > slot;
}

function isTrainingDay(date: Date, body: BodyProfile): boolean {
  if (body.trainingDaysOfWeek && body.trainingDaysOfWeek.length > 0) {
    return body.trainingDaysOfWeek.includes(date.getDay());
  }
  const daysPerWeek = Math.min(7, Math.max(1, body.trainingDaysPerWeek ?? 3));
  return isTrainingDaySpread(date.getDay(), daysPerWeek);
}

export function generatePlan(
  skills: SkillProfile,
  equipment: TrainingEquipment,
  goalTracks: SkillTrack[],
  body: BodyProfile,
  range: PlanRange,
  startDate: Date = new Date(),
  stats?: Record<string, ExerciseStat>,
  block?: TrainingBlock | null
): PlanDay[] {
  const totalDays = RANGE_DAYS[range];

  const days: PlanDay[] = [];
  let trainingCounter = 0;

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateISO = date.toISOString().slice(0, 10);
    const weekday = WEEKDAYS[date.getDay()];

    const training = isTrainingDay(date, body);

    if (!training) {
      days.push({ dateISO, weekday, isRestDay: true, session: null });
      continue;
    }

    const focus = focusWithBlock(date, equipment, goalTracks, block ?? undefined, trainingCounter);
    // planned sessions reflect what training has already learned
    const fitted = fitSessionToMinutes(
      adaptSession(generateSession(skills, equipment, focus, date, body.sessionLengthMinutes), stats, equipment, skills),
      body.sessionLengthMinutes
    ).session;
    const session = block && isActive(block, date) && phaseOf(block, blockWeek(block, date)) === "deload" ? applyDeload(fitted) : fitted;
    trainingCounter++;
    days.push({ dateISO, weekday, isRestDay: false, session });
  }

  return days;
}

// The same plan for yoga or Pilates: training days from your schedule, each
// with the next focus in the sport's rotation (the first is today's, so the
// plan and Today agree), adapted to its history and fitted to its length.
export function generateSportPlan(
  def: SportDef,
  track: SportTrack,
  body: BodyProfile,
  equipment: TrainingEquipment,
  range: PlanRange,
  startDate: Date = new Date()
): PlanDay[] {
  const days: PlanDay[] = [];
  let trainingCounter = 0;
  for (let i = 0; i < RANGE_DAYS[range]; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateISO = date.toISOString().slice(0, 10);
    const weekday = WEEKDAYS[date.getDay()];
    if (!isTrainingDay(date, body)) {
      days.push({ dateISO, weekday, isRestDay: true, session: null });
      continue;
    }
    const focus = pickSportFocus(def, track, startDate, trainingCounter++);
    const session = fitSessionToMinutes(
      adaptSession(generateSportSession(def, track, focus, date), track.exerciseStats, equipment),
      track.sessionLengthMinutes ?? body.sessionLengthMinutes
    ).session;
    days.push({ dateISO, weekday, isRestDay: false, session: { ...session, sport: def.id } });
  }
  return days;
}
