import { SessionRecord } from "./types";
import { formatSets } from "./timingLearning";

// ---------------------------------------------------------------------------
// Export a logged session as a TCX file (Garmin's Training Center XML),
// the format fitness platforms accept for file uploads (e.g. Strava,
// Garmin Connect). An indoor/strength activity: timed trackpoints, no GPS,
// with the exercise list in the notes. Apple Health and Android Health
// Connect can't be written from a web app — that would need a native app.
// ---------------------------------------------------------------------------

const xml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export function canExportTcx(r: SessionRecord): boolean {
  return !!r.durationMin && r.durationMin > 0;
}

export function buildTcx(r: SessionRecord): string {
  const minutes = r.durationMin ?? 0;
  const end = new Date(r.finishedAt);
  const start = new Date(end.getTime() - minutes * 60000);
  const iso = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, "Z");
  // a time-only trackpoint each minute, so platforms see the real duration
  const points: string[] = [];
  for (let m = 0; m <= minutes; m++) {
    points.push(`<Trackpoint><Time>${iso(new Date(start.getTime() + m * 60000))}</Time></Trackpoint>`);
  }
  const notes = [
    `BarQuests — ${r.focusLabel}`,
    ...r.exercises
      .filter((e) => e.outcome === "done")
      .map((e) => `✓ ${e.name}${formatSets(e.sets) ? ` (${formatSets(e.sets)})` : e.detail ? ` (${e.detail})` : ""}`),
  ].join("\n");
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">` +
    `<Activities><Activity Sport="Other"><Id>${iso(start)}</Id>` +
    `<Lap StartTime="${iso(start)}"><TotalTimeSeconds>${minutes * 60}</TotalTimeSeconds><DistanceMeters>0</DistanceMeters>` +
    `<Calories>0</Calories><Intensity>Active</Intensity><TriggerMethod>Manual</TriggerMethod>` +
    `<Track>${points.join("")}</Track></Lap>` +
    `<Notes>${xml(notes)}</Notes>` +
    `</Activity></Activities></TrainingCenterDatabase>\n`
  );
}

export function tcxFileName(r: SessionRecord): string {
  return `barquests-${r.finishedAt.slice(0, 10)}-${r.focusLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.tcx`;
}
