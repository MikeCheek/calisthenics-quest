import { createPublicKey, createVerify, KeyObject, JsonWebKey } from "node:crypto";

// Verifying a Firebase App Check token (an RS256 JWT) against the published
// JWKS: algorithm, key id, signature, issuer and audience (the project
// number), expiry. Kept free of Next.js imports so it can be tested in Node.

const JWKS_URL = "https://firebaseappcheck.googleapis.com/v1/jwks";

export class AppCheckError extends Error {}

type KeyLookup = (kid: string) => Promise<KeyObject | null>;

const part = (p: string) => JSON.parse(Buffer.from(p, "base64url").toString("utf8")) as Record<string, unknown>;

export async function verifyAppCheckToken(
  token: string,
  opts: { projectNumber: string; projectId?: string; getKey: KeyLookup; nowS?: number }
): Promise<{ appId: string }> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new AppCheckError("malformed token");
  let header: Record<string, unknown>;
  let payload: Record<string, unknown>;
  try {
    header = part(parts[0]);
    payload = part(parts[1]);
  } catch {
    throw new AppCheckError("malformed token");
  }
  if (header.alg !== "RS256" || typeof header.kid !== "string") throw new AppCheckError("unexpected algorithm or key id");
  const key = await opts.getKey(header.kid);
  if (!key) throw new AppCheckError("unknown signing key");
  if (!createVerify("RSA-SHA256").update(`${parts[0]}.${parts[1]}`).verify(key, Buffer.from(parts[2], "base64url"))) {
    throw new AppCheckError("bad signature");
  }
  const now = opts.nowS ?? Math.floor(Date.now() / 1000);
  if (payload.iss !== `https://firebaseappcheck.googleapis.com/${opts.projectNumber}`) throw new AppCheckError("wrong issuer");
  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  const allowed = [`projects/${opts.projectNumber}`, ...(opts.projectId ? [`projects/${opts.projectId}`] : [])];
  if (!aud.some((a) => allowed.includes(String(a)))) throw new AppCheckError("wrong audience");
  if (!(typeof payload.exp === "number" && payload.exp > now - 30)) throw new AppCheckError("expired");
  if (typeof payload.sub !== "string" || !payload.sub) throw new AppCheckError("bad subject");
  return { appId: payload.sub };
}

let cache: { keys: Map<string, KeyObject>; until: number } | null = null;

export const appCheckKeyLookup: KeyLookup = async (kid) => {
  if (!cache || Date.now() > cache.until || !cache.keys.has(kid)) {
    const res = await fetch(JWKS_URL);
    if (!res.ok) throw new AppCheckError("couldn't fetch App Check keys");
    const { keys } = (await res.json()) as { keys: (JsonWebKey & { kid: string })[] };
    cache = { keys: new Map(keys.map((k) => [k.kid, createPublicKey({ key: k, format: "jwk" })])), until: Date.now() + 6 * 3600 * 1000 };
  }
  return cache.keys.get(kid) ?? null;
};

