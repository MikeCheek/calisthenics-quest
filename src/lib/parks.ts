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
  edit?: UserParkDoc; // the community's name/position, and who changed it last
  place?: string; // the park it's in, when it has no name of its own
  photo?: string; // from the map's tags
  wikidata?: string; // where a photo may be found
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

// parks/{id}: a park added by an athlete ("u-…"/auto id, source "user"), or
// community edits to an OpenStreetMap park ("osm-…", source "osm") whose
// name and position then replace the map's
export interface UserParkDoc {
  id: string;
  name: string;
  lat: number;
  lon: number;
  cell: string;
  source: "user" | "osm";
  createdBy: string;
  createdAtISO: string;
  editedBy?: string;
  editedByName?: string; // first name, shown as "edited by"
  editedAtISO?: string;
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


export interface OsmElement {
  type: "node" | "way" | "relation" | "area";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  bounds?: { minlat: number; minlon: number; maxlat: number; maxlon: number };
  tags?: Record<string, string>;
}

// ---- names and photos from the park around a station ----

// a named park, recreation ground… (they come with their outline's box)
const PLACE_LEISURE = /^(park|recreation_ground|playground|pitch|sports_centre)$/;
const isPlace = (e: OsmElement) => !!e.bounds && !!e.tags?.name && PLACE_LEISURE.test(e.tags.leisure ?? "") && e.tags.sport !== "calisthenics";

const inside = (b: NonNullable<OsmElement["bounds"]>, p: { lat: number; lon: number }) => p.lat >= b.minlat && p.lat <= b.maxlat && p.lon >= b.minlon && p.lon <= b.maxlon;
const area = (b: NonNullable<OsmElement["bounds"]>) => (b.maxlat - b.minlat) * (b.maxlon - b.minlon);

// the smallest named place whose outline's box holds the point
export function placeAround(places: OsmElement[], p: { lat: number; lon: number }): OsmElement | null {
  return places.filter((x) => x.bounds && inside(x.bounds, p)).sort((a, b) => area(a.bounds!) - area(b.bounds!))[0] ?? null;
}

// a photo straight from the tags: an image link, or a Wikimedia Commons file
export function photoFromTags(tags: Record<string, string> = {}): string | undefined {
  const img = tags.image?.trim();
  if (img && /^https:\/\//.test(img)) {
    const file = img.match(/commons\.wikimedia\.org\/wiki\/(File:[^?#]+)/)?.[1];
    if (file) return commonsThumb(decodeURIComponent(file));
    if (/\.(jpe?g|png|webp)(\?|$)/i.test(img)) return img;
  }
  const commons = tags.wikimedia_commons?.trim();
  if (commons?.startsWith("File:")) return commonsThumb(commons);
  return undefined;
}

export const commonsThumb = (file: string) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file.replace(/^File:/, ""))}?width=640`;

// the photo on a Wikidata item (P18), for places whose tags only link there
export async function wikidataPhoto(qid: string, fetcher: typeof fetch = fetch): Promise<string | undefined> {
  if (!/^Q\d+$/.test(qid)) return undefined;
  const res = await fetcher(`https://www.wikidata.org/w/api.php?action=wbgetclaims&property=P18&entity=${qid}&format=json&origin=*`);
  if (!res.ok) return undefined;
  const json = (await res.json()) as { claims?: { P18?: { mainsnak?: { datavalue?: { value?: string } } }[] } };
  const file = json.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
  return file ? commonsThumb(file) : undefined;
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
export function groupParks(all: OsmElement[], from?: { lat: number; lon: number }): Park[] {
  const places = all.filter(isPlace);
  const elements = all.filter((e) => !isPlace(e) && (e.tags?.leisure === "fitness_station" || e.tags?.sport === "calisthenics"));
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
      parks.push({ id: `osm-n${p.e.id}`, name: p.e.tags?.name ?? null, lat: p.lat, lon: p.lon, source: "osm", mapKit: [], kit: new Set(kit), n: 1, cluster: true });
    }
  }
  const tagsById = new Map(elements.map((e) => [`osm-${e.type[0]}${e.id}`, e.tags ?? {}]));
  return parks
    .map(({ kit, n: _n, cluster: _c, ...p }) => {
      const own = tagsById.get(p.id) ?? {};
      const around = placeAround(places, p);
      const photo = photoFromTags(own) ?? photoFromTags(around?.tags);
      const wikidata = own.wikidata ?? around?.tags?.wikidata;
      return {
        ...p,
        ...(!p.name && around?.tags?.name ? { place: around.tags.name } : {}),
        ...(photo ? { photo } : {}),
        ...(wikidata ? { wikidata } : {}),
        mapKit: PARK_KIT.filter((k) => kit.has(k)),
        ...(from ? { distanceM: Math.round(distanceM(from, p)) } : {}),
      };
    })
    .sort((a, b) => (a.distanceM ?? 0) - (b.distanceM ?? 0));
}

