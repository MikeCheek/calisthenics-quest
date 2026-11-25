import { test } from "node:test";
import assert from "node:assert/strict";
import { loadOsmParks, cellsCovering, cellBox, planLoad, placeAround, photoFromTags, placeAt, commonsThumb, parkName, splitByCell, mergeEdits, dedupe, type OsmCell, type UserParkDoc, cellOf, cellsAround, cleanNote, confirmation, distanceM, equipmentAt, groupParks, kitFromTags, parkKit, reactionCounts, type OsmElement, type ParkReport } from "../src/lib/parks";
import { OVERPASS_SERVERS, askOverpass, parksQuery, validBox } from "../src/lib/server/overpass";
import { DEFAULT_EQUIPMENT } from "../src/lib/types";
import { translate } from "../src/lib/i18n/tx";

const at = { lat: 45.46, lon: 9.19 };
// ~11 m per 0.0001° of latitude
const station = (id: number, dLat: number, fs: string, extra: Record<string, string> = {}): OsmElement => ({ type: "node", id, lat: at.lat + dLat, lon: at.lon, tags: { leisure: "fitness_station", fitness_station: fs, ...extra } });

test("map tags become kit", () => {
  assert.deepEqual(kitFromTags({ fitness_station: "horizontal_bar;parallel_bars" }).sort(), ["parallelBars", "pullUpBar"]);
  assert.deepEqual(kitFromTags({ fitness_station: "wall bars" }), ["verticalPole"]);
  assert.deepEqual(kitFromTags({ "fitness_station:rings": "yes", "fitness_station:monkey_bars": "no" }), ["rings"]);
  assert.deepEqual(kitFromTags({ fitness_station: "sit-up" }), []);
});

test("stations close together are one park; an area takes the stations in it", () => {
  const parks = groupParks(
    [
      { type: "way", id: 7, center: { lat: at.lat + 0.01, lon: at.lon }, tags: { leisure: "fitness_station", sport: "calisthenics", name: "Riverside bars" } },
      station(1, 0.0101, "rings"), // ~11 m from the area
      station(2, 0.0, "horizontal_bar"),
      station(3, 0.0003, "parallel_bars"), // ~33 m from #2
      station(4, 0.03, "monkey_bars"), // on its own, far away
    ],
    at
  );
  assert.equal(parks.length, 3);
  assert.deepEqual(parks[0].mapKit, ["pullUpBar", "parallelBars"]);
  assert.ok(parks[0].distanceM! < 30);
  const river = parks.find((p) => p.id === "osm-w7")!;
  assert.equal(river.name, "Riverside bars");
  assert.deepEqual(river.mapKit, ["rings"]);
  assert.ok(Math.abs(river.distanceM! - 1112) < 15);
});

