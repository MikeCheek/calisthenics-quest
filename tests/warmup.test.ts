import { test } from "node:test";
import assert from "node:assert/strict";
import { pickWarmupFor, warmupAreas, WARMUP_WHY } from "../src/lib/warmupFinisher";
import { generateSession } from "../src/lib/trainingGenerator";
import { fitsEquipment } from "../src/lib/equipmentNeeds";
import { DEFAULT_SKILLS, type TrainingEquipment } from "../src/lib/types";
import { translate } from "../src/lib/i18n/tx";

const NONE: TrainingEquipment = { pullUpBar: false, parallelBars: false, rings: false, wallSpace: false, verticalPole: false, monkeyBars: false, weights: false, resistanceBands: false };
const BAR = { ...NONE, pullUpBar: true };
const ALL = Object.fromEntries(Object.keys(NONE).map((k) => [k, true])) as unknown as TrainingEquipment;

const PUSH = [{ name: "Tuck planche holds", detail: "4 x 10s" }, { name: "Wall handstand holds", detail: "3 x 30s" }, { name: "Push-ups", detail: "3 x 12" }];
const PULL = [{ name: "Pull-ups", detail: "4 x 6" }, { name: "Tuck front lever holds", detail: "4 x 10s" }];
const LEGS = [{ name: "Pistol squats", detail: "4 x 5" }, { name: "Bulgarian split squats", detail: "3 x 10" }];

test("hands on the floor: the warm-up always preps the wrists", () => {
  assert.ok(warmupAreas(PUSH).slice(0, 3).includes("wrists"));
  const w = pickWarmupFor(PUSH, ALL, "2026-11-21");
  assert.ok(w.some((d) => /wrist/i.test(d.name)), w.map((d) => d.name).join());
});

test("pulling preps shoulder blades and shoulders; legs prep hips and ankles", () => {
  assert.ok(["scapula", "shoulders"].includes(warmupAreas(PULL)[0]));
  const legs = warmupAreas(LEGS).slice(0, 3);
  assert.ok(legs.includes("hips"), legs.join());
});

test("only drills the equipment allows", () => {
  for (const eq of [NONE, BAR, ALL]) {
    for (const s of [PUSH, PULL, LEGS]) {
      const w = pickWarmupFor(s, eq, "2026-11-21");
      assert.equal(w.length, 3);
      for (const d of w) assert.ok(fitsEquipment(d, eq), `${d.name} with ${JSON.stringify(eq)}`);
    }
  }
  assert.ok(!pickWarmupFor(PULL, NONE, "2026-11-21").some((d) => /hang/i.test(d.name)));
});

test("every drill says what it's getting ready, in both languages", () => {
  for (const d of pickWarmupFor(PULL, BAR, "2026-11-21")) assert.ok(d.adaptNote && Object.values(WARMUP_WHY).includes(d.adaptNote));
  for (const why of Object.values(WARMUP_WHY)) assert.notEqual(translate("it", why), why, why);
});

test("generated sessions use the matched warm-up, within the equipment", () => {
  for (const eq of [NONE, BAR, ALL]) {
    const s = generateSession(DEFAULT_SKILLS, eq, eq.pullUpBar ? "frontLever" : "pushStrength", new Date("2026-11-21T10:00:00Z"));
    const warm = s.sets.find((x) => x.track === "warmup")!;
    assert.ok(warm.exercises.length >= 3);
    for (const d of warm.exercises) {
      assert.ok(fitsEquipment(d, eq), d.name);
      assert.ok(d.adaptNote, d.name);
    }
  }
});
