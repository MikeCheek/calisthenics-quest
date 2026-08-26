// XP curve: level N requires N^2 * 40 total xp (roughly).
export function levelFromXp(xp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(xp / 40)) + 1);
}

export function xpForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 40;
}

export function xpProgress(xp: number): { level: number; into: number; span: number; pct: number } {
  const level = levelFromXp(xp);
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  const span = ceil - floor;
  const into = xp - floor;
  return { level, into, span, pct: Math.min(100, Math.round((into / span) * 100)) };
}

export const RANK_TITLES: { min: number; title: string }[] = [
  { min: 1, title: "Bar Rookie" },
  { min: 5, title: "Park Regular" },
  { min: 10, title: "Bar Athlete" },
  { min: 16, title: "Skill Chaser" },
  { min: 24, title: "Iron Disciplined" },
  { min: 34, title: "Lever Adept" },
  { min: 46, title: "Planche Contender" },
  { min: 60, title: "Park Veteran" },
  { min: 80, title: "Bar Master" },
];

export function rankTitle(level: number): string {
  let title = RANK_TITLES[0].title;
  for (const r of RANK_TITLES) {
    if (level >= r.min) title = r.title;
  }
  return title;
}
