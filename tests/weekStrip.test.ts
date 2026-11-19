import { test } from "node:test";
import assert from "node:assert/strict";
import { trainedToday, weekStart, weekStrip } from "../src/lib/weekStrip";

// Thursday 19 Nov 2026, 10:00 local
const NOW = new Date(2026, 10, 19, 10, 0, 0);
const at = (day: number, h = 18) => new Date(2026, 10, day, h, 0, 0).toISOString();

test("the week starts on Monday", () => {
  const s = weekStart(NOW);
  assert.equal(s.getDay(), 1);
  assert.equal(s.getDate(), 16);
  // Sunday belongs to the week that started the Monday before
  assert.equal(weekStart(new Date(2026, 10, 22, 12)).getDate(), 16);
});

test("marks done, planned, past and today", () => {
  const strip = weekStrip(NOW, [{ finishedAt: at(16) }, { finishedAt: at(17) }, { finishedAt: at(12) }], [1, 3, 5]);
  assert.equal(strip.length, 7);
  assert.deepEqual(strip.map((d) => d.done), [true, true, false, false, false, false, false]);
  assert.deepEqual(strip.map((d) => d.planned), [true, false, true, false, true, false, false]);
  assert.deepEqual(strip.map((d) => d.isToday), [false, false, false, true, false, false, false]);
  assert.deepEqual(strip.map((d) => d.isPast), [true, true, true, false, false, false, false]);
});

test("trained today", () => {
  assert.equal(trainedToday(NOW, [{ finishedAt: at(19, 8) }]), true);
  assert.equal(trainedToday(NOW, [{ finishedAt: at(18) }]), false);
});
