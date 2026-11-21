// ---------------------------------------------------------------------------
// Bodyweight over time (userDoc.weightLog): one entry a day at most, the
// last 400 kept. Bodyweight exercises measure strength for your weight, so
// "Then vs now" can also show the absolute change when the weight moved.
// ---------------------------------------------------------------------------

export interface WeightEntry {
  date: string; // YYYY-MM-DD, local
  kg: number;
}

export const WEIGHT_LOG_MAX = 400;
export const MIN_KG = 30;
export const MAX_KG = 250;

export const localDate = (d: Date = new Date()) => d.toLocaleDateString("en-CA");

export const validKg = (kg: number) => Number.isFinite(kg) && kg >= MIN_KG && kg <= MAX_KG;

// today's entry replaces an earlier one from the same day
export function logWeight(log: WeightEntry[] | undefined, kg: number, date = localDate()): WeightEntry[] {
  if (!validKg(kg)) return log ?? [];
  const rounded = Math.round(kg * 10) / 10;
  return [...(log ?? []).filter((e) => e.date !== date), { date, kg: rounded }].sort((a, b) => a.date.localeCompare(b.date)).slice(-WEIGHT_LOG_MAX);
}

// the weight on a date: the last entry on or before it, else the earliest
// one after (closest known), else the profile's weight
export function weightAt(log: WeightEntry[] | undefined, fallback: number | undefined, isoOrDate: string): number | undefined {
  const day = isoOrDate.slice(0, 10);
  const sorted = [...(log ?? [])].sort((a, b) => a.date.localeCompare(b.date));
  let found: WeightEntry | undefined;
  for (const e of sorted) if (e.date <= day) found = e;
  return found?.kg ?? sorted[0]?.kg ?? fallback;
}

// change over the last N days (kg), when there are entries to compare
export function weightChange(log: WeightEntry[] | undefined, days = 30, now = new Date()): number | null {
  const sorted = [...(log ?? [])].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length < 2) return null;
  const latest = sorted[sorted.length - 1];
  const since = localDate(new Date(now.getTime() - days * 86400000));
  const before = sorted.filter((e) => e.date <= since).pop() ?? sorted[0];
  if (before === latest) return null;
  return Math.round((latest.kg - before.kg) * 10) / 10;
}

// a strength change for your weight, turned into an absolute one
export function absoluteChange(relativePct: number, kgThen: number, kgNow: number): number {
  return Math.round(((1 + relativePct / 100) * (kgNow / kgThen) - 1) * 100);
}
