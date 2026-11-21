import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { clearProfileCache, readProfileCache, writeProfileCache } from "../src/lib/profileCache";
import type { UserDoc } from "../src/lib/types";

// a tiny in-memory localStorage for node
const store = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
  key: () => null,
  length: 0,
};

const user = { uid: "u1", isAnonymous: false, displayName: "Alex", email: "a@example.com", photoURL: null };
const doc = { uid: "u1", displayName: "Alex", xp: 500, pushTokens: ["secret-token"] } as unknown as UserDoc;

beforeEach(() => store.clear());

test("the profile kept on the device comes back as it was", () => {
  writeProfileCache(user, doc);
  const c = readProfileCache()!;
  assert.equal(c.user.uid, "u1");
  assert.equal(c.doc.xp, 500);
});

test("push tokens aren't kept on the device", () => {
  writeProfileCache(user, doc);
  assert.ok(!store.get("barquests:profile-cache")!.includes("secret-token"));
});

test("signing out clears it", () => {
  writeProfileCache(user, doc);
  clearProfileCache();
  assert.equal(readProfileCache(), null);
});

test("an old copy, a mismatched one or a broken one isn't used", () => {
  writeProfileCache(user, doc);
  assert.equal(readProfileCache(Date.now() + 31 * 86400000), null);
  writeProfileCache({ ...user, uid: "someone-else" }, doc);
  assert.equal(readProfileCache(), null);
  store.set("barquests:profile-cache", "{not json");
  assert.equal(readProfileCache(), null);
});
