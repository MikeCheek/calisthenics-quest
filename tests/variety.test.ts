import { test } from "node:test";
import assert from "node:assert/strict";
import { generateSession } from "../src/lib/trainingGenerator";
import { applyExerciseFeedback } from "../src/lib/adaptation";
import { SUPPORT, exerciseByName, rotateScheme } from "../src/lib/variety";
import { generatePlan } from "../src/lib/planGenerator";
import { DEFAULT_EQUIPMENT, DEFAULT_SKILLS, type ExerciseStat, type SkillProfile, type TrainingSession } from "../src/lib/types";

const skills = { ...DEFAULT_SKILLS, pullUpMaxReps: 12, dipMaxReps: 15, pushUpMaxReps: 30, frontLever: "advancedTuck", planche: "tuck", handstand: "wall" } as unknown as SkillProfile;
const eq = { ...DEFAULT_EQUIPMENT, resistanceBands: true };
const work = (s: TrainingSession) => s.sets.filter((x) => x.track !== "warmup" && x.track !== "finisher" && x.track !== "skillCheck");
const names = (s: TrainingSession) => work(s).flatMap((x) => x.exercises.map((e) => e.name));
const did = (stats: Record<string, ExerciseStat>, s: TrainingSession, day: string) =>
  applyExerciseFeedback(stats, work(s).flatMap((x) => x.exercises.map((e) => ({ name: e.name, setTitle: x.title, outcome: "done" as const }))), `${day}T18:00:00.000Z`);

test("the same day always gives the same session", () => {
  const a = generateSession(skills, eq, "frontLever", new Date("2026-12-01"), 60);
  const b = generateSession(skills, eq, "frontLever", new Date("2026-12-01"), 60);
  assert.deepEqual(a, b);
});

for (const focus of ["frontLever", "planche", "handstand", "muscleUp", "core", "legs"] as const) {
  test(`${focus} a few days later isn't the same session`, () => {
    let stats: Record<string, ExerciseStat> = {};
    const first = generateSession(skills, eq, focus, new Date("2026-12-01"), 60, { stats });
    stats = did(stats, first, "2026-12-01");
    const again = generateSession(skills, eq, focus, new Date("2026-12-04"), 60, { stats });
    const a = names(first);
    const b = names(again);
    const same = b.filter((n) => a.includes(n)).length;
    assert.ok(same / b.length <= 0.5, `${focus}: ${same} of ${b.length} repeated — ${b.join(", ")}`);
    // the skill's key exercise stays: that's the practice
    assert.equal(work(first)[0].exercises[0].name, work(again)[0].exercises[0].name);
  });
}

test("even with no history, two different days differ", () => {
  const a = names(generateSession(skills, eq, "frontLever", new Date("2026-12-01"), 60));
  const b = names(generateSession(skills, eq, "frontLever", new Date("2026-12-08"), 60));
  assert.notDeepEqual(a, b);
});

test("a skill day builds the muscles it needs, not only the skill", () => {
  const s = generateSession(skills, eq, "frontLever", new Date("2026-12-01"), 60);
  const strength = s.sets.find((x) => x.title === "Strength for Front Lever");
  assert.ok(strength, "a strength block");
  assert.ok(strength!.exercises.length >= 2);
  const main = s.sets.find((x) => x.title.startsWith("Main Focus"))!;
  assert.ok(main.exercises.length <= 4, "the skill itself is a few drills, not the whole session");
  const all = names(s);
  assert.equal(new Set(all).size, all.length, "nothing twice");
});

test("every strength exercise exists, with an animation-ready library entry", () => {
  for (const [track, list] of Object.entries(SUPPORT)) for (const [name] of list ?? []) assert.ok(exerciseByName(name), `${track}: ${name}`);
});

test("schemes rotate sensibly", () => {
  const hold = { name: "Tuck front lever holds", detail: "4 x max hold", restSeconds: 120 };
  assert.equal(rotateScheme(hold, 0, undefined), hold);
  assert.equal(rotateScheme(hold, 1, { records: { tuck_front_lever_holds: { hold: 15 } } }).detail, "6 x 10s");
  assert.equal(rotateScheme(hold, 2, undefined).detail, "3 x max hold");
  const reps = { name: "Pull-ups", detail: "4 x 6-8 reps", restSeconds: 90 };
  assert.equal(rotateScheme(reps, 1, undefined).detail, "5 x 4-6 reps, 3s lower");
  assert.equal(rotateScheme(reps, 2, undefined).detail, "3 x 7-9 reps");
  // nothing silly with few reps
  const few = { name: "Wall walks", detail: "3 x 3 reps", restSeconds: 90 };
  assert.equal(rotateScheme(few, 1, undefined).detail, "3 x 3 reps");
  assert.equal(rotateScheme(few, 2, undefined).detail, "2 x 4 reps");
});

test("a planned week doesn't repeat the same session for the same focus", () => {
  const body = { trainingDaysPerWeek: 6, sessionLengthMinutes: 60 } as never;
  const plan = generatePlan(skills, eq, ["frontLever"], body, "week", new Date("2026-12-01"));
  const byFocus = new Map<string, string[][]>();
  for (const d of plan) {
    if (!d.session) continue;
    const list = byFocus.get(d.session.focusLabel) ?? [];
    list.push(names(d.session));
    byFocus.set(d.session.focusLabel, list);
  }
  for (const [focus, sessions] of byFocus) {
    for (let i = 1; i < sessions.length; i++) assert.notDeepEqual(sessions[i], sessions[i - 1], `${focus} repeated`);
  }
});

test("yoga and Pilates rotate their supporting work too", async () => {
  const { SPORTS } = await import("../src/lib/sports");
  const { generateSportSession } = await import("../src/lib/sports/generator");
  const { newTrack } = await import("../src/lib/sports");
  for (const id of ["yoga", "pilates"] as const) {
    const def = SPORTS[id];
    const track = newTrack(def, "some", [], 45);
    const focus = def.groups[0].key;
    const first = generateSportSession(def, track, focus, new Date("2026-12-01"));
    const support = (s: TrainingSession) => s.sets.find((x) => x.title === "Supporting work")!.exercises.map((e) => e.name);
    let stats: Record<string, ExerciseStat> = {};
    stats = applyExerciseFeedback(stats, first.sets.flatMap((x) => x.exercises.map((e) => ({ name: e.name, setTitle: "Main", outcome: "done" as const }))), "2026-12-01T18:00:00.000Z");
    const again = generateSportSession(def, { ...track, exerciseStats: stats }, focus, new Date("2026-12-04"));
    assert.equal(support(first).length, 2);
    assert.notDeepEqual(support(again), support(first), `${id}: same supporting work`);
  }
});