test("the Overpass query asks for stations and calisthenics areas in the cells' box", () => {
  const q = parksQuery(cellBox(["454:91", "455:92"]));
  assert.match(q, /leisure"="fitness_station"\]\(45\.4000,9\.1000,45\.6000,9\.3000\)/);
  assert.match(q, /sport"="calisthenics"/);
  assert.match(q, /out tags center/);
  assert.match(q, /leisure"~"\^\(park\|recreation_ground/); // the parks around, for names
  assert.match(q, /out tags bb/);
});

test("the server only searches boxes the app could ask for", () => {
  assert.deepEqual(validBox({ s: 45.4, w: 9.1, n: 45.6, e: 9.3 }), { s: 45.4, w: 9.1, n: 45.6, e: 9.3 });
  assert.equal(validBox({ s: 40, w: 0, n: 50, e: 10 }), null); // a whole country
  assert.equal(validBox({ s: 45.6, w: 9.1, n: 45.4, e: 9.3 }), null);
  assert.equal(validBox("45,9"), null);
});

test("an unnamed station takes the name of the park it's in, and a photo from the map", () => {
  const parks = groupParks([
    station(1, 0, "horizontal_bar"),
    { type: "way", id: 50, bounds: { minlat: at.lat - 0.002, minlon: at.lon - 0.002, maxlat: at.lat + 0.002, maxlon: at.lon + 0.002 }, tags: { leisure: "park", name: "Parco Sempione", wikimedia_commons: "File:Parco Sempione.jpg" } },
    { type: "way", id: 51, bounds: { minlat: at.lat - 0.05, minlon: at.lon - 0.05, maxlat: at.lat + 0.05, maxlon: at.lon + 0.05 }, tags: { leisure: "park", name: "Big outer park" } },
    station(2, 0.03, "rings", { name: "Own name" }),
  ]);
  assert.equal(parks.length, 2); // the parks themselves aren't bar parks
  const inPark = parks.find((p) => p.id === "osm-n1")!;
  assert.equal(inPark.name, null);
  assert.equal(inPark.place, "Parco Sempione"); // the smallest park around it
  assert.equal(inPark.photo, commonsThumb("File:Parco Sempione.jpg"));
  assert.equal(parkName(inPark), "Parco Sempione");
  assert.equal(parks.find((p) => p.id === "osm-n2")!.name, "Own name");
});

test("photos come only from safe, real image tags", () => {
  assert.equal(photoFromTags({ image: "https://example.org/bars.jpg" }), "https://example.org/bars.jpg");
  assert.equal(photoFromTags({ image: "http://example.org/bars.jpg" }), undefined);
  assert.equal(photoFromTags({ image: "https://example.org/page" }), undefined);
  assert.equal(photoFromTags({ image: "https://commons.wikimedia.org/wiki/File:Bars%20park.jpg" }), commonsThumb("File:Bars park.jpg"));
  assert.equal(photoFromTags({ wikimedia_commons: "Category:Parks" }), undefined);
  assert.equal(placeAround([], at), null);
});

test("a new park is named after the park around its spot", async () => {
  const fetcher = (async (url: string, init: RequestInit) => {
    assert.equal(url, "/api/parks/osm");
    assert.deepEqual(JSON.parse(String(init.body)), { at: { lat: 45.46, lon: 9.19 } });
    return new Response(JSON.stringify({ elements: [{ type: "area", id: 1, tags: { leisure: "playground", name: "Playground" } }, { type: "area", id: 2, tags: { leisure: "park", name: "Giardini" } }] }));
  }) as unknown as typeof fetch;
  assert.deepEqual(await placeAt(45.46, 9.19, fetcher), { name: "Giardini" });
});

const now = new Date("2026-11-23T12:00:00Z");
const rep = (uid: string, kit: ParkReport["kit"], daysAgo: number, reactions?: ParkReport["reactions"]): ParkReport => ({ uid, name: uid, kit, atISO: new Date(now.getTime() - daysAgo * 86400000).toISOString(), reactions });

test("what's there: athletes' reports, with the map as one vote", () => {
  const s = parkKit({ mapKit: ["pullUpBar", "rings"] }, [rep("a", { pullUpBar: true, rings: false, parallelBars: true }, 2), rep("b", { rings: false }, 10), rep("c", { monkeyBars: true }, 400)], now);
  const by = Object.fromEntries(s.map((x) => [x.kit, x]));
  assert.equal(by.pullUpBar.state, "yes");
  assert.equal(by.pullUpBar.yes, 1);
  assert.equal(by.rings.state, "no"); // two say gone, the map says there
  assert.equal(by.parallelBars.state, "yes");
  assert.equal(by.monkeyBars.state, "unknown"); // over a year old
  assert.equal(by.wallSpace.state, "unknown");
});

test("a tie goes to the newest report", () => {
  const s = parkKit({ mapKit: [] }, [rep("a", { rings: true }, 30), rep("b", { rings: false }, 1)], now);
  assert.equal(s.find((x) => x.kit === "rings")!.state, "no");
});

test("train here: the park's kit plus what you carry", () => {
  const s = parkKit({ mapKit: ["monkeyBars"] }, [], now);
  const eq = equipmentAt(s, { ...DEFAULT_EQUIPMENT, resistanceBands: true, rings: true });
  assert.equal(eq.pullUpBar, true); // monkey bars work for pull-ups
  assert.equal(eq.parallelBars, false);
  assert.equal(eq.rings, true);
  assert.equal(eq.resistanceBands, true);
});

test("confirming copies what's known; reactions are counted; notes are trimmed", () => {
  const s = parkKit({ mapKit: ["pullUpBar"] }, [rep("a", { rings: false }, 1)], now);
  assert.deepEqual(confirmation(s), { pullUpBar: true, rings: false });
  assert.deepEqual(reactionCounts(rep("a", {}, 1, { x: "fire", y: "fire", z: "thanks" })), { fire: 2, thanks: 1 });
  assert.equal(cleanNote("  new   rings\n" + "x".repeat(200)).length, 140);
});

test("athlete-added parks are found by grid cell", () => {
  assert.equal(cellOf(45.46, 9.19), "454:91");
  assert.equal(cellsAround(45.46, 9.19).length, 9);
  assert.ok(cellsAround(45.46, 9.19).includes("455:92"));
  assert.ok(Math.abs(distanceM(at, { lat: at.lat + 0.01, lon: at.lon }) - 1112) < 5);
});

test("parks copy is in Italian", () => {
  for (const p of ["Bar parks near you", "Train here today", "Still like this", "Update equipment", "Pull-up bar", "Latest updates"]) assert.notEqual(translate("it", p), p);
  assert.equal(translate("it", "{n} confirmed · {d}", { n: 3, d: "ieri" }), "3 conferme · ieri");
});

// ---- the shared cache ----
const now2 = new Date("2026-11-23T12:00:00Z");
const daysAgo = (d: number) => new Date(now2.getTime() - d * 86400000).toISOString();
const memory = (cells: OsmCell[] = []) => {
  const store = new Map(cells.map((c) => [c.cell, c]));
  const writes: OsmCell[][] = [];
  return {
    store,
    writes,
    io: {
      read: async (ids: string[]) => ids.flatMap((id) => (store.has(id) ? [store.get(id)!] : [])),
      write: async (cs: OsmCell[]) => {
        writes.push(cs);
        cs.forEach((c) => store.set(c.cell, c));
      },
    },
  };
};
const okFetcher = (elements: unknown[], hits: string[] = []) =>
  (async (url: string) => {
    hits.push(url);
    return new Response(JSON.stringify({ elements }), { status: 200 });
  }) as unknown as typeof fetch;

test("the cells a search circle touches", () => {
  assert.deepEqual(cellsCovering(45.45, 9.15, 2000), ["454:91"]);
  const wide = cellsCovering(45.45, 9.15, 10000);
  assert.ok(wide.length >= 9 && wide.includes("454:91") && wide.includes("455:92") && wide.includes("453:90"));
});

test("fresh cache: no Overpass at all, and the date it was read", async () => {
  const cells = cellsCovering(at.lat, at.lon, 2000);
  const m = memory(cells.map((cell) => ({ cell, parks: [{ id: "osm-n9", name: "Cached bars", lat: at.lat + 0.001, lon: at.lon, mapKit: ["rings" as const] }], fetchedAtISO: daysAgo(3) })));
  const hits: string[] = [];
  const r = await loadOsmParks(at, 2000, { ...m.io, fetcher: okFetcher([], hits) }, { now: now2 });
  assert.equal(hits.length, 0);
  assert.equal(r.from, "cache");
  assert.equal(r.parks.length, 1); // the same park in several cells shows once
  assert.equal(r.updatedAtISO, daysAgo(3));
});

test("missing or stale cells: one Overpass query for them all, saved cell by cell", async () => {
  const m = memory();
  const hits: string[] = [];
  const r = await loadOsmParks(at, 2000, { ...m.io, fetcher: okFetcher([station(9, 0.001, "rings")], hits) }, { now: now2 });
  assert.equal(hits.length, 1);
  assert.equal(r.from, "openstreetmap");
  assert.equal(r.parks.length, 1);
  assert.equal(m.writes.length, 1);
  assert.deepEqual(m.writes[0].map((c) => c.cell), cellsCovering(at.lat, at.lon, 2000));
  assert.equal(m.writes[0].flatMap((c) => c.parks).length, 1);
  assert.equal(r.updatedAtISO, now2.toISOString());
});

test("Overpass down: the cache, however old, and the date it's from", async () => {
  const cells = cellsCovering(at.lat, at.lon, 2000);
  const m = memory(cells.map((cell) => ({ cell, parks: [{ id: "osm-n9", name: null, lat: at.lat, lon: at.lon, mapKit: [] }], fetchedAtISO: daysAgo(40) })));
  const down = (async () => new Response("busy", { status: 504 })) as unknown as typeof fetch;
  const r = await loadOsmParks(at, 2000, { ...m.io, fetcher: down }, { now: now2 });
  assert.equal(r.failed, true);
  assert.equal(r.parks.length, 1);
  assert.equal(r.updatedAtISO, daysAgo(40));
});

test("refreshing on request: at most once a day per area", () => {
  const cells = ["454:91"];
  const c = (d: number) => [{ cell: "454:91", parks: [], fetchedAtISO: daysAgo(d) }];
  assert.equal(planLoad(cells, c(3), now2).fetch, false);
  assert.equal(planLoad(cells, c(20), now2).fetch, true);
  assert.equal(planLoad(cells, c(3), now2, true).fetch, true);
  assert.equal(planLoad(cells, c(0.2), now2, true).fetch, false);
  assert.equal(planLoad(["454:91", "454:92"], c(1), now2).fetch, true); // a cell missing
});

test("parks are filed under the cell they sit in", () => {
  const out = splitByCell([{ id: "a", name: null, lat: 45.46, lon: 9.19, mapKit: [] }, { id: "b", name: null, lat: 45.51, lon: 9.19, mapKit: [] }], ["454:91", "455:91"], now2);
  assert.deepEqual(out.map((c) => c.parks.map((p) => p.id)), [["a"], ["b"]]);
  assert.equal(dedupe([{ id: "a", lat: 45, lon: 9 }, { id: "b", lat: 45.0001, lon: 9 }]).length, 1);
});

test("community edits rename and move OpenStreetMap parks; added parks join the list", () => {
  const osm = [{ id: "osm-n1", name: null, lat: at.lat, lon: at.lon, source: "osm" as const, mapKit: [], distanceM: 0 }];
  const edit: UserParkDoc = { id: "osm-n1", name: "Riverside bars", lat: at.lat + 0.001, lon: at.lon, cell: "454:91", source: "osm", createdBy: "u", createdAtISO: "", editedByName: "Sam" };
  const added: UserParkDoc = { id: "u-1", name: "School bars", lat: at.lat + 0.002, lon: at.lon, cell: "454:91", source: "user", createdBy: "u", createdAtISO: "" };
  const far: UserParkDoc = { ...added, id: "u-2", lat: at.lat + 0.5 };
  const out = mergeEdits(osm, [edit, added, far], at, 2000);
  assert.deepEqual(out.map((p) => p.id), ["osm-n1", "u-1"]);
  assert.equal(out[0].name, "Riverside bars");
  assert.equal(out[0].lat, at.lat + 0.001);
  assert.ok(out[0].distanceM! > 100);
  assert.equal(out[0].edit?.editedByName, "Sam");
});

test("the server tries the next Overpass server when one is busy", async () => {
  const hits: string[] = [];
  const fetcher = (async (url: string, init: RequestInit) => {
    hits.push(new URL(url).host);
    assert.match(String((init.headers as Record<string, string>)["User-Agent"]), /BarQuests/);
    if (hits.length === 1) return new Response("busy", { status: 406 });
    if (hits.length === 2) return new Response(JSON.stringify({ elements: [], remark: "runtime error: Query timed out" }), { status: 200 });
    return new Response(JSON.stringify({ elements: [station(9, 0, "rings")] }), { status: 200 });
  }) as unknown as typeof fetch;
  const els = await askOverpass("q", { fetcher });
  assert.equal(hits.length, 3);
  assert.equal(els.length, 1);
});

test("every Overpass server down: the error names each one", async () => {
  const fetcher = (async () => new Response("no", { status: 429 })) as unknown as typeof fetch;
  await assert.rejects(askOverpass("q", { fetcher }), /overpass-api\.de: HTTP 429/);
  assert.ok(OVERPASS_SERVERS.length >= 3);
});

test("our server down and nothing cached: no parks, marked as failed", async () => {
  const fetcher = (async () => new Response("no", { status: 502 })) as unknown as typeof fetch;
  const r = await loadOsmParks(at, 2000, { ...memory().io, fetcher }, { now: now2 });
  assert.equal(r.failed, true);
  assert.deepEqual(r.parks, []);
});
