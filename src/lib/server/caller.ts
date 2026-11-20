import { NextRequest, NextResponse } from "next/server";
import { googleKeyLookup, verifyFirebaseIdToken, VerifiedUser } from "./firebaseToken";

// Who's calling a server route: the Firebase ID token in
// "Authorization: Bearer …", verified against Google's public keys.
export async function verifyCaller(req: NextRequest, tag: string, signInError: string): Promise<VerifiedUser | NextResponse> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    console.error(`[${tag}] NEXT_PUBLIC_FIREBASE_PROJECT_ID missing — can't verify callers`);
    return NextResponse.json({ configured: false, error: "This isn't configured on this server." }, { status: 501 });
  }
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return NextResponse.json({ error: signInError }, { status: 401 });
  try {
    return await verifyFirebaseIdToken(token, { projectId, getKey: googleKeyLookup });
  } catch (e) {
    console.log(`[${tag}] rejected token: ${(e as Error).message}`);
    return NextResponse.json({ error: signInError }, { status: 401 });
  }
}
