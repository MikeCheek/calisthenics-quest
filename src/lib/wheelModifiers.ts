import { Exercise } from "./types";
import { adjustDetail } from "./exerciseTiming";

export type ModifierKind =
  | "none"
  | "addSet"
  | "removeSet"
  | "moreRest"
  | "lessRest"
  | "moreEffort"
  | "lessEffort"
  | "xpMultiplier"
  | "flatXp"
  | "golden";

export interface QuantityOption {
  value: number;
  label: string; // shown on the second reel, e.g. "+1", "x3", "1/2 time"
}

export interface ModifierType {
  kind: ModifierKind;
  label: string; // shown on the first reel, e.g. "More Sets"
  description: string;
  quantities: QuantityOption[];
}

// The composed result once both reels have landed.
export interface Modifier {
  kind: ModifierKind;
  typeLabel: string;
  description: string;
  quantity: QuantityOption;
}

// Weighted so "No Bonus" stays the most common outcome and the rare/exciting
// ones (multiplied XP, golden) stay genuinely rare — same idea as a casino
// wheel where most segments are plain and a few are big. Each type carries
// its own pool of possible magnitudes, spun on the second reel once the
// first reel has landed on that type.
const MODIFIER_TYPES: { type: ModifierType; weight: number }[] = [
  {
    weight: 5,
    type: {
      kind: "none",
      label: "No Bonus",
      description: "Straight up, exactly as prescribed.",
      quantities: [{ value: 0, label: "as prescribed" }],
    },
  },
  {
    weight: 2,
    type: {
      kind: "addSet",
      label: "More Sets",
      description: "Extra set(s) added.",
      quantities: [
        { value: 1, label: "+1" },
        { value: 2, label: "+2" },
        { value: 3, label: "+3" },
      ],
    },
  },
  {
    weight: 2,
    type: {
      kind: "removeSet",
      label: "Fewer Sets",
      description: "Set(s) trimmed off — a lighter round.",
      quantities: [
        { value: 1, label: "-1" },
        { value: 2, label: "-2" },
      ],
    },
  },
  {
    weight: 2,
    type: {
      kind: "moreRest",
      label: "More Rest",
      description: "Extra recovery time between sets.",
      quantities: [
        { value: 15, label: "+15s" },
        { value: 30, label: "+30s" },
        { value: 45, label: "+45s" },
      ],
    },
  },
  {
    weight: 2,
    type: {
      kind: "lessRest",
      label: "Less Rest",
      description: "Tighter recovery — keeps the pace up.",
      quantities: [
        { value: 10, label: "-10s" },
        { value: 15, label: "-15s" },
        { value: 20, label: "-20s" },
      ],
    },
  },
  {
    weight: 2,
    type: {
      kind: "moreEffort",
      label: "Bonus Effort",
      description: "Push a bit further than prescribed.",
      quantities: [
        { value: 2, label: "+2 reps" },
        { value: 5, label: "+5s hold" },
        { value: 3, label: "+3 reps" },
      ],
    },
  },
  {
    weight: 2,
    type: {
      kind: "lessEffort",
      label: "Easy Mode",
      description: "Ease off a little from what's prescribed.",
      quantities: [
        { value: 2, label: "-2 reps" },
        { value: 1, label: "1/2 time" },
        { value: 5, label: "-5s hold" },
      ],
    },
  },
  {
    weight: 2,
    type: {
      kind: "flatXp",
      label: "Bonus XP",
      description: "A flat XP top-up just for landing this.",
      quantities: [
        { value: 5, label: "+5 XP" },
        { value: 10, label: "+10 XP" },
        { value: 20, label: "+20 XP" },
      ],
    },
  },
  {
    weight: 1,
    type: {
      kind: "xpMultiplier",
      label: "Multiplied XP",
      description: "This one's worth several times the XP.",
      quantities: [
        { value: 2, label: "x2" },
        { value: 3, label: "x3" },
        { value: 5, label: "x5" },
      ],
    },
  },
  {
    weight: 1,
    type: {
      kind: "golden",
      label: "🌟 Golden Exercise",
      description: "Pure bonus — massive XP, no downside.",
      quantities: [{ value: 2, label: "everything x2" }],
    },
  },
];

export function weightedModifierTypeList(): ModifierType[] {
  const list: ModifierType[] = [];
  for (const { type, weight } of MODIFIER_TYPES) {
    for (let i = 0; i < weight; i++) list.push(type);
  }
  return list;
}

export function pickRandomModifierType(): ModifierType {
  const list = weightedModifierTypeList();
  return list[Math.floor(Math.random() * list.length)];
}

export function pickRandomQuantity(type: ModifierType): QuantityOption {
  const options = type.quantities;
  return options[Math.floor(Math.random() * options.length)];
}

export function composeModifier(type: ModifierType, quantity: QuantityOption): Modifier {
  return { kind: type.kind, typeLabel: type.label, description: type.description, quantity };
}

export function applyModifier(exercise: Exercise, modifier: Modifier): Exercise {
  const q = modifier.quantity.value;
  switch (modifier.kind) {
    case "addSet":
      return { ...exercise, detail: adjustDetail(exercise.detail, q) };
    case "removeSet":
      return { ...exercise, detail: adjustDetail(exercise.detail, -q) };
    case "moreRest":
      return { ...exercise, restSeconds: exercise.restSeconds + q };
    case "lessRest":
      return { ...exercise, restSeconds: Math.max(10, exercise.restSeconds - q) };
    case "moreEffort":
      return {
        ...exercise,
        cue: [exercise.cue, `Bonus effort: aim for ${modifier.quantity.label} beyond what's written.`]
          .filter(Boolean)
          .join(" "),
      };
    case "lessEffort":
      return {
        ...exercise,
        cue: [exercise.cue, `Easy mode: ${modifier.quantity.label} is plenty today.`].filter(Boolean).join(" "),
      };
    default:
      return exercise;
  }
}

// The multiplier applied to the base XP award.
export function modifierXpMultiplier(modifier: Modifier): number {
  if (modifier.kind === "golden") return modifier.quantity.value;
  if (modifier.kind === "xpMultiplier") return modifier.quantity.value;
  return 1;
}

// A flat XP amount added on top, before the multiplier.
export function modifierFlatXpBonus(modifier: Modifier): number {
  if (modifier.kind === "flatXp") return modifier.quantity.value;
  return 0;
}

// Flat lists (one entry per type/quantity, unweighted) used purely for the
// cycling visual on the two reels — the actual winner is chosen separately
// via the weighted pickers above.
export const ALL_MODIFIER_TYPES: ModifierType[] = MODIFIER_TYPES.map((m) => m.type);
export const ALL_QUANTITY_LABELS: string[] = Array.from(
  new Set(MODIFIER_TYPES.flatMap((m) => m.type.quantities.map((q) => q.label)))
);
