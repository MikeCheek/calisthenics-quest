import {
  AdvancedSkill,
  BaselineClaimKey,
  CheckSpec,
  ClaimKey,
  Exercise,
  ExerciseFeedback,
  SkillClaim,
  SkillMastery,
  SkillProfile,
  SkillProgress,
  SkillTrack,
  StagedSkillKey,
  TrainingEquipment,
  TrainingSession,
  DEFAULT_MASTERY,
  SKILL_FIELD_LABEL,
} from "./types";
import { STAGE_ORDER, STAGE_LABEL } from "./stageOrder";
import { advancedSkillAvailable } from "./advancedSkills";
import type { StageSuggestion } from "./adaptation";
import { exerciseStage } from "./exerciseHierarchy";

// ---------------------------------------------------------------------------
// Claims and verification.
//
// Everything the athlete *says* — "I can do 10 push-ups", "I hold a full
// front lever for 5s" — is stored as a claim. A claim stays unverified until
// a "Skill Check" exercise in a regular session proves it: hold the target
// time (measured by the timer) or hit the target reps. Results:
//   - hit the target           -> verified (and mastery is at least "Consistent")
//   - beat a rep claim         -> verified at the higher number
//   - miss once                -> "unconfirmed", mastery capped, retested later
//   - miss on two separate days-> step-down suggested / rep baseline set to
//                                 what was actually measured
// Implausible numbers (typos, a forgotten timer) are rejected, not applied,
// and a single bad day can never downgrade anything by itself.
// ---------------------------------------------------------------------------

export const BASELINE_KEYS: BaselineClaimKey[] = ["pullUpMaxReps", "pushUpMaxReps", "dipMaxReps"];

const BASELINE_LABEL: Record<BaselineClaimKey, string> = {
  pullUpMaxReps: "Max strict pull-ups",
  pushUpMaxReps: "Max push-ups",
  dipMaxReps: "Max dips",
};

export function claimLabel(key: ClaimKey): string {
  return (BASELINE_LABEL as Record<string, string>)[key] ?? SKILL_FIELD_LABEL[key as StagedSkillKey];
}

function isBaseline(key: ClaimKey): key is BaselineClaimKey {
  return (BASELINE_KEYS as string[]).includes(key);
}

// Hold targets mirror the wording the assessment used ("Tuck, 5s+" etc.),
// so a check tests exactly what was claimed.
const HOLD_SEC: Partial<Record<StagedSkillKey, Record<string, number>>> = {
  frontLever: { tuck: 5, advancedTuck: 5, oneLeg: 5, straddle: 5, full: 5 },
  backLever: { tuck: 5, advancedTuck: 5, oneLeg: 5, straddle: 5, full: 5 },
  planche: { tuck: 5, advancedTuck: 5, straddle: 5, full: 5 },
  humanFlag: { tuck: 3, advancedTuck: 3, straddle: 3, full: 3 },
  lSit: { tuck: 10, advanced: 10, full: 10 },
  handstand: { wall: 20, freestanding: 10 },
  oneArmHandstand: { wall: 5, freestandingAttempts: 2, full: 5 },
  elbowLever: { tuck: 10, straddle: 5, full: 5 },
  ironCross: { support: 10, tuckCross: 3, full: 3 },
  maltese: { tuck: 3, straddle: 3, full: 3 },
  manna: { vSit: 5, straddle: 3, full: 3 },
};

const REPS: Partial<Record<StagedSkillKey, Record<string, number>>> = {
  muscleUp: { single: 1, multiple: 3 },
  pistolSquat: { assisted: 3, full: 1 },
  handstandPushUp: { wallFull: 1, freestanding: 1 },
  dragonFlag: { tuck: 1, straddle: 1, full: 1 },
  oneArmPullUp: { full: 1 },
  oneArmPushUp: { full: 1 },
  nordicCurl: { full: 1 },
  shrimpSquat: { full: 1 },
  impossibleDip: { full: 1 },
};

// Skills whose in-between stages are full progressions (their own claims);
// for the generic 3/4-stage side skills, "developing"/"assisted" just means
// "working on it" — nothing to verify yet.
const LADDER_STAGED = new Set<string>([
  "frontLever", "backLever", "planche", "muscleUp", "handstand", "humanFlag", "pistolSquat", "lSit",
  "ironCross", "maltese", "oneArmPullUp", "oneArmHandstand", "dragonFlag", "elbowLever", "oneArmPushUp",
  "nordicCurl", "shrimpSquat", "handstandPushUp", "impossibleDip", "manna",
]);

