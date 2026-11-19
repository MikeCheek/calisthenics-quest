import { NextRequest, NextResponse } from "next/server";
import { googleKeyLookup, verifyFirebaseIdToken, VerifiedUser } from "./firebaseToken";
import { LimitRule, RateLimiter } from "./rateLimit";

// Shared gate for the AI routes: every call must carry a valid Firebase ID
// token (Authorization: Bearer …), and each account gets a request budget —
// a tighter one for guests, since anyone can create a guest account.

export type AiRoute = "coach-chat" | "exercise-tip" | "plan-coach" | "plan-review";

const MIN = 60_000;
const DAY = 24 * 60 * MIN;

// per account, per route: [signed-in, guest]
const ROUTE_LIMITS: Record<AiRoute, [LimitRule, LimitRule]> = {
  "coach-chat": [{ max: 20, windowMs: 10 * MIN }, { max: 6, windowMs: 10 * MIN }],
  "exercise-tip": [{ max: 30, windowMs: 10 * MIN }, { max: 10, windowMs: 10 * MIN }],
  "plan-coach": [{ max: 10, windowMs: 10 * MIN }, { max: 3, windowMs: 10 * MIN }],
  "plan-review": [{ max: 10, windowMs: 10 * MIN }, { max: 3, windowMs: 10 * MIN }],
};
// per account, all routes together, per day: [signed-in, guest]
const DAILY: [LimitRule, LimitRule] = [{ max: 150, windowMs: DAY }, { max: 30, windowMs: DAY }];
// everyone together, per server instance
const GLOBAL: LimitRule = { max: 300, windowMs: MIN };

const limiter = new RateLimiter();

export const AI_ERRORS = {
  signIn: "Sign in to use the AI coach.",
  busy: "The AI coach is busy — try again in a minute.",
  tooMany: "You've asked the AI coach a lot recently — try again in a few minutes.",
  daily: "You've reached today's AI coach limit — it resets within a day.",
} as const;

function tooMany(error: string, retryAfterS: number) {
  return NextResponse.json({ error }, { status: 429, headers: { "Retry-After": String(retryAfterS) } });
}

/** Returns the verified user, or a response to send back instead. */
export async function guardAiRequest(req: NextRequest, route: AiRoute): Promise<VerifiedUser | NextResponse> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    console.error(`[${route}] NEXT_PUBLIC_FIREBASE_PROJECT_ID missing — can't verify callers`);
    return NextResponse.json({ configured: false, error: "The AI coach isn't configured on this server." }, { status: 501 });
  }

  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return NextResponse.json({ error: AI_ERRORS.signIn }, { status: 401 });

  let user: VerifiedUser;
  try {
    user = await verifyFirebaseIdToken(token, { projectId, getKey: googleKeyLookup });
  } catch (e) {
    console.log(`[${route}] rejected token: ${(e as Error).message}`);
    return NextResponse.json({ error: AI_ERRORS.signIn }, { status: 401 });
  }

  const tier = user.anonymous ? 1 : 0;
  const global = limiter.check("global", GLOBAL);
  if (!global.ok) return tooMany(AI_ERRORS.busy, global.retryAfterS);
  const perRoute = limiter.check(`${route}:${user.uid}`, ROUTE_LIMITS[route][tier]);
  if (!perRoute.ok) return tooMany(AI_ERRORS.tooMany, perRoute.retryAfterS);
  const daily = limiter.check(`day:${user.uid}`, DAILY[tier]);
  if (!daily.ok) return tooMany(AI_ERRORS.daily, daily.retryAfterS);

  return user;
}
