import { test } from "node:test";
import assert from "node:assert/strict";
import { createSign, createVerify, generateKeyPairSync, KeyObject } from "node:crypto";
import { serviceAccount, signedAssertion } from "../src/lib/server/googleAuth";
import { decodeFields, encodeValue, FirestoreRest } from "../src/lib/server/firestoreRest";
import { pushToUser, sendToToken } from "../src/lib/server/push";
import { localParts, reminderDue } from "../src/lib/reminderSchedule";
import { AppCheckError, verifyAppCheckToken } from "../src/lib/server/appCheckToken";

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const pem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
const SA = { project_id: "demo-proj", client_email: "push@demo-proj.iam.gserviceaccount.com", private_key: pem };

test("service account: read from env (with escaped newlines) and sign a valid assertion", () => {
  const env = { FIREBASE_SERVICE_ACCOUNT: JSON.stringify({ ...SA, private_key: pem.replace(/\n/g, "\\n") }) };
  const sa = serviceAccount(env)!;
  assert.equal(sa.private_key, pem);
  assert.equal(serviceAccount({}), null);
  assert.equal(serviceAccount({ FIREBASE_SERVICE_ACCOUNT: "{not json" }), null);
  const [h, p, s] = signedAssertion(sa, 1000).split(".");
  assert.ok(createVerify("RSA-SHA256").update(`${h}.${p}`).verify(publicKey, Buffer.from(s, "base64url")));
  const claims = JSON.parse(Buffer.from(p, "base64url").toString());
  assert.equal(claims.iss, SA.client_email);
  assert.equal(claims.exp, 4600);
  assert.match(claims.scope, /firebase\.messaging/);
});

test("Firestore values round-trip", () => {
  const data = { a: "x", n: 3, f: 1.5, b: true, list: ["t1", "t2"], map: { enabled: true, time: "18:00" }, none: null };
  const enc = encodeValue(data) as { mapValue: { fields: Record<string, never> } };
  assert.deepEqual(decodeFields(enc.mapValue.fields), data);
});

// a fake network: records requests, answers from a handler
function fakeFetch(handler: (url: string, init: RequestInit) => { status: number; body: unknown }) {
  const calls: { url: string; init: RequestInit }[] = [];
  const f = (async (url: string, init: RequestInit = {}) => {
    calls.push({ url, init });
    if (url.includes("oauth2.googleapis.com")) return new Response(JSON.stringify({ access_token: "tok", expires_in: 3600 }), { status: 200 });
    const r = handler(url, init);
    return new Response(typeof r.body === "string" ? r.body : JSON.stringify(r.body), { status: r.status });
  }) as unknown as typeof fetch;
  return { f, calls };
}

test("FCM: a data-only web push; an unregistered token is reported gone", async () => {
  const ok = fakeFetch(() => ({ status: 200, body: { name: "m1" } }));
  assert.equal(await sendToToken(SA, "good", { title: "T", body: "B", url: "/dashboard", tag: "x" }, ok.f), "sent");
  const sent = JSON.parse(String(ok.calls.find((c) => c.url.includes("fcm"))!.init.body));
  assert.deepEqual(sent.message.webpush.data, { title: "T", body: "B", url: "/dashboard", tag: "x" });
  assert.equal(sent.message.notification, undefined); // shown by our service worker
  const gone = fakeFetch(() => ({ status: 404, body: { error: { status: "NOT_FOUND", details: [{ errorCode: "UNREGISTERED" }] } } }));
  assert.equal(await sendToToken(SA, "old", { title: "T", body: "B", url: "/", tag: "x" }, gone.f), "gone");
  const broken = fakeFetch(() => ({ status: 500, body: "oops" }));
  assert.equal(await sendToToken(SA, "t", { title: "T", body: "B", url: "/", tag: "x" }, broken.f), "failed");
});

test("pushing to a user sends to each device and forgets tokens that are gone", async () => {
  const net = fakeFetch((url, init) => {
    if (url.includes("fcm")) return JSON.parse(String(init.body)).message.token === "dead" ? { status: 404, body: "UNREGISTERED" } : { status: 200, body: {} };
    if (init.method === "PATCH") return { status: 200, body: {} };
    return { status: 404, body: {} };
  });
  const fs = new FirestoreRest(SA.project_id, async () => "tok", net.f);
  const n = await pushToUser({ sa: SA, fs, fetchImpl: net.f }, "u1", { title: "T", body: "B", url: "/", tag: "x" }, { pushTokens: ["a", "dead", "b"] });
  assert.equal(n, 2);
  const patch = net.calls.find((c) => c.init.method === "PATCH")!;
  assert.match(patch.url, /users\/u1\?updateMask\.fieldPaths=pushTokens/);
  assert.deepEqual(decodeFields(JSON.parse(String(patch.init.body)).fields).pushTokens, ["a", "b"]);
});

