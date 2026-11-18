import { Demo } from "./figure";
import * as T from "./templates";
import type { Variant } from "./templates";

// ---------------------------------------------------------------------------
// Exercise name -> demonstration + common mistakes.
//
// Rules run in order, most specific first; the first match wins. Mistakes
// belong to the movement family, so every exercise built on the same
// movement shares one well-reviewed list (translated in phrases.it.ts).
// ---------------------------------------------------------------------------

export type Family =
  | "pullUp" | "hang" | "legRaise" | "row" | "muscleUp" | "germanHang" | "frontLever" | "backLever"
  | "pushUp" | "pike" | "dip" | "support" | "handstand" | "hspu" | "planche" | "plancheLean" | "lSit"
  | "squat" | "pistol" | "lunge" | "nordic" | "bridge" | "plank" | "hollow" | "superman" | "dragonFlag"
  | "flag" | "calf" | "gluteBridge";

export const MISTAKES: Record<Family, string[]> = {
  pullUp: ["Kipping or swinging to get up", "Half reps — not starting from a full hang", "Shrugging: shoulders up by the ears at the bottom"],
  hang: ["Fully relaxed, collapsed shoulders", "Bent arms", "Swinging"],
  legRaise: ["Swinging for momentum", "Dropping the legs without control", "Shrugged shoulders"],
  row: ["Hips sagging — keep the body in one line", "Pushing the chin forward to reach the bar", "Stopping short of the chest touching the bar"],
  muscleUp: ["Pulling too low — the bar should reach the lower chest", "One arm turning over before the other", "Too much kip in the strict version"],
  germanHang: ["Dropping in fast", "Bending the arms", "Going deeper than the shoulders comfortably allow"],
  frontLever: ["Hips piking or sagging below the line", "Bent arms — keep the elbows locked", "Losing the hollow body / holding the breath"],
  backLever: ["Arching the lower back", "Bent arms", "Hips dropping below the shoulder line"],
  pushUp: ["Hips sagging or piking", "Elbows flared straight out to the sides", "Partial range — chest not near the floor"],
  pike: ["Hips dropping — keep them high", "Head landing in front of the hands instead of forming a triangle", "Elbows flaring out"],
  dip: ["Shoulders shrugging up at the top", "Going so deep the front of the shoulder hurts", "Swinging the legs for momentum"],
  support: ["Shrugged shoulders", "Bent elbows", "Swinging"],
  handstand: ["Banana back — ribs flared, lower back arched", "Bent arms or relaxed shoulders (push the floor away)", "Looking too far forward or back — keep the head neutral"],
  hspu: ["Head landing too far in front of the hands", "Elbows flaring wide", "Kicking off the wall for momentum"],
  planche: ["Bent arms", "Shoulders not leaning far enough past the hands", "Losing the rounded, protracted upper back"],
  plancheLean: ["Not leaning far enough forward", "Bent elbows", "Hips sagging"],
  lSit: ["Collapsed shoulders — push down hard", "Legs drooping below horizontal", "Bent knees in the full version"],
  squat: ["Knees caving inward", "Heels lifting", "Rounding the lower back at the bottom"],
  pistol: ["Heel lifting off the floor", "Knee caving in", "Collapsing at the bottom instead of controlling the descent"],
  lunge: ["Front knee caving in", "Torso collapsing forward", "Too short a step"],
  nordic: ["Bending at the hips instead of staying straight from knee to head", "Dropping fast at the end without control", "Heels not anchored firmly"],
  bridge: ["Bent elbows", "Pushing mostly with the legs, shoulders not opening", "Feet too far from the hands"],
  plank: ["Hips sagging", "Hips too high", "Holding the breath"],
  hollow: ["Lower back lifting off the floor", "Chin jutting forward", "Lowering the legs further than you can keep the back down"],
  superman: ["Cranking the neck up", "Bent knees", "Holding the breath"],
  dragonFlag: ["Bending at the hips", "Dropping fast instead of lowering slowly", "Resting on the neck instead of the upper back"],
  flag: ["Bottom arm bending — push hard", "Hips dropping", "Hands too close together on the pole"],
  gluteBridge: ["Pushing through the toes instead of the heels", "Arching the lower back at the top instead of squeezing the glutes", "Hips dropping on one side (single-leg)"],
  calf: ["Bouncing instead of pausing at the top", "Partial range", "Rolling onto the outside of the foot"],
};

function variantOf(name: string): Variant {
  if (/adv(\.|anced)?\s*tuck/i.test(name)) return "advTuck";
  if (/one[- ]leg/i.test(name)) return "oneLeg";
  if (/tuck/i.test(name)) return "tuck";
  if (/straddle/i.test(name)) return "straddle";
  return "full";
}

interface Rule {
  test: RegExp;
  family: Family;
  build: (name: string) => Demo;
}