export function checkSpecFor(key: ClaimKey, value: string | number): CheckSpec | null {
  if (isBaseline(key)) {
    const n = Number(value);
    return n > 0 ? { key, kind: "reps", target: n, label: BASELINE_LABEL[key] } : null;
  }
  const stage = String(value);
  if (stage === "none") return null;
  const label = stage === "full" ? SKILL_FIELD_LABEL[key] : `${STAGE_LABEL[stage] ?? stage} ${SKILL_FIELD_LABEL[key]}`;
  const hold = HOLD_SEC[key]?.[stage];
  if (hold) return { key, kind: "hold", target: hold, label };
  const reps = REPS[key]?.[stage];
  if (reps) return { key, kind: "reps", target: reps, label };
  if (stage === "full" || LADDER_STAGED.has(key)) return { key, kind: "pass", target: 1, label };
  return null;
}

function checkEquipmentOk(key: ClaimKey, eq: TrainingEquipment): boolean {
  switch (key) {
    case "pullUpMaxReps":
    case "frontLever":
    case "backLever":
    case "muscleUp":
      return eq.pullUpBar || eq.rings;
    case "dipMaxReps":
      return eq.parallelBars || eq.rings;
    case "humanFlag":
      return eq.verticalPole;
    case "pushUpMaxReps":
    case "planche":
    case "handstand":
    case "pistolSquat":
    case "lSit":
      return true;
    default:
      return advancedSkillAvailable(key as AdvancedSkill, eq);
  }
}

// Brings the stored claims in line with the current profile: a changed
// stage or rep number is a new, unverified claim; a skill set back to
// "none" (or something with nothing to verify) drops its claim.
export function syncClaims(
  claims: Partial<Record<ClaimKey, SkillClaim>> | undefined,
  skills: SkillProfile,
  nowISO: string = new Date().toISOString()
): Partial<Record<ClaimKey, SkillClaim>> {
  const out: Partial<Record<ClaimKey, SkillClaim>> = {};
  const rec = skills as unknown as Record<string, string | number | undefined>;
  const keys: ClaimKey[] = [...(Object.keys(STAGE_ORDER) as StagedSkillKey[]), ...BASELINE_KEYS];
  for (const key of keys) {
    const value = rec[key];
    if (value === undefined || !checkSpecFor(key, value)) continue;
    const prev = claims?.[key];
    out[key] = prev && prev.value === value ? prev : { value, status: "claimed", claimedAt: nowISO, fails: 0 };
  }
  return out;
}

// ---- choosing what to check ----

const FOCUS_CLAIMS: Record<SkillTrack, ClaimKey[]> = {
  frontLever: ["frontLever"],
  backLever: ["backLever"],
  planche: ["planche"],
  muscleUp: ["muscleUp", "pullUpMaxReps"],
  handstand: ["handstand", "handstandPushUp", "oneArmHandstand"],
  humanFlag: ["humanFlag"],
  pullStrength: ["pullUpMaxReps", "oneArmPullUp"],
  pushStrength: ["pushUpMaxReps", "dipMaxReps", "planche"],
  legs: ["pistolSquat", "shrimpSquat", "nordicCurl"],
  core: ["lSit", "dragonFlag"],
};

const DAY = 86400000;
const RETRY_AFTER_SKIP_DAYS = 2;
const RETRY_AFTER_FAIL_DAYS = 3; // a failed check is retried on a *different* day
const RECHECK_VERIFIED_DAYS = 60;

export function pickSkillCheck(
  claims: Partial<Record<ClaimKey, SkillClaim>>,
  equipment: TrainingEquipment,
  focus: SkillTrack,
  now: Date = new Date()
): CheckSpec | null {
  let best: { spec: CheckSpec; score: number } | null = null;
  for (const key of Object.keys(claims) as ClaimKey[]) {
    const c = claims[key]!;
    const spec = checkSpecFor(key, c.value);
    if (!spec || !checkEquipmentOk(key, equipment)) continue;
    const since = (iso?: string) => (iso ? (now.getTime() - new Date(iso).getTime()) / DAY : Infinity);

    let score: number;
    if (c.status === "verified") {
      if (since(c.verifiedAt) < RECHECK_VERIFIED_DAYS) continue;
      score = -50; // occasional re-test of old verifications, lowest priority
    } else {
      const wait = c.status === "unconfirmed" ? RETRY_AFTER_FAIL_DAYS : RETRY_AFTER_SKIP_DAYS;
      if (since(c.lastAttemptAt) < wait) continue;
      score = c.status === "unconfirmed" ? 10 : 0;
    }
    if (FOCUS_CLAIMS[focus]?.includes(key)) score += 100;
    if (isBaseline(key)) score += 20;
    else if (LADDER_STAGED.has(key)) score += 30 + (STAGE_ORDER[key]?.indexOf(String(c.value)) ?? 0) * 5;

    if (!best || score > best.score || (score === best.score && spec.key < best.spec.key)) best = { spec, score };
  }
  return best?.spec ?? null;
}

