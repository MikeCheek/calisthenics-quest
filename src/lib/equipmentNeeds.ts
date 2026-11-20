import type { Exercise, TrainingEquipment } from "./types";

// ---------------------------------------------------------------------------
// What an exercise needs, read from its name: "Ring dips" need rings,
// "Band-assisted pull-ups" a band and a bar, "Wall handstand holds" a wall.
// Each requirement is a list of alternatives (any one will do); all of them
// must be met. Floor, box, bench or a rail count as always available.
// ---------------------------------------------------------------------------

type Key = keyof TrainingEquipment;
export type Needs = Key[][];

const HANG: Key[] = ["pullUpBar", "rings"];
const DIP: Key[] = ["parallelBars", "rings"];

export function exerciseNeeds(name: string): Needs {
  const n = name.toLowerCase();
  const needs: Needs = [];
  const add = (alts: Key[]) => needs.push(alts);

  // a band that's optional ("band or stick") isn't a requirement
  if (/\bband(ed|-assisted)?\b|\(band\)/.test(n) && !/band or /.test(n)) add(["resistanceBands"]);
  if (/weighted|\bvest\b|dip belt|\bplates?\b/.test(n)) add(["weights"]);
  if (/\bwall\b/.test(n)) add(["wallSpace"]);
  if (/monkey bar/.test(n)) {
    add(["monkeyBars"]);
    return needs;
  }
  if (/\bpole\b|human flag|flag pull|flag raises/.test(n) && !/dragon flag/.test(n)) add(["verticalPole"]);
  if (/\brope\b/.test(n)) add(["pullUpBar", "verticalPole"]);

  // apparatus written as alternatives: "ring/bar", "ring / parallette"
  if (/ring\s*\/\s*(bar|parallette)/.test(n)) add(DIP);
  else if (/\brings?\b/.test(n)) add(["rings"]);
  else if (/parallette|p-?bars?\b|parallel bar/.test(n)) add(["parallelBars"]);
  else if (/straight bar dips/.test(n)) add(["pullUpBar"]);
  else if (/impossible dip/.test(n)) add(["parallelBars", "rings", "pullUpBar"]);
  else if (/\bdips?\b/.test(n) && !/hip dips/.test(n)) add(DIP);
  else if (/hang or support/.test(n)) add(["pullUpBar", "rings", "parallelBars"]);
  else if (
    /pull-?ups?\b|chin|one-arm negatives|\bhangs?\b|hanging|muscle-?ups?|toes-to-bar|front lever|back lever|skin the cat|german hang|on bar|low bar|bar spin|swings?\b|\bkip(ping)?\b(?!-up)|scapula pulls|high pulls(?!.*band)|pull-outs|lever (rows|pulls)/.test(n) &&
    !/kip-ups?/.test(n)
  ) {
    // a band alone can't hold you up: these still need something to hang from
    if (!/\(band\)/.test(n)) add(HANG);
  }
  return needs;
}

export function fitsEquipment(exercise: Pick<Exercise, "name">, equipment: TrainingEquipment): boolean {
  return exerciseNeeds(exercise.name).every((alts) => alts.some((k) => equipment[k]));
}
