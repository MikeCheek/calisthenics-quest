import type { TrainingEquipment } from "./types";

// ---------------------------------------------------------------------------
// Bar parks near you. The map data is OpenStreetMap (Overpass API): outdoor
// fitness stations and calisthenics areas, grouped into parks. Athletes then
// say what's actually there — each one keeps one report per park, others
// confirm it or react to it — and the park's kit is the consensus of the
// last year's reports, with the map's tags as one starting vote.
// ---------------------------------------------------------------------------

export const PARK_KIT = ["pullUpBar", "parallelBars", "rings", "monkeyBars", "verticalPole", "wallSpace"] as const;
export type ParkKit = (typeof PARK_KIT)[number];

export const KIT_LABEL: Record<ParkKit, string> = {
  pullUpBar: "Pull-up bar",
  parallelBars: "Dip bars",
  rings: "Rings",
  monkeyBars: "Monkey bars",
  verticalPole: "Pole or wall bars",
  wallSpace: "Wall for handstands",
};

export interface Park {
  id: string; // "osm-n123", "osm-w45" or "u-…" for one added by an athlete
  name: string | null;
  lat: number;
  lon: number;
  source: "osm" | "user";
  mapKit: ParkKit[]; // what the map's tags say
  distanceM?: number;
}

export type Reaction = "thanks" | "strong" | "fire";
export const REACTIONS: Record<Reaction, string> = { thanks: "🙏", strong: "💪", fire: "🔥" };

export interface ParkReport {
  uid: string;
  name: string; // first name shown with it
  kit: Partial<Record<ParkKit, boolean>>; // true there, false not there; missing = didn't say
  note?: string; // ≤ 140 characters
  atISO: string;
  reactions?: Record<string, Reaction>; // reactor uid → reaction
}

export interface UserParkDoc {
  id: string;
  name: string;
  lat: number;
  lon: number;
  cell: string;
  source: "user";
  createdBy: string;
  createdAtISO: string;
}

export const NOTE_MAX = 140;

// ---- OpenStreetMap ----

const KIT_TAGS: Record<string, ParkKit> = {
  horizontal_bar: "pullUpBar",
  horizontal_bars: "pullUpBar",
  pull_up_bar: "pullUpBar",
  "pull-up_bar": "pullUpBar",
  pullup: "pullUpBar",
  chin_up: "pullUpBar",
  high_bar: "pullUpBar",
  parallel_bars: "parallelBars",
  dip_bars: "parallelBars",
  dip_station: "parallelBars",
  dip: "parallelBars",
  dips: "parallelBars",
  parallettes: "parallelBars",
  rings: "rings",
  gymnastic_rings: "rings",
  monkey_bars: "monkeyBars",
  horizontal_ladder: "monkeyBars",
  overhead_ladder: "monkeyBars",
  wall_bars: "verticalPole",
  stall_bars: "verticalPole",
  swedish_ladder: "verticalPole",
  vertical_pole: "verticalPole",
  pole: "verticalPole",
};

export function kitFromTags(tags: Record<string, string> = {}): ParkKit[] {
  const values = (tags.fitness_station ?? "").split(";").map((v) => v.trim().toLowerCase().replace(/\s+/g, "_"));
  const kit = new Set<ParkKit>();
  for (const v of values) if (KIT_TAGS[v]) kit.add(KIT_TAGS[v]);
  // "fitness_station:horizontal_bar=yes" style
  for (const [k, v] of Object.entries(tags)) {
    const m = k.match(/^fitness_station:(.+)$/);
    if (m && v !== "no" && KIT_TAGS[m[1]]) kit.add(KIT_TAGS[m[1]]);
  }
  return [...kit];
}

export function overpassQuery(lat: number, lon: number, radiusM: number): string {
  const a = `(around:${Math.round(radiusM)},${lat.toFixed(4)},${lon.toFixed(4)})`;
  return `[out:json][timeout:25];(nwr["leisure"="fitness_station"]${a};nwr["sport"="calisthenics"]${a};);out center tags 400;`;
}

export interface OsmElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

