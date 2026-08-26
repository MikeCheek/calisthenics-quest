import { Mission } from "./types";

export function currentWeekKey(d: Date = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export function generateWeeklyMissions(weekKey: string): Mission[] {
  return [
    {
      id: `${weekKey}-sessions3`,
      label: "Three Sessions",
      description: "Complete 3 training sessions this week",
      targetCount: 3,
      progress: 0,
      xpReward: 60,
      kind: "sessionsThisWeek",
      weekKey,
      completed: false,
    },
    {
      id: `${weekKey}-streak3`,
      label: "Keep the Streak",
      description: "Train 3 days in a row",
      targetCount: 3,
      progress: 0,
      xpReward: 40,
      kind: "streak",
      weekKey,
      completed: false,
    },
    {
      id: `${weekKey}-pair1`,
      label: "Train Together",
      description: "Complete one paired session with a friend",
      targetCount: 1,
      progress: 0,
      xpReward: 50,
      kind: "pairing",
      weekKey,
      completed: false,
    },
    {
      id: `${weekKey}-skillfocus2`,
      label: "Skill Grinder",
      description: "Complete 2 sessions focused on the same skill",
      targetCount: 2,
      progress: 0,
      xpReward: 45,
      kind: "skillFocus",
      weekKey,
      completed: false,
    },
  ];
}

export function ensureCurrentWeekMissions(missions: Mission[]): Mission[] {
  const wk = currentWeekKey();
  const hasCurrent = missions.some((m) => m.weekKey === wk);
  if (hasCurrent) return missions;
  return [...generateWeeklyMissions(wk), ...missions.filter((m) => m.completed).slice(-8)];
}

export function bumpMissions(
  missions: Mission[],
  events: { sessionCompleted?: boolean; isPaired?: boolean; streak?: number; repeatedFocus?: boolean }
): { missions: Mission[]; xpFromMissions: number } {
  const wk = currentWeekKey();
  let xpFromMissions = 0;
  const updated = missions.map((m) => {
    if (m.weekKey !== wk || m.completed) return m;
    let progress = m.progress;
    if (m.kind === "sessionsThisWeek" && events.sessionCompleted) progress += 1;
    if (m.kind === "pairing" && events.sessionCompleted && events.isPaired) progress += 1;
    if (m.kind === "skillFocus" && events.sessionCompleted && events.repeatedFocus) progress += 1;
    if (m.kind === "streak" && events.streak !== undefined) progress = Math.max(progress, events.streak);
    const completed = progress >= m.targetCount;
    if (completed && !m.completed) xpFromMissions += m.xpReward;
    return { ...m, progress: Math.min(progress, m.targetCount), completed };
  });
  return { missions: updated, xpFromMissions };
}
