import { createSign } from "node:crypto";

// ---------------------------------------------------------------------------
// Google API access from the app's own server routes, with a Firebase
// service account (env FIREBASE_SERVICE_ACCOUNT: the JSON key file's
// contents). No Admin SDK: a signed JWT is exchanged for an access token
// (OAuth 2.0 JWT bearer flow), cached until shortly before it expires.
// Used for sending push messages (FCM) and reading the few Firestore fields
// that needs (recipients' push tokens), with the service account's access.
// ---------------------------------------------------------------------------

export interface ServiceAccount {
  project_id: string;
  client_email: string;
  private_key: string;
}

const SCOPES = ["https://www.googleapis.com/auth/firebase.messaging", "https://www.googleapis.com/auth/datastore"];
const TOKEN_URL = "https://oauth2.googleapis.com/token";

export function serviceAccount(env: Record<string, string | undefined> = process.env): ServiceAccount | null {
  const raw = env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  try {
    const sa = JSON.parse(raw) as ServiceAccount;
    if (!sa.project_id || !sa.client_email || !sa.private_key) return null;
    // keys pasted into an env var often arrive with literal "\n"
    return { ...sa, private_key: sa.private_key.replace(/\\n/g, "\n") };
  } catch {
    return null;
  }
}

const b64url = (v: string | Buffer) => Buffer.from(v).toString("base64url");

export function signedAssertion(sa: ServiceAccount, nowS = Math.floor(Date.now() / 1000)): string {
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(JSON.stringify({ iss: sa.client_email, scope: SCOPES.join(" "), aud: TOKEN_URL, iat: nowS, exp: nowS + 3600 }));
  const sig = createSign("RSA-SHA256").update(`${header}.${claims}`).sign(sa.private_key).toString("base64url");
  return `${header}.${claims}.${sig}`;
}

let cached: { token: string; until: number; email: string } | null = null;

export async function accessToken(sa: ServiceAccount, fetchImpl: typeof fetch = fetch): Promise<string> {
  if (cached && cached.email === sa.client_email && Date.now() < cached.until) return cached.token;
  const res = await fetchImpl(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: signedAssertion(sa) }).toString(),
  });
  if (!res.ok) throw new Error(`token exchange failed (${res.status})`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cached = { token: data.access_token, until: Date.now() + (data.expires_in - 120) * 1000, email: sa.client_email };
  return data.access_token;
}
