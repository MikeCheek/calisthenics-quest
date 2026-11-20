import { test } from "node:test";
import assert from "node:assert/strict";
import { EVENT_THEMES, contribution, currentEvent, daysLeftInMonth, monthKey, progress } from "../src/lib/events";
import { translate } from "../src/lib/i18n/tx";
import type { ExerciseRecord, SessionRecord } from "../src/lib/types";

const ex = (name: string, detail: string, extra: Partial<ExerciseRecord> = {}) =>
  ({ name, detail, outcome: "done", setTitle: "Strength", ...extra }) as unknown as ExerciseRecord;
const session = (exercises: ExerciseRecord[], durationMin = 40) => ({ finishedAt: "2026-11-10T18:00:00Z", exercises, durationMin }) as SessionRecord;

test("one theme per month, every one in Italian too", () => {
  assert.equal(EVENT_THEMES.length, 12);
  for (const t of EVENT_THEMES) {
    assert.notEqual(translate("it", t.title), t.title, t.title);
    assert.notEqual(translate("it", t.blurb), t.blurb, t.blurb);
  }
});

test("the event follows the calendar month, in local time", () => {
  const d = new Date(2026, 11, 3); // 3 December
  assert.equal(monthKey(d), "2026-12");
  assert.equal(currentEvent(d).id, "push-dec");
  assert.equal(daysLeftInMonth(new Date(2026, 10, 30)), 0);
  assert.equal(daysLeftInMonth(new Date(2026, 10, 20)), 10);
});

test("the community goal scales with Remote Config, never to zero", () => {
  const d = new Date(2026, 1, 1);
  assert.equal(currentEvent(d, 2).communityGoal, 20000);
  assert.equal(currentEvent(d, 0.00001).communityGoal, 1);
});

test("push-up month counts every push-up variation and nothing else", () => {
  const push = currentEvent(new Date(2026, 1, 1));
  const s = [
    session([ex("Push-ups", "3 x 10"), ex("Pike push-ups", "2 x 8"), ex("Pull-ups", "3 x 5"), ex("Wrist circles", "2 x 10", { setTitle: "Warm-up" })]),
    session([ex("Diamond push-ups", "3 x 6", { outcome: "skipped" } as Partial<ExerciseRecord>)]),
  ];
  assert.equal(contribution(push, s), 30 + 16);
});

test("session and minute months count sessions and time", () => {
  const s = [session([], 30), session([], 45)];
  assert.equal(contribution(currentEvent(new Date(2026, 5, 1)), s), 2);
  assert.equal(contribution(currentEvent(new Date(2026, 7, 1)), s), 75);
});

test("progress stays between 0 and 1", () => {
  assert.equal(progress(50, 100), 0.5);
  assert.equal(progress(500, 100), 1);
  assert.equal(progress(5, 0), 0);
});
