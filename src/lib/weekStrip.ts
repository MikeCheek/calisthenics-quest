import type { SessionRecord } from "./types";

// The Today screen's seven-day strip, Monday first (ISO weeks, like the
// missions and leaderboard).
export interface StripDay {
  dateISO: string; // local yyyy-mm-dd
  weekday: number; // 0=Sun..6=Sat, like Date.getDay()
  isToday: boolean;
  isPast: boolean;
  done: boolean; // at least one session finished that day
  planned: boolean; // one of the athlete's training days
}

const localISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function weekStart(now: Date): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // back to Monday
  return d;
}

export function weekStrip(now: Date, sessions: Pick<SessionRecord, "finishedAt">[], plannedDays: number[] = []): StripDay[] {
  const start = weekStart(now);
  const doneDays = new Set(sessions.map((s) => localISO(new Date(s.finishedAt))));
  const todayISO = localISO(now);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const dateISO = localISO(d);
    return {
      dateISO,
      weekday: d.getDay(),
      isToday: dateISO === todayISO,
      isPast: dateISO < todayISO,
      done: doneDays.has(dateISO),
      planned: plannedDays.includes(d.getDay()),
    };
  });
}

export function trainedToday(now: Date, sessions: Pick<SessionRecord, "finishedAt">[]): boolean {
  const t = localISO(now);
  return sessions.some((s) => localISO(new Date(s.finishedAt)) === t);
}
