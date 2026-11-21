import { exerciseEffort } from "./effort";
import { exerciseArea, type Area } from "./compare";

// ---------------------------------------------------------------------------
// A cool-down after training: which muscles the session worked hardest, and
// a few stretches for them. Each exercise loads some muscles (read from its
// name, falling back on its muscle group); the load is weighted by how much
// work the exercise was (effort.ts). The stretches are picked to cover the
// most-worked muscles first, 4–6 of them, a few minutes in all.
// ---------------------------------------------------------------------------

export type Muscle =
  | "lats"
  | "chest"
  | "shoulders"
  | "triceps"
  | "biceps"
  | "wrists"
  | "core"
  | "lowerBack"
  | "hipFlexors"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves";

export const MUSCLE_LABEL: Record<Muscle, string> = {
  lats: "Lats & upper back",
  chest: "Chest",
  shoulders: "Shoulders",
  triceps: "Triceps",
  biceps: "Biceps & forearms",
  wrists: "Wrists",
  core: "Core",
  lowerBack: "Lower back",
  hipFlexors: "Hip flexors",
  quads: "Quads",
  hamstrings: "Hamstrings",
  glutes: "Glutes",
  calves: "Calves",
};

type Load = Partial<Record<Muscle, number>>;

// first matching rule wins; hands-on-the-floor work adds wrist load after
const RULES: [RegExp, Load][] = [
  [/front lever/, { lats: 1, core: 0.8, biceps: 0.4 }],
  [/back lever|skin the cat|german hang/, { chest: 0.8, shoulders: 0.9, biceps: 0.7 }],
  [/human flag|flag pull|flag raises|pole/, { lats: 1, shoulders: 0.8, core: 0.8 }],
  [/iron cross|maltese|cross pull|victorian|inverted cross/, { chest: 0.8, lats: 0.8, biceps: 0.8, shoulders: 0.6 }],
  [/muscle-?up/, { lats: 1, chest: 0.6, triceps: 0.6, biceps: 0.6 }],
  [/toes-to-bar|leg raises|knee raises|windshield|around the world/, { core: 1, hipFlexors: 0.8, lats: 0.4, biceps: 0.3 }],
  [/pull-?up|chin|row|hang|pull-down|rope|typewriter|monkey/, { lats: 1, biceps: 0.8, shoulders: 0.3 }],
  [/planche/, { shoulders: 1, wrists: 0.8, chest: 0.5, core: 0.6 }],
  [/handstand|hspu|pike|wall walk|press to/, { shoulders: 1, triceps: 0.6, wrists: 0.7 }],
  [/dip/, { chest: 1, triceps: 0.9, shoulders: 0.6 }],
  [/push-?up|bench press/, { chest: 1, triceps: 0.7, shoulders: 0.5 }],
  [/l-sit|v-sit|tuck sit|manna/, { core: 0.8, hipFlexors: 1, triceps: 0.4, hamstrings: 0.3 }],
  [/dragon flag|hollow|plank|crunch|sit-?up|ab wheel|elbow lever|turkish/, { core: 1, shoulders: 0.3 }],
  [/superman|back extension|arch/, { lowerBack: 1, glutes: 0.4 }],
  [/bridge|hip thrust/, { glutes: 0.8, lowerBack: 0.5, hamstrings: 0.5 }],
  [/nordic|hamstring|glute-ham/, { hamstrings: 1, glutes: 0.4 }],
  [/pistol|shrimp|sissy|squat|lunge|step-?up|cossack/, { quads: 1, glutes: 0.8, hamstrings: 0.3, calves: 0.3 }],
  [/calf|jump|hop|flip|sprint|burpee/, { calves: 0.8, quads: 0.6, glutes: 0.4 }],
];

const HANDS_DOWN = /push-?up|planche|handstand|hspu|l-sit|elbow lever|plank|pike|crow|frog|bear|tuck sit|v-sit|manna|wall walk/;

