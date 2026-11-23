import { NextRequest, NextResponse } from "next/server";
import { verifyCaller } from "@/lib/server/caller";
import { checkAppCheck } from "@/lib/server/appCheck";
import { pushContext, pushToUser } from "@/lib/server/push";
import { RateLimiter } from "@/lib/server/rateLimit";
import { translate } from "@/lib/i18n/tx";
import { pickReminderLine } from "@/lib/reminderMessages";
import { cleanCustomNudge, renderNudge, validNudge, validReply } from "@/lib/nudges";
import type { Locale } from "@/lib/types";

export const runtime = "nodejs";

// A nudge or a train-together invite, delivered as a push notification to a
// friend's devices — even with the app closed. The in-app ping is written by
// the client as before; this only adds the push. The server checks the two
// really are friends (like the security rules do for in-app nudges) and
// writes the text itself, in the recipient's language.

const limiter = new RateLimiter();
const MIN = 60_000;

export async function POST(req: NextRequest) {
  const ctx = pushContext();
  if (!ctx) return NextResponse.json({ configured: false }, { status: 501 });

  const caller = await verifyCaller(req, "push-ping", "Sign in to send nudges.");
  if (caller instanceof NextResponse) return caller;
  const appCheck = await checkAppCheck(req, "push-ping");
  if (appCheck) return appCheck;
  if (caller.anonymous) return NextResponse.json({ error: "Sign in to send nudges." }, { status: 403 });

  let body: { toUid?: string; kind?: string; pairingCode?: string; nudge?: unknown; custom?: unknown; reply?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const toUid = typeof body.toUid === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(body.toUid) ? body.toUid : null;
  const kind = body.kind === "pairing_invite" ? "pairing_invite" : body.kind === "nudge_reply" ? "nudge_reply" : body.kind === "kudos" ? "kudos" : "nudge";
  const reply = validReply(body.reply);
  const code = typeof body.pairingCode === "string" && /^[A-Z0-9]{6}$/.test(body.pairingCode) ? body.pairingCode : null;
  if (!toUid || toUid === caller.uid || (kind === "pairing_invite" && !code) || (kind === "nudge_reply" && !reply)) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  for (const [key, rule] of [
    [`from:${caller.uid}`, { max: 30, windowMs: 60 * MIN }],
    [`pair:${caller.uid}:${toUid}`, { max: 3, windowMs: 10 * MIN }],
  ] as const) {
    const r = limiter.check(key, rule);
    if (!r.ok) return NextResponse.json({ error: "Easy on the nudges — try again in a few minutes." }, { status: 429, headers: { "Retry-After": String(r.retryAfterS) } });
  }

  try {
    // only friends (the recipient's own list has the sender)
    const [friend, recipient, sender] = await Promise.all([
      ctx.fs.get(`users/${toUid}/friends/${caller.uid}`),
      ctx.fs.get(`users/${toUid}`),
      ctx.fs.get(`users/${caller.uid}`),
    ]);
    if (!friend || !recipient) return NextResponse.json({ error: "You can only nudge your friends." }, { status: 403 });
    const locale: Locale = recipient.locale === "it" ? "it" : "en";
    const name = String((sender?.displayName as string | undefined) ?? "A friend").split(" ")[0];
    // the nudge text: a ready-made one (checked, with the real sender's
    // name), your own short message, or a random reminder line
    const nudge = validNudge(body.nudge);
    const custom = cleanCustomNudge(body.custom);
    const nudgeText =
      (nudge && renderNudge(locale, { ...nudge, vars: { ...nudge.vars, sender: name } })) || custom || translate(locale, pickReminderLine());
    const data =
      kind === "pairing_invite"
        ? { title: translate(locale, "{name} wants to train together", { name }), body: translate(locale, "Tap to join the session."), url: `/friends?code=${code}`, tag: "pairing-invite" }
        : kind === "kudos"
        ? { title: translate(locale, "{name} gave you kudos 👏", { name }), body: translate(locale, "For your last session. Keep it going!"), url: "/friends", tag: "kudos" }
        : kind === "nudge_reply"
        ? { title: translate(locale, "{name} replied to your nudge", { name }), body: translate(locale, reply!.text), url: "/friends", tag: "nudge-reply" }
        : { title: translate(locale, "{name} is nudging you", { name }), body: nudgeText, url: "/dashboard", tag: "friend-nudge" };
    const sent = await pushToUser(ctx, toUid, data, recipient);
    return NextResponse.json({ sent });
  } catch (e) {
    console.log("[push-ping] failed", (e as Error).message);
    return NextResponse.json({ error: "Couldn't send that right now — try again." }, { status: 502 });
  }
}
