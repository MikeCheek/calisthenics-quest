// ---------------------------------------------------------------------------
// Values that can be tuned from Firebase Remote Config without a release:
// XP rules, effort thresholds, and two feature switches. Every value has a
// safe default and an allowed range — anything missing, mistyped or out of
// range in the console is ignored and the default kept, so a typo can't
// break the app. Parameter names in the console are the snake_case names
// in REMOTE_PARAMS (and in remoteconfig.template.json).
// ---------------------------------------------------------------------------

export interface Tuning {
  xpSession: number;
  xpPerEffort: number;
  xpVerified: number;
  xpRecord: number;
  xpStageUp: number;
  easeUpEarly: number; // "I'm tired" cut before 35% through
  easeUpMid: number; // …before 70%
  easeUpLate: number; // …after
  fatigueFullUntil: number; // feedback counts fully up to this far through
  fatigueFloorFrom: number; // …and is at its minimum from here
  fatigueFloor: number; // the minimum weight
  balanceHeadroom: number; // sessions may exceed recent capacity by this factor
  tiredSessionsNeeded: number; // times you ran out before sessions get balanced
  xpNudgeDone: number; // XP for completing a friend's challenge nudge
  eventGoalScale: number; // multiplies the monthly community goals (events.ts)
  featureGlobalBoard: boolean;
  featureAiCoach: boolean;
  featureEvents: boolean;
}

export const TUNING_DEFAULTS: Tuning = {
  xpSession: 15,
  xpPerEffort: 4,
  xpVerified: 40,
  xpRecord: 10,
  xpStageUp: 75,
  easeUpEarly: 0.5,
  easeUpMid: 0.35,
  easeUpLate: 0.2,
  fatigueFullUntil: 0.4,
  fatigueFloorFrom: 0.85,
  fatigueFloor: 0.35,
  balanceHeadroom: 1.1,
  tiredSessionsNeeded: 2,
  xpNudgeDone: 10,
  eventGoalScale: 1,
  featureGlobalBoard: true,
  featureAiCoach: true,
  featureEvents: true,
};

type NumKey = { [K in keyof Tuning]: Tuning[K] extends number ? K : never }[keyof Tuning];

// [Remote Config parameter, allowed range] — integers where it matters
export const REMOTE_PARAMS: Record<keyof Tuning, { param: string; range?: [number, number]; integer?: boolean }> = {
  xpSession: { param: "xp_session", range: [0, 200], integer: true },
  xpPerEffort: { param: "xp_per_effort", range: [0, 50] },
  xpVerified: { param: "xp_verified", range: [0, 500], integer: true },
  xpRecord: { param: "xp_record", range: [0, 200], integer: true },
  xpStageUp: { param: "xp_stage_up", range: [0, 1000], integer: true },
  easeUpEarly: { param: "ease_up_early", range: [0.05, 0.8] },
  easeUpMid: { param: "ease_up_mid", range: [0.05, 0.8] },
  easeUpLate: { param: "ease_up_late", range: [0.05, 0.8] },
  fatigueFullUntil: { param: "fatigue_full_until", range: [0, 0.95] },
  fatigueFloorFrom: { param: "fatigue_floor_from", range: [0.05, 1] },
  fatigueFloor: { param: "fatigue_floor", range: [0, 1] },
  balanceHeadroom: { param: "balance_headroom", range: [1, 2] },
  tiredSessionsNeeded: { param: "tired_sessions_needed", range: [1, 6], integer: true },
  xpNudgeDone: { param: "xp_nudge_done", range: [0, 50], integer: true },
  eventGoalScale: { param: "event_goal_scale", range: [0.01, 1000] },
  featureGlobalBoard: { param: "feature_global_board" },
  featureAiCoach: { param: "feature_ai_coach" },
  featureEvents: { param: "feature_events" },
};

let current: Tuning = { ...TUNING_DEFAULTS };
const listeners = new Set<() => void>();

export function tuning(): Tuning {
  return current;
}

export function onTuningChange(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

// Applies Remote Config values (as strings, the way the SDK hands them out).
// Returns the keys that were rejected, for logging.
export function applyTuning(raw: Record<string, string | undefined>): string[] {
  const next: Tuning = { ...TUNING_DEFAULTS };
  const rejected: string[] = [];
  for (const key of Object.keys(REMOTE_PARAMS) as (keyof Tuning)[]) {
    const spec = REMOTE_PARAMS[key];
    const value = raw[spec.param];
    if (value === undefined || value === "") continue;
    if (typeof TUNING_DEFAULTS[key] === "boolean") {
      if (value === "true" || value === "false") (next as unknown as Record<string, unknown>)[key] = value === "true";
      else rejected.push(spec.param);
      continue;
    }
    const n = Number(value);
    const [lo, hi] = spec.range!;
    if (!Number.isFinite(n) || n < lo || n > hi || (spec.integer && !Number.isInteger(n))) {
      rejected.push(spec.param);
      continue;
    }
    next[key as NumKey] = n;
  }
  // the three "I'm tired" cuts must go down as the session goes on, and the
  // fatigue curve must start before it ends — otherwise keep the defaults
  if (!(next.easeUpEarly >= next.easeUpMid && next.easeUpMid >= next.easeUpLate)) {
    next.easeUpEarly = TUNING_DEFAULTS.easeUpEarly;
    next.easeUpMid = TUNING_DEFAULTS.easeUpMid;
    next.easeUpLate = TUNING_DEFAULTS.easeUpLate;
    rejected.push("ease_up_* (order)");
  }
  if (!(next.fatigueFullUntil < next.fatigueFloorFrom)) {
    next.fatigueFullUntil = TUNING_DEFAULTS.fatigueFullUntil;
    next.fatigueFloorFrom = TUNING_DEFAULTS.fatigueFloorFrom;
    rejected.push("fatigue_* (order)");
  }
  current = next;
  listeners.forEach((cb) => cb());
  return rejected;
}

export function resetTuning() {
  current = { ...TUNING_DEFAULTS };
  listeners.forEach((cb) => cb());
}
