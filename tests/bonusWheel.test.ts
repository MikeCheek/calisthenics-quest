import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BET_SPOTS,
  SEGMENTS,
  betReturn,
  betsLeft,
  bonusCards,
  chance,
  expectedReturn,
  maxStake,
  pickExercise,
  stageOffset,
  wheelSkillAvailable,
} from "../src/lib/bonusWheel";
import { exerciseNeeds, fitsEquipment } from "../src/lib/equipmentNeeds";
import { DEFAULT_SKILLS, type StagedSkillKey, type TrainingEquipment } from "../src/lib/types";
import { STAGE_ORDER } from "../src/lib/stageOrder";
import { xpForLevel } from "../src/lib/xp";

const NONE: TrainingEquipment = { pullUpBar: false, parallelBars: false, rings: false, wallSpace: false, verticalPole: false, monkeyBars: false, weights: false, resistanceBands: false };
const KEYS = Object.keys(NONE) as (keyof TrainingEquipment)[];
const ALL_SKILLS = Object.keys(STAGE_ORDER) as StagedSkillKey[];

test("equipment is read from exercise names", () => {
  assert.deepEqual(exerciseNeeds("Ring dips"), [["rings"]]);
  assert.deepEqual(exerciseNeeds("Negative dips"), [["parallelBars", "rings"]]);
  assert.deepEqual(exerciseNeeds("Band-assisted chest-to-bar pull-ups"), [["resistanceBands"], ["pullUpBar", "rings"]]);
  assert.deepEqual(exerciseNeeds("Wall handstand holds"), [["wallSpace"]]);
  assert.deepEqual(exerciseNeeds("Weighted pull-ups"), [["weights"], ["pullUpBar", "rings"]]);
  assert.deepEqual(exerciseNeeds("Tuck human flag holds"), [["verticalPole"]]);
  assert.deepEqual(exerciseNeeds("Tuck dragon flag holds"), []); // a floor exercise, not a pole one
  assert.deepEqual(exerciseNeeds("Side plank hip dips"), []);
  assert.deepEqual(exerciseNeeds("Kip-ups"), []);
  assert.deepEqual(exerciseNeeds("Shoulder dislocates (band or stick)"), []);
  assert.ok(fitsEquipment({ name: "Push-ups" }, NONE));
});

test("with nothing but the floor, the wheel offers nothing that needs gear", () => {
  const offered = ALL_SKILLS.filter((s) => wheelSkillAvailable(s, NONE));
  assert.ok(offered.length > 5, `only ${offered.length}`);
  for (const bar of ["frontLever", "backLever", "muscleUp", "humanFlag", "ironCross", "oneArmPullUp", "toesToBar"] as StagedSkillKey[]) {
    assert.ok(!offered.includes(bar), bar);
  }
});

test("every exercise the wheel can pick fits the equipment, for many kits", () => {
  // every single item on its own, a few common kits, and everything
  const kits: TrainingEquipment[] = [
    NONE,
    ...KEYS.map((k) => ({ ...NONE, [k]: true })),
    { ...NONE, pullUpBar: true, parallelBars: true },
    { ...NONE, pullUpBar: true, wallSpace: true, resistanceBands: true },
    { ...NONE, rings: true, wallSpace: true },
    Object.fromEntries(KEYS.map((k) => [k, true])) as unknown as TrainingEquipment,
  ];
  let checked = 0;
  for (const eq of kits) {
    for (const skill of ALL_SKILLS.filter((s) => wheelSkillAvailable(s, eq))) {
      for (const seg of BET_SPOTS) {
        for (let r = 0; r < 4; r++) {
          const pick = pickExercise(skill, DEFAULT_SKILLS, eq, stageOffset(seg), () => r / 4);
          assert.ok(pick, `${skill} ${String(seg)}`);
          assert.ok(fitsEquipment(pick.exercise, eq), `${skill}: ${pick.exercise.name} with ${KEYS.filter((k) => eq[k]).join(",") || "nothing"}`);
          checked++;
        }
      }
      for (const c of bonusCards(skill, DEFAULT_SKILLS, eq)) assert.ok(fitsEquipment(c.exercise, eq), c.exercise.name);
    }
  }
  assert.ok(checked > 1000, String(checked));
});

test("harder segments pick from harder stages", () => {
  const eq = Object.fromEntries(KEYS.map((k) => [k, true])) as unknown as TrainingEquipment;
  const skills = { ...DEFAULT_SKILLS, frontLever: "tuck" } as typeof DEFAULT_SKILLS;
  const order = STAGE_ORDER.frontLever;
  const at = (offset: number) => order.indexOf(pickExercise("frontLever", skills, eq, offset)!.stage);
  assert.ok(at(-1) < at(0) && at(0) < at(1) && at(1) < at(2), `${at(-1)} ${at(0)} ${at(1)} ${at(2)}`);
});

test("the wheel's odds are what it shows, and no bet is a money-maker", () => {
  assert.equal(SEGMENTS.length, 24);
  assert.equal(BET_SPOTS.reduce((a, v) => a + chance(v), 0), 1);
  for (const v of BET_SPOTS) assert.ok(expectedReturn(v) <= 1.0001 && expectedReturn(v) >= 0.7, `${String(v)}: ${expectedReturn(v)}`);
  // equal values never sit side by side
  SEGMENTS.forEach((v, i) => assert.notEqual(v, SEGMENTS[(i + 1) % SEGMENTS.length], `at ${i}`));
});

test("bets: what comes back, how much you can stake, how many a day", () => {
  assert.equal(betReturn({ on: 5, stake: 10 }, 5), 60);
  assert.equal(betReturn({ on: "bonus", stake: 5 }, "bonus"), 55);
  assert.equal(betReturn({ on: 2, stake: 10 }, 1), 0);
  assert.equal(betReturn(null, 10), 0);
  // never more than what's been earned into the current level
  assert.equal(maxStake(xpForLevel(7)), 0);
  assert.equal(maxStake(xpForLevel(7) + 12), 12);
  assert.equal(maxStake(xpForLevel(7) + 400), 25);
  assert.equal(betsLeft(undefined, "2026-11-20"), 5);
  assert.equal(betsLeft({ day: "2026-11-20", count: 5 }, "2026-11-20"), 0);
  assert.equal(betsLeft({ day: "2026-11-19", count: 5 }, "2026-11-20"), 5);
});
