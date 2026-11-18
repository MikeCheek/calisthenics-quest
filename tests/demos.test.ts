import { test } from "node:test";
import assert from "node:assert/strict";
import { demoFor, MISTAKES } from "../src/lib/demos/catalog";
import { skeleton, poseAt, demoDuration } from "../src/lib/demos/figure";
import { generateSession } from "../src/lib/trainingGenerator";
import { translate } from "../src/lib/i18n/tx";
import { DEFAULT_EQUIPMENT, DEFAULT_SKILLS, SkillProfile, SkillTrack } from "../src/lib/types";
import { STAGE_ORDER } from "../src/lib/stageOrder";

// Every exercise that shows up in real sessions (all focuses, all stages,
// basic and full equipment), weighted by how often it appears.
function catalogUsage(): Map<string, number> {
  const tracks: SkillTrack[] = ["frontLever", "backLever", "planche", "muscleUp", "handstand", "humanFlag", "pullStrength", "pushStrength", "legs", "core"];
  const eqs = [DEFAULT_EQUIPMENT, { ...DEFAULT_EQUIPMENT, rings: true, verticalPole: true, weights: true, resistanceBands: true }];
  const count = new Map<string, number>();
  for (const eq of eqs) for (const t of tracks) for (let lvl = 0; lvl < 4; lvl++) for (let d = 0; d < 7; d++) {
    const sk: Record<string, unknown> = { ...DEFAULT_SKILLS, pullUpMaxReps: [3, 8, 14, 20][lvl], dipMaxReps: [3, 8, 14, 20][lvl] };
    for (const k of ["frontLever", "backLever", "planche", "muscleUp", "handstand", "humanFlag", "pistolSquat", "lSit"]) {
      sk[k] = STAGE_ORDER[k][Math.min(lvl, STAGE_ORDER[k].length - 1)];
    }
    const s = generateSession(sk as unknown as SkillProfile, eq, t, new Date(2026, 10, 1 + d));
    for (const set of s.sets) {
      if (set.title === "Warm-Up" || set.title === "Final Hits") continue;
      for (const e of set.exercises) count.set(e.name, (count.get(e.name) ?? 0) + 1);
    }
  }
  return count;
}

test("demos cover the bulk of what athletes actually train", () => {
  const usage = catalogUsage();
  const names = [...usage.keys()];
  const covered = names.filter((n) => demoFor(n));
  const total = [...usage.values()].reduce((a, b) => a + b, 0);
  const coveredUses = covered.reduce((a, n) => a + usage.get(n)!, 0);
  assert.ok(covered.length >= 60, `${covered.length} of ${names.length} exercises have a demo`);
  assert.ok(coveredUses / total >= 0.85, `${Math.round((coveredUses / total) * 100)}% of exercise appearances have a demo`);
});

test("every anchored hand and foot actually reaches its anchor, all through the loop", () => {
  const bad: string[] = [];
  for (const name of catalogUsage().keys()) {
    const entry = demoFor(name);
    if (!entry) continue;
    const total = demoDuration(entry.demo);
    for (let ms = 0; ms < total; ms += 50) {
      const sk = skeleton(poseAt(entry.demo, ms));
      const err = Math.max(...[...sk.arms, ...sk.legs].map((l) => l.error));
      if (err > 2) {
        bad.push(`${name} @${ms}ms: ${err.toFixed(1)}`);
        break;
      }
    }
  }
  assert.deepEqual(bad, []);
});

test("the figure stays inside its frame", () => {
  const bad: string[] = [];
  for (const name of catalogUsage().keys()) {
    const entry = demoFor(name);
    if (!entry) continue;
    const [x0, y0, w, h] = entry.demo.viewBox;
    for (const f of entry.demo.frames) {
      const sk = skeleton(f.pose);
      const pts = [sk.head, sk.hip, sk.shoulder, ...sk.arms.flatMap((a) => [a.joint, a.end]), ...sk.legs.flatMap((l) => [l.joint, l.end])];
      if (pts.some(([x, y]) => x < x0 - 2 || y < y0 - 2 || x > x0 + w + 2 || y > y0 + h + 2)) bad.push(name);
    }
  }
  assert.deepEqual([...new Set(bad)], []);
});

test("name matching picks the right movement and stage", () => {
  assert.equal(demoFor("Tuck front lever holds")?.family, "frontLever");
  assert.equal(demoFor("Advanced tuck back lever raises")?.family, "backLever");
  assert.equal(demoFor("Pseudo planche push-ups")?.family, "plancheLean");
  assert.equal(demoFor("Tuck planche push-ups")?.family, "planche");
  assert.equal(demoFor("Handstand push-up negatives")?.family, "hspu");
  assert.equal(demoFor("L-sit pull-ups")?.family, "pullUp");
  assert.equal(demoFor("Ring / bar support hold")?.family, "support");
  assert.equal(demoFor("Wrist prep & flexibility drills"), null);
});

test("every common mistake has an Italian translation", () => {
  const missing = Object.values(MISTAKES).flat().filter((m) => translate("it", m) === m);
  assert.deepEqual(missing, []);
});
