import { Exercise } from "./types";
import { adjustDetail } from "./exerciseTiming";

export type ModifierKind = "none" | "addSet" | "removeSet" | "moreEffort" | "lessEffort" | "doubleXp" | "golden";

export interface Modifier {
  kind: ModifierKind;
  label: string;
  description: string;
}

// Weighted so "no bonus" is the most common outcome and the rare/exciting
// ones (double XP, golden) are genuinely rare — same idea as a casino wheel
// where most segments are plain, a few are big.
const MODIFIER_POOL: { modifier: Modifier; weight: number }[] = [
  { weight: 6, modifier: { kind: "none", label: "No Bonus", description: "Straight up, exactly as prescribed." } },
  { weight: 2, modifier: { kind: "addSet", label: "+1 Set!", description: "One extra set added." } },
  { weight: 2, modifier: { kind: "removeSet", label: "-1 Set", description: "One set trimmed off — lighter round." } },
  { weight: 2, modifier: { kind: "moreEffort", label: "Bonus Effort", description: "Push it: a few extra reps or ~5s more on any holds." } },
  { weight: 2, modifier: { kind: "lessEffort", label: "Easy Mode", description: "Ease off: a couple fewer reps or ~5s less on holds." } },
  { weight: 1, modifier: { kind: "doubleXp", label: "Double XP!", description: "This one's worth 2x XP when you finish it." } },
  { weight: 1, modifier: { kind: "golden", label: "🌟 Golden Exercise", description: "Pure bonus — double XP, no downside." } },
];

export function weightedModifierList(): Modifier[] {
  const list: Modifier[] = [];
  for (const { modifier, weight } of MODIFIER_POOL) {
    for (let i = 0; i < weight; i++) list.push(modifier);
  }
  return list;
}

export function pickRandomModifier(): Modifier {
  const list = weightedModifierList();
  return list[Math.floor(Math.random() * list.length)];
}

export function applyModifier(exercise: Exercise, modifier: Modifier): Exercise {
  switch (modifier.kind) {
    case "addSet":
      return { ...exercise, detail: adjustDetail(exercise.detail, 1) };
    case "removeSet":
      return { ...exercise, detail: adjustDetail(exercise.detail, -1) };
    case "moreEffort":
      return { ...exercise, cue: [exercise.cue, "Bonus effort: push a few extra reps or ~5s on any hold."].filter(Boolean).join(" ") };
    case "lessEffort":
      return { ...exercise, cue: [exercise.cue, "Easy mode: trim a couple reps or ~5s off any hold."].filter(Boolean).join(" ") };
    default:
      return exercise;
  }
}

export function modifierXpMultiplier(modifier: Modifier): number {
  return modifier.kind === "doubleXp" || modifier.kind === "golden" ? 2 : 1;
}
