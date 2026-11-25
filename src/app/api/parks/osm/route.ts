import { NextRequest, NextResponse } from "next/server";
import { RateLimiter } from "@/lib/server/rateLimit";
import { askOverpass, parksQuery, placeQuery, validBox } from "@/lib/server/overpass";

export const runtime = "nodejs";
export const maxDuration = 60;

// OpenStreetMap data for the parks map, fetched here rather than in the
// browser (see lib/server/overpass.ts). The data is public, so no sign-in
// is needed; a per-address limit keeps it from being used as a free proxy.
// Results are cached in Firestore by the app, so most visits never get here.

const limiter = new RateLimiter();

export async function POST(req: NextRequest) {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "local";
  const r = limiter.check(`osm:${ip}`, { max: 20, windowMs: 10 * 60_000 });
  if (!r.ok) return NextResponse.json({ error: "Too many map searches — try again in a few minutes." }, { status: 429, headers: { "Retry-After": String(r.retryAfterS) } });

  let body: { box?: unknown; at?: { lat?: unknown; lon?: unknown } };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const deadline = Date.now() + 55_000;
  try {
    if (body.box !== undefined) {
      const box = validBox(body.box);
      if (!box) return NextResponse.json({ error: "Invalid area." }, { status: 400 });
      return NextResponse.json({ elements: await askOverpass(parksQuery(box), { deadline, timeoutMs: 45_000 }) });
    }
    const lat = Number(body.at?.lat), lon = Number(body.at?.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return NextResponse.json({ error: "Invalid point." }, { status: 400 });
    return NextResponse.json({ elements: await askOverpass(placeQuery(lat, lon), { deadline, timeoutMs: 20_000 }) });
  } catch (e) {
    console.log("[parks-osm]", (e as Error).message);
    return NextResponse.json({ error: "OpenStreetMap is busy right now." }, { status: 502 });
  }
}
