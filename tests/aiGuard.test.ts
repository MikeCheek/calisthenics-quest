import { test } from "node:test";
import assert from "node:assert/strict";
import { createSign, generateKeyPairSync, KeyObject } from "node:crypto";
import { TokenError, verifyFirebaseIdToken } from "../src/lib/server/firebaseToken";
import { RateLimiter } from "../src/lib/server/rateLimit";
import { translate } from "../src/lib/i18n/tx";

const PROJECT = "barquests-test";
const NOW = 1_800_000_000;
const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const other = generateKeyPairSync("rsa", { modulusLength: 2048 });

const keys: Record<string, KeyObject> = { k1: publicKey };
const getKey = async (kid: string) => keys[kid] ?? null;

function b64(o: object) {
  return Buffer.from(JSON.stringify(o)).toString("base64url");
}

function makeToken(
  claims: Record<string, unknown> = {},
  header: Record<string, unknown> = {},
  key: KeyObject = privateKey
): string {
  const h = b64({ alg: "RS256", kid: "k1", typ: "JWT", ...header });
  const p = b64({
    aud: PROJECT,
    iss: `https://securetoken.google.com/${PROJECT}`,
    sub: "user-123",
    iat: NOW - 100,
    auth_time: NOW - 1000,
    exp: NOW + 3000,
    firebase: { sign_in_provider: "google.com" },
    ...claims,
  });
  const sig = createSign("RSA-SHA256").update(`${h}.${p}`).sign(key).toString("base64url");
  return `${h}.${p}.${sig}`;
}

const verify = (t: string) => verifyFirebaseIdToken(t, { projectId: PROJECT, getKey, nowS: NOW });

test("a valid Google-account token verifies", async () => {
  assert.deepEqual(await verify(makeToken()), { uid: "user-123", anonymous: false });
});

test("guest (anonymous) tokens are recognised", async () => {
  const u = await verify(makeToken({ firebase: { sign_in_provider: "anonymous" } }));
  assert.equal(u.anonymous, true);
});

test("tokens are rejected for every documented failure", async () => {
  const bad: [string, string][] = [
    ["garbage", "not.a.jwt.at-all"],
    ["wrong key", makeToken({}, {}, other.privateKey)],
    ["unknown kid", makeToken({}, { kid: "nope" })],
    ["alg none", makeToken({}, { alg: "none" })],
    ["HS256", makeToken({}, { alg: "HS256" })],
    ["other project", makeToken({ aud: "someone-else" })],
    ["wrong issuer", makeToken({ iss: "https://evil.example/barquests-test" })],
    ["expired", makeToken({ exp: NOW - 3600 })],
    ["issued in future", makeToken({ iat: NOW + 3600 })],
    ["auth in future", makeToken({ auth_time: NOW + 3600 })],
    ["no subject", makeToken({ sub: "" })],
    ["long subject", makeToken({ sub: "x".repeat(129) })],
  ];
  for (const [name, t] of bad) {
    await assert.rejects(verify(t), TokenError, name);
  }
});

test("tampering with the payload breaks the signature", async () => {
  const [h, , s] = makeToken().split(".");
  const forged = `${h}.${b64({ aud: PROJECT, iss: `https://securetoken.google.com/${PROJECT}`, sub: "admin", iat: NOW, auth_time: NOW, exp: NOW + 99 })}.${s}`;
  await assert.rejects(verify(forged), TokenError);
});

test("rate limiter allows up to max per window, then reports when to retry", () => {
  const rl = new RateLimiter();
  const rule = { max: 3, windowMs: 60_000 };
  const t0 = 1_000_000;
  for (const dt of [0, 20_000, 40_000]) assert.equal(rl.check("u", rule, t0 + dt).ok, true);
  const denied = rl.check("u", rule, t0 + 50_000);
  assert.equal(denied.ok, false);
  assert.equal(denied.retryAfterS, 10); // the oldest hit leaves the window at t0 + 60s
  // other keys are independent
  assert.equal(rl.check("v", rule, t0 + 50_000).ok, true);
  // the window slides: once the oldest hit expires, exactly one more is allowed
  assert.equal(rl.check("u", rule, t0 + 60_001).ok, true);
  assert.equal(rl.check("u", rule, t0 + 60_002).ok, false);
});

test("denied requests don't extend the wait", () => {
  const rl = new RateLimiter();
  const rule = { max: 1, windowMs: 10_000 };
  rl.check("u", rule, 0);
  for (let t = 1000; t < 10_000; t += 1000) assert.equal(rl.check("u", rule, t).ok, false);
  assert.equal(rl.check("u", rule, 10_001).ok, true);
});

test("the AI guard's error messages have Italian versions", () => {
  // read the strings without importing next/server into the test build
  for (const s of [
    "Sign in to use the AI coach.",
    "The AI coach is busy — try again in a minute.",
    "You've asked the AI coach a lot recently — try again in a few minutes.",
    "You've reached today's AI coach limit — it resets within a day.",
  ]) {
    assert.notEqual(translate("it", s), s, s);
  }
});
