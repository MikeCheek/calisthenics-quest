import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addTrainTime,
  applyBlockPrefs,
  blockSample,
  blockToAsk,
  habitDays,
  habitHour,
  habitReminder,
  usualWhere,
  type BlockSample,
  type TrainTime,
  type WhereSample,
} from "../src/lib/trainingHabits";
import { generatePlan } from "../src/lib/planGenerator";
import { translate } from "../src/lib/i18n/tx";
import { DEFAULT_EQUIPMENT, DEFAULT_SKILLS, type ExerciseFeedback, type TrainingSession } from "../src/lib/types";

const NOW = new Date(2026, 11, 20, 12); // a Sunday
const at = (daysAgo: number, hour: number): TrainTime => {
  const d = new Date(NOW);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour);
  return { d: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`, w: d.getDay(), h: hour };
};

// Mondays, Wednesdays and Saturdays for four weeks, around 18–19
const habit: TrainTime[] = [];
for (let week = 3; week >= 0; week--) for (const back of [6, 4, 1]) habit.push(at(week * 7 + back, back === 1 ? 10 : 18));

test("the weekdays you actually train, once there's a pattern", () => {
  assert.deepEqual(habitDays(habit, 3, NOW), [1, 3, 6]);
  assert.deepEqual(habitDays(habit, 2, NOW), [1, 3], "as many as your days a week");
  assert.equal(habitDays(habit.slice(-4), 3, NOW), null, "four sessions aren't a habit");
  // all over the place: no pattern to follow
  const scattered = Array.from({ length: 14 }, (_, i) => at(i * 2 + 1, 18));
  assert.equal(habitDays(scattered, 2, NOW), null);
});

test("the usual hour, and a reminder an hour before", () => {
  assert.equal(habitHour(habit, NOW), 18);
  assert.equal(habitReminder(18), "17:00");
  assert.equal(habitReminder(0), "23:00");
  assert.equal(habitHour(habit.slice(-3), NOW), null);
});

test("one start time per day: the first session's", () => {
  let log = addTrainTime([], { d: "2026-12-01", w: 2, h: 18 });
  log = addTrainTime(log, { d: "2026-12-01", w: 2, h: 20 });
  assert.deepEqual(log, [{ d: "2026-12-01", w: 2, h: 18 }]);
  log = addTrainTime(log, { d: "2026-12-01", w: 2, h: 7 });
  assert.deepEqual(log, [{ d: "2026-12-01", w: 2, h: 7 }]);
});

test("the plan goes on your usual days", () => {
  const body = { trainingDaysPerWeek: 3, sessionLengthMinutes: 45, trainingDaysOfWeek: habitDays(habit, 3, NOW)! } as never;
  const plan = generatePlan(DEFAULT_SKILLS, DEFAULT_EQUIPMENT, [], body, "week", new Date(2026, 11, 21));
  const days = plan.filter((d) => !d.isRestDay).map((d) => d.weekday);
  assert.deepEqual(days, ["Mon", "Wed", "Sat"]);
  assert.equal(translate("it", "Planned on the days you usually train: {days}"), "Pianificato nei giorni in cui ti alleni di solito: {days}");
});

// ---- where ----

const park = { id: "osm-n1", label: "Parco Nord", equipment: { ...DEFAULT_EQUIPMENT, pullUpBar: true, parallelBars: true } };
const w = (k: WhereSample["k"], wet: boolean, day = 6): WhereSample => ({ w: day, wet, k, ...(k === "park" ? { park } : {}) });

test("rainy days you train at home: Today preselects home when it rains", () => {
  const log = [w("home", true, 1), w("usual", false), w("home", true, 3), w("home", true, 5), w("usual", false)];
  assert.deepEqual(usualWhere(log, { w: 2, wet: true }), { kind: "home", park: undefined, why: "wet" });
  assert.equal(usualWhere(log, { w: 2, wet: false }), null, "a dry Tuesday: nothing to go on");
});

test("the same park on Saturdays", () => {
  const log = [w("park", false), w("park", false), w("usual", false, 2), w("park", false), w("usual", false)];
  assert.deepEqual(usualWhere(log, { w: 6, wet: false }), { kind: "park", park, why: "weekday" });
  assert.equal(usualWhere([w("park", false), w("usual", false), w("park", false), w("usual", false)], { w: 6, wet: false }), null, "two of four isn't usual");
  assert.equal(usualWhere([w("usual", false), w("usual", false), w("usual", false)], { w: 6, wet: false }), null, "your usual spot needs no preselecting");
});

// ---- blocks ----

const session: TrainingSession = {
  id: "t",
  dateISO: "2026-12-10",
  focusLabel: "x",
  estXp: 0,
  sets: [
    { track: "warmup", title: "Warm-Up", exercises: ["A", "B", "C", "D"].map((name) => ({ name, detail: "1 x 30s", restSeconds: 0 })) },
    { track: "pullStrength", title: "Main Focus — Pull Strength", exercises: [{ name: "Pull-ups", detail: "4 x 6-8 reps", restSeconds: 90 }] },
    { track: "finisher", title: "Final Hits", exercises: [{ name: "Burpees", detail: "1 x 60s", restSeconds: 0 }] },
  ],
};
const fb = (name: string, setTitle: string, outcome: "done" | "skipped" = "done"): ExerciseFeedback => ({ name, setTitle, outcome });

test("what was left out of a session", () => {
  assert.deepEqual(blockSample(session, [fb("A", "Warm-Up"), fb("Pull-ups", "Main Focus — Pull Strength"), fb("Burpees", "Final Hits", "skipped")]), { wu: true, fin: true });
  assert.deepEqual(blockSample(session, [fb("A", "Warm-Up"), fb("B", "Warm-Up"), fb("Burpees", "Final Hits")]), { wu: false, fin: false });
});

test("asked once after four of five, not again for a month after keeping it, never after shortening", () => {
  const skipFin: BlockSample[] = [
    { wu: false, fin: true },
    { wu: false, fin: true },
    { wu: false, fin: false },
    { wu: false, fin: true },
    { wu: false, fin: true },
  ];
  assert.equal(blockToAsk(skipFin, undefined, NOW), "finisher");
  assert.equal(blockToAsk(skipFin.slice(0, 3), undefined, NOW), null);
  assert.equal(blockToAsk(skipFin, { finisher: "keep", at: { finisher: "2026-12-10T00:00:00Z" } }, NOW), null);
  assert.equal(blockToAsk(skipFin, { finisher: "keep", at: { finisher: "2026-11-01T00:00:00Z" } }, NOW), "finisher");
  assert.equal(blockToAsk(skipFin, { finisher: "short" }, NOW), null);
  assert.equal(blockToAsk(skipFin.map(() => ({ wu: true, fin: false })), undefined, NOW), "warmup");
});

test("shortened: two warm-up exercises, no finisher; a cool-down keeps one stretch", () => {
  const s = applyBlockPrefs(session, { warmup: "short", finisher: "short" });
  assert.deepEqual(s.sets.map((x) => [x.title, x.exercises.length]), [["Warm-Up", 2], ["Main Focus — Pull Strength", 1]]);
  const yoga = { ...session, sets: [...session.sets.slice(0, 2), { track: "finisher" as const, title: "Cool-Down", exercises: ["X", "Y", "Z"].map((name) => ({ name, detail: "60s", restSeconds: 0 })) }] };
  assert.equal(applyBlockPrefs(yoga, { finisher: "short" }).sets.at(-1)!.exercises.length, 1);
  assert.equal(applyBlockPrefs(session, { warmup: "keep" }), session);
});
