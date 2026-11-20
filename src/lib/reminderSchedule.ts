// ---------------------------------------------------------------------------
// Who gets a daily reminder push right now. The server checks every user with
// reminders on once an hour (see api/push/reminders); a reminder is due when
//   - it's their reminder hour, in their own time zone,
//   - they haven't trained today (their local today), and
//   - they haven't already been reminded today.
// ---------------------------------------------------------------------------

export interface ReminderPrefs {
  enabled?: boolean;
  time?: string; // "HH:MM", local
  tz?: string; // IANA, e.g. "Europe/Rome"
  lastPushDate?: string; // local yyyy-mm-dd of the last reminder push
}

export function localParts(now: Date, tz: string): { date: string; hour: number } | null {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23",
    }).formatToParts(now);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    return { date: `${get("year")}-${get("month")}-${get("day")}`, hour: parseInt(get("hour"), 10) };
  } catch {
    return null; // unknown time zone
  }
}

export function reminderDue(
  user: { notifications?: ReminderPrefs; lastSessionDateISO?: string },
  now: Date = new Date()
): { due: boolean; localDate?: string } {
  const n = user.notifications;
  if (!n?.enabled || !n.time || !n.tz) return { due: false };
  const here = localParts(now, n.tz);
  if (!here) return { due: false };
  const hour = parseInt(n.time.split(":")[0], 10);
  if (!Number.isFinite(hour) || hour !== here.hour) return { due: false, localDate: here.date };
  if (n.lastPushDate === here.date) return { due: false, localDate: here.date };
  const trained = user.lastSessionDateISO ? localParts(new Date(user.lastSessionDateISO), n.tz)?.date === here.date : false;
  return { due: !trained, localDate: here.date };
}