const BY_AREA: Record<Area, Load> = {
  pull: { lats: 1, biceps: 0.7 },
  push: { chest: 0.8, triceps: 0.8, shoulders: 0.6 },
  statics: { lats: 0.7, shoulders: 0.7, core: 0.7 },
  balance: { shoulders: 1, wrists: 0.7 },
  core: { core: 1, hipFlexors: 0.5 },
  legs: { quads: 1, glutes: 0.8, hamstrings: 0.4 },
  mobility: { lowerBack: 0.4, hipFlexors: 0.4, shoulders: 0.4 },
};

export function exerciseMuscles(name: string): Load {
  const n = name.toLowerCase().replace(/^skill check:\s*/, "");
  const rule = RULES.find(([re]) => re.test(n));
  const load: Load = { ...(rule ? rule[1] : BY_AREA[exerciseArea(name)]) };
  if (HANDS_DOWN.test(n)) load.wrists = Math.max(load.wrists ?? 0, 0.6);
  return load;
}

export interface DoneExercise {
  name: string;
  detail?: string;
  setTitle?: string;
  setsDone?: number;
}

// How much each muscle was worked, as shares that add up to 1
export function sessionLoad(exercises: DoneExercise[]): Load {
  const total: Load = {};
  for (const e of exercises) {
    if (/^warm-?up$/i.test(e.setTitle ?? "")) continue;
    const effort = exerciseEffort({ name: e.name, detail: e.detail ?? "3 x 8" }, e.setTitle ?? "", e.setsDone);
    for (const [m, w] of Object.entries(exerciseMuscles(e.name)) as [Muscle, number][]) total[m] = (total[m] ?? 0) + w * effort;
  }
  const sum = Object.values(total).reduce((a, b) => a + (b ?? 0), 0);
  if (!sum) return {};
  return Object.fromEntries(Object.entries(total).map(([m, v]) => [m, (v ?? 0) / sum])) as Load;
}

