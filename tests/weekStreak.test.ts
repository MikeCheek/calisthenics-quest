import { test } from "node:test";
import assert from "node:assert/strict";
import { nextStreak, shownStreak, streakFromSessions, trainedThisWeek, weekOf, weeksBetween } from "../src/lib/weekStreak";

const d = (day: number, h = 10) => new Date(2026, 10, day, h); // November 2026; the 23rd is a Monday
const iso = (day: number) => d(day).toISOString();

test("weeks start on Monday", () => {
  assert.equal(weekOf(d(29)).getDate(), 23); // Sunday → its Monday
  assert.equal(weekOf(d(23)).getDate(), 23);
  assert.equal(weeksBetween(d(22), d(23)), 1); // Sunday to Monday is a new week
  assert.equal(weeksBetween(d(23), d(29)), 0);
});

test("once a week keeps it going; a whole week off resets it", () => {
  assert.deepEqual(nextStreak({ streak: 0 }, d(23)), { streak: 1, event: "started" });
  assert.deepEqual(nextStreak({ streak: 4, lastSessionDateISO: iso(24) }, d(27)), { streak: 4, event: "none" }); // same week
  assert.deepEqual(nextStreak({ streak: 4, lastSessionDateISO: iso(16) }, d(27)), { streak: 5, event: "increased" }); // the week before
  assert.deepEqual(nextStreak({ streak: 4, lastSessionDateISO: iso(9) }, d(27)), { streak: 1, event: "restarted" }); // a week skipped
});

test("the streak shown is lost once a whole week passes", () => {
  assert.equal(shownStreak({ streak: 6, lastSessionDateISO: iso(18) }, d(27)), 6); // last week: still alive
  assert.equal(shownStreak({ streak: 6, lastSessionDateISO: iso(11) }, d(27)), 0);
  assert.equal(trainedThisWeek({ lastSessionDateISO: iso(23) }, d(29)), true);
  assert.equal(trainedThisWeek({ lastSessionDateISO: iso(22) }, d(23)), false);
});

test("a day streak converts to weeks from the history", () => {
  assert.equal(streakFromSessions([iso(2), iso(10), iso(11), iso(17), iso(24)], d(25)), 4);
  assert.equal(streakFromSessions([iso(2), iso(10), iso(17)], d(25)), 3); // nothing this week yet: counts back from last week
  assert.equal(streakFromSessions([iso(2), iso(17)], d(25)), 1); // a gap
  assert.equal(streakFromSessions([iso(2)], d(25)), 0);
  assert.equal(streakFromSessions([], d(25)), 0);
});
