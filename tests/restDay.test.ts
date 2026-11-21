import { test } from "node:test";
import assert from "node:assert/strict";
import { planRestDay, recentLoad } from "../src/lib/restDay";
import { fitsEquipment } from "../src/lib/equipmentNeeds";
import type { SessionRecord, TrainingEquipment } from "../src/lib/types";
import { MOBILITY_POOL } from "../src/lib/warmupFinisher";

const NONE: TrainingEquipment = { pullUpBar: false, parallelBars: false, rings: false, wallSpace: false, verticalPole: false, monkeyBars: false, weights: false, resistanceBands: false };
const now = new Date("2026-11-21T18:00:00Z");
const pullDay = { finishedAt: "2026-11-20T18:00:00Z", exercises: [{ name: "Pull-ups", detail: "4 x 6", setTitle: "Strength", outcome: "done" }] } as unknown as SessionRecord;
const old = { finishedAt: "2026-11-10T18:00:00Z", exercises: [{ name: "Pistol squats", detail: "4 x 5", setTitle: "Strength", outcome: "done" }] } as unknown as SessionRecord;

test("only the last three days count as recent", () => {
  const load = recentLoad([pullDay, old], now);
  assert.ok((load.lats ?? 0) > 0);
  assert.equal(load.quads, undefined);
});

test("a rest-day routine: drills then holds, about ten minutes, within the equipment", () => {
  const plan = planRestDay(recentLoad([pullDay], now), NONE);
  assert.ok(plan.stretches.length >= 7 && plan.stretches.length <= 9, String(plan.stretches.length));
  assert.ok(plan.minutes >= 7 && plan.minutes <= 13, String(plan.minutes));
  const drills = plan.stretches.filter((s) => s.description);
  assert.ok(drills.length >= 2);
  for (const d of drills) assert.ok(fitsEquipment(d, NONE), d.name);
  // drills first, no pulse raisers on a rest day
  assert.ok(plan.stretches.findIndex((s) => !s.description) >= drills.length);
  const general = MOBILITY_POOL.filter((d) => d.areas.includes("general")).map((d) => d.name);
  assert.ok(!plan.stretches.some((s) => general.includes(s.name)));
  // eases yesterday's pulling
  assert.ok(plan.stretches.some((s) => s.for.includes("lats")));
});

test("with no recent training it still moves the whole body", () => {
  const plan = planRestDay({}, NONE);
  const covered = new Set(plan.stretches.flatMap((s) => s.for));
  for (const m of ["hipFlexors", "hamstrings", "shoulders"]) assert.ok(covered.has(m as never), m);
});
