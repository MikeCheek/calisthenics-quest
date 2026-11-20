import type { Locale, PublicProfile, StagedSkillKey, UserDoc, WeekStats } from "./types";
import { SKILL_FIELD_LABEL } from "./types";
import { STAGE_LABEL } from "./stageOrder";
import { translate } from "./i18n/tx";
import { currentWeekKey } from "./missions";

// ---------------------------------------------------------------------------
// Nudges between friends: funny, personalised lines, picked at random (or
// by mood), or a short message of your own.
//
// A ready-made nudge travels as its template id plus values, never as text,
// so the friend reads it in their own language — in the app and in the
// push. Templates only show up when they fit: "XP ahead" only if you are.
// ---------------------------------------------------------------------------

export type NudgeMood = "friendly" | "cheeky" | "challenge";
export const NUDGE_MOODS: NudgeMood[] = ["friendly", "cheeky", "challenge"];

export interface NudgeContext {
  sender: string; // first names
  name: string;
  senderWeek: { sessions: number; xp: number };
  friendWeek: { sessions: number; xp: number };
  senderStreak: number;
  friendStreak: number;
  friendLevel: number;
  friendSkill?: { skill: StagedSkillKey; stage: string }; // one they've started
}

type Vars = Record<string, string | number>;

interface NudgeDef {
  id: string;
  mood: NudgeMood;
  text: string; // English template; Italian in phrases.it.ts
  when?: (c: NudgeContext) => boolean;
  vars?: (c: NudgeContext, rnd: () => number) => Vars;
}

const pickStep = (rnd: () => number, from: number, to: number, step: number) => from + step * Math.floor(rnd() * ((to - from) / step + 1));

export const NUDGES: NudgeDef[] = [
  // friendly
  { id: "f-lonely-bar", mood: "friendly", text: "{name}, your bar is getting lonely. Come say hi." },
  { id: "f-believes", mood: "friendly", text: "{sender} believes in your next rep, {name}." },
  { id: "f-future-self", mood: "friendly", text: "One short session today? {sender} says your future self will thank you." },
  {
    id: "f-feed-streak",
    mood: "friendly",
    text: "{name}, your {streak}-day streak looks great. Feed it today?",
    when: (c) => c.friendStreak >= 2,
    vars: (c) => ({ streak: c.friendStreak }),
  },
  {
    id: "f-next-level",
    mood: "friendly",
    text: "Level {level} looks good on you, {name}. Level {next} would look even better.",
    vars: (c) => ({ level: c.friendLevel, next: c.friendLevel + 1 }),
  },
  {
    id: "f-see-skill",
    mood: "friendly",
    text: "{sender} wants to see your {skill} ({stage}) today, {name}.",
    when: (c) => !!c.friendSkill,
    vars: (c) => ({ skill: SKILL_FIELD_LABEL[c.friendSkill!.skill], stage: STAGE_LABEL[c.friendSkill!.stage] ?? c.friendSkill!.stage }),
  },
  // cheeky
  {
    id: "c-sessions-score",
    mood: "cheeky",
    text: "Sessions this week — {sender}: {s}, you: {r}. No pressure. (Some pressure.)",
    when: (c) => c.senderWeek.sessions > c.friendWeek.sessions,
    vars: (c) => ({ s: c.senderWeek.sessions, r: c.friendWeek.sessions }),
  },
  {
    id: "c-xp-ahead",
    mood: "cheeky",
    text: "{sender} is {d} XP ahead of you this week. Just saying 👀",
    when: (c) => c.senderWeek.xp > c.friendWeek.xp,
    vars: (c) => ({ d: c.senderWeek.xp - c.friendWeek.xp }),
  },
  { id: "c-missing", mood: "cheeky", text: "Breaking news: {name}'s pull-up bar has reported them missing." },
  { id: "c-couch", mood: "cheeky", text: "Your couch called {sender}. It says you two are spending too much time together." },
  { id: "c-excuse", mood: "cheeky", text: "{sender} is training. What's your excuse today, {name}?" },
  {
    id: "c-skill-staring",
    mood: "cheeky",
    text: "Your {skill} won't get better by looking at it, {name}.",
    when: (c) => !!c.friendSkill,
    vars: (c) => ({ skill: SKILL_FIELD_LABEL[c.friendSkill!.skill] }),
  },
  { id: "c-gravity", mood: "cheeky", text: "Gravity 1, {name} 0. Time for a rematch?" },
  { id: "c-muscles", mood: "cheeky", text: "{sender} checked: your muscles are still there. They miss you." },
  // challenge
  {
    id: "h-pushups",
    mood: "challenge",
    text: "{sender} challenges you: {count} push-ups before dinner. Go!",
    vars: (_c, rnd) => ({ count: pickStep(rnd, 15, 40, 5) }),
  },
  {
    id: "h-dead-hang",
    mood: "challenge",
    text: "{sender} bets you can't dead-hang for {sec} seconds today.",
    vars: (_c, rnd) => ({ sec: pickStep(rnd, 30, 90, 15) }),
  },
  { id: "h-first-session", mood: "challenge", text: "First to log a session today wins bragging rights. {sender} is already warming up." },
  {
    id: "h-weekly-race",
    mood: "challenge",
    text: "Race for the weekly board — {sender}: {sx} XP, you: {rx}. Your move, {name}.",
    when: (c) => c.senderWeek.xp > 0 || c.friendWeek.xp > 0,
    vars: (c) => ({ sx: c.senderWeek.xp, rx: c.friendWeek.xp }),
  },
  {
    id: "h-streak-duel",
    mood: "challenge",
    text: "Streak duel: {sender} {ss} days vs {name} {rs}. Who blinks first?",
    when: (c) => c.senderStreak >= 1 && c.friendStreak >= 1,
    vars: (c) => ({ ss: c.senderStreak, rs: c.friendStreak }),
  },
  { id: "h-personal-best", mood: "challenge", text: "{sender} dares you to beat one personal best today." },
];

