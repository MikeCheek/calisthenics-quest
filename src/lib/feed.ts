import type { SessionRecord, UserDoc } from "./types";

// ---------------------------------------------------------------------------
// The crew's activity feed: when you finish a session, a short line goes to
// users/{uid}/feed for your friends to see ("Giulia · Front lever · 42 min ·
// new record on L-sit"), and they can give it kudos. Only friends can read
// it, and it can be turned off in Settings (userDoc.shareActivity).
// ---------------------------------------------------------------------------

export interface FeedItem {
  id: string;
  uid: string; // whose session
  name: string; // their first name
  focusLabel: string; // English; shown translated
  minutes?: number;
  xp: number;
  exercises: number;
  records: string[]; // exercise names with a new record (≤ 3)
  streak: number;
  paired?: boolean;
  createdAtISO: string;
  kudos?: Record<string, string>; // giver uid → first name
}

export const FEED_DAYS = 14;
export const FEED_PER_FRIEND = 5;
export const FEED_MAX = 30;

export const sharesActivity = (u: { shareActivity?: boolean; friendCode?: string | null }) => u.shareActivity !== false && !!u.friendCode;

export const firstName = (s: string | undefined) => (s ?? "").trim().split(/\s+/)[0] || "Athlete";

export function feedItemFor(u: Pick<UserDoc, "uid" | "displayName">, r: SessionRecord, streak: number): Omit<FeedItem, "id"> {
  return {
    uid: u.uid,
    name: firstName(u.displayName),
    focusLabel: r.focusLabel,
    ...(r.durationMin ? { minutes: Math.round(r.durationMin) } : {}),
    xp: r.xp,
    exercises: r.exercises.filter((e) => e.outcome === "done").length,
    records: (r.records ?? []).map((p) => p.name).slice(0, 3),
    streak,
    ...(r.paired ? { paired: true } : {}),
    createdAtISO: r.finishedAt,
  };
}

// friends' items, newest first, from the last two weeks
export function mergeFeed(lists: FeedItem[][], now = new Date()): FeedItem[] {
  const since = now.getTime() - FEED_DAYS * 86400000;
  const seen = new Set<string>();
  return lists
    .flat()
    .filter((i) => new Date(i.createdAtISO).getTime() >= since && !seen.has(`${i.uid}/${i.id}`) && seen.add(`${i.uid}/${i.id}`))
    .sort((a, b) => b.createdAtISO.localeCompare(a.createdAtISO))
    .slice(0, FEED_MAX);
}

// "Marco", "Marco and Sara", "Marco, Sara and 2 more" — you first, as "You"
export function kudosLine(item: Pick<FeedItem, "kudos">, myUid: string, you = "You"): { names: string[]; more: number } {
  const entries = Object.entries(item.kudos ?? {});
  const mine = entries.filter(([u]) => u === myUid).map(() => you);
  const others = entries.filter(([u]) => u !== myUid).map(([, n]) => n);
  const names = [...mine, ...others];
  return { names: names.slice(0, 2), more: Math.max(0, names.length - 2) };
}
