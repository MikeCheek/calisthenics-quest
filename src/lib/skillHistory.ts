import type { SkillProfile, StagedSkillKey } from "./types";

// ---------------------------------------------------------------------------
// Your skill stages over time, for "then vs now" (compare.ts). A dated
// snapshot is added whenever the stages change — not every session — so
// the list stays short; only started skills are kept in each snapshot.
// ---------------------------------------------------------------------------

export interface SkillSnapshot {
  at: string; // ISO time of the change
  skills: Partial<Record<StagedSkillKey, string>>;
}

export const SKILL_HISTORY_MAX = 120;

const started = (skills: SkillProfile | Partial<Record<StagedSkillKey, string>>) =>
  Object.fromEntries(Object.entries(skills).filter(([, v]) => v && v !== "none")) as Partial<Record<StagedSkillKey, string>>;

const same = (a: Partial<Record<string, string>>, b: Partial<Record<string, string>>) => {
  const ka = Object.keys(a);
  return ka.length === Object.keys(b).length && ka.every((k) => a[k] === b[k]);
};

// The history to save with new skills, or nothing when they didn't change.
// The first save (onboarding) is the baseline everything is compared to.
export function nextSkillHistory(
  prev: { skills?: SkillProfile; skillHistory?: SkillSnapshot[] },
  next: SkillProfile,
  at: string = new Date().toISOString()
): SkillSnapshot[] | undefined {
  const history = prev.skillHistory ?? [];
  const now = started(next);
  if (history.length && same(history[history.length - 1].skills, now)) return undefined;
  if (!history.length && prev.skills && same(started(prev.skills), now) && Object.keys(now).length === 0) return undefined;
  return [...history, { at, skills: now }].slice(-SKILL_HISTORY_MAX);
}

// The patch to spread into a user-document update
export const skillHistoryPatch = (prev: { skills?: SkillProfile; skillHistory?: SkillSnapshot[] }, next: SkillProfile, at?: string) => {
  const h = nextSkillHistory(prev, next, at);
  return h ? { skillHistory: h } : {};
};

// The stages as they were at a moment, from the history (undefined if it
// doesn't reach back that far).
export function skillsAt(history: SkillSnapshot[] | undefined, when: string): Partial<Record<StagedSkillKey, string>> | undefined {
  if (!history?.length || history[0].at > when) return undefined;
  let last = history[0];
  for (const s of history) {
    if (s.at <= when) last = s;
    else break;
  }
  return last.skills;
}
