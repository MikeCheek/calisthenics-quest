import { test } from "node:test";
import assert from "node:assert/strict";
import { libraryEntries, searchLibrary, findEntry } from "../src/lib/exerciseLibrary";
import { buildCustomSession, setsOf, withSets } from "../src/lib/customSession";
import { fitsEquipment } from "../src/lib/equipmentNeeds";
import type { TrainingEquipment } from "../src/lib/types";

const NONE: TrainingEquipment = { pullUpBar: false, parallelBars: false, rings: false, wallSpace: false, verticalPole: false, monkeyBars: false, weights: false, resistanceBands: false };
const BAR = { ...NONE, pullUpBar: true };

test("the library has every exercise once, with where it belongs", () => {
  const all = libraryEntries();
  assert.ok(all.length > 150, String(all.length));
  assert.equal(new Set(all.map((e) => e.exercise.name)).size, all.length);
  const tuck = findEntry("Tuck front lever holds")!;
  assert.equal(tuck.skill, "frontLever");
  assert.equal(tuck.stage, "tuck");
  assert.equal(tuck.kind, "skill");
  assert.equal(findEntry("Wrist circles & stretch")?.kind, "mobility");
  assert.equal(findEntry("Burpees")?.kind, "conditioning");
});

test("search: words in any order, accents ignored, filters combine", () => {
  const all = libraryEntries();
  const r = searchLibrary(all, { query: "lever tuck" });
  assert.ok(r.some((e) => e.exercise.name === "Tuck front lever holds"));
  assert.ok(searchLibrary(all, { kind: "mobility" }).every((e) => e.kind === "mobility"));
  assert.ok(searchLibrary(all, { area: "legs" }).every((e) => e.area === "legs"));
  // the Italian description is searchable too
  assert.ok(searchLibrary(all, { query: "polsi" }, (e) => (e.exercise.name.includes("Wrist") ? "ruota i polsi" : "")).length > 0);
  // easiest first
  const pull = searchLibrary(all, { skill: "frontLever" });
  assert.ok(pull[0].difficulty <= pull[pull.length - 1].difficulty);
});

test("'only what my equipment allows' really does", () => {
  for (const eq of [NONE, BAR]) {
    for (const e of searchLibrary(libraryEntries(), { equipment: eq })) assert.ok(fitsEquipment(e.exercise, eq), e.exercise.name);
  }
  assert.ok(!searchLibrary(libraryEntries(), { equipment: NONE }).some((e) => /ring dips/i.test(e.exercise.name)));
});

test("sets can be changed on any prescription", () => {
  assert.equal(withSets("3 x 8-10 reps", 5), "5 x 8-10 reps");
  assert.equal(withSets("4-5 x 10s", 2), "2 x 10s");
  assert.equal(withSets("max hold", 3), "3 x max hold");
  assert.equal(setsOf("4 x 6"), 4);
  assert.equal(withSets("3 x 5", 99), "10 x 5");
});

test("a custom session: your exercises, your sets, an optional matched warm-up", () => {
  const s = buildCustomSession("Quick pull", [{ name: "Pull-ups", sets: 5 }, { name: "Tuck front lever holds" }], { warmup: true, equipment: BAR, now: new Date("2026-11-21T10:00:00Z") })!;
  assert.equal(s.focusLabel, "Quick pull");
  assert.equal(s.sets[0].title, "Warm-Up");
  assert.ok(s.sets[0].exercises.every((d) => fitsEquipment(d, BAR)));
  const main = s.sets[1];
  assert.equal(main.title, "Your session");
  assert.match(main.exercises[0].detail, /^5 x/);
  const noWarm = buildCustomSession("", [{ name: "Push-ups" }], { warmup: false, equipment: NONE })!;
  assert.equal(noWarm.sets.length, 1);
  assert.equal(noWarm.focusLabel, "Your session");
  assert.equal(buildCustomSession("x", [{ name: "Not an exercise" }], { warmup: false, equipment: NONE }), null);
});
