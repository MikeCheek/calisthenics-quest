import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type * as real from "../src/lib/store";
import * as demo from "../src/lib/demoMode/store";
import { DEMO_UID, demoSessions, demoUserDoc } from "../src/lib/demoMode/fixture";

// Compile-time: the demo store must be usable wherever the real one is.
const _sameShape: typeof real = demo;
void _sameShape;

test("demo store exports everything the real store does", () => {
  // read from the source: importing the real store would start Firebase
  const src = readFileSync(join(process.cwd(), "src/lib/store.ts"), "utf8");
  const names = [...src.matchAll(/^export (?:async function|function|const) (\w+)/gm)].map((m) => m[1]);
  assert.ok(names.length >= 20, `found ${names.length}`);
  const missing = names.filter((k) => !(k in demo));
  assert.deepEqual(missing, []);
});

test("demo mode can't switch on in a production build", () => {
  const flag = readFileSync(join(process.cwd(), "src/lib/demoMode/flag.ts"), "utf8");
  assert.match(flag, /process\.env\.NODE_ENV === "development"/);
  const config = readFileSync(join(process.cwd(), "next.config.mjs"), "utf8");
  assert.match(config, /if \(DEMO && dev\)/);
});

test("the example athlete is complete and consistent", async () => {
  const u = demoUserDoc();
  assert.equal(u.uid, DEMO_UID);
  assert.equal(u.onboarded, true);
  assert.ok(u.level > 1 && u.missions.length > 0 && u.xpHistory.length > 0);
  const s = demoSessions();
  assert.ok(s.length >= 10);
  assert.ok(s.every((r) => r.exercises.length > 0 && r.focusLabel));
  // the in-memory store serves and updates it
  const fetched = await demo.fetchUserDoc(DEMO_UID);
  assert.equal(fetched?.displayName, u.displayName);
  await demo.updateProgress(DEMO_UID, { streak: 10 });
  assert.equal((await demo.fetchUserDoc(DEMO_UID))?.streak, 10);
  const recent = await demo.fetchSessionsBetween(DEMO_UID, new Date(Date.now() - 7 * 86400000).toISOString(), new Date().toISOString());
  assert.ok(recent.length > 0 && recent.every((r, i) => i === 0 || recent[i - 1].finishedAt >= r.finishedAt));
});

test("only the demo store imports the example data", () => {
  const { execSync } = require("node:child_process") as typeof import("node:child_process");
  const hits = execSync('grep -rlE "demoMode/(fixture|store)|from \\"\\./fixture\\"" src || true', { encoding: "utf8" })
    .split("\n")
    .filter(Boolean)
    .sort();
  assert.deepEqual(hits, ["src/lib/demoMode/store.ts"]);
});
