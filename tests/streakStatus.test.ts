import { test } from "node:test";
import assert from "node:assert/strict";
import { badgeCount, statusIconSvg, streakStatus } from "../src/lib/streakStatus";
import { buzz, PATTERNS } from "../src/lib/haptics";

const sat = new Date(2026, 10, 21, 18); // a Saturday
const user = (o: Partial<{ streak: number; lastSessionDateISO: string; days: number[] }>) =>
  ({ streak: o.streak ?? 0, lastSessionDateISO: o.lastSessionDateISO, body: { trainingDaysOfWeek: o.days ?? [] } }) as never;

test("the status: in session, done today, streak at risk, or nothing", () => {
  assert.equal(streakStatus(user({ streak: 5 }), { inSession: true, now: sat }), "session");
  assert.equal(streakStatus(user({ streak: 5, lastSessionDateISO: new Date(2026, 10, 21, 9).toISOString() }), { inSession: false, now: sat }), "done");
  assert.equal(streakStatus(user({ streak: 5, days: [6] }), { inSession: false, now: sat }), "atRisk");
  assert.equal(streakStatus(user({ streak: 5, days: [1, 3] }), { inSession: false, now: sat }), "idle"); // a rest day
  assert.equal(streakStatus(user({ streak: 0, days: [6] }), { inSession: false, now: sat }), "idle"); // nothing to lose
});

test("the badge shows when there's something to do now", () => {
  assert.equal(badgeCount("session"), 1);
  assert.equal(badgeCount("atRisk"), 1);
  assert.equal(badgeCount("done"), 0);
});

test("the tab icon carries a dot for every status but idle", () => {
  assert.ok(statusIconSvg("atRisk").includes("#f59e0b"));
  assert.ok(!statusIconSvg("idle").includes("<circle"));
});

test("haptics: patterns exist, and a missing vibrate API is harmless", () => {
  assert.ok(PATTERNS.go.length > 1);
  assert.doesNotThrow(() => buzz("rest"));
});
