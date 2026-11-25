// ---------------------------------------------------------------------------
// OpenStreetMap's Overpass API, asked from the server. Browsers can't use
// it reliably: overpass-api.de refuses cross-origin requests (406, no CORS
// header) and the public mirrors are often busy. From here we send a proper
// User-Agent, wait longer, and try each server in turn.
// ---------------------------------------------------------------------------

export const OVERPASS_SERVERS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

export const USER_AGENT = "BarQuests/1.0 (calisthenics training app; https://barquests.vercel.app)";

export interface OverpassElement {
  type: "node" | "way" | "relation" | "area";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  bounds?: { minlat: number; minlon: number; maxlat: number; maxlon: number };
  tags?: Record<string, string>;
}

export async function askOverpass(query: string, opts: { fetcher?: typeof fetch; timeoutMs?: number; deadline?: number } = {}): Promise<OverpassElement[]> {
  const fetcher = opts.fetcher ?? fetch;
  const errors: string[] = [];
  for (const url of OVERPASS_SERVERS) {
    const left = (opts.deadline ?? Infinity) - Date.now();
    if (left < 3000) break; // no time for another server
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), Math.min(opts.timeoutMs ?? 25000, left));
    try {
      const res = await fetcher(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json", "User-Agent": USER_AGENT },
        body: "data=" + encodeURIComponent(query),
        signal: ctl.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { elements?: OverpassElement[]; remark?: string };
      // a server that ran out of time answers 200 with a remark and no data
      if (!json.elements || (json.remark && /runtime error|timeout|out of memory/i.test(json.remark) && !json.elements.length)) throw new Error(json.remark ?? "no elements");
      return json.elements;
    } catch (e) {
      errors.push(`${new URL(url).host}: ${(e as Error).name === "AbortError" ? "timed out" : (e as Error).message}`);
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error(`Overpass unreachable — ${errors.join("; ")}`);
}

export interface Box {
  s: number;
  w: number;
  n: number;
  e: number;
}

// a search box can't be bigger than the app ever asks for (~0.5° a side)
export function validBox(b: unknown): Box | null {
  const x = b as Partial<Box> | null;
  if (!x || ![x.s, x.w, x.n, x.e].every((v) => typeof v === "number" && Number.isFinite(v))) return null;
  const { s, w, n, e } = x as Box;
  if (s < -90 || n > 90 || w < -180 || e > 180 || n <= s || e <= w || n - s > 0.6 || e - w > 0.8) return null;
  return { s, w, n, e };
}

// fitness stations and calisthenics areas, plus the named parks around
// them (with their outline's box) so unnamed stations can take their name
export function parksQuery(b: Box): string {
  const a = `(${b.s.toFixed(4)},${b.w.toFixed(4)},${b.n.toFixed(4)},${b.e.toFixed(4)})`;
  return (
    `[out:json][timeout:40];` +
    `(nwr["leisure"="fitness_station"]${a};nwr["sport"="calisthenics"]${a};);out tags center 2000;` +
    `(way["leisure"~"^(park|recreation_ground|playground|pitch|sports_centre)$"]["name"]${a};relation["leisure"~"^(park|recreation_ground)$"]["name"]${a};);out tags bb 2000;`
  );
}

// the named park (or similar) a point is in
export function placeQuery(lat: number, lon: number): string {
  return `[out:json][timeout:20];is_in(${lat.toFixed(6)},${lon.toFixed(6)})->.a;(area.a["leisure"]["name"];area.a["landuse"="recreation_ground"]["name"];);out tags;`;
}
