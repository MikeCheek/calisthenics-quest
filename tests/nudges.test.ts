import { test } from "node:test";
import assert from "node:assert/strict";
import { NUDGES, NUDGE_REPLIES, cleanCustomNudge, isChallengeNudge, nudgeContext, nudgeXpLeft, pickNudge, renderNudge, repliesFor, validNudge, validReply } from "../src/lib/nudges";
import type { NudgeContext } from "../src/lib/nudges";
import type { PublicProfile, UserDoc } from "../src/lib/types";
import { translate } from "../src/lib/i18n/tx";

const WEEK = "2026-W47";
const seq = (...xs: number[]) => {
  let i = 0;
  return () => xs[i++ % xs.length];
};

const base: NudgeContext = {
  sender: "Mike",
  name: "Sara",
  senderWeek: { sessions: 3, xp: 400 },
  friendWeek: { sessions: 1, xp: 150 },
  senderStreak: 4,
  friendStreak: 6,
  friendLevel: 7,
  friendSkill: { skill: "frontLever", stage: "negative" },
};

test("every nudge template has an Italian version", () => {
  const missing = NUDGES.filter((n) => translate("it", n.text) === n.text).map((n) => n.id);
  assert.deepEqual(missing, []);
});

test("the sheet's labels have Italian versions", () => {
  for (const s of ["Friendly", "Cheeky", "Challenge", "Any", "Another one", "Write your own", "wants to train together", "Decline", "Accept"])
    assert.notEqual(translate("it", s), s, s);
});

test("ids are unique", () => {
  assert.equal(new Set(NUDGES.map((n) => n.id)).size, NUDGES.length);
});

test("context uses first names and only this week's numbers", () => {
  const me = { displayName: "Mike Cheek", streak: 3, week: { key: WEEK, sessions: 2, xp: 300 } } as unknown as UserDoc;
  const friend = { uid: "f", displayName: "Sara Rossi", level: 5, streak: 0, week: { key: "2026-W40", sessions: 9, xp: 999 }, skills: {} } as unknown as PublicProfile;
  const c = nudgeContext(me, friend, Math.random, WEEK);
  assert.equal(c.sender, "Mike");
  assert.equal(c.name, "Sara");
  assert.deepEqual(c.senderWeek, { sessions: 2, xp: 300 });
  assert.deepEqual(c.friendWeek, { sessions: 0, xp: 0 }); // an old week doesn't count
  assert.equal(c.friendSkill, undefined);
});

test("templates only appear when they fit", () => {
  const behind: NudgeContext = { ...base, senderWeek: { sessions: 0, xp: 0 }, friendWeek: { sessions: 3, xp: 500 }, friendStreak: 0, friendSkill: undefined };
  for (let i = 0; i < 200; i++) {
    const n = pickNudge(behind);
    assert.ok(!["c-xp-ahead", "c-sessions-score", "f-feed-streak", "f-see-skill", "c-skill-staring", "h-streak-duel"].includes(n.id), n.id);
  }
});

test("a mood gives only that mood, and the avoid-list is respected", () => {
  for (let i = 0; i < 100; i++) {
    const n = pickNudge(base, { mood: "challenge", avoid: ["h-pushups"] });
    assert.equal(NUDGES.find((d) => d.id === n.id)!.mood, "challenge");
    assert.notEqual(n.id, "h-pushups");
  }
});

test("avoiding everything still gives a nudge", () => {
  const n = pickNudge(base, { mood: "friendly", avoid: NUDGES.map((d) => d.id) });
  assert.ok(NUDGES.some((d) => d.id === n.id));
});

test("values are filled in, and every pick renders without leftover braces in both languages", () => {
  for (let i = 0; i < 300; i++) {
    const n = pickNudge(base);
    for (const l of ["en", "it"] as const) {
      const t = renderNudge(l, n)!;
      assert.ok(t && !/[{}]/.test(t), `${n.id} ${l}: ${t}`);
    }
  }
});

test("push-up counts stay in range and round", () => {
  const n = pickNudge(base, { mood: "challenge", avoid: NUDGES.filter((d) => d.id !== "h-pushups").map((d) => d.id) }, seq(0.999));
  assert.equal(n.id, "h-pushups");
  assert.ok((n.vars.count as number) <= 40 && (n.vars.count as number) % 5 === 0);
});

test("rendering in Italian", () => {
  const t = renderNudge("it", { id: "c-xp-ahead", vars: { sender: "Mike", name: "Sara", d: 250 } })!;
  assert.match(t, /Mike/);
  assert.match(t, /250/);
  assert.notEqual(t, renderNudge("en", { id: "c-xp-ahead", vars: { sender: "Mike", name: "Sara", d: 250 } }));
});

test("unknown ids don't render", () => {
  assert.equal(renderNudge("en", { id: "nope", vars: {} }), null);
});

test("validNudge accepts a real one and rejects junk", () => {
  assert.deepEqual(validNudge({ id: "h-pushups", vars: { sender: "Mike", count: 25.4 } }), { id: "h-pushups", vars: { sender: "Mike", count: 25 } });
  assert.equal(validNudge({ id: "made-up", vars: {} }), null);
  assert.equal(validNudge({ id: "h-pushups", vars: { "<b>": 1 } }), null);
  assert.equal(validNudge({ id: "h-pushups", vars: { sender: "x".repeat(41) } }), null);
  assert.equal(validNudge({ id: "h-pushups", vars: { sender: { a: 1 } } }), null);
  assert.equal(validNudge({ id: "h-pushups", vars: Object.fromEntries("abcdefghi".split("").map((k) => [k, 1])) }), null);
  assert.equal(validNudge("h-pushups"), null);
  assert.equal(validNudge(null), null);
  assert.equal(validNudge({ id: "h-pushups", vars: { sender: "Mi\nke" } })!.vars.sender, "Mike");
});

test("own messages are one trimmed line of at most 80 characters", () => {
  assert.equal(cleanCustomNudge("  hey\n\n  get   up  "), "hey get up");
  assert.equal(cleanCustomNudge("x".repeat(120))!.length, 80);
  assert.equal(cleanCustomNudge("   "), null);
  assert.equal(cleanCustomNudge(42), null);
});

test("'Done!' only answers a challenge", () => {
  assert.ok(isChallengeNudge("h-pushups"));
  assert.ok(!isChallengeNudge("c-gravity"));
  assert.ok(repliesFor("h-pushups").some((r) => r.id === "done"));
  assert.ok(!repliesFor("c-gravity").some((r) => r.id === "done"));
  assert.ok(!repliesFor(undefined).some((r) => r.id === "done")); // a message of their own
});

test("replies are checked and translated", () => {
  assert.equal(validReply("on-it")?.id, "on-it");
  assert.equal(validReply("<script>"), null);
  for (const r of NUDGE_REPLIES) assert.notEqual(translate("it", r.text), r.text, r.text);
});

test("the XP for 'Done!' runs out after three a day and comes back the next day", () => {
  assert.equal(nudgeXpLeft(undefined, "2026-11-20"), 3);
  assert.equal(nudgeXpLeft({ day: "2026-11-20", count: 2 }, "2026-11-20"), 1);
  assert.equal(nudgeXpLeft({ day: "2026-11-20", count: 5 }, "2026-11-20"), 0);
  assert.equal(nudgeXpLeft({ day: "2026-11-19", count: 3 }, "2026-11-20"), 3);
});