// OpenStreetMap goes through our own server (api/parks/osm): browsers
// can't call Overpass reliably (CORS, busy public servers)
async function askServer(body: object, fetcher: typeof fetch = fetch): Promise<OsmElement[]> {
  const res = await fetcher("/api/parks/osm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return ((await res.json()) as { elements?: OsmElement[] }).elements ?? [];
}

// the name (and a photo, if the map has one) of the park a point is in,
// to suggest for a park someone adds there
export async function placeAt(lat: number, lon: number, fetcher?: typeof fetch): Promise<{ name: string; photo?: string; wikidata?: string } | null> {
  const areas = await askServer({ at: { lat, lon } }, fetcher);
  const rank = (t: Record<string, string> = {}) => (/^(park|recreation_ground)$/.test(t.leisure ?? "") ? 0 : t.leisure ? 1 : 2);
  const best = areas.filter((a) => a.tags?.name).sort((a, b) => rank(a.tags) - rank(b.tags))[0];
  if (!best?.tags?.name) return null;
  const photo = photoFromTags(best.tags);
  return { name: best.tags.name, ...(photo ? { photo } : {}), ...(best.tags.wikidata ? { wikidata: best.tags.wikidata } : {}) };
}

// ---- the shared cache: OpenStreetMap parks per 0.1° cell, in Firestore ----
// Overpass is slow and often busy, so whoever loads an area first saves the
// parks found, cell by cell, for everyone (osmCache/{cell}); later visits
// read those in a moment. A cell is refreshed from OpenStreetMap when it's
// older than CACHE_FRESH_DAYS, or on request (at most once a day: the
// Firestore rules enforce it).

export const CACHE_FRESH_DAYS = 14;
export const REFRESH_MIN_HOURS = 24;

export type CachedPark = Pick<Park, "id" | "name" | "lat" | "lon" | "mapKit" | "place" | "photo" | "wikidata">;

export interface OsmCell {
  cell: string;
  parks: CachedPark[];
  fetchedAtISO: string;
}

export interface Box {
  s: number;
  w: number;
  n: number;
  e: number;
}

const KM_PER_DEG = 111.32;

// every 0.1° cell the search circle touches
export function cellsCovering(lat: number, lon: number, radiusM: number): string[] {
  const dLat = radiusM / 1000 / KM_PER_DEG;
  const dLon = radiusM / 1000 / (KM_PER_DEG * Math.max(0.1, Math.cos((lat * Math.PI) / 180)));
  const out: string[] = [];
  for (let la = Math.floor((lat - dLat) * 10); la <= Math.floor((lat + dLat) * 10); la++)
    for (let lo = Math.floor((lon - dLon) * 10); lo <= Math.floor((lon + dLon) * 10); lo++) out.push(`${la}:${lo}`);
  return out;
}

export function cellBox(cells: string[]): Box {
  const pts = cells.map((c) => c.split(":").map(Number));
  return {
    s: Math.min(...pts.map((p) => p[0])) / 10,
    n: (Math.max(...pts.map((p) => p[0])) + 1) / 10,
    w: Math.min(...pts.map((p) => p[1])) / 10,
    e: (Math.max(...pts.map((p) => p[1])) + 1) / 10,
  };
}

// parks grouped over the whole box, then filed under the cell they sit in
export function splitByCell(parks: CachedPark[], cells: string[], now = new Date()): OsmCell[] {
  return cells.map((cell) => ({
    cell,
    parks: parks
      .filter((p) => cellOf(p.lat, p.lon) === cell)
      .map(({ id, name, lat, lon, mapKit, place, photo, wikidata }) => ({ id, name, lat, lon, mapKit, ...(place ? { place } : {}), ...(photo ? { photo } : {}), ...(wikidata ? { wikidata } : {}) })),
    fetchedAtISO: now.toISOString(),
  }));
}

const ageDays = (iso: string, now: Date) => (now.getTime() - new Date(iso).getTime()) / 86400000;

// what to do with what the cache has
export function planLoad(cells: string[], cached: OsmCell[], now = new Date(), force = false): { fetch: boolean; usable: OsmCell[] } {
  const usable = cached.filter((c) => cells.includes(c.cell));
  const complete = cells.every((c) => usable.some((u) => u.cell === c));
  const fresh = complete && usable.every((c) => ageDays(c.fetchedAtISO, now) < CACHE_FRESH_DAYS);
  const recent = complete && usable.every((c) => ageDays(c.fetchedAtISO, now) * 24 < REFRESH_MIN_HOURS);
  return { fetch: force ? !recent : !fresh, usable };
}

// the oldest cell's date: "updated on …" can't claim more than that
export const updatedOn = (cells: OsmCell[]) => (cells.length ? cells.map((c) => c.fetchedAtISO).sort()[0] : null);

export const canRefresh = (cells: OsmCell[], now = new Date()) => cells.some((c) => ageDays(c.fetchedAtISO, now) * 24 >= REFRESH_MIN_HOURS) || !cells.length;

// cells may overlap at the edges (grouped at different times): one per id
// and none within 30 m of another
export function dedupe<T extends { id: string; lat: number; lon: number }>(parks: T[]): T[] {
  const out: T[] = [];
  for (const p of parks) if (!out.some((q) => q.id === p.id || distanceM(q, p) < 30)) out.push(p);
  return out;
}

export interface LoadResult {
  parks: Park[];
  updatedAtISO: string | null; // when OpenStreetMap was last read for this area
  from: "cache" | "openstreetmap";
  failed: boolean; // OpenStreetMap was needed but unreachable
}

export async function loadOsmParks(
  center: { lat: number; lon: number },
  radiusM: number,
  io: { read: (cells: string[]) => Promise<OsmCell[]>; write: (cells: OsmCell[]) => Promise<void>; fetcher?: typeof fetch },
  opts: { force?: boolean; now?: Date } = {}
): Promise<LoadResult> {
  const now = opts.now ?? new Date();
  const cells = cellsCovering(center.lat, center.lon, radiusM);
  const cached = await io.read(cells).catch(() => [] as OsmCell[]);
  const plan = planLoad(cells, cached, now, opts.force);
  const inRange = (list: CachedPark[]) =>
    dedupe(list)
      .map((p) => ({ ...p, source: "osm" as const, distanceM: Math.round(distanceM(center, p)) }))
      .filter((p) => p.distanceM <= radiusM)
      .sort((a, b) => a.distanceM - b.distanceM);

  if (!plan.fetch) return { parks: inRange(plan.usable.flatMap((c) => c.parks)), updatedAtISO: updatedOn(plan.usable), from: "cache", failed: false };
  try {
    const elements = await askServer({ box: cellBox(cells) }, io.fetcher);
    const fresh = splitByCell(groupParks(elements), cells, now);
    io.write(fresh).catch((e) => console.warn("[parks] cache not saved:", (e as Error).message));
    return { parks: inRange(fresh.flatMap((c) => c.parks)), updatedAtISO: now.toISOString(), from: "openstreetmap", failed: false };
  } catch (e) {
    console.warn("[parks]", (e as Error).message);
    // whatever the cache has is better than nothing
    return { parks: inRange(plan.usable.flatMap((c) => c.parks)), updatedAtISO: updatedOn(plan.usable), from: "cache", failed: true };
  }
}

// ---- parks added by athletes: found by a 0.1° grid cell ----

export const cellOf = (lat: number, lon: number) => `${Math.floor(lat * 10)}:${Math.floor(lon * 10)}`;
export function cellsAround(lat: number, lon: number): string[] {
  const la = Math.floor(lat * 10), lo = Math.floor(lon * 10);
  const out: string[] = [];
  for (const dy of [-1, 0, 1]) for (const dx of [-1, 0, 1]) out.push(`${la + dy}:${lo + dx}`);
  return out;
}

// athletes' parks plus their edits to OpenStreetMap ones (name, position)
export function mergeEdits(osm: Park[], docs: UserParkDoc[], from: { lat: number; lon: number }, radiusM: number): Park[] {
  const edits = new Map(docs.filter((d) => d.source === "osm").map((d) => [d.id, d]));
  const edited = osm.map((p) => {
    const e = edits.get(p.id);
    return e ? { ...p, name: e.name || p.name, lat: e.lat, lon: e.lon, distanceM: Math.round(distanceM(from, e)), edit: e } : p;
  });
  const added = docs.filter((d) => d.source !== "osm").map((d) => ({ ...userParkToPark(d, from), edit: d }));
  return [...edited, ...added].filter((p) => (p.distanceM ?? 0) <= radiusM).sort((a, b) => (a.distanceM ?? 0) - (b.distanceM ?? 0));
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

export const parkName = (p: Pick<Park, "name"> & { place?: string }, fallback = "Bar park") => p.name?.trim() || p.place?.trim() || fallback;
export const directionsUrl = (p: Pick<Park, "lat" | "lon">) => `https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}#map=18/${p.lat}/${p.lon}`;