test("Firestore update writes only the given (dotted) fields", async () => {
  const net = fakeFetch(() => ({ status: 200, body: {} }));
  await new FirestoreRest("p", async () => "tok", net.f).update("users/u1", { "notifications.lastPushDate": "2026-11-20" });
  assert.match(net.calls[0].url, /updateMask\.fieldPaths=notifications\.lastPushDate/);
  assert.deepEqual(decodeFields(JSON.parse(String(net.calls[0].init.body)).fields), { notifications: { lastPushDate: "2026-11-20" } });
});

test("reminders: at the user's own local hour, once a day, not after training", () => {
  // 17:30 UTC = 18:30 in Rome (winter, UTC+1)
  const now = new Date("2026-11-20T17:30:00Z");
  assert.deepEqual(localParts(now, "Europe/Rome"), { date: "2026-11-20", hour: 18 });
  const base = { notifications: { enabled: true, time: "18:00", tz: "Europe/Rome" } };
  assert.equal(reminderDue(base, now).due, true);
  assert.equal(reminderDue({ notifications: { ...base.notifications, time: "19:00" } }, now).due, false);
  assert.equal(reminderDue({ notifications: { ...base.notifications, tz: "America/New_York" } }, now).due, false); // 12:30 there
  assert.equal(reminderDue({ notifications: { ...base.notifications, lastPushDate: "2026-11-20" } }, now).due, false);
  assert.equal(reminderDue({ ...base, lastSessionDateISO: "2026-11-20T07:00:00Z" }, now).due, false); // trained this morning
  assert.equal(reminderDue({ ...base, lastSessionDateISO: "2026-11-19T22:30:00Z" }, now).due, true); // 23:30 yesterday, Rome time
  assert.equal(reminderDue({ notifications: { ...base.notifications, enabled: false } }, now).due, false);
  assert.equal(reminderDue({ notifications: { ...base.notifications, tz: "Not/AZone" } }, now).due, false);
  assert.equal(reminderDue({ notifications: { enabled: true, time: "18:00" } }, now).due, false); // no time zone yet
});

// ---- App Check ----
const ac = generateKeyPairSync("rsa", { modulusLength: 2048 });
const other = generateKeyPairSync("rsa", { modulusLength: 2048 });
const keys: Record<string, KeyObject> = { k1: ac.publicKey };
const NOW = 1_800_000_000;
function appCheckToken(claims: Record<string, unknown> = {}, header: Record<string, unknown> = {}, key: KeyObject = ac.privateKey) {
  const b = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const h = b({ alg: "RS256", typ: "JWT", kid: "k1", ...header });
  const p = b({ iss: "https://firebaseappcheck.googleapis.com/123456", aud: ["projects/123456", "projects/demo-proj"], sub: "1:123456:web:abc", exp: NOW + 3600, iat: NOW, ...claims });
  return `${h}.${p}.${createSign("RSA-SHA256").update(`${h}.${p}`).sign(key).toString("base64url")}`;
}
const verifyAc = (t: string) => verifyAppCheckToken(t, { projectNumber: "123456", projectId: "demo-proj", getKey: async (kid) => keys[kid] ?? null, nowS: NOW });

test("App Check: a valid token passes, everything else is refused", async () => {
  assert.deepEqual(await verifyAc(appCheckToken()), { appId: "1:123456:web:abc" });
  for (const [name, t] of [
    ["garbage", "a.b"],
    ["wrong key", appCheckToken({}, {}, other.privateKey)],
    ["unknown kid", appCheckToken({}, { kid: "zz" })],
    ["alg none", appCheckToken({}, { alg: "none" })],
    ["other project", appCheckToken({ iss: "https://firebaseappcheck.googleapis.com/999" })],
    ["wrong audience", appCheckToken({ aud: ["projects/999"] })],
    ["expired", appCheckToken({ exp: NOW - 3600 })],
    ["no subject", appCheckToken({ sub: "" })],
  ] as const) {
    await assert.rejects(verifyAc(t), AppCheckError, name);
  }
});
