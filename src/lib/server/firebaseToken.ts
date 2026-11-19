import { createPublicKey, createVerify, KeyObject } from "node:crypto";

// ---------------------------------------------------------------------------
// Verifies a Firebase Authentication ID token without the Admin SDK (and so
// without a service-account secret): the token is an RS256 JWT signed by
// Google, whose public certificates are published. Implements the checks
// Firebase documents for verifying ID tokens with a third-party library:
// algorithm, key id, signature, audience, issuer, expiry, issue time,
// auth time and subject.
// ---------------------------------------------------------------------------

const CERTS_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
const CLOCK_SKEW_S = 60;

export interface VerifiedUser {
  uid: string;
  anonymous: boolean; // a guest (anonymous sign-in)
}

export class TokenError extends Error {}

type KeyLookup = (kid: string) => Promise<KeyObject | null>;

function b64urlJson(part: string): Record<string, unknown> {
  return JSON.parse(Buffer.from(part, "base64url").toString("utf8"));
}

export async function verifyFirebaseIdToken(
  token: string,
  opts: { projectId: string; getKey: KeyLookup; nowS?: number }
): Promise<VerifiedUser> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new TokenError("malformed token");
  const [h, p, sig] = parts;
  let header: Record<string, unknown>;
  let payload: Record<string, unknown>;
  try {
    header = b64urlJson(h);
    payload = b64urlJson(p);
  } catch {
    throw new TokenError("malformed token");
  }
  if (header.alg !== "RS256" || typeof header.kid !== "string") throw new TokenError("unexpected algorithm or key id");

  const key = await opts.getKey(header.kid);
  if (!key) throw new TokenError("unknown signing key");
  const valid = createVerify("RSA-SHA256").update(`${h}.${p}`).verify(key, Buffer.from(sig, "base64url"));
  if (!valid) throw new TokenError("bad signature");

  const now = opts.nowS ?? Math.floor(Date.now() / 1000);
  const num = (v: unknown) => (typeof v === "number" ? v : NaN);
  if (payload.aud !== opts.projectId) throw new TokenError("wrong audience");
  if (payload.iss !== `https://securetoken.google.com/${opts.projectId}`) throw new TokenError("wrong issuer");
  if (!(num(payload.exp) > now - CLOCK_SKEW_S)) throw new TokenError("expired");
  if (!(num(payload.iat) <= now + CLOCK_SKEW_S)) throw new TokenError("issued in the future");
  if (!(num(payload.auth_time) <= now + CLOCK_SKEW_S)) throw new TokenError("bad auth time");
  if (typeof payload.sub !== "string" || !payload.sub || payload.sub.length > 128) throw new TokenError("bad subject");

  const provider = (payload.firebase as { sign_in_provider?: string } | undefined)?.sign_in_provider;
  return { uid: payload.sub, anonymous: provider === "anonymous" };
}

// ---- Google's signing certificates, cached as long as Google allows ----
let cache: { keys: Map<string, KeyObject>; until: number } | null = null;

export const googleKeyLookup: KeyLookup = async (kid) => {
  if (!cache || Date.now() > cache.until || !cache.keys.has(kid)) {
    const res = await fetch(CERTS_URL);
    if (!res.ok) throw new TokenError("couldn't fetch signing keys");
    const certs = (await res.json()) as Record<string, string>;
    const maxAge = Number(res.headers.get("cache-control")?.match(/max-age=(\d+)/)?.[1] ?? 3600);
    const keys = new Map<string, KeyObject>();
    for (const [id, pem] of Object.entries(certs)) keys.set(id, createPublicKey(pem));
    cache = { keys, until: Date.now() + maxAge * 1000 };
  }
  return cache.keys.get(kid) ?? null;
};
