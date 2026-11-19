import { test } from "node:test";
import assert from "node:assert/strict";
import { summaryLines } from "../src/lib/sessionSummary";
import { translate } from "../src/lib/i18n/tx";
import { SKILL_DESCRIPTIONS } from "../src/lib/skillDescriptions";
import { SKILL_DESCRIPTIONS_IT } from "../src/lib/skillDescriptions.it";
import type { StreakEvent } from "../src/lib/sessionComplete";

const c = (leveledUp: boolean, streakEvent: StreakEvent) => ({ leveledUp, newLevel: 15, streakEvent, newStreak: 12 });

test("a level-up leads the summary, with the streak underneath", () => {
  const l = summaryLines(c(true, "increased"), 120);
  assert.deepEqual(l.headline, { text: "Level {n}!", vars: { n: 15 } });
  assert.deepEqual(l.detail, { text: "Streak up — {n} days in a row", vars: { n: 12 } });
  assert.deepEqual(l.xp, { text: "+{n} XP", vars: { n: 120 } });
});

test("without a level-up the streak is the headline; with neither, a plain one", () => {
  assert.equal(summaryLines(c(false, "unfrozen"), 50).headline.text, "Streak unfrozen — {n} days, rest days don't break it");
  assert.equal(summaryLines(c(false, "none"), 50).headline.text, "Session complete");
  assert.equal(summaryLines(c(false, "none"), 50).detail, null);
});

test("every summary line has an Italian version", () => {
  const events: StreakEvent[] = ["none", "started", "increased", "unfrozen", "restarted"];
  for (const up of [true, false])
    for (const e of events) {
      const l = summaryLines(c(up, e), 10);
      for (const line of [l.headline, l.detail].filter(Boolean)) {
        assert.notEqual(translate("it", line!.text), line!.text, line!.text);
      }
    }
});

test("every skill description has an Italian version", () => {
  for (const k of Object.keys(SKILL_DESCRIPTIONS) as (keyof typeof SKILL_DESCRIPTIONS)[]) {
    assert.ok(SKILL_DESCRIPTIONS_IT[k]?.length > 40, k);
    assert.notEqual(SKILL_DESCRIPTIONS_IT[k], SKILL_DESCRIPTIONS[k], k);
  }
});
