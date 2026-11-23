import { test } from "node:test";
import assert from "node:assert/strict";
import { cellOf, cellsAround, cleanNote, confirmation, distanceM, equipmentAt, groupParks, kitFromTags, overpassQuery, parkKit, reactionCounts, type OsmElement, type ParkReport } from "../src/lib/parks";
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

test("the Overpass query asks for stations and calisthenics areas around you", () => {
  const q = overpassQuery(45.4642, 9.19, 5000);
  assert.match(q, /leisure"="fitness_station"\]\(around:5000,45\.4642,9\.1900\)/);
  assert.match(q, /sport"="calisthenics"/);
  assert.match(q, /out center tags/);
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
