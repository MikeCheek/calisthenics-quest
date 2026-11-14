import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TimerLog,
  TimerSetSample,
  TimerRestSample,
  summarizeTimerLog,
  bestHoldFromLog,
  scaleHoldDetail,
  learnedTransitionRest,
  median,
} from "../src/lib/timingLearning";

const hold = (activeSec: number, targetSec: number | null = 10, extra: Partial<TimerSetSample> = {}): TimerSetSample => ({
  kind: "hold", targetSec, activeSec, endedEarly: targetSec !== null && activeSec < targetSec, maxPauseMs: 0, hiddenMs: 0, ...extra,
});
const reps = (activeSec: number, extra: Partial<TimerSetSample> = {}): TimerSetSample => ({
  kind: "reps", targetSec: null, activeSec, endedEarly: false, maxPauseMs: 0, hiddenMs: 0, ...extra,
});
const rest = (takenSec: number, plannedSec = 90, extra: Partial<TimerRestSample> = {}): TimerRestSample => ({
  plannedSec, takenSec, maxPauseMs: 0, hiddenMs: 0, ...extra,
});
const log = (sets: TimerSetSample[], rests: TimerRestSample[] = [], workPauses = 0): TimerLog => ({ sets, rests, workPauses });

test("median handles odd, even and empty", () => {
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([4, 1, 3, 2]), 2.5);
  assert.ok(Number.isNaN(median([])));
});

test("drops accidental taps, backgrounded and interrupted samples", () => {
  const s = summarizeTimerLog(
    log(
      [hold(6), hold(0.3), hold(7, 10, { hiddenMs: 60_000 }), hold(5)],
      [rest(60), rest(1), rest(1500), rest(55, 90, { maxPauseMs: 400_000 })]
    )
  )!;
  assert.equal(s.holdRatio, 0.55); // median of 0.6 and 0.5 only
  assert.ok(Math.abs(s.restRatio! - 60 / 90) < 1e-9);
  assert.equal(s.ignored, 5);
  assert.equal(s.struggled, true);
});

test("tapped-through rep sets invalidate the rests too", () => {
  const s = summarizeTimerLog(log([reps(0.8), reps(1.1)], [rest(10), rest(12)]))!;
  assert.equal(s.restRatio, undefined);
  assert.equal(s.ignored, 4);
});

test("max holds (no target) never count as falling short, but still give a best hold", () => {
  const l = log([hold(4, null), hold(6, null)]);
  const s = summarizeTimerLog(l)!;
  assert.equal(s.holdRatio, undefined);
  assert.equal(s.struggled, false);
  assert.equal(bestHoldFromLog(l), 6);
});

test("logged reps: ratio, best, plausibility and struggle", () => {
  const good = summarizeTimerLog(log([reps(30, { reps: 12, targetReps: 8 }), reps(30, { reps: 11, targetReps: 8 })]))!;
  assert.equal(good.bestReps, 12);
  assert.ok(good.repRatio! > 1.3);
  assert.equal(good.struggled, false);

  const low = summarizeTimerLog(log([reps(30, { reps: 4, targetReps: 8 }), reps(30, { reps: 5, targetReps: 8 })]))!;
  assert.equal(low.struggled, true);

  const typo = summarizeTimerLog(log([reps(30, { reps: 400, targetReps: 8 })]))!;
  assert.equal(typo.bestReps, undefined);
  assert.equal(typo.ignored, 1);
});

test("repeated mid-set pauses mark a struggle", () => {
  assert.equal(summarizeTimerLog(log([hold(10)], [], 2))!.struggled, true);
});

test("scaleHoldDetail only touches seconds", () => {
  assert.equal(scaleHoldDetail("4 x 15-20s", 0.7), "4 x 11-14s");
  assert.equal(scaleHoldDetail("4 x max hold (target 8-12s)", 0.6), "4 x max hold (target 5-7s)");
  assert.equal(scaleHoldDetail("3 x 8 reps", 0.5), "3 x 8 reps");
});

test("between-exercise rest needs 3 sessions and ignores small differences", () => {
  assert.deepEqual(learnedTransitionRest(60, [0.5, 0.5]), { seconds: 60, learned: false });
  assert.deepEqual(learnedTransitionRest(60, [1.05, 0.95, 1.1]), { seconds: 60, learned: false });
  assert.deepEqual(learnedTransitionRest(60, [0.5, 0.6, 0.55]), { seconds: 35, learned: true });
});
