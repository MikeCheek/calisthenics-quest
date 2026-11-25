import type { PublicProfile, SessionRecord, UserDoc } from "./types";
import type { FeedItem } from "./feed";
import type { ParkReport } from "./parks";

// ---------------------------------------------------------------------------
// Account deletion = anonymisation (GDPR art. 17, recital 26).
//
// Deleting an account doesn't remove the rows: everything that identifies a
// person is removed or coarsened, and what's left is training numbers that
// can't be traced back to anyone. The Firebase sign-in is deleted, so the uid
// left on the documents points to no one (signing in again creates a new
// uid), while links between documents — kudos counts, park votes, the
// month's community total, session counts — keep working.
//
// Rules of thumb:
// - WHITELIST, never blacklist: each anonymised document is rebuilt from the
//   fields listed here, so a personal field added later is dropped by
//   default rather than kept by mistake;
// - names become ANON_NAME, free text (notes, workout names) goes;
// - email, photo, body stats, weight log, push addresses, time zone and the
//   friend code go;
// - exact times become days or months, so nothing lines up with a known
//   moment in someone's life;
// - relationships with other people (friends, inbox messages) are removed:
//   they're the other person's data as much as yours.
// ---------------------------------------------------------------------------

export const ANON_NAME = "Former athlete";

export interface Anonymized {
  month: string; // when it happened, "2026-11"
  reason: "account-deletion";
}

export const toDay = (iso: string | undefined) => (iso && !Number.isNaN(Date.parse(iso)) ? new Date(iso).toISOString().slice(0, 10) + "T00:00:00.000Z" : undefined);
export const toMonth = (iso: string | undefined) => (iso && !Number.isNaN(Date.parse(iso)) ? new Date(iso).toISOString().slice(0, 7) : undefined);

// drop undefined (Firestore rejects it)
const clean = <T extends object>(o: T): T => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;

export type AnonymizedUserDoc = Partial<UserDoc> & { uid: string; anonymized: Anonymized };

// the private profile: training numbers only
export function anonymizeUserDoc(u: UserDoc, now = new Date()): AnonymizedUserDoc {
  return clean({
    uid: u.uid,
    displayName: ANON_NAME,
    email: "",
    friendCode: "",
    onboarded: u.onboarded,
    // the plan's shape, never the person's measurements
    body: clean({
      experienceYears: u.body?.experienceYears,
      trainingDaysPerWeek: u.body?.trainingDaysPerWeek,
      sessionLengthMinutes: u.body?.sessionLengthMinutes,
    }) as UserDoc["body"],
    skills: u.skills,
    skillMastery: u.skillMastery,
    skillProgress: u.skillProgress,
    equipment: u.equipment,
    goalTracks: u.goalTracks,
    xp: u.xp,
    level: u.level,
    streak: u.streak,
    totalSessionsCompleted: u.totalSessionsCompleted,
    lastSessionDateISO: toDay(u.lastSessionDateISO),
    createdAt: toMonth(u.createdAt),
    locale: u.locale,
    exerciseStats: u.exerciseStats,
    records: u.records && Object.fromEntries(Object.entries(u.records).map(([k, r]) => [k, clean({ ...r, dateISO: toDay(r.dateISO) ?? "" })])),
    achievements: u.achievements && Object.fromEntries(Object.entries(u.achievements).map(([k, d]) => [k, toMonth(d) ?? ""])),
    xpHistory: (u.xpHistory ?? []).map((p) => ({ ...p, dateISO: toDay(p.dateISO) ?? "" })),
    skillHistory: u.skillHistory?.map((h) => ({ ...h, at: toDay(h.at) ?? "" })),
    pastBlocks: u.pastBlocks,
    week: u.week,
    notifications: { enabled: false, time: u.notifications?.time ?? "18:00" },
    globalBoard: false,
    shareActivity: false,
    anonymized: { month: toMonth(now.toISOString())!, reason: "account-deletion" },
  });
}

// the public profile: still opens (old links and kudos resolve), says nothing
export function anonymizePublicProfile(p: Pick<PublicProfile, "uid" | "level" | "xp" | "streak" | "totalSessionsCompleted" | "skills" | "skillMastery" | "week">): PublicProfile & { deleted: true } {
  return clean({
    uid: p.uid,
    displayName: ANON_NAME,
    friendCode: "",
    level: p.level,
    streak: 0,
    xp: p.xp,
    totalSessionsCompleted: p.totalSessionsCompleted,
    skills: p.skills,
    skillMastery: p.skillMastery,
    week: p.week,
    deleted: true as const,
  });
}

// a finished session: the training, on its day
export function anonymizeSession(r: SessionRecord): SessionRecord {
  return clean({
    finishedAt: toDay(r.finishedAt) ?? r.finishedAt,
    focusLabel: r.focusLabel,
    sport: r.sport,
    durationMin: r.durationMin,
    xp: r.xp,
    paired: r.paired,
    exercises: r.exercises.map((e) => clean({ name: e.name, setTitle: e.setTitle, outcome: e.outcome, detail: e.detail, sets: e.sets, checkResult: e.checkResult, setsDone: e.setsDone })),
    records: r.records,
  });
}

export function anonymizeFeedItem(i: Omit<FeedItem, "id">): Omit<FeedItem, "id"> {
  return clean({ ...i, name: ANON_NAME, createdAtISO: toDay(i.createdAtISO) ?? i.createdAtISO });
}

// a park report keeps its vote on the kit (the park's consensus stays right)
export function anonymizeParkReport(r: ParkReport): ParkReport {
  return clean({ uid: r.uid, name: ANON_NAME, kit: r.kit, atISO: toDay(r.atISO) ?? r.atISO, reactions: r.reactions });
}

export const isAnonymized = (u: object | null | undefined) => !!u && "anonymized" in u && !!(u as { anonymized?: Anonymized }).anonymized;

// shown in the reader's language; real names are never run through the translator
export const nameFor = (name: string, tx: (s: string) => string) => (name === ANON_NAME ? tx(name) : name);
