import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ASSESSMENT_AREAS,
  answersFromProfile,
  applyAssessment,
  areaTier,
  visibleLadders,
  visibleSides,
  sideLevel,
} from "../src/lib/assessment";
import { translate } from "../src/lib/i18n/tx";
import IT_PHRASES from "../src/lib/i18n/phrases.it";
import { DEFAULT_EQUIPMENT, DEFAULT_SKILLS } from "../src/lib/types";

const area = (id: string) => ASSESSMENT_AREAS.find((a) => a.id === id)!;

test("strong puller / weak pusher is placed separately per area", () => {
  const a = answersFromProfile(DEFAULT_SKILLS, {});
  a.baselines = { pullUpMaxReps: 18, pushUpMaxReps: 12, dipMaxReps: 4 };
  a.archerPullUp = true;
  a.stages = { muscleUp: "multiple", frontLever: "straddle", backLever: "full", planche: "none", handstandPushUp: "none" };
  assert.equal(areaTier(area("pull"), a, DEFAULT_EQUIPMENT), 2);
  assert.equal(areaTier(area("push"), a, DEFAULT_EQUIPMENT), 0);

  const out = applyAssessment(DEFAULT_SKILLS, {}, a, DEFAULT_EQUIPMENT);
  assert.equal(out.skills.muscleUp, "multiple");
  assert.equal(out.skills.chestToBarPullUp, "full"); // assumed at advanced pulling
  assert.equal(out.skills.planche, "none");
});

test("questions are gated by equipment and earlier answers", () => {
  const a = answersFromProfile(DEFAULT_SKILLS, {});
  a.baselines = { pullUpMaxReps: 1 };
  assert.ok(!visibleLadders(area("pull"), a, DEFAULT_EQUIPMENT).some((l) => l.skill === "muscleUp"));
  const noPole = { ...DEFAULT_EQUIPMENT, verticalPole: false };
  assert.ok(!visibleLadders(area("statics"), a, noPole).some((l) => l.skill === "humanFlag"));
  assert.ok(!visibleSides(area("statics"), a, { ...DEFAULT_EQUIPMENT, rings: false }).some((s) => s.skill === "ironCross"));
});

test("beginners don't see elite side skills", () => {
  const a = answersFromProfile(DEFAULT_SKILLS, {});
  a.baselines = { pullUpMaxReps: 2 };
  assert.ok(!visibleSides(area("pull"), a, DEFAULT_EQUIPMENT).some((s) => s.skill === "oneArmPullUp"));
});

test("an explicit answer always beats a tier assumption", () => {
  const a = answersFromProfile(DEFAULT_SKILLS, {});
  a.baselines = { pullUpMaxReps: 20 };
  a.archerPullUp = true;
  a.stages = { muscleUp: "multiple" };
  a.sides = { chestToBarPullUp: 0 };
  const side = area("pull").sides.find((s) => s.skill === "chestToBarPullUp")!;
  assert.equal(sideLevel(area("pull"), side, a, DEFAULT_EQUIPMENT), 0);
});

test("re-taking prefills from the existing profile", () => {
  const a = answersFromProfile({ ...DEFAULT_SKILLS, frontLever: "tuck", bridge: "full" }, { frontLever: 5 });
  assert.equal(a.stages.frontLever, "tuck");
  assert.equal(a.solidity.frontLever, 5);
  assert.equal(a.sides.bridge, 2);
});

test("translations: static, templated, composite and fallback", () => {
  assert.equal(translate("it", "Danger zone"), "Zona pericolosa");
  assert.equal(translate("it", "Level {n}", { n: 3 }), "Livello 3");
  assert.equal(
    translate("it", "Eased from Pull-ups — you skipped it recently"),
    "Alleggerito da Pull-ups — di recente l'hai saltato"
  );
  assert.equal(
    translate("it", "+1 set — consistently completed · rest 90s → 60s, matching what you take"),
    "+1 serie — completato con costanza · recupero 90s → 60s, come quello che fai davvero"
  );
  assert.equal(translate("it", "Not in the table"), "Not in the table");
  assert.equal(translate("en", "Danger zone"), "Danger zone");
});

test("every assessment string has an Italian entry", () => {
  const keys = new Set(IT_PHRASES.map(([en]) => en));
  const missing: string[] = [];
  for (const a of ASSESSMENT_AREAS) {
    for (const s of [a.title, a.blurb, ...a.ladders.map((l) => l.title), ...(a.baselines ?? []).map((b) => b.label)]) {
      if (!keys.has(s) && translate("it", s) === s && !/^[A-Z][a-z]+( [a-z]+)*$/.test(s)) missing.push(s);
    }
    for (const l of a.ladders) for (const o of l.options) {
      for (const s of [o.label, o.hint].filter(Boolean) as string[]) if (!keys.has(s)) missing.push(s);
    }
  }
  assert.deepEqual(missing, []);
});
