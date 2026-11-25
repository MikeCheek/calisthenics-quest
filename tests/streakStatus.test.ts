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
  const lastWeek = new Date(2026, 10, 12, 9).toISOString(); // Thursday of the week before
  const earlierThisWeek = new Date(2026, 10, 17, 9).toISOString(); // Tuesday
  assert.equal(streakStatus(user({ streak: 5, lastSessionDateISO: lastWeek, days: [6] }), { inSession: false, now: sat }), "atRisk"); // Saturday is the week's last planned day
  assert.equal(streakStatus(user({ streak: 5, lastSessionDateISO: lastWeek, days: [6, 0] }), { inSession: false, now: sat }), "idle"); // Sunday still to come
  assert.equal(streakStatus(user({ streak: 5, lastSessionDateISO: lastWeek, days: [1, 3] }), { inSession: false, now: sat }), "atRisk"); // planned days gone, week nearly over
  assert.equal(streakStatus(user({ streak: 5, lastSessionDateISO: earlierThisWeek, days: [6] }), { inSession: false, now: sat }), "idle"); // this week already counts
  assert.equal(streakStatus(user({ streak: 0, lastSessionDateISO: lastWeek, days: [6] }), { inSession: false, now: sat }), "idle"); // nothing to lose
  assert.equal(streakStatus(user({ streak: 5, lastSessionDateISO: new Date(2026, 10, 2).toISOString(), days: [6] }), { inSession: false, now: sat }), "idle"); // already lost
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
