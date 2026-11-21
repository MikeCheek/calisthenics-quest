import { test } from "node:test";
import assert from "node:assert/strict";
import { applyDeload, blockOutline, blockWeek, blockSkillsFor, focusWithBlock, isActive, newBlock, phaseOf, reached, suggestWeeks, targetsFor, testExercise } from "../src/lib/trainingBlock";
import { DEFAULT_SKILLS, type SkillProfile, type TrainingEquipment, type TrainingSession } from "../src/lib/types";
import { pickFocus } from "../src/lib/trainingGenerator";

const ALL = { pullUpBar: true, parallelBars: true, rings: true, wallSpace: true, verticalPole: true, monkeyBars: true, weights: true, resistanceBands: true } as TrainingEquipment;
const NONE = Object.fromEntries(Object.keys(ALL).map((k) => [k, false])) as unknown as TrainingEquipment;
const start = new Date(2026, 10, 2, 9); // a Monday

test("weeks, phases and the outline", () => {
  const b = newBlock("frontLever", "tuck", "straddle", 8, start);
  assert.equal(blockWeek(b, new Date(2026, 10, 2, 20)), 1);
  assert.equal(blockWeek(b, new Date(2026, 10, 9, 8)), 2);
  assert.equal(blockWeek(b, new Date(2026, 10, 1)), 0);
  assert.deepEqual(blockOutline(8), ["build", "build", "build", "deload", "build", "build", "build", "test"]);
  assert.equal(phaseOf(b, 4), "deload");
  assert.ok(isActive(b, new Date(2026, 11, 20)));
  assert.ok(!isActive(b, new Date(2027, 0, 30)));
});

test("lengths stay between 4 and 12 weeks", () => {
  assert.equal(newBlock("planche", "none", "tuck", 2, start).weeks, 4);
  assert.equal(newBlock("planche", "none", "tuck", 30, start).weeks, 12);
  const s = { skills: { ...DEFAULT_SKILLS, frontLever: "tuck" } as SkillProfile, skillMastery: {}, skillProgress: {} };
  const w = suggestWeeks(s, [], "frontLever", "straddle");
  assert.ok(w >= 4 && w <= 12, String(w));
});

test("the block's skill gets two days in three", () => {
  const b = newBlock("frontLever", "tuck", "straddle", 8, start);
  let onSkill = 0;
  for (let d = 0; d < 21; d++) {
    const date = new Date(2026, 10, 3 + d, 12);
    if (focusWithBlock(date, ALL, [], b) === "frontLever") onSkill++;
  }
  assert.ok(onSkill >= 13, String(onSkill));
  // no block, or one that doesn't fit the equipment: the normal rotation
  const date = new Date(2026, 10, 5, 12);
  assert.equal(focusWithBlock(date, ALL, [], undefined), pickFocus(date, ALL, []));
  assert.equal(focusWithBlock(date, NONE, [], b), pickFocus(date, NONE, []));
});

test("deload: about a third fewer sets, never below two, warm-up untouched", () => {
  const s = {
    id: "x", dateISO: "2026-11-21", focusLabel: "Front Lever", estXp: 0,
    sets: [
      { track: "warmup", title: "Warm-Up", exercises: [{ name: "Arm circles", detail: "2 x 15", restSeconds: 15 }] },
      { track: "frontLever", title: "Main Focus — Front Lever", exercises: [{ name: "Tuck front lever holds", detail: "6 x 10s", restSeconds: 90 }, { name: "Pull-ups", detail: "2 x 8", restSeconds: 90 }] },
    ],
  } as TrainingSession;
  const d = applyDeload(s);
  assert.equal(d.sets[0].exercises[0].detail, "2 x 15");
  assert.equal(d.sets[1].exercises[0].detail, "4 x 10s");
  assert.equal(d.sets[1].exercises[1].detail, "2 x 8");
  assert.ok(d.sets[1].exercises[0].adaptNote);
});

test("targets, the test exercise, and when the goal is reached", () => {
  assert.deepEqual(targetsFor("frontLever", "tuck"), ["advancedTuck", "oneLeg", "straddle"]);
  assert.deepEqual(targetsFor("frontLever", "full"), []);
  assert.ok(testExercise({ skill: "frontLever", targetStage: "straddle" }));
  const b = newBlock("frontLever", "tuck", "oneLeg", 6, start);
  assert.ok(!reached(b, { ...DEFAULT_SKILLS, frontLever: "advancedTuck" } as SkillProfile));
  assert.ok(reached(b, { ...DEFAULT_SKILLS, frontLever: "straddle" } as SkillProfile));
  // skills offered depend on equipment: no bar, no front lever block
  assert.ok(!blockSkillsFor(NONE).includes("frontLever"));
  assert.ok(blockSkillsFor(NONE).includes("planche"));
});