export function checkExercise(spec: CheckSpec): Exercise {
  const base = { restSeconds: 120, check: spec };
  if (spec.kind === "hold") {
    return {
      ...base,
      name: `Skill check: ${spec.label}`,
      detail: `3 x ${spec.target}s`,
      cue: "Up to 3 attempts — stop the timer the moment form breaks",
      description: `Verifies your claim. Get into a clean ${spec.label} and hold it for ${spec.target} seconds. The timer measures your best attempt; you can also type it in.`,
    };
  }
  if (isBaseline(spec.key)) {
    return {
      ...base,
      name: `Skill check: ${spec.label}`,
      detail: "1 x max reps",
      cue: "One all-out set, strict form, full range",
      description: `Verifies your claim of ${spec.target}. Fully warmed up, do one strict set to failure and log how many clean reps you got.`,
    };
  }
  return {
    ...base,
    name: `Skill check: ${spec.label}`,
    detail: spec.kind === "reps" ? `Up to 3 attempts at ${spec.target} clean rep${spec.target === 1 ? "" : "s"}` : "Up to 3 attempts",
    cue: "Clean, controlled — this verifies your level",
    description: `Verifies your claim. Perform a clean ${spec.label}${spec.kind === "reps" ? ` for ${spec.target} rep${spec.target === 1 ? "" : "s"}` : ""} and log whether you got it.`,
  };
}

// Puts at most one Skill Check right after the warm-up, while fresh.
export function addSkillCheck(session: TrainingSession, spec: CheckSpec | null): TrainingSession {
  if (!spec) return session;
  const sets = [...session.sets];
  const at = sets[0]?.track === "warmup" ? 1 : 0;
  sets.splice(at, 0, { track: "skillCheck", title: "Skill Check", exercises: [checkExercise(spec)] });
  return { ...session, sets, estXp: session.estXp + 10 };
}

// ---- validating results ----

export function validateCheckValue(spec: CheckSpec, value: number | boolean | undefined): string | null {
  if (value === undefined) return "Log a result first";
  if (spec.kind === "pass") return typeof value === "boolean" ? null : "Pick a result";
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return "Enter a number";
  if (spec.kind === "hold" && value > Math.max(spec.target * 8, 60))
    return `${value}s is far beyond the ${spec.target}s target — please double-check`;
  if (spec.kind === "reps" && value > Math.max(spec.target * 3, spec.target + 25))
    return `${value} reps is far beyond your claim of ${spec.target} — please double-check`;
  return null;
}

function passed(spec: CheckSpec, value: number | boolean): boolean {
  if (spec.kind === "pass") return value === true;
  // 5% slack on holds: the timer and human reaction aren't frame-perfect
  return spec.kind === "hold" ? (value as number) >= spec.target * 0.95 : (value as number) >= spec.target;
}

// ---- applying results ----

export interface VerificationEvent {
  key: ClaimKey;
  outcome: "verified" | "raised" | "unconfirmed" | "lowered" | "ignored";
  text: string;
  // for share cards, on verified / raised results
  label?: string; // e.g. "Tuck Front Lever", "Max push-ups"
  result?: string; // e.g. "8s", "12 reps", "done"
  videoKey?: string; // the attempt was recorded (clip on this device)
}

