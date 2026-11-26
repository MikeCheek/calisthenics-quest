import { NextRequest, NextResponse } from "next/server";
import { VerifiedUser } from "./firebaseToken";
import { verifyCaller } from "./caller";
import { checkAppCheck } from "./appCheck";
import { LimitRule, RateLimiter, SharedRateLimiter, limitsStore } from "./rateLimit";

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

// the global cap stays per instance (one shared counter document would be a
// write hotspot); per-account caps are shared across instances (Firestore)
const limiter = new RateLimiter();
const shared = new SharedRateLimiter(limitsStore);

export const AI_ERRORS = {
  signIn: "Sign in to use the AI coach.",
  busy: "The AI coach is busy — try again in a minute.",
  tooMany: "You've asked the AI coach a lot recently — try again in a few minutes.",
  daily: "You've reached today's AI coach limit — it resets within a day.",
  modelBusy: "The AI model is busy right now — try again in a minute.",
  upstream: "The AI coach couldn't answer right now — try again.",
} as const;

/** What to tell the user when OpenRouter fails. Details stay in the server log. */
export function upstreamFailure(status: number) {
  return NextResponse.json({ error: status === 429 ? AI_ERRORS.modelBusy : AI_ERRORS.upstream }, { status: 502 });
}

function tooMany(error: string, retryAfterS: number) {
  return NextResponse.json({ error }, { status: 429, headers: { "Retry-After": String(retryAfterS) } });
}

/** Returns the verified user, or a response to send back instead. */
export async function guardAiRequest(req: NextRequest, route: AiRoute): Promise<VerifiedUser | NextResponse> {
  const caller = await verifyCaller(req, route, AI_ERRORS.signIn);
  if (caller instanceof NextResponse) return caller;
  const user = caller;
  const appCheck = await checkAppCheck(req, route);
  if (appCheck) return appCheck;

  const tier = user.anonymous ? 1 : 0;
  const global = limiter.check("global", GLOBAL);
  if (!global.ok) return tooMany(AI_ERRORS.busy, global.retryAfterS);
  const perRoute = await shared.check(`${route}:${user.uid}`, ROUTE_LIMITS[route][tier]);
  if (!perRoute.ok) return tooMany(AI_ERRORS.tooMany, perRoute.retryAfterS);
  const daily = await shared.check(`day:${user.uid}`, DAILY[tier]);
  if (!daily.ok) return tooMany(AI_ERRORS.daily, daily.retryAfterS);

  return user;
}