const BY_ID = new Map(NUDGES.map((n) => [n.id, n]));

export interface Nudge {
  id: string;
  vars: Vars;
}

const firstName = (s: string | undefined) => (s ?? "").trim().split(/\s+/)[0] || "Athlete";
const thisWeek = (w: WeekStats | undefined, key: string) => (w && w.key === key ? { sessions: w.sessions, xp: w.xp } : { sessions: 0, xp: 0 });

export function nudgeContext(me: UserDoc, friend: PublicProfile, rnd: () => number = Math.random, weekKey = currentWeekKey()): NudgeContext {
  const started = (Object.entries(friend.skills ?? {}) as [StagedSkillKey, string][]).filter(([k, v]) => v && v !== "none" && SKILL_FIELD_LABEL[k]);
  const pick = started.length ? started[Math.floor(rnd() * started.length)] : undefined;
  return {
    sender: firstName(me.displayName),
    name: firstName(friend.displayName),
    senderWeek: thisWeek(me.week, weekKey),
    friendWeek: thisWeek(friend.week, weekKey),
    senderStreak: me.streak ?? 0,
    friendStreak: friend.streak ?? 0,
    friendLevel: friend.level ?? 1,
    friendSkill: pick ? { skill: pick[0], stage: pick[1] } : undefined,
  };
}

// A random nudge that fits, optionally of one mood, avoiding the ids given
// (the last few sent) when there's anything else.
export function pickNudge(c: NudgeContext, opts: { mood?: NudgeMood; avoid?: string[] } = {}, rnd: () => number = Math.random): Nudge {
  const fits = NUDGES.filter((n) => (!opts.mood || n.mood === opts.mood) && (!n.when || n.when(c)));
  const fresh = fits.filter((n) => !opts.avoid?.includes(n.id));
  const pool = fresh.length ? fresh : fits.length ? fits : NUDGES.filter((n) => !n.when);
  const def = pool[Math.floor(rnd() * pool.length)];
  return { id: def.id, vars: { sender: c.sender, name: c.name, ...(def.vars?.(c, rnd) ?? {}) } };
}

// Skill and stage values are translated too; names and numbers aren't.
export function renderNudge(locale: Locale, n: Nudge): string | null {
  const def = BY_ID.get(n.id);
  if (!def) return null;
  const vars: Vars = { ...n.vars };
  for (const k of ["skill", "stage"]) if (typeof vars[k] === "string") vars[k] = translate(locale, vars[k] as string);
  return translate(locale, def.text, vars);
}

// Checks a nudge from a client before it's stored or pushed: a known id,
// a few short plain values.
export function validNudge(raw: unknown): Nudge | null {
  if (!raw || typeof raw !== "object") return null;
  const { id, vars } = raw as { id?: unknown; vars?: unknown };
  if (typeof id !== "string" || !BY_ID.has(id) || !vars || typeof vars !== "object") return null;
  const entries = Object.entries(vars as Record<string, unknown>);
  if (entries.length > 8) return null;
  const clean: Vars = {};
  for (const [k, v] of entries) {
    if (!/^[a-z]{1,8}$/.test(k)) return null;
    if (typeof v === "number" && Number.isFinite(v) && Math.abs(v) < 1e7) clean[k] = Math.round(v);
    else if (typeof v === "string" && v.length <= 40) clean[k] = v.replace(/[\u0000-\u001f]/g, "");
    else return null;
  }
  return { id, vars: clean };
}

export const CUSTOM_NUDGE_MAX = 80;

// Your own message: one line, trimmed, at most 80 characters.
export function cleanCustomNudge(text: unknown): string | null {
  if (typeof text !== "string") return null;
  const t = text.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  return t ? t.slice(0, CUSTOM_NUDGE_MAX) : null;
}