export function applyCheckResults(
  claimsIn: Partial<Record<ClaimKey, SkillClaim>>,
  skillsIn: SkillProfile,
  masteryIn: Partial<Record<StagedSkillKey, SkillMastery>>,
  progress: Partial<Record<StagedSkillKey, SkillProgress>>,
  feedback: ExerciseFeedback[],
  now: Date = new Date()
) {
  const nowISO = now.toISOString();
  const claims = { ...claimsIn };
  const skills = { ...skillsIn } as SkillProfile;
  const mastery = { ...masteryIn };
  const events: VerificationEvent[] = [];
  const suggestions: StageSuggestion[] = [];
  const snoozed = (k: StagedSkillKey) => (progress[k]?.snoozeUntil ?? "") > nowISO;
  const fmt = (spec: CheckSpec, v: number | boolean) =>
    spec.kind === "hold" ? `${v}s` : spec.kind === "reps" ? `${v} rep${v === 1 ? "" : "s"}` : v ? "done" : "not yet";

  for (const fb of feedback) {
    const spec = fb.check;
    if (!spec) {
      const ev = passiveEvidence(fb, claims, skills, mastery, nowISO);
      if (ev) events.push(ev);
      continue;
    }
    const prev = claims[spec.key];
    // the claim changed since this check was generated (e.g. edited in the
    // profile mid-session): the result no longer tests it
    const current = prev ? checkSpecFor(spec.key, prev.value) : null;
    if (!prev || !current || current.label !== spec.label || current.target !== spec.target) continue;
    const c: SkillClaim = { ...prev };
    claims[spec.key] = c;

    if (fb.outcome !== "done" || fb.checkResult === undefined) {
      c.lastAttemptAt = nowISO; // skipped: rotate to other claims for a couple of days
      continue;
    }
    const v = fb.checkResult;
    if (validateCheckValue(spec, v)) {
      events.push({ key: spec.key, outcome: "ignored", text: `${spec.label}: result looked implausible, so it wasn't applied` });
      continue;
    }
    // a second attempt the same day isn't independent evidence of failure
    const sameDayRetry = c.lastAttemptAt?.slice(0, 10) === nowISO.slice(0, 10);
    c.lastAttemptAt = nowISO;
    if (typeof v === "number") c.best = Math.max(c.best ?? 0, v);

    if (isBaseline(spec.key)) {
      const n = v as number;
      if (n >= spec.target) {
        c.status = "verified";
        c.verifiedAt = nowISO;
        c.fails = 0;
        if (fb.checkVideoKey) {
          c.videoKey = fb.checkVideoKey;
          c.videoAt = nowISO;
        }
        if (n > spec.target) {
          c.value = n;
          (skills as unknown as Record<string, number>)[spec.key] = n;
          events.push({ key: spec.key, outcome: "raised", text: `${spec.label}: claimed ${spec.target}, did ${n} — verified at ${n}`, label: spec.label, result: `${n} reps`, videoKey: fb.checkVideoKey });
        } else {
          events.push({ key: spec.key, outcome: "verified", text: `${spec.label}: ${n} verified`, label: spec.label, result: `${n} reps`, videoKey: fb.checkVideoKey });
        }
      } else {
        if (!sameDayRetry) c.fails += 1;
        if (c.fails >= 2) {
          // two separate days short of the claim: trust the measurement
          const measured = Math.max(c.best ?? n, n);
          c.value = measured;
          c.status = "verified";
          c.verifiedAt = nowISO;
          c.fails = 0;
          (skills as unknown as Record<string, number>)[spec.key] = measured;
          events.push({ key: spec.key, outcome: "lowered", text: `${spec.label}: set to ${measured}, your best measured result (claimed ${spec.target})` });
        } else {
          c.status = "unconfirmed";
          events.push({ key: spec.key, outcome: "unconfirmed", text: `${spec.label}: ${n} of ${spec.target} — we'll retest on another day` });
        }
      }
      continue;
    }

    const skill = spec.key as StagedSkillKey;
    const m = (mastery[skill] ?? DEFAULT_MASTERY) as SkillMastery;
    const order = STAGE_ORDER[skill] ?? [];
    const idx = order.indexOf(String(c.value));
    if (passed(spec, v)) {
      c.status = "verified";
      c.verifiedAt = nowISO;
      c.fails = 0;
      if (fb.checkVideoKey) {
        c.videoKey = fb.checkVideoKey;
        c.videoAt = nowISO;
      }
      if (m < 4) mastery[skill] = 4;
      events.push({ key: skill, outcome: "verified", text: `${spec.label}: ${fmt(spec, v)} — verified`, label: spec.label, result: fmt(spec, v), videoKey: fb.checkVideoKey });
      // held double the target: probably ready for the next stage
      if (spec.kind === "hold" && (v as number) >= spec.target * 2 && idx >= 0 && idx < order.length - 1 && !snoozed(skill)) {
        suggestions.push({ skill, direction: "up", fromStage: order[idx], toStage: order[idx + 1] });
      }
    } else {
      if (!sameDayRetry) c.fails += 1;
      c.status = "unconfirmed";
      const close = spec.kind === "hold" && (v as number) >= spec.target * 0.6;
      const cap: SkillMastery = close ? 3 : 2;
      if (m > cap) mastery[skill] = cap;
      events.push({
        key: skill,
        outcome: "unconfirmed",
        text: `${spec.label}: ${fmt(spec, v)}${spec.kind === "hold" ? ` of ${spec.target}s` : ""} — ${c.fails >= 2 ? "missed twice" : "we'll retest on another day"}`,
      });
      if (c.fails >= 2 && idx > 0 && !snoozed(skill)) {
        suggestions.push({ skill, direction: "down", fromStage: order[idx], toStage: order[idx - 1] });
      }
    }
  }

  return { claims, skills, mastery, events, suggestions };
}