export const topMuscles = (load: Load, n = 3) =>
  (Object.entries(load) as [Muscle, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([m]) => m);

// ---- the stretches ----

export interface Stretch {
  id: string;
  name: string; // stays English, like exercise names
  detail: string; // for the timer: "1 x 30s" or "2 x 30s" (one per side)
  perSide: boolean;
  targets: Muscle[];
  how: string; // English; Italian in phrases.it.ts
}

export const STRETCHES: Stretch[] = [
  { id: "child-reach", name: "Child's pose side reach", detail: "2 x 30s", perSide: true, targets: ["lats", "lowerBack", "shoulders"], how: "Kneel, sit back on your heels and walk both hands to one side until you feel the opposite side of your back open up. Breathe into it." },
  { id: "thread-needle", name: "Thread the needle", detail: "2 x 30s", perSide: true, targets: ["lats", "shoulders"], how: "On all fours, slide one arm under your body along the floor and rest that shoulder and ear down. Keep your hips over your knees." },
  { id: "doorway-chest", name: "Wall chest stretch", detail: "2 x 30s", perSide: true, targets: ["chest", "shoulders", "biceps"], how: "Put your forearm on a wall, post or bar upright, elbow at shoulder height, and turn your body gently away until the front of the chest stretches." },
  { id: "cross-body", name: "Cross-body shoulder stretch", detail: "2 x 30s", perSide: true, targets: ["shoulders", "lats"], how: "Bring one straight arm across your chest and hold it near the elbow with the other hand. Keep the shoulder down, away from your ear." },
  { id: "overhead-triceps", name: "Overhead triceps stretch", detail: "2 x 30s", perSide: true, targets: ["triceps", "lats"], how: "Reach one hand down your back between the shoulder blades and press the elbow gently back with the other hand." },
  { id: "biceps-wall", name: "Biceps wall stretch", detail: "2 x 30s", perSide: true, targets: ["biceps", "chest"], how: "Put your palm flat on a wall behind you at shoulder height, arm straight and thumb up, and turn your chest away slowly." },
  { id: "wrist-flexor", name: "Wrist flexor stretch", detail: "1 x 30s", perSide: false, targets: ["wrists", "biceps"], how: "Kneel with palms on the floor, fingers pointing back toward your knees. Lean back gently until you feel the inside of the forearms." },
  { id: "wrist-extensor", name: "Wrist extensor stretch", detail: "1 x 30s", perSide: false, targets: ["wrists"], how: "Kneel and place the backs of your hands on the floor, fingers toward your knees. Lean back a little; keep it gentle." },
  { id: "sphinx", name: "Sphinx stretch", detail: "1 x 40s", perSide: false, targets: ["core", "hipFlexors"], how: "Lie on your stomach and prop yourself on your forearms, hips on the floor. Lengthen the front of your body and relax your glutes." },
  { id: "kneeling-hip", name: "Kneeling hip flexor stretch", detail: "2 x 30s", perSide: true, targets: ["hipFlexors", "quads"], how: "Half-kneel, squeeze the glute of the back leg and shift your hips forward until the front of that hip stretches. Stay tall." },
  { id: "standing-quad", name: "Standing quad stretch", detail: "2 x 30s", perSide: true, targets: ["quads", "hipFlexors"], how: "Stand on one leg, hold the other ankle behind you and bring the heel toward your glute, knees together. Hold a pole for balance." },
  { id: "forward-fold", name: "Seated forward fold", detail: "1 x 40s", perSide: false, targets: ["hamstrings", "lowerBack"], how: "Sit with legs straight, hinge forward from the hips and reach toward your feet. Bend your knees a little if your back rounds a lot." },
  { id: "figure-four", name: "Figure-four stretch", detail: "2 x 30s", perSide: true, targets: ["glutes", "lowerBack"], how: "Lie on your back, cross one ankle over the other knee and pull the bottom thigh toward you until the glute of the crossed leg stretches." },
  { id: "knees-chest", name: "Knees to chest", detail: "1 x 30s", perSide: false, targets: ["lowerBack", "glutes"], how: "Lie on your back, hug both knees to your chest and rock gently side to side." },
  { id: "supine-twist", name: "Supine twist", detail: "2 x 30s", perSide: true, targets: ["lowerBack", "core", "glutes"], how: "Lie on your back, drop both knees to one side and look the other way, shoulders on the floor." },
  { id: "calf-wall", name: "Calf stretch", detail: "2 x 30s", perSide: true, targets: ["calves", "hamstrings"], how: "Hands on a wall or pole, one foot back with the heel down and the leg straight. Lean in until the calf stretches." },
];

export interface CoolDown {
  stretches: (Stretch & { for: Muscle[] })[];
  minutes: number;
  focus: Muscle[]; // the most-worked muscles
}

// Greedy cover: each pick is the stretch that reaches the most load still
// uncovered; stop when most of the session is covered (4–6 stretches).
export function planCoolDown(exercises: DoneExercise[]): CoolDown | null {
  const load = sessionLoad(exercises);
  if (!Object.keys(load).length) return null;
  const left: Load = { ...load };
  const picked: CoolDown["stretches"] = [];
  const covered = () => 1 - Object.values(left).reduce((a, b) => a + (b ?? 0), 0);
  while (picked.length < 6 && (picked.length < 4 || covered() < 0.85)) {
    let best: Stretch | null = null;
    let bestGain = 0;
    for (const s of STRETCHES) {
      if (picked.some((p) => p.id === s.id)) continue;
      const gain = s.targets.reduce((a, m, i) => a + (left[m] ?? 0) * (i === 0 ? 1 : 0.6), 0);
      if (gain > bestGain) {
        best = s;
        bestGain = gain;
      }
    }
    if (!best || bestGain < 0.01) break;
    const hits = best.targets.filter((m) => (left[m] ?? 0) > 0);
    picked.push({ ...best, for: hits });
    for (const m of best.targets) left[m] = (left[m] ?? 0) * 0.25; // mostly covered now
  }
  // sessions with hands on the floor always get a wrist stretch
  if ((load.wrists ?? 0) > 0.05 && !picked.some((p) => p.targets[0] === "wrists")) {
    const w = STRETCHES.find((s) => s.id === "wrist-flexor")!;
    picked.push({ ...w, for: ["wrists"] });
  }
  const seconds = picked.reduce((a, s) => a + (s.perSide ? 70 : 40), 0);
  return { stretches: picked, minutes: Math.max(3, Math.round(seconds / 60)), focus: topMuscles(load) };
}
