import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { pushContext, pushToUser } from "@/lib/server/push";
import { reminderDue, ReminderPrefs } from "@/lib/reminderSchedule";
import { translate } from "@/lib/i18n/tx";
import { pickReminderLine } from "@/lib/reminderMessages";
import type { Locale } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Daily training reminders as push notifications, so they arrive even when
// the app hasn't been opened. Called once an hour by a scheduler (a GitHub
// Actions workflow — see .github/workflows/reminders.yml — or Vercel Cron),
// with "Authorization: Bearer <CRON_SECRET>". Each user is reminded at
// their own local reminder hour, once a day, and not if they've trained.

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(req.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

async function run(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ctx = pushContext();
  if (!ctx) return NextResponse.json({ configured: false }, { status: 501 });

  const now = new Date();
  let checked = 0;
  let reminded = 0;
  let delivered = 0;
  try {
    for await (const u of ctx.fs.usersWithReminders()) {
      checked++;
      const user = u.data as { notifications?: ReminderPrefs; lastSessionDateISO?: string; locale?: string; pushTokens?: unknown };
      const { due, localDate } = reminderDue(user, now);
      if (!due || !localDate || !Array.isArray(user.pushTokens) || user.pushTokens.length === 0) continue;
      const locale: Locale = user.locale === "it" ? "it" : "en";
      // marked first, so a retry of this hour can't remind twice
      await ctx.fs.update(`users/${u.id}`, { "notifications.lastPushDate": localDate });
      reminded++;
      delivered += await pushToUser(
        ctx,
        u.id,
        { title: "BarQuests", body: translate(locale, pickReminderLine()), url: "/dashboard", tag: "training-reminder" },
        u.data
      );
    }
  } catch (e) {
    console.log("[push-reminders] failed", (e as Error).message);
    return NextResponse.json({ error: "Reminder run failed.", checked, reminded, delivered }, { status: 502 });
  }
  return NextResponse.json({ checked, reminded, delivered });
}

export const GET = run; // Vercel Cron calls with GET
export const POST = run;
