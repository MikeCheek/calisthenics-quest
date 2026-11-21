import { test } from "node:test";
import assert from "node:assert/strict";
import { STRETCHES, exerciseMuscles, planCoolDown, sessionLoad } from "../src/lib/stretching";
import { translate } from "../src/lib/i18n/tx";

const PULL = [{ name: "Pull-ups", detail: "4 x 6" }, { name: "Tuck front lever holds", detail: "4 x 10s" }, { name: "Hanging knee raises", detail: "3 x 10" }];
const PUSH = [{ name: "Push-ups", detail: "4 x 12" }, { name: "Tuck planche holds", detail: "4 x 10s" }, { name: "Wall handstand holds", detail: "3 x 30s" }, { name: "Negative dips", detail: "3 x 5" }];
const LEGS = [{ name: "Pistol squats", detail: "4 x 5" }, { name: "Bulgarian split squats", detail: "3 x 10" }, { name: "Nordic curls", detail: "3 x 5" }];

test("exercises load the muscles you'd expect", () => {
  assert.ok((exerciseMuscles("Pull-ups").lats ?? 0) >= 1);
  assert.ok((exerciseMuscles("Tuck planche holds").wrists ?? 0) > 0);
  assert.ok((exerciseMuscles("Ring dips").chest ?? 0) >= 1);
  assert.ok((exerciseMuscles("Pistol squats").quads ?? 0) >= 1);
  assert.ok((exerciseMuscles("Diamond push-ups").wrists ?? 0) > 0); // hands on the floor
  assert.equal(exerciseMuscles("Dead hangs").wrists, undefined);
});

test("session load: shares that add up to 1; warm-ups don't count", () => {
  const load = sessionLoad([...PULL, { name: "Wrist circles", detail: "2 x 10", setTitle: "Warm-Up" }]);
  const sum = Object.values(load).reduce((a, b) => a + (b ?? 0), 0);
  assert.ok(Math.abs(sum - 1) < 1e-9);
  assert.equal(load.wrists, undefined);
  assert.deepEqual(sessionLoad([]), {});
});

test("a pulling day stretches lats and arms; a pushing day chest, shoulders and wrists; a leg day legs", () => {
  const pull = planCoolDown(PULL)!;
  assert.equal(pull.focus[0], "lats");
  assert.ok(pull.stretches.some((s) => s.targets.includes("lats")));
  assert.ok(pull.stretches.some((s) => s.targets.includes("biceps")));

  const push = planCoolDown(PUSH)!;
  assert.ok(push.stretches.some((s) => s.targets.includes("chest")));
  assert.ok(push.stretches.some((s) => s.targets[0] === "wrists"), push.stretches.map((s) => s.id).join());

  const legs = planCoolDown(LEGS)!;
  assert.ok(legs.focus.includes("quads"));
  assert.ok(legs.stretches.some((s) => s.targets.includes("quads")));
  assert.ok(legs.stretches.some((s) => s.targets.includes("hamstrings")));
  assert.ok(!legs.stretches.some((s) => s.targets[0] === "wrists"));
});

test("a cool-down is 4 to 7 different stretches and a few minutes", () => {
  for (const s of [PULL, PUSH, LEGS, [...PULL, ...PUSH, ...LEGS]]) {
    const p = planCoolDown(s)!;
    assert.ok(p.stretches.length >= 4 && p.stretches.length <= 7, String(p.stretches.length));
    assert.equal(new Set(p.stretches.map((x) => x.id)).size, p.stretches.length);
    assert.ok(p.minutes >= 3 && p.minutes <= 9, String(p.minutes));
  }
  assert.equal(planCoolDown([]), null);
});

test("every stretch explains itself in Italian too", () => {
  for (const s of STRETCHES) assert.notEqual(translate("it", s.how), s.how, s.id);
});
