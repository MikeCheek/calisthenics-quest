// ---------------------------------------------------------------------------
// The park you're training at today (this tab), to log with the session.
// Set from the "Where are you training?" question before a session, or by
// "Train here today" on a park. "none" = asked, not at a park.
// ---------------------------------------------------------------------------

export type TodayPark = { id: string; name: string } | "none";

const KEY = "barquests:todayPark";
const day = () => new Date().toDateString();

export function readTodayPark(): TodayPark | null {
  try {
    const v = JSON.parse(sessionStorage.getItem(KEY) ?? "null") as { day: string; park: TodayPark } | null;
    return v && v.day === day() ? v.park : null;
  } catch {
    return null;
  }
}

export function setTodayPark(park: TodayPark | null) {
  try {
    if (park) sessionStorage.setItem(KEY, JSON.stringify({ day: day(), park }));
    else sessionStorage.removeItem(KEY);
  } catch {
    // storage blocked: this visit only
  }
}
