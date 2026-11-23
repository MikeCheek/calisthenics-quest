// ---------------------------------------------------------------------------
// Weather for today's session (Open-Meteo, free and keyless). We look at the
// hour the athlete usually trains and say whether it'll be wet; if so, the
// nearest dry window today, or a floor-only session indoors. Very hot or
// cold hours get a short tip. Only rounded coordinates leave the device.
// ---------------------------------------------------------------------------

export interface Forecast {
  hourly: {
    time: string[]; // local wall-clock "2026-11-23T18:00"
    temperature_2m: number[];
    apparent_temperature: number[];
    precipitation_probability: (number | null)[];
    precipitation: number[];
    weather_code: number[];
  };
}

export interface Hour {
  time: string;
  hour: number;
  temp: number;
  feels: number;
  rainChance: number;
  rainMm: number;
  code: number;
  wet: boolean;
}

export type Advice =
  | { kind: "dry"; at: Hour; tip?: "hot" | "cold" }
  | { kind: "moveEarlier" | "moveLater"; at: Hour; window: Hour; tip?: "hot" | "cold" }
  | { kind: "indoors"; at: Hour };

// codes for rain, showers, snow and thunderstorms (WMO)
const WET_CODES = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99]);

export const isWet = (h: Pick<Hour, "rainChance" | "rainMm" | "code">) => h.rainMm >= 0.3 || h.rainChance >= 60 || (WET_CODES.has(h.code) && h.rainChance >= 40);

export const tipFor = (h: Pick<Hour, "feels">): "hot" | "cold" | undefined => (h.feels >= 30 ? "hot" : h.feels <= 4 ? "cold" : undefined);

const pad = (n: number) => String(n).padStart(2, "0");
export const localDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// the hours of one local day
export function hoursOf(f: Forecast, day: string): Hour[] {
  const h = f.hourly;
  return h.time.flatMap((time, i) => {
    if (!time.startsWith(day)) return [];
    const x = {
      time,
      hour: parseInt(time.slice(11, 13), 10),
      temp: h.temperature_2m[i],
      feels: h.apparent_temperature[i] ?? h.temperature_2m[i],
      rainChance: h.precipitation_probability[i] ?? 0,
      rainMm: h.precipitation[i] ?? 0,
      code: h.weather_code[i] ?? 0,
    };
    return [{ ...x, wet: isWet(x) }];
  });
}

// the hour they usually train: the reminder time, else when they last
// finished (minus the session), else early evening
export function trainingHour(u: { notifications?: { enabled?: boolean; time?: string }; lastSessionDateISO?: string; body?: { sessionLengthMinutes?: number } }): number {
  const t = u.notifications?.enabled && u.notifications.time ? parseInt(u.notifications.time, 10) : NaN;
  if (Number.isFinite(t)) return t;
  if (u.lastSessionDateISO && u.lastSessionDateISO.length > 10) {
    const end = new Date(u.lastSessionDateISO);
    const start = new Date(end.getTime() - (u.body?.sessionLengthMinutes ?? 45) * 60000);
    return start.getHours();
  }
  return 18;
}

// what to do today. `from` is the first hour still ahead; windows run 7–22
export function advise(f: Forecast, opts: { day: string; hour: number; from: number; minutes?: number }): Advice | null {
  const hours = hoursOf(f, opts.day);
  const hour = Math.max(opts.hour, opts.from);
  const at = hours.find((h) => h.hour === hour);
  if (!at) return null;
  const need = Math.max(1, Math.ceil((opts.minutes ?? 45) / 60));
  const dryFrom = (start: number) => {
    const run = hours.filter((h) => h.hour >= start && h.hour < start + need);
    return run.length === need && run.every((h) => !h.wet);
  };
  if (dryFrom(hour)) return { kind: "dry", at, tip: tipFor(at) };
  // the dry window closest to the usual hour, still ahead, in daylight-ish hours
  const starts = hours
    .filter((h) => h.hour >= Math.max(7, opts.from) && h.hour + need <= 22 && h.hour !== hour && dryFrom(h.hour))
    .sort((a, b) => Math.abs(a.hour - hour) - Math.abs(b.hour - hour) || a.hour - b.hour);
  const w = starts[0];
  if (w) return { kind: w.hour < hour ? "moveEarlier" : "moveLater", at, window: w, tip: tipFor(w) };
  return { kind: "indoors", at };
}

export const roundCoord = (n: number) => Math.round(n * 100) / 100; // ~1 km

export const forecastUrl = (lat: number, lon: number) =>
  `https://api.open-meteo.com/v1/forecast?latitude=${roundCoord(lat)}&longitude=${roundCoord(lon)}` +
  "&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code&forecast_days=1&timezone=auto";

// ---- where (saved on this device only) ----

const PLACE_KEY = "barquests:place";
const CACHE_KEY = "barquests:forecast";

export interface Place {
  lat: number;
  lon: number;
}

export function savedPlace(): Place | null {
  try {
    const p = JSON.parse(localStorage.getItem(PLACE_KEY) ?? "null");
    return p && typeof p.lat === "number" && typeof p.lon === "number" ? p : null;
  } catch {
    return null;
  }
}

export function savePlace(p: Place | null) {
  try {
    if (p) localStorage.setItem(PLACE_KEY, JSON.stringify({ lat: roundCoord(p.lat), lon: roundCoord(p.lon) }));
    else {
      localStorage.removeItem(PLACE_KEY);
      localStorage.removeItem(CACHE_KEY);
    }
  } catch {
    // storage blocked: works for this visit only
  }
}

export function locate(): Promise<Place> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return reject(new Error("unsupported"));
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: roundCoord(p.coords.latitude), lon: roundCoord(p.coords.longitude) }),
      reject,
      { maximumAge: 6 * 3600000, timeout: 15000, enableHighAccuracy: false }
    );
  });
}

// the forecast, kept for half an hour
export async function fetchForecast(p: Place): Promise<Forecast> {
  const key = `${roundCoord(p.lat)},${roundCoord(p.lon)}`;
  try {
    const c = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "null");
    if (c && c.key === key && Date.now() - c.at < 30 * 60000) return c.data;
  } catch {
    // no cache
  }
  const res = await fetch(forecastUrl(p.lat, p.lon));
  if (!res.ok) throw new Error(`forecast ${res.status}`);
  const data = (await res.json()) as Forecast;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ key, at: Date.now(), data }));
  } catch {
    // fine
  }
  return data;
}
