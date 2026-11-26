import { test } from "node:test";
import assert from "node:assert/strict";
import { guideIdFor, variantLines, GuideText } from "../src/lib/guides/index";
import { GUIDES as EN } from "../src/lib/guides/guides.en";
import { GUIDES as IT } from "../src/lib/guides/guides.it";
import { libraryEntries } from "../src/lib/exerciseLibrary";

const SPORTS = ["calisthenics", "yoga", "pilates"] as const;
const allNames = () => [...new Set(SPORTS.flatMap((s) => libraryEntries(s).map((e) => e.exercise.name)))];

test("every exercise in every sport has a form guide", () => {
  const missing = allNames().filter((n) => {
    const id = guideIdFor(n);
    return !id || !EN[id] || !IT[id];
  });
  assert.deepEqual(missing, [], "exercises without a guide in both languages");
});

const complete = (g: GuideText) =>
  g.setup.length >= 1 && g.steps.length >= 3 && g.targets.length >= 2 && g.mistakes.length >= 3 && g.breath.length > 0;

test("every guide is complete and the Italian matches the English line for line", () => {
  assert.deepEqual(Object.keys(IT).sort(), Object.keys(EN).sort(), "same guides in both languages");
  for (const [id, en] of Object.entries(EN)) {
    const it = IT[id];
    assert.ok(complete(en), `${id}: incomplete English guide`);
    for (const k of ["setup", "steps", "targets", "mistakes"] as const)
      assert.equal(it[k].length, en[k].length, `${id}.${k}: Italian has a different number of lines`);
    for (const g of [en, it])
      for (const line of [...g.setup, ...g.steps, ...g.targets, ...g.mistakes.map((m) => m[1]), g.breath])
        assert.ok(line.trim().length >= 12, `${id}: stub line "${line}"`);
  }
  // enough to actually teach the movement
  const thin = Object.entries(EN)
    .filter(([, g]) => [...g.setup, ...g.steps, ...g.targets, ...g.mistakes.flat(), g.breath].join("").length < 430)
    .map(([id]) => id);
  assert.deepEqual(thin, [], "guides too short to teach the movement");
  // no guide is unused
  const used = new Set(allNames().map(guideIdFor));
  assert.deepEqual(Object.keys(EN).filter((id) => !used.has(id)), [], "guides no exercise uses");
});

test("guides go to the right movement", () => {
  const cases: [string, string][] = [
    ["Pull-ups", "pullUp"],
    ["Weighted archer pull-ups", "archerPullUp"],
    ["One-arm pull-up, other hand on wrist", "oneArmPullUp"],
    ["Flag pull-ups", "flagPullUp"],
    ["Full human flag holds", "humanFlag"],
    ["Tuck front lever raises", "frontLever"],
    ["Front lever rows (bent-arm)", "frontLever"],
    ["Skin the cat to back lever", "backLever"],
    ["Skin the cats", "germanHang"],
    ["Ring muscle-ups", "muscleUp"],
    ["Ring dips", "dip"],
    ["Impossible dips", "impossibleDip"],
    ["Wall walks", "wallWalk"],
    ["Wall HSPU negatives", "hspu"],
    ["Pike press to handstand", "pressHandstand"],
    ["Side plank hip dips", "sidePlank"],
    ["Hamstring bridges", "hamstringBridge"],
    ["Standing-to-bridge (drop back)", "bridge"],
    ["Cossack squats", "cossack"],
    ["Jump pistols onto a box", "jumpPistol"],
    ["Sissy squats (unassisted)", "sissySquat"],
    ["Pigeon pose", "pigeon"],
    ["Warrior II", "warrior2"],
    ["Warrior III", "warrior3"],
    ["Boat pose", "boatPose"],
    ["Hundred (low legs)", "hundred"],
    ["Single-leg teaser", "teaser"],
    ["Seal", "seal"],
    ["Forearm plank", "plank"],
  ];
  for (const [name, id] of cases) assert.equal(guideIdFor(name), id, name);
});

test("version lines come from the name, in both languages", () => {
  assert.ok(variantLines("Band-assisted one-arm pull-ups", "en").some((l) => l.startsWith("Band help")));
  assert.ok(!variantLines("Band-assisted one-arm pull-ups", "en").some((l) => l.startsWith("Assisted")));
  assert.ok(variantLines("Advanced tuck back lever holds", "en").some((l) => l.startsWith("Advanced tuck")));
  assert.ok(!variantLines("Advanced tuck back lever holds", "en").some((l) => l.startsWith("Tuck:")));
  assert.deepEqual(variantLines("Hamstring bridges", "en"), []);
  assert.deepEqual(variantLines("Full lotus", "en"), []);
  assert.equal(variantLines("Ring dips", "it").length, variantLines("Ring dips", "en").length);
});
