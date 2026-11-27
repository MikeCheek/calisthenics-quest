import { test } from "node:test";
import assert from "node:assert/strict";
import { weekPlan } from "../src/lib/weekShift";

// the week of Monday 23 November 2026
const day = (d: number, h = 18) => new Date(2026, 10, d, h);
const ran = (...ds: number[]) => ds.map((d) => ({ finishedAt: day(d).toISOString() }));
const MWF = [1, 3, 5]; // Date.getDay(): Monday, Wednesday, Friday
const names = (days: number[]) => days.map((d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]).join("-");

test("on plan: the usual days", () => {
  const p = weekPlan(MWF, ran(23), day(24, 9));
  assert.equal(names(p.days), "Mon-Wed-Fri");
  assert.equal(p.shifted, false);
  assert.equal(p.todayPlanned, false); // Tuesday
});

test("skip Monday: Tue-Thu-Sat", () => {
  const p = weekPlan(MWF, [], day(24, 9));
  assert.equal(names(p.days), "Tue-Thu-Sat");
  assert.equal(p.shifted, true);
  assert.equal(p.todayPlanned, true);
  assert.equal(p.skipped, 0);
});

test("skip Monday and Tuesday: back to Wed-Fri, one session skipped", () => {
  const p = weekPlan(MWF, [], day(25, 9));
  assert.equal(names(p.days), "Wed-Fri");
  assert.equal(p.shifted, false);
  assert.equal(p.skipped, 1);
  assert.equal(p.todayPlanned, true);
});

test("train on the moved day: the week stays moved", () => {
  const p = weekPlan(MWF, ran(24), day(25, 9));
  assert.equal(names(p.days), "Tue-Thu-Sat");
  assert.equal(p.todayPlanned, false); // Wednesday is free now
});

test("'skip today' moves the week straight away", () => {
  const p = weekPlan(MWF, [], day(23, 9), ["2026-11-23"]);
  assert.equal(names(p.days), "Tue-Thu-Sat");
  assert.equal(p.todayPlanned, false);
});

test("a session pushed past Sunday doesn't happen that week", () => {
  const late = weekPlan([6, 0], [], day(29, 9)); // Sat & Sun, Saturday missed
  assert.equal(names(late.days), "Sun"); // Saturday's session moved to Sunday, Sunday's would be Monday: gone
  assert.equal(late.todayPlanned, true);
});

test("training on a day off counts for the next session", () => {
  const p = weekPlan(MWF, ran(24), day(26, 9)); // trained Tuesday instead of Monday
  assert.equal(names(p.days), "Tue-Thu-Sat");
});

test("a whole week missed: what can't happen any more is counted the way you'd count it", () => {
  // Mon-Wed-Thu-Sat, nothing done, it's Friday: three sessions are gone, Saturday is left
  const p = weekPlan([1, 3, 4, 6], [], day(27, 9));
  assert.equal(p.lost, 3);
  assert.equal(names(p.ahead), "Sat");
  // on plan: nothing lost
  assert.equal(weekPlan(MWF, ran(23, 25), day(26, 9)).lost, 0);
});
