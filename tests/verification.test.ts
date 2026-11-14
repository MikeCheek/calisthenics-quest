import { test } from "node:test";
import assert from "node:assert/strict";
import {
  syncClaims,
  pickSkillCheck,
  applyCheckResults,
  checkSpecFor,
  addSkillCheck,
  validateCheckValue,
  claimCounts,
} from "../src/lib/verification";
import { generateSession } from "../src/lib/trainingGenerator";
import { CheckSpec, DEFAULT_EQUIPMENT, DEFAULT_SKILLS, ExerciseFeedback, SkillProfile } from "../src/lib/types";

const claimed: SkillProfile = { ...DEFAULT_SKILLS, frontLever: "full", pushUpMaxReps: 10, pullUpMaxReps: 8, sidePlank: "developing", bridge: "full" };

const check = (spec: CheckSpec, result: number | boolean | undefined, outcome: "done" | "skipped" = "done"): ExerciseFeedback[] => [
  { name: `Skill check: ${spec.label}`, setTitle: "Skill Check", outcome, check: spec, checkResult: result },
];

test("claims cover staged skills and baselines, not 'working on it' side skills", () => {
  const c = syncClaims(undefined, claimed);
  assert.equal(c.frontLever?.value, "full");
  assert.equal(c.bridge?.value, "full");
  assert.equal(c.sidePlank, undefined);
  assert.equal(c.pushUpMaxReps?.value, 10);
});

test("changing a value creates a fresh unverified claim", () => {
  const c1 = { frontLever: { value: "full", status: "verified" as const, claimedAt: "x", fails: 0 } };
  assert.equal(syncClaims(c1, claimed).frontLever?.status, "verified");
  assert.equal(syncClaims(c1, { ...claimed, frontLever: "straddle" }).frontLever?.status, "claimed");
});

test("today's focus picks a related check, placed right after the warm-up", () => {
  const claims = syncClaims(undefined, claimed);
  const spec = pickSkillCheck(claims, DEFAULT_EQUIPMENT, "frontLever", new Date("2026-11-14"))!;
  assert.deepEqual({ key: spec.key, kind: spec.kind, target: spec.target }, { key: "frontLever", kind: "hold", target: 5 });
  const session = addSkillCheck(generateSession(claimed, DEFAULT_EQUIPMENT, "frontLever"), spec);
  assert.equal(session.sets[0].title, "Warm-Up");
  assert.equal(session.sets[1].title, "Skill Check");
});

test("equipment you don't have is never checked", () => {
  const claims = syncClaims(undefined, { ...claimed, humanFlag: "full" });
  const spec = pickSkillCheck(claims, { ...DEFAULT_EQUIPMENT, verticalPole: false }, "humanFlag");
  assert.notEqual(spec?.key, "humanFlag");
});

test("hitting a hold target verifies and raises mastery", () => {
  const claims = syncClaims(undefined, claimed);
  const spec = checkSpecFor("frontLever", "full")!;
  const r = applyCheckResults(claims, claimed, { frontLever: 2 }, {}, check(spec, 6));
  assert.equal(r.claims.frontLever?.status, "verified");
  assert.equal(r.mastery.frontLever, 4);
});

test("one miss is 'unconfirmed'; a same-day retry doesn't count; a second day suggests stepping back", () => {
  const spec = checkSpecFor("frontLever", "full")!;
  let r = applyCheckResults(syncClaims(undefined, claimed), claimed, { frontLever: 5 }, {}, check(spec, 3), new Date("2026-11-14T10:00:00Z"));
  assert.equal(r.claims.frontLever?.status, "unconfirmed");
  assert.equal(r.mastery.frontLever, 3); // close (>= 60%): capped at 3
  r = applyCheckResults(r.claims, claimed, r.mastery, {}, check(spec, 2), new Date("2026-11-14T18:00:00Z"));
  assert.equal(r.claims.frontLever?.fails, 1);
  r = applyCheckResults(r.claims, claimed, r.mastery, {}, check(spec, 2), new Date("2026-11-18T10:00:00Z"));
  assert.deepEqual(r.suggestions.map((s) => [s.direction, s.toStage]), [["down", "straddle"]]);
});

test("beating a rep claim raises it; missing twice sets it to the measured best", () => {
  const spec = checkSpecFor("pushUpMaxReps", 10)!;
  const up = applyCheckResults(syncClaims(undefined, claimed), claimed, {}, {}, check(spec, 14));
  assert.equal(up.skills.pushUpMaxReps, 14);
  assert.equal(syncClaims(up.claims, up.skills).pushUpMaxReps?.status, "verified");

  let r = applyCheckResults(syncClaims(undefined, claimed), claimed, {}, {}, check(spec, 6), new Date("2026-11-14T10:00:00Z"));
  r = applyCheckResults(r.claims, r.skills, {}, {}, check(spec, 7), new Date("2026-11-20T10:00:00Z"));
  assert.equal(r.skills.pushUpMaxReps, 7);
});

test("implausible results are rejected, skipped checks rotate away", () => {
  const spec = checkSpecFor("pushUpMaxReps", 10)!;
  const typo = applyCheckResults(syncClaims(undefined, claimed), claimed, {}, {}, check(spec, 400));
  assert.equal(typo.skills.pushUpMaxReps, 10);
  assert.equal(typo.events[0].outcome, "ignored");
  assert.match(validateCheckValue(checkSpecFor("frontLever", "full")!, 90) ?? "", /double-check/);

  const skipped = applyCheckResults(syncClaims(undefined, claimed), claimed, {}, {}, check(spec, undefined, "skipped"), new Date("2026-11-14T10:00:00Z"));
  assert.notEqual(pickSkillCheck(skipped.claims, DEFAULT_EQUIPMENT, "pushStrength", new Date("2026-11-15T10:00:00Z"))?.key, "pushUpMaxReps");
});

test("regular training verifies passively: logged reps and clean holds", () => {
  const claims = syncClaims(undefined, claimed);
  const reps = applyCheckResults(claims, claimed, {}, {}, [
    { name: "Push-ups", setTitle: "Main Focus — Push Strength", outcome: "done", timing: { bestReps: 12, struggled: false, ignored: 0 } },
  ]);
  assert.equal(reps.skills.pushUpMaxReps, 12);
  assert.equal(reps.events[0].outcome, "raised");

  const tuck: SkillProfile = { ...DEFAULT_SKILLS, frontLever: "tuck" };
  const holds = applyCheckResults(syncClaims(undefined, tuck), tuck, {}, {}, [
    { name: "Tuck front lever holds", setTitle: "Main Focus — Front Lever", outcome: "done", timing: { bestHold: 8, struggled: false, ignored: 0 } },
  ]);
  assert.equal(holds.claims.frontLever?.status, "verified");
});

test("regular training never counts against a claim", () => {
  const claims = syncClaims(undefined, claimed);
  const r = applyCheckResults(claims, claimed, {}, {}, [
    { name: "Push-ups", setTitle: "Main Focus — Push Strength", outcome: "done", timing: { bestReps: 4, struggled: true, ignored: 0 } },
  ]);
  assert.equal(r.skills.pushUpMaxReps, 10);
  assert.equal(r.claims.pushUpMaxReps?.status, "claimed");
  assert.equal(claimCounts(r.claims).verified, 0);
});
