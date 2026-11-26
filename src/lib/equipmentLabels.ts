import type { KitKey, SpotKey } from "./types";

// Names for the place's equipment and for the kit you bring (English; tx() translates).
export const KIT_LABEL: Record<KitKey, [label: string, hint: string]> = {
  weights: ["Weight vest or belt", "Or plates, or a loaded backpack — for weighted pulls and dips."],
  resistanceBands: ["Resistance bands", "Assistance on pull-ups, dips and levers."],
  rings: ["Rings", "Hang them at a park bar or a sturdy beam."],
  homeBar: ["Pull-up bar at home", "A doorway or wall bar: pulls and hangs on home days."],
  parallettes: ["Parallettes", "L-sits, dips and planche work anywhere."],
};

export const SPOT_LABEL: Record<SpotKey, string> = {
  pullUpBar: "Pull-up bar",
  parallelBars: "Dip bars",
  wallSpace: "Wall",
  verticalPole: "Pole",
  monkeyBars: "Monkey bars",
};
