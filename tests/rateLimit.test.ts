import { test } from "node:test";
import assert from "node:assert/strict";
import { SharedRateLimiter, counterId } from "../src/lib/server/rateLimit";
import { FirestoreRest } from "../src/lib/server/firestoreRest";

// A fake Firestore commit endpoint: one counter per document, like the real one.
function fakeFirestore() {
  const counts = new Map<string, number>();
  const calls: string[] = [];
  const fetchImpl = (async (url: string, init?: RequestInit) => {
    assert.match(String(url), /:commit$/);
    const body = JSON.parse(String(init!.body));
    const w = body.writes[0];
    assert.equal(w.updateTransforms[0].fieldPath, "n");
    const n = (counts.get(w.update.name) ?? 0) + Number(w.updateTransforms[0].increment.integerValue);
    counts.set(w.update.name, n);
    calls.push(w.update.name);
    return new Response(JSON.stringify({ writeResults: [{ transformResults: [{ integerValue: String(n) }] }] }), { status: 200 });
  }) as typeof fetch;
  return { fs: new FirestoreRest("p", async () => "t", fetchImpl), counts, calls };
}

test("two server instances share one count", async () => {
  const { fs } = fakeFirestore();
  const a = new SharedRateLimiter(() => fs);
  const b = new SharedRateLimiter(() => fs);
  const rule = { max: 3, windowMs: 60_000 };
  const now = 1_000_000_020_000;
  assert.equal((await a.check("coach:u1", rule, now)).ok, true);
  assert.equal((await b.check("coach:u1", rule, now)).ok, true);
  assert.equal((await a.check("coach:u1", rule, now)).ok, true);
  // the fourth, on the other instance: refused, with time until the window ends
  const r = await b.check("coach:u1", rule, now);
  assert.equal(r.ok, false);
  assert.ok(r.retryAfterS > 0 && r.retryAfterS <= 60);
  // other users aren't affected; a new window starts fresh
  assert.equal((await b.check("coach:u2", rule, now)).ok, true);
  assert.equal((await b.check("coach:u1", rule, now + 60_000)).ok, true);
});

test("Firestore unreachable: the in-memory limit still applies", async () => {
  const broken = new FirestoreRest("p", async () => "t", (async () => new Response("no", { status: 503 })) as typeof fetch);
  const l = new SharedRateLimiter(() => broken);
  const rule = { max: 2, windowMs: 60_000 };
  assert.equal((await l.check("k", rule)).ok, true);
  assert.equal((await l.check("k", rule)).ok, true);
  assert.equal((await l.check("k", rule)).ok, false);
});

test("no credentials: in memory only, no requests", async () => {
  const l = new SharedRateLimiter(() => null);
  assert.equal((await l.check("k", { max: 1, windowMs: 1000 })).ok, true);
  assert.equal((await l.check("k", { max: 1, windowMs: 1000 })).ok, false);
});

test("counter ids are safe document ids", () => {
  assert.equal(counterId("osm:1.2.3.4", 60000), "osm_1_2_3_4_60000");
  assert.ok(!counterId("a/b/c".repeat(100), 1).includes("/"));
});
