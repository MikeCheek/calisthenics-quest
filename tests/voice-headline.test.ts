import { test } from "node:test";
import assert from "node:assert/strict";
import { speakableDetail, speakableName } from "../src/lib/voice";
import { translate } from "../src/lib/i18n/tx";

test("exercise details read naturally aloud (English)", () => {
  assert.equal(speakableDetail("4 x 5-6 reps", "en"), "4 sets of 5 to 6 reps");
  assert.equal(speakableDetail("3 x 20s", "en"), "3 sets of 20 seconds");
  assert.equal(speakableDetail("4 x 15-20s", "en"), "4 sets of 15 to 20 seconds");
  assert.equal(speakableDetail("4 x max hold (target 8-12s)", "en"), "4 sets, max hold");
  assert.equal(speakableDetail("3 x 4-5 reps per side", "en"), "3 sets of 4 to 5 reps each side");
  assert.equal(speakableDetail("1 x max reps", "en"), "1 set, max reps");
  assert.equal(speakableDetail("8 min, 1-2 reps per minute", "en"), "8 minutes, 1 to 2 reps per minute");
});

test("exercise details read naturally aloud (Italian)", () => {
  assert.equal(speakableDetail("4 x 5-6 reps", "it"), "4 serie da 5 a 6 ripetizioni");
  assert.equal(speakableDetail("3 x 20s", "it"), "3 serie da 20 secondi");
  assert.equal(speakableDetail("3 x 4-5 reps per side", "it"), "3 serie da 4 a 5 ripetizioni per lato");
});

test("every spoken cue has an Italian version", () => {
  const cues = ["Voice coaching on", "Last set", "Ten seconds", "Rest {n} seconds", "Exercise complete", "Get ready",
    "Session complete. Great work!", "Rest. Up next: {x}", "Swapped in {ex}", "Set {a} of {b}", "Skill check."];
  assert.deepEqual(cues.filter((c) => translate("it", c) === c && c !== "Skill check."), []);
  assert.equal(translate("it", "Rest. Up next: {x}", { x: "Pull-ups" }), "Recupero. A seguire: Pull-ups");
});

test("spoken names drop parenthetical notes", () => {
  assert.equal(speakableName("Shoulder dislocates (band or stick)"), "Shoulder dislocates");
  assert.equal(speakableName("Ring / bar support hold"), "Ring / bar support hold");
});
