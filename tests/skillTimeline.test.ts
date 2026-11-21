import { test } from "node:test";
import assert from "node:assert/strict";
import { etaLabel, pointsToNextStage, sessionPoints, skillPace, skillTimeline } from "../src/lib/skillTimeline";
import { DEFAULT_SKILLS, type SessionRecord, type SkillProfile } from "../src/lib/types";

const skills = { ...DEFAULT_SKILLS, frontLever: "tuck" } as SkillProfile;
const now = new Date("2026-11-21T12:00:00Z");
const day = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();
const session = (d: number, outcome = "done", name = "Tuck front lever holds") =>
  ({ finishedAt: day(d), exercises: [{ name, detail: "4 x 10s", setTitle: "Main Focus", outcome }] }) as unknown as SessionRecord;

test("session points follow the app's own rules", () => {
  assert.equal(sessionPoints(skills, session(1)).frontLever, 1); // your own stage, done
  assert.equal(sessionPoints(skills, session(1, "done", "Advanced tuck holds")).frontLever, 2); // above it
  assert.equal(sessionPoints(skills, session(1, "tooHard")).frontLever, -2);
  const warm = { finishedAt: day(1), exercises: [{ name: "Tuck front lever holds", setTitle: "Warm-Up", outcome: "done" }] } as unknown as SessionRecord;
  assert.deepEqual(sessionPoints(skills, warm), {});
});

test("pace counts only the last six weeks", () => {
  const p = skillPace(skills, [session(3), session(10), session(60)], now);
  assert.equal(p.frontLever, 2 / 6);
});

test("points to the next stage shrink with mastery and score", () => {
  assert.ok(pointsToNextStage(2) > pointsToNextStage(4));
  assert.ok(pointsToNextStage(4, { score: 3 }) < pointsToNextStage(4));
  assert.equal(pointsToNextStage(5, { score: 6 }), 0);
});

test("a skill trained regularly gets an estimate; the stage after takes longer", () => {
  const sessions = Array.from({ length: 12 }, (_, i) => session(1 + i * 3));
  const t = skillTimeline({ skills, skillMastery: { frontLever: 3 }, skillProgress: {} }, sessions, now);
  const fl = t.find((r) => r.skill === "frontLever")!;
  assert.equal(fl.next[0].stage, "advancedTuck");
  assert.ok(fl.next[0].weeks > 0 && fl.next[1].weeks > fl.next[0].weeks * 2);
  assert.ok(fl.next[0].low < fl.next[0].weeks && fl.next[0].high > fl.next[0].weeks);
});

test("no estimate for skills going backwards or not trained", () => {
  const t = skillTimeline({ skills, skillMastery: {}, skillProgress: {} }, [session(2, "tooHard"), session(4, "tooHard")], now);
  assert.equal(t.length, 0);
});

test("labels read naturally", () => {
  assert.deepEqual(etaLabel({ low: 2.1, high: 4.2 }), { key: "{a}–{b} weeks", vars: { a: 2, b: 4 } });
  assert.deepEqual(etaLabel({ low: 0.2, high: 0.8 }), { key: "this week or next", vars: {} });
  assert.deepEqual(etaLabel({ low: 12, high: 22 }), { key: "{a}–{b} months", vars: { a: 3, b: 5 } });
  assert.deepEqual(etaLabel({ low: 40, high: 80 }), { key: "over a year", vars: {} });
});
