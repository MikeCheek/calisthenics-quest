import { test } from "node:test";
import assert from "node:assert/strict";
import { ACHIEVEMENTS, isEarned, newlyEarned, stageUps, type AchievementInput } from "../src/lib/achievements";
import { DEFAULT_SKILLS, type UserDoc } from "../src/lib/types";
import { translate } from "../src/lib/i18n/tx";
import { xpForLevel } from "../src/lib/xp";

const base = { totalSessionsCompleted: 0, streak: 0, xp: 0, claims: {}, skills: DEFAULT_SKILLS, records: {}, skillHistory: [], missions: [] } as unknown as AchievementInput & Pick<UserDoc, "achievements">;
const get = (id: string) => ACHIEVEMENTS.find((a) => a.id === id)!;

test("ids are unique and every badge is in Italian", () => {
  assert.equal(new Set(ACHIEVEMENTS.map((a) => a.id)).size, ACHIEVEMENTS.length);
  for (const a of ACHIEVEMENTS) {
    assert.notEqual(translate("it", a.title), a.title, a.title);
    assert.notEqual(translate("it", a.description), a.description, a.description);
  }
});

test("a brand-new athlete has earned nothing", () => {
  assert.deepEqual(newlyEarned(base), []);
});

test("milestones unlock at their threshold, with progress before", () => {
  const u = { ...base, totalSessionsCompleted: 12, streak: 8, xp: xpForLevel(10) }; // weeks
  assert.ok(isEarned(get("sessions-10"), u));
  assert.ok(!isEarned(get("sessions-25"), u));
  assert.deepEqual(get("sessions-25").progress(u), [12, 25]);
  assert.ok(isEarned(get("streak-7"), u));
  assert.ok(isEarned(get("level-10"), u));
  assert.ok(!isEarned(get("level-20"), u));
});

test("already saved ones aren't earned again", () => {
  const u = { ...base, totalSessionsCompleted: 1, achievements: { "sessions-1": "2026-11-01T00:00:00Z" } };
  assert.ok(!newlyEarned(u).includes("sessions-1"));
});

test("stage-ups come from the skill history", () => {
  const h = [
    { at: "2026-09-01T00:00:00Z", skills: { frontLever: "tuck" } },
    { at: "2026-10-01T00:00:00Z", skills: { frontLever: "advancedTuck", lSit: "tuck" } },
    { at: "2026-11-01T00:00:00Z", skills: { frontLever: "oneLeg", lSit: "tuck" } },
  ];
  assert.equal(stageUps({ skillHistory: h as never }), 2 + 1); // two front lever steps, l-sit appearing counts as a step from none
});

test("time-of-day badges use the last session's local time", () => {
  const early = new Date(2026, 10, 20, 6, 15).toISOString();
  const late = new Date(2026, 10, 20, 22, 40).toISOString();
  assert.ok(isEarned(get("early-bird"), { ...base, lastSessionDateISO: early }));
  assert.ok(isEarned(get("night-owl"), { ...base, lastSessionDateISO: late }));
  assert.ok(!isEarned(get("night-owl"), { ...base, lastSessionDateISO: early }));
});