const RULES: Rule[] = [
  // levers & flags first — their names also contain "hold", "raise", "pull"
  { test: /back lever/i, family: "backLever", build: (n) => T.backLever(variantOf(n), { raise: /raise|negative/i.test(n) }) },
  { test: /front lever|ice cream maker|tuck-to-one-leg|one-leg to straddle|tuck negatives|tuck hold from support|^advanced tuck holds$/i, family: "frontLever", build: (n) => T.frontLever(variantOf(n), { raise: /raise|negative|ice cream|pull/i.test(n) }) },
  { test: /human flag|flag negatives|straddle-to-full|tuck-to-straddle/i, family: "flag", build: (n) => T.humanFlag(variantOf(n)) },
  { test: /dragon flag/i, family: "dragonFlag", build: (n) => T.dragonFlag({ tuck: /tuck/i.test(n) }) },
  { test: /german hang|skin the cat/i, family: "germanHang", build: (n) => T.germanHang({ skinTheCat: /skin|transition/i.test(n) }) },
  { test: /muscle-?up|transition drill/i, family: "muscleUp", build: () => T.muscleUp() },
  // planche family
  { test: /planche lean|pseudo planche/i, family: "plancheLean", build: (n) => T.plancheLean({ pushUp: /push/i.test(n) }) },
  { test: /planche/i, family: "planche", build: (n) => T.planche(variantOf(n), { pushUp: /push|press/i.test(n) }) },
  // handstands
  { test: /handstand push|hspu/i, family: "hspu", build: (n) => T.handstand({ wall: !/parallette|freestanding/i.test(n), pushUp: true, parallettes: /parallette/i.test(n) }) },
  { test: /pike push/i, family: "pike", build: () => T.pikePushUp() },
  { test: /handstand|kick-up|wall walk|shoulder taps|straddle-to-hs/i, family: "handstand", build: (n) => T.handstand({ wall: /wall/i.test(n) }) },
  // pushing
  { test: /support hold/i, family: "support", build: (n) => T.supportHold({ rings: /ring/i.test(n) }) },
  { test: /dips?\b/i, family: "dip", build: (n) => T.dip({ rings: /ring/i.test(n), straightBar: /straight bar/i.test(n), slow: /negative|tempo|slow/i.test(n) }) },
  { test: /push-?ups?/i, family: "pushUp", build: (n) => T.pushUp({ decline: /decline/i.test(n), slow: /tempo|slow|negative/i.test(n) }) },
  // core & compression
  { test: /l-sit pull/i, family: "pullUp", build: () => T.pullUp({ lsitLegs: true }) },
  { test: /l-sit|l sit|v-sit|tuck-to-extend/i, family: "lSit", build: (n) => T.lSit(variantOf(n)) },
  { test: /knee raise|leg raise|toes.to.bar|windshield wiper(?!s \(pole)/i, family: "legRaise", build: (n) => T.legRaise({ straight: /straight|leg raise|toes/i.test(n) }) },
  { test: /hollow|dead bug/i, family: "hollow", build: (n) => T.hollow({ rock: /rock/i.test(n) }) },
  { test: /superman|arch hold/i, family: "superman", build: () => T.superman() },
  { test: /side plank/i, family: "plank", build: () => T.plank({ side: true }) },
  { test: /plank/i, family: "plank", build: () => T.plank() },
  // pulling
  { test: /dead hang|false grip hang|scapula/i, family: "hang", build: (n) => T.deadHang({ scapula: /scapula/i.test(n) }) },
  { test: /\brows?\b/i, family: "row", build: () => T.row() },
  { test: /pull-?ups?|chin-?ups?/i, family: "pullUp", build: (n) => T.pullUp({ slowDown: /negative|eccentric|tempo/i.test(n), high: /high|chest|explosive/i.test(n) }) },
  // legs
  { test: /nordic/i, family: "nordic", build: () => T.nordic() },
  { test: /shrimp/i, family: "pistol", build: () => T.pistol({ shrimp: true }) },
  { test: /pistol|single-leg sit|step-down/i, family: "pistol", build: (n) => T.pistol({ slow: /negative|step-down|sit/i.test(n) }) },
  { test: /lunge|split squat|cossack/i, family: "lunge", build: () => T.lunge() },
  { test: /squat/i, family: "squat", build: (n) => T.squat({ jump: /jump/i.test(n) }) },
  { test: /glute bridge|hip thrust/i, family: "gluteBridge", build: (n) => T.gluteBridge({ singleLeg: /single/i.test(n) }) },
  { test: /\bbridge\b/i, family: "bridge", build: () => T.bridge() },
  { test: /calf raise/i, family: "calf", build: () => T.calfRaise() },
];

export interface DemoEntry {
  family: Family;
  demo: Demo;
  mistakes: string[];
}

const cache = new Map<string, DemoEntry | null>();

export function demoFor(exerciseName: string): DemoEntry | null {
  if (cache.has(exerciseName)) return cache.get(exerciseName)!;
  const rule = RULES.find((r) => r.test.test(exerciseName));
  const entry = rule ? { family: rule.family, demo: rule.build(exerciseName), mistakes: MISTAKES[rule.family] } : null;
  cache.set(exerciseName, entry);
  return entry;
}
