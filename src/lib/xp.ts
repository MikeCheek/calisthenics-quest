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

export const RANK_TITLES: { min: number; title: string; blurb: string }[] = [
  { min: 1, title: "Bar Rookie", blurb: "Get comfortable hanging, pushing, and pulling your own bodyweight." },
  { min: 5, title: "Park Regular", blurb: "Basic control is showing up — balance, bracing, first holds." },
  { min: 10, title: "Bar Athlete", blurb: "Real pulling and pushing strength starts stacking up." },
  { min: 16, title: "Skill Chaser", blurb: "Tucked levers, wall handstands — the fun stuff begins." },
  { min: 24, title: "Iron Disciplined", blurb: "Consistency pays off: tension, control, and patience skills." },
  { min: 34, title: "Lever Adept", blurb: "Straddles and strict strength — the intermediate grind." },
  { min: 46, title: "Planche Contender", blurb: "One-arm work and flashy dynamic moves enter the picture." },
  { min: 60, title: "Park Veteran", blurb: "Full levers, full planche — the skills people stop and watch." },
  { min: 80, title: "Bar Master", blurb: "Apex territory. Keep training — there's always another skill." },
];

export function rankTitle(level: number): string {
  let title = RANK_TITLES[0].title;
  for (const r of RANK_TITLES) {
    if (level >= r.min) title = r.title;
  }
  return title;
}

export function rankBlurb(level: number): string {
  let blurb = RANK_TITLES[0].blurb;
  for (const r of RANK_TITLES) {
    if (level >= r.min) blurb = r.blurb;
  }
  return blurb;
}
