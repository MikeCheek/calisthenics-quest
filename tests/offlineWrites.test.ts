import { test } from "node:test";
import assert from "node:assert/strict";
import { clearQueuedWrites, hadQueuedWrites, settleWrite } from "../src/lib/offlineWrites";

const setOnline = (online: boolean) =>
  Object.defineProperty(globalThis, "navigator", { value: { onLine: online }, configurable: true });

test("online: waits for the server", async () => {
  setOnline(true);
  clearQueuedWrites();
  assert.equal(await settleWrite(Promise.resolve()), "saved");
  assert.equal(hadQueuedWrites(), false);
});

test("offline: doesn't wait — the write is queued on the device", async () => {
  setOnline(false);
  clearQueuedWrites();
  const never = new Promise<void>(() => {});
  const t0 = Date.now();
  assert.equal(await settleWrite(never), "queued");
  assert.ok(Date.now() - t0 < 50);
  assert.equal(hadQueuedWrites(), true);
});

test("a slow connection: stops waiting after a while, counts as queued", async () => {
  setOnline(true);
  clearQueuedWrites();
  assert.equal(await settleWrite(new Promise<void>(() => {}), 30), "queued");
  assert.equal(hadQueuedWrites(), true);
});

test("a refused write still fails", async () => {
  setOnline(true);
  await assert.rejects(settleWrite(Promise.reject(new Error("permission-denied"))));
});
