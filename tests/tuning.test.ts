import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { applyTuning, resetTuning, tuning, TUNING_DEFAULTS, REMOTE_PARAMS } from "../src/lib/tuning";
import { xpRules } from "../src/lib/sessionXp";
import { feedbackWeight, easeUpTarget } from "../src/lib/effort";

afterEach(() => resetTuning());

test("valid Remote Config values are applied", () => {
  const rejected = applyTuning({ xp_per_effort: "6", xp_verified: "60", feature_global_board: "false", ease_up_early: "0.6" });
  assert.deepEqual(rejected, []);
  assert.equal(xpRules().perEffort, 6);
  assert.equal(xpRules().verified, 60);
  assert.equal(tuning().featureGlobalBoard, false);
  assert.equal(easeUpTarget(0.1), 0.6);
});

test("missing, mistyped or out-of-range values keep the defaults", () => {
  const rejected = applyTuning({ xp_per_effort: "lots", xp_session: "-5", xp_record: "2.5", feature_ai_coach: "yes", balance_headroom: "9" });
  assert.deepEqual(rejected.sort(), ["balance_headroom", "feature_ai_coach", "xp_per_effort", "xp_record", "xp_session"]);
  assert.deepEqual(tuning(), TUNING_DEFAULTS);
});

test("orders that would make no sense fall back together", () => {
  applyTuning({ ease_up_early: "0.1", ease_up_late: "0.5" }); // early must cut most
  assert.equal(tuning().easeUpEarly, TUNING_DEFAULTS.easeUpEarly);
  applyTuning({ fatigue_full_until: "0.9", fatigue_floor_from: "0.5" });
  assert.equal(tuning().fatigueFullUntil, TUNING_DEFAULTS.fatigueFullUntil);
  assert.equal(feedbackWeight(0.95), TUNING_DEFAULTS.fatigueFloor);
});

test("the Remote Config template matches the defaults", () => {
  const template = JSON.parse(readFileSync("remoteconfig.template.json", "utf8")).parameters;
  for (const [key, spec] of Object.entries(REMOTE_PARAMS)) {
    assert.equal(template[spec.param]?.defaultValue.value, String(TUNING_DEFAULTS[key as keyof typeof TUNING_DEFAULTS]), spec.param);
  }
});
