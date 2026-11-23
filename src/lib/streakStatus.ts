import type { UserDoc } from "./types";

// ---------------------------------------------------------------------------
// A glanceable status for the app's icon: the badge on an installed app and
// the browser tab's icon. (A web app can't swap its home-screen icon the
// way native apps do; the badge and the tab icon are what browsers allow.)
// ---------------------------------------------------------------------------

export type StreakStatus = "session" | "done" | "atRisk" | "idle";

const localDay = (d: Date) => d.toLocaleDateString("en-CA");

export function streakStatus(
  u: Pick<UserDoc, "streak" | "lastSessionDateISO" | "body"> | null,
  opts: { inSession: boolean; now?: Date }
): StreakStatus {
  if (opts.inSession) return "session";
  if (!u) return "idle";
  const now = opts.now ?? new Date();
  const trainedToday = !!u.lastSessionDateISO && localDay(new Date(u.lastSessionDateISO)) === localDay(now);
  if (trainedToday) return "done";
  const planned = u.body?.trainingDaysOfWeek?.includes(now.getDay()) ?? false;
  return (u.streak ?? 0) > 0 && planned ? "atRisk" : "idle";
}

export const STATUS_COLOR: Record<StreakStatus, string | null> = {
  session: "#38bdf8", // in progress
  done: "#22c55e", // trained today
  atRisk: "#f59e0b", // the streak needs today's session
  idle: null,
};

// the tab icon: the app's mark, with a coloured dot for the status
export function statusIconSvg(status: StreakStatus): string {
  const dot = STATUS_COLOR[status];
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<rect width="64" height="64" rx="14" fill="#09090b"/>` +
    `<path d="M32 12 L54 50 L10 50 Z" fill="#f97316"/>` +
    (dot ? `<circle cx="50" cy="14" r="12" fill="${dot}" stroke="#09090b" stroke-width="4"/>` : "") +
    `</svg>`
  );
}

export const statusIconHref = (status: StreakStatus) => `data:image/svg+xml,${encodeURIComponent(statusIconSvg(status))}`;

// the installed app's badge: a 1 when there's something to do now
export const badgeCount = (status: StreakStatus) => (status === "session" || status === "atRisk" ? 1 : 0);
