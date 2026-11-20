import { NextRequest, NextResponse } from "next/server";
import { appCheckKeyLookup, verifyAppCheckToken } from "./appCheckToken";

// ---------------------------------------------------------------------------
// Firebase App Check for the app's own server routes. The client sends its
// App Check token in "X-Firebase-AppCheck" (apiClient.ts); it's an RS256 JWT
// signed by Firebase, checked against the published JWKS: algorithm, key
// id, signature, issuer and audience (the project number), expiry.
//
// APP_CHECK_MODE: "off" (default) — not checked; "monitor" — checked and
// logged, never refused (turn this on first and watch the logs); "enforce"
// — requests without a valid token are refused.
// ---------------------------------------------------------------------------

export type AppCheckMode = "off" | "monitor" | "enforce";

export function appCheckMode(env: Record<string, string | undefined> = process.env): AppCheckMode {
  const m = (env.APP_CHECK_MODE ?? "").toLowerCase();
  return m === "monitor" || m === "enforce" ? m : "off";
}

// null = carry on; a response = refuse (only in "enforce" mode).
export async function checkAppCheck(req: NextRequest, tag: string): Promise<NextResponse | null> {
  const mode = appCheckMode();
  if (mode === "off") return null;
  const projectNumber = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID; // the project number
  const token = req.headers.get("x-firebase-appcheck");
  let problem: string | null = null;
  if (!projectNumber) problem = "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID missing";
  else if (!token) problem = "no App Check token";
  else {
    try {
      await verifyAppCheckToken(token, { projectNumber, projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, getKey: appCheckKeyLookup });
    } catch (e) {
      problem = (e as Error).message;
    }
  }
  if (!problem) return null;
  console.log(`[${tag}] App Check ${mode === "enforce" ? "refused" : "would refuse"}: ${problem}`);
  return mode === "enforce" ? NextResponse.json({ error: "This request didn't come from the app — reload it and try again." }, { status: 401 }) : null;
}
