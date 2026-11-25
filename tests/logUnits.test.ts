import { test } from "node:test";
import assert from "node:assert/strict";
import { countUnit, isOpenHold, targetCount } from "../src/lib/exerciseTiming";
import { cleanSets } from "../src/lib/timingLearning";

test("the logger counts in the exercise's own unit", () => {
  assert.equal(countUnit("3 x 1-2 laps"), "laps");
  assert.equal(countUnit("5 x max attempt per side"), "attempts");
  assert.equal(countUnit("3 x 8-10 reps"), "reps");
  assert.equal(countUnit("3 x 8-10"), "reps");
  assert.equal(targetCount("3 x 1-2 laps"), 1);
  assert.equal(targetCount("3 x 8-10 reps"), 8);
  assert.equal(targetCount("3 x 8-10"), 8);
  assert.equal(targetCount("4 x max reps"), null);
});

test("open-ended holds ask how long you held", () => {
  assert.equal(isOpenHold("4 x max hold"), true);
  assert.equal(isOpenHold("4 x max hold (target 8-12s)"), true);
  assert.equal(isOpenHold("3 x 20s hold"), false);
  assert.equal(isOpenHold("3 x 8 reps"), false);
});

test("seconds you log replace the timer's default for an open hold", () => {
  const base = { kind: "hold" as const, targetSec: null, endedEarly: false, maxPauseMs: 0, hiddenMs: 0 };
  assert.deepEqual(cleanSets({ sets: [{ ...base, activeSec: 20, loggedSec: 35 }], rests: [], workPauses: 0 } as never), [{ holdSec: 35 }]);
  assert.deepEqual(cleanSets({ sets: [{ ...base, activeSec: 20 }], rests: [], workPauses: 0 } as never), [{ holdSec: 20 }]);
});
