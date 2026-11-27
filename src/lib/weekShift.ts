import type { SessionRecord } from "./types";
import { weekStart } from "./weekStrip";

// ---------------------------------------------------------------------------
// A skipped training day moves the rest of the week. Worked out from what
// happened this week, so nothing needs saving:
// - miss a planned day → the rest of the week's sessions move one day later
//   (Mon-Wed-Fri, Monday missed → Tue-Thu-Sat);
// - miss the moved day too → that session is dropped for the week and the
//   rest go back to their usual days (→ Wed-Fri, one skipped);
// - training on any day counts for the next session due;
// - a session pushed past Sunday doesn't happen that week.
// "Skip today" (skippedDays) counts today as missed straight away.
// ---------------------------------------------------------------------------

const pos = (jsDay: number) => (jsDay + 6) % 7; // Monday 0 … Sunday 6
const jsDay = (p: number) => (p + 1) % 7;
const localISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export interface WeekPlan {
  days: number[]; // this week's training days, as Date.getDay() (0 = Sunday)
  shifted: boolean; // the rest of the week moved by a day
  skipped: number; // sessions dropped this week by the shifting
  lost: number; // planned sessions that can't happen this week any more (missed, not made up)
  ahead: number[]; // the sessions still to come this week, as Date.getDay()
  todayPlanned: boolean;
}

export function weekPlan(
  baseDays: number[],
  sessions: Pick<SessionRecord, "finishedAt">[],
  now = new Date(),
  skippedDays: string[] = [] // local yyyy-mm-dd days you said you'd skip
): WeekPlan {
  const base = [...new Set(baseDays.map(pos))].sort((a, b) => a - b);
  const start = weekStart(now);
  const today = pos(now.getDay());
  const dayISO = (p: number) => localISO(new Date(start.getFullYear(), start.getMonth(), start.getDate() + p));
  const trained = new Set(sessions.map((s) => localISO(new Date(s.finishedAt))));
  const skippedSet = new Set(skippedDays);

  const done: number[] = []; // days a session was done on
  let next = 0; // the next session due (index into base)
  let shift = 0;
  let skipped = 0;
  for (let p = 0; p <= today && next < base.length; p++) {
    const due = base[next] + shift;
    if (trained.has(dayISO(p))) {
      done.push(p);
      next++;
      continue;
    }
    const missed = p === due && (p < today || skippedSet.has(dayISO(p)));
    if (!missed) continue;
    if (shift === 0) shift = 1; // the rest of the week moves a day
    else {
      next++; // missed the moved day too: that one's gone this week
      skipped++;
      shift = 0;
    }
  }
  // sessions still to come; one pushed past Sunday doesn't happen this week
  const ahead = base.slice(next).map((p) => p + shift).filter((p) => p <= 6 && p >= today);
  const days = [...new Set([...done, ...ahead])].sort((a, b) => a - b);
  return {
    days: days.map(jsDay),
    shifted: shift > 0 && ahead.length > 0,
    skipped,
    lost: Math.max(0, base.length - done.length - ahead.length),
    ahead: ahead.map(jsDay),
    todayPlanned: ahead.includes(today) && !trained.has(dayISO(today)),
  };
}

export const todayISO = (now = new Date()) => localISO(now);