// metres between two points
export function distanceM(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371000, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const ATTACH_M = 120; // a station this close to an area belongs to it
const CLUSTER_M = 80; // stations this close together are one park

// one park per calisthenics area (or named spot), stations grouped around
export function groupParks(elements: OsmElement[], from?: { lat: number; lon: number }): Park[] {
  const pts = elements
    .map((e) => ({ e, lat: e.lat ?? e.center?.lat, lon: e.lon ?? e.center?.lon }))
    .filter((p): p is { e: OsmElement; lat: number; lon: number } => typeof p.lat === "number" && typeof p.lon === "number");
  const isAnchor = (e: OsmElement) => e.type !== "node" || e.tags?.sport === "calisthenics" || (!!e.tags?.name && !e.tags?.fitness_station);
  const parks: (Park & { kit: Set<ParkKit>; n: number; cluster: boolean })[] = pts
    .filter((p) => isAnchor(p.e))
    .map((p) => ({ id: `osm-${p.e.type[0]}${p.e.id}`, name: p.e.tags?.name ?? null, lat: p.lat, lon: p.lon, source: "osm", mapKit: [], kit: new Set(kitFromTags(p.e.tags)), n: 1, cluster: false }));
  // drop areas that sit inside a bigger one already listed (same spot twice)
  for (let i = parks.length - 1; i >= 0; i--) if (parks.some((q, j) => j < i && distanceM(q, parks[i]) < 30)) parks.splice(i, 1);
  for (const p of pts.filter((p) => !isAnchor(p.e))) {
    const kit = kitFromTags(p.e.tags);
    let best: (typeof parks)[number] | null = null, bestD = Infinity;
    for (const park of parks) {
      const d = distanceM(park, p);
      if (d < bestD && d < (park.cluster ? CLUSTER_M : ATTACH_M)) (best = park), (bestD = d);
    }
    if (best) {
      kit.forEach((k) => best!.kit.add(k));
      if (best.cluster) {
        // a cluster of stations: centre it on them all
        best.lat = (best.lat * best.n + p.lat) / (best.n + 1);
        best.lon = (best.lon * best.n + p.lon) / (best.n + 1);
      }
      best.n++;
      if (!best.name && p.e.tags?.name) best.name = p.e.tags.name;
    } else {
      parks.push({ id: `osm-n${p.e.id}`, name: null, lat: p.lat, lon: p.lon, source: "osm", mapKit: [], kit: new Set(kit), n: 1, cluster: true });
    }
  }
  return parks
    .map(({ kit, n: _n, cluster: _c, ...p }) => ({ ...p, mapKit: PARK_KIT.filter((k) => kit.has(k)), ...(from ? { distanceM: Math.round(distanceM(from, p)) } : {}) }))
    .sort((a, b) => (a.distanceM ?? 0) - (b.distanceM ?? 0));
}

const CACHE_KEY = "barquests:parks";
export async function fetchOsmParks(lat: number, lon: number, radiusM: number): Promise<Park[]> {
  const key = `${lat.toFixed(2)},${lon.toFixed(2)},${radiusM}`;
  try {
    const c = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "null");
    if (c && c.key === key && Date.now() - c.at < 24 * 3600000) return groupParks(c.elements, { lat, lon });
  } catch {
    // no cache
  }
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "data=" + encodeURIComponent(overpassQuery(lat, lon, radiusM)),
  });
  if (!res.ok) throw new Error(`overpass ${res.status}`);
  const elements = ((await res.json()) as { elements: OsmElement[] }).elements ?? [];
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ key, at: Date.now(), elements }));
  } catch {
    // too big or blocked
  }
  return groupParks(elements, { lat, lon });
}

// ---- parks added by athletes: found by a 0.1° grid cell ----

export const cellOf = (lat: number, lon: number) => `${Math.floor(lat * 10)}:${Math.floor(lon * 10)}`;
export function cellsAround(lat: number, lon: number): string[] {
  const la = Math.floor(lat * 10), lo = Math.floor(lon * 10);
  const out: string[] = [];
  for (const dy of [-1, 0, 1]) for (const dx of [-1, 0, 1]) out.push(`${la + dy}:${lo + dx}`);
  return out;
}

export const userParkToPark = (p: UserParkDoc, from?: { lat: number; lon: number }): Park => ({
  id: p.id,
  name: p.name,
  lat: p.lat,
  lon: p.lon,
  source: "user",
  mapKit: [],
  ...(from ? { distanceM: Math.round(distanceM(from, p)) } : {}),
});

// ---- what's there: the consensus ----

export interface KitStatus {
  kit: ParkKit;
  state: "yes" | "no" | "unknown";
  yes: number; // athletes who say it's there
  no: number;
  onMap: boolean;
  lastYesISO?: string;
}

const YEAR = 365 * 86400000;

export function parkKit(park: Pick<Park, "mapKit">, reports: ParkReport[], now = new Date()): KitStatus[] {
  const recent = reports.filter((r) => now.getTime() - new Date(r.atISO).getTime() < YEAR);
  return PARK_KIT.map((kit) => {
    const says = recent.filter((r) => r.kit[kit] !== undefined).sort((a, b) => b.atISO.localeCompare(a.atISO));
    const yes = says.filter((r) => r.kit[kit]).length;
    const no = says.length - yes;
    const onMap = park.mapKit.includes(kit);
    // the map counts as one vote; on a tie the newest report wins
    const score = yes + (onMap ? 1 : 0) - no;
    const state = score > 0 ? "yes" : score < 0 ? "no" : says.length ? (says[0].kit[kit] ? "yes" : "no") : "unknown";
    return { kit, state, yes, no, onMap, lastYesISO: says.find((r) => r.kit[kit])?.atISO };
  });
}

// equipment for "Train here": the park's kit plus what you carry
export function equipmentAt(status: KitStatus[], own: TrainingEquipment): TrainingEquipment {
  const has = (k: ParkKit) => status.find((s) => s.kit === k)?.state === "yes";
  return {
    pullUpBar: has("pullUpBar") || has("monkeyBars"),
    parallelBars: has("parallelBars"),
    rings: has("rings") || own.rings, // rings travel with you
    wallSpace: has("wallSpace"),
    verticalPole: has("verticalPole"),
    monkeyBars: has("monkeyBars"),
    weights: own.weights,
    resistanceBands: own.resistanceBands,
  };
}

// a report that agrees with what's there now ("Still there")
export function confirmation(status: KitStatus[]): ParkReport["kit"] {
  return Object.fromEntries(status.filter((s) => s.state !== "unknown").map((s) => [s.kit, s.state === "yes"]));
}

export const cleanNote = (s: string) => s.replace(/\s+/g, " ").trim().slice(0, NOTE_MAX);

export function reactionCounts(r: ParkReport): Partial<Record<Reaction, number>> {
  const out: Partial<Record<Reaction, number>> = {};
  for (const v of Object.values(r.reactions ?? {})) out[v] = (out[v] ?? 0) + 1;
  return out;
}

export const parkName = (p: Pick<Park, "name">, fallback = "Bar park") => p.name?.trim() || fallback;
export const directionsUrl = (p: Pick<Park, "lat" | "lon">) => `https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}#map=18/${p.lat}/${p.lon}`;
