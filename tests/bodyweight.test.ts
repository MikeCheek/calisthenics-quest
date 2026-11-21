import { test } from "node:test";
import assert from "node:assert/strict";
import { absoluteChange, logWeight, validKg, weightAt, weightChange, WEIGHT_LOG_MAX } from "../src/lib/bodyweight";

test("one entry a day, sorted, rounded, capped", () => {
  let log = logWeight([], 78.04, "2026-11-01");
  log = logWeight(log, 77.6, "2026-10-01");
  log = logWeight(log, 77.9, "2026-11-01"); // same day: replaces
  assert.deepEqual(log, [{ date: "2026-10-01", kg: 77.6 }, { date: "2026-11-01", kg: 77.9 }]);
  assert.deepEqual(logWeight(log, 10, "2026-11-02"), log); // not a real weight: ignored
  let big: ReturnType<typeof logWeight> = [];
  for (let i = 0; i < WEIGHT_LOG_MAX + 20; i++) big = logWeight(big, 70, new Date(Date.UTC(2025, 0, 1 + i)).toISOString().slice(0, 10));
  assert.equal(big.length, WEIGHT_LOG_MAX);
  assert.ok(validKg(75) && !validKg(20) && !validKg(NaN));
});

test("the weight on a date, with sensible fallbacks", () => {
  const log = [{ date: "2026-09-01", kg: 80 }, { date: "2026-11-01", kg: 77 }];
  assert.equal(weightAt(log, 75, "2026-10-15T10:00:00Z"), 80);
  assert.equal(weightAt(log, 75, "2026-11-20"), 77);
  assert.equal(weightAt(log, 75, "2026-08-01"), 80); // before the first entry: the closest known
  assert.equal(weightAt([], 75, "2026-08-01"), 75); // no log: the profile's weight
});

test("change over 30 days", () => {
  const log = [{ date: "2026-10-01", kg: 80 }, { date: "2026-10-20", kg: 79 }, { date: "2026-11-20", kg: 77.5 }];
  assert.equal(weightChange(log, 30, new Date("2026-11-21T12:00:00")), -1.5);
  assert.equal(weightChange([{ date: "2026-11-20", kg: 77 }], 30), null);
});

test("strength for your weight, turned into absolute", () => {
  // same reps 3 kg lighter: stronger for your weight, a little less in absolute terms
  assert.equal(absoluteChange(0, 80, 77), -4);
  assert.equal(absoluteChange(20, 80, 80), 20);
  assert.equal(absoluteChange(10, 75, 78), 14);
});