// ---- passive verification from regular training ----
// Exercises whose logged reps directly measure a rep baseline.
const BASELINE_EXERCISES: Record<string, BaselineClaimKey> = {
  "Pull-ups": "pullUpMaxReps",
  "Push-ups": "pushUpMaxReps",
  "Parallel bar dips": "dipMaxReps",
  "Ring dips": "dipMaxReps",
};

// A regular exercise can prove a claim too: a clean hold of the claimed
// stage for its target time, or a logged set reaching a claimed rep count.
// Only ever confirms or raises — a mid-session set after other work isn't a
// fair test, so falling short here never counts against a claim.
function passiveEvidence(
  fb: ExerciseFeedback,
  claims: Partial<Record<ClaimKey, SkillClaim>>,
  skills: SkillProfile,
  mastery: Partial<Record<StagedSkillKey, SkillMastery>>,
  nowISO: string
): VerificationEvent | null {
  if (fb.outcome !== "done" || !fb.timing) return null;

  const baseKey = BASELINE_EXERCISES[fb.name];
  const reps = fb.timing.bestReps;
  if (baseKey && reps !== undefined) {
    const c = claims[baseKey];
    if (!c) return null;
    const claimed = Number(c.value);
    if (reps < claimed || reps > Math.max(claimed * 3, claimed + 25)) return null;
    if (c.status === "verified" && reps <= claimed) return null;
    claims[baseKey] = { ...c, value: Math.max(claimed, reps), status: "verified", verifiedAt: nowISO, fails: 0, best: Math.max(c.best ?? 0, reps) };
    (skills as unknown as Record<string, number>)[baseKey] = Math.max(claimed, reps);
    const card = { label: claimLabel(baseKey), result: `${reps} reps` };
    return reps > claimed
      ? { key: baseKey, outcome: "raised", text: `${claimLabel(baseKey)}: ${reps} in training — raised from ${claimed}`, ...card }
      : { key: baseKey, outcome: "verified", text: `${claimLabel(baseKey)}: ${reps} in training — verified`, ...card };
  }

  const hold = fb.timing.bestHold;
  if (hold === undefined || !/hold/i.test(fb.name)) return null;
  const loc = exerciseStage(fb.name);
  if (!loc) return null;
  const c = claims[loc.skill];
  if (!c || c.status === "verified" || String(c.value) !== loc.stage) return null;
  const spec = checkSpecFor(loc.skill, c.value);
  if (!spec || spec.kind !== "hold" || hold < spec.target * 0.95 || hold > Math.max(spec.target * 8, 60)) return null;
  claims[loc.skill] = { ...c, status: "verified", verifiedAt: nowISO, fails: 0, best: Math.max(c.best ?? 0, hold) };
  if ((mastery[loc.skill] ?? DEFAULT_MASTERY) < 4) mastery[loc.skill] = 4;
  return { key: loc.skill, outcome: "verified", text: `${spec.label}: held ${hold}s in training — verified`, label: spec.label, result: `${hold}s` };
}

export function claimCounts(claims: Partial<Record<ClaimKey, SkillClaim>>) {
  const all = Object.values(claims).filter(Boolean) as SkillClaim[];
  return {
    total: all.length,
    verified: all.filter((c) => c.status === "verified").length,
    unconfirmed: all.filter((c) => c.status === "unconfirmed").length,
  };
}
