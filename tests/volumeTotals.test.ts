import { test } from "node:test";
import assert from "node:assert/strict";
import { exerciseVolume, formatHeld, totalsByExercise } from "../src/lib/volumeTotals";

const done = (detail: string, extra: object = {}) => ({ outcome: "done" as const, detail, ...extra });

test("measured reps and holds win over the prescription", () => {
  assert.deepEqual(exerciseVolume(done("4 x 6-8 reps", { sets: [{ reps: 9 }, { reps: 8 }, { reps: 7 }, { reps: 6 }] })), { reps: 30, holdSec: 0, estimated: false });
  assert.deepEqual(exerciseVolume(done("4 x 8-12s", { sets: [{ holdSec: 10.4 }, { holdSec: 9.2 }] })), { reps: 0, holdSec: 20, estimated: false });
});

test("otherwise the prescription counts, low end of the range", () => {
  assert.deepEqual(exerciseVolume(done("3 x 8-10 reps")), { reps: 24, holdSec: 0, estimated: true });
  assert.deepEqual(exerciseVolume(done("5 x 5")), { reps: 25, holdSec: 0, estimated: true });
  assert.deepEqual(exerciseVolume(done("3 x 10 per side")), { reps: 60, holdSec: 0, estimated: true });
  assert.deepEqual(exerciseVolume(done("4 x 3-5 reps, slow descent")), { reps: 12, holdSec: 0, estimated: true });
  assert.deepEqual(exerciseVolume(done("3 x 20-30s")), { reps: 0, holdSec: 75, estimated: true });
  assert.deepEqual(exerciseVolume(done("3 x 30s per side")), { reps: 0, holdSec: 180, estimated: true });
  assert.deepEqual(exerciseVolume(done("3 x 20 (10 per side)")), { reps: 60, holdSec: 0, estimated: true });
  assert.deepEqual(exerciseVolume(done("8 min, 1-2 reps per minute")), { reps: 8, holdSec: 0, estimated: true });
  assert.deepEqual(exerciseVolume(done("5 x max attempt, accumulate 30-45s")), { reps: 0, holdSec: 30, estimated: true });
  assert.deepEqual(exerciseVolume(done("4 x max hold (target 15s+)")), { reps: 0, holdSec: 60, estimated: true });
});

test("nothing is invented: max reps, attempts, skipped and too hard count zero", () => {
  for (const d of ["5 x max reps", "3 x max hold", "5-6 attempts", "3 x 5 attempts", "5 x 5-10 steps"]) {
    assert.deepEqual(exerciseVolume(done(d)), { reps: 0, holdSec: 0, estimated: false }, d);
  }
  assert.equal(exerciseVolume({ outcome: "skipped", detail: "3 x 10 reps" }).reps, 0);
  assert.equal(exerciseVolume({ outcome: "tooHard", detail: "3 x 10 reps" }).reps, 0);
});

test("a Skill Check counts its result", () => {
  assert.deepEqual(exerciseVolume(done("1 x max reps", { checkResult: 12 })), { reps: 12, holdSec: 0, estimated: false });
  assert.deepEqual(exerciseVolume(done("3 x 5s", { checkResult: 7 })), { reps: 0, holdSec: 7, estimated: false });
});

test("totals add up per exercise across sessions, biggest first", () => {
  const sessions = [
    { finishedAt: "2026-11-02T18:00:00Z", exercises: [{ name: "Muscle-ups", setTitle: "Main", ...done("4 x 3 reps") }, { name: "Tuck front lever", setTitle: "Main", ...done("3 x 10s") }] },
    { finishedAt: "2026-11-09T18:00:00Z", exercises: [{ name: "Muscle-ups", setTitle: "Main", ...done("4 x 3 reps", { sets: [{ reps: 4 }, { reps: 3 }, { reps: 3 }, { reps: 2 }] }) }] },
    { finishedAt: "2026-11-12T18:00:00Z", exercises: [{ name: "Push-ups", setTitle: "Main", outcome: "skipped" as const, detail: "3 x 20 reps" }, { name: "Skill check: Muscle-ups", setTitle: "Skill Check", ...done("1 x max reps", { checkResult: 5 }) }] },
  ];
  const t = totalsByExercise(sessions);
  assert.deepEqual(t.map((x) => [x.name, x.reps, x.holdSec, x.sessions]), [
    ["Muscle-ups", 12 + 12 + 5, 0, 3],
    ["Tuck front lever", 0, 30, 1],
  ]);
  assert.equal(t[0].estimated, true); // the first session's 12 came from the prescription
});

test("time held reads naturally", () => {
  assert.equal(formatHeld(45), "45 s");
  assert.equal(formatHeld(272), "4 min 32 s");
  assert.equal(formatHeld(600), "10 min");
  assert.equal(formatHeld(7500), "2 h 05 min");
});

test("warm-up drills aren't counted", () => {
  const t = totalsByExercise([
    { finishedAt: "2026-11-02T18:00:00Z", exercises: [
      { name: "Wrist circles & stretch", setTitle: "Warm-Up", ...done("2 x 10 each direction") },
      { name: "Push-ups", setTitle: "Final Hits", ...done("3 x 15") },
    ] },
  ]);
  assert.deepEqual(t.map((x) => x.name), ["Push-ups"]);
});
