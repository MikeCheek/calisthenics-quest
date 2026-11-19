import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  clearActiveSession,
  isRestorable,
  loadActiveSession,
  loadTimer,
  MAX_AGE_MS,
  saveActiveSession,
  saveGuidedProgress,
  saveTimer,
  secondsLeftOf,
  GuidedProgress,
} from "../src/lib/activeSession";
import type { TrainingSession } from "../src/lib/types";

// a minimal localStorage for node
const mem = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => (mem.has(k) ? mem.get(k)! : null),
  setItem: (k: string, v: string) => void mem.set(k, v),
  removeItem: (k: string) => void mem.delete(k),
  clear: () => mem.clear(),
  key: () => null,
  length: 0,
} as Storage;
beforeEach(() => mem.clear());

const session = (id: string): TrainingSession => ({
  id,
  dateISO: "2026-11-19",
  focusLabel: "Handstand",
  estXp: 100,
  sets: [{ track: "warmup", title: "Warm-up", exercises: [{ name: "Wrist circles", detail: "2 x 10", restSeconds: 15 } as never] }],
});
const guided = (index: number): GuidedProgress => ({
  index,
  completed: [0],
  skipped: [],
  overrides: {},
  tooHard: [],
  timerLogs: {},
  checkResults: {},
  checkVideos: {},
  restEndsAt: null,
  restLeft: null,
});

test("a saved session comes back for the same account, not another", () => {
  saveActiveSession({ uid: "alice", startedAt: 1, session: session("s1"), paused: false });
  assert.equal(loadActiveSession("alice")?.session.id, "s1");
  assert.equal(loadActiveSession("bob"), null);
});

test("sessions older than 12 hours are ignored", () => {
  saveActiveSession({ uid: "alice", startedAt: 1, session: session("s1"), paused: false });
  const saved = loadActiveSession("alice")!;
  assert.equal(isRestorable(saved, "alice", saved.savedAt + MAX_AGE_MS - 1), true);
  assert.equal(isRestorable(saved, "alice", saved.savedAt + MAX_AGE_MS + 1), false);
});

test("guided progress is kept with its own session only", () => {
  saveActiveSession({ uid: "alice", startedAt: 1, session: session("s1"), paused: false });
  saveGuidedProgress("s1", guided(3));
  assert.equal(loadActiveSession("alice")?.guided?.index, 3);
  // re-saving the same session (e.g. on pause) keeps its progress
  saveActiveSession({ uid: "alice", startedAt: 1, session: session("s1"), paused: true });
  assert.equal(loadActiveSession("alice")?.guided?.index, 3);
  // progress for a different session is ignored, and a new session starts clean
  saveGuidedProgress("other", guided(7));
  assert.equal(loadActiveSession("alice")?.guided?.index, 3);
  saveActiveSession({ uid: "alice", startedAt: 2, session: session("s2"), paused: false });
  assert.equal(loadActiveSession("alice")?.guided, undefined);
});

test("finishing or discarding clears the session and its timer", () => {
  saveActiveSession({ uid: "alice", startedAt: 1, session: session("s1"), paused: false });
  saveTimer({ sessionId: "s1", step: 2, set: 2, phase: "rest", endsAt: 5, secondsLeft: null, log: { sets: [], rests: [], workPauses: 0 } });
  clearActiveSession();
  assert.equal(loadActiveSession("alice"), null);
  assert.equal(loadTimer("s1", 2), null);
});

test("a timer is restored only for its own session and step", () => {
  saveTimer({ sessionId: "s1", step: 2, set: 3, phase: "work", endsAt: null, secondsLeft: 12, log: { sets: [], rests: [], workPauses: 0 } });
  assert.equal(loadTimer("s1", 2)?.set, 3);
  assert.equal(loadTimer("s1", 3), null);
  assert.equal(loadTimer("s2", 2), null);
});

test("time left comes from the end time, so time away counts", () => {
  const now = 1_000_000;
  assert.equal(secondsLeftOf(now + 42_000, null, now), 42);
  assert.equal(secondsLeftOf(now + 41_100, null, now), 42); // rounds up, like the display
  assert.equal(secondsLeftOf(now - 5_000, null, now), 0); // ran out while away
  assert.equal(secondsLeftOf(null, 17, now), 17); // paused: frozen
  assert.equal(secondsLeftOf(null, null, now), null);
});
