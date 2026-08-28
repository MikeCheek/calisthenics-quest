import { Exercise, TrainingEquipment, SkillTrack } from "./types";

// Every mobility drill tagged by which area(s) it actually opens up —
// warm-ups are picked by matching these against the day's focus, not
// drawn from one generic pool regardless of what's being trained.
type MobilityArea =
  | "wrists" | "shoulders" | "scapula" | "thoracic" | "chest"
  | "hips" | "hamstrings" | "ankles" | "grip" | "core" | "general";

interface MobilityDrill extends Exercise {
  areas: MobilityArea[];
}

export const MOBILITY_POOL: MobilityDrill[] = [
  { name: "Wrist circles & stretch", detail: "2 x 10 each direction", restSeconds: 15, areas: ["wrists"] },
  { name: "Wrist push-up rocks (flexor/extensor prep)", detail: "2 x 10", restSeconds: 15, areas: ["wrists"] },
  { name: "Arm circles", detail: "2 x 15 each direction", restSeconds: 15, areas: ["shoulders"] },
  { name: "Shoulder dislocates (band or stick)", detail: "2 x 10", restSeconds: 20, areas: ["shoulders", "thoracic"] },
  { name: "Scapula pulls (hang or support)", detail: "2 x 10", restSeconds: 30, areas: ["scapula", "shoulders", "grip"] },
  { name: "Band pull-aparts (or arm swings)", detail: "2 x 15", restSeconds: 20, areas: ["scapula", "shoulders"] },
  { name: "Prone Y-T-W raises (light)", detail: "2 x 8 each position", restSeconds: 20, areas: ["scapula", "shoulders"] },
  { name: "Dead hang", detail: "2 x 15-20s", restSeconds: 30, areas: ["shoulders", "scapula", "grip", "wrists"] },
  { name: "Cat-cow spinal rocks", detail: "2 x 10", restSeconds: 15, areas: ["thoracic", "core"] },
  { name: "Thoracic spine rotations (quadruped)", detail: "2 x 8 each side", restSeconds: 15, areas: ["thoracic"] },
  { name: "Chest opener doorway stretch", detail: "2 x 20-30s", restSeconds: 15, areas: ["chest", "shoulders"] },
  { name: "Passive shoulder hang stretch", detail: "2 x 15-20s", restSeconds: 20, areas: ["shoulders", "wrists"] },
  { name: "Hip circles", detail: "2 x 10 each direction", restSeconds: 15, areas: ["hips"] },
  { name: "Leg swings", detail: "2 x 10 each leg", restSeconds: 15, areas: ["hips", "hamstrings"] },
  { name: "World's greatest stretch", detail: "2 x 5 each side", restSeconds: 20, areas: ["hips", "thoracic", "hamstrings"] },
  { name: "Couch stretch (hip flexor)", detail: "2 x 20-30s each side", restSeconds: 20, areas: ["hips"] },
  { name: "Ankle circles & calf raises", detail: "2 x 10 each", restSeconds: 15, areas: ["ankles"] },
  { name: "Bodyweight squats", detail: "2 x 12", restSeconds: 20, areas: ["hips", "ankles", "general"] },
  { name: "Hollow body activation hold", detail: "2 x 15-20s", restSeconds: 20, areas: ["core"] },
  { name: "Jumping jacks", detail: "2 x 30s", restSeconds: 20, areas: ["general"] },
];

// Which areas actually matter for each day's focus — a couple of areas
// per track, not an exhaustive anatomy lesson, so the match stays sharp.
const FOCUS_AREAS: Record<SkillTrack, MobilityArea[]> = {
  frontLever: ["scapula", "shoulders", "hamstrings", "wrists"],
  backLever: ["shoulders", "thoracic", "chest", "scapula"],
  planche: ["wrists", "shoulders", "thoracic"],
  muscleUp: ["shoulders", "wrists", "thoracic", "scapula"],
  handstand: ["wrists", "shoulders", "thoracic"],
  humanFlag: ["shoulders", "core", "wrists"],
  pullStrength: ["scapula", "shoulders", "grip"],
  pushStrength: ["shoulders", "chest", "wrists"],
  legs: ["hips", "ankles", "hamstrings"],
  core: ["hips", "thoracic", "core"],
};

export const FINISHER_POOL: Exercise[] = [
  { name: "Burpees", detail: "3 x 10", restSeconds: 45 },
  { name: "Mountain climbers", detail: "3 x 20 (10 per side)", restSeconds: 30 },
  { name: "Hollow body rocks", detail: "3 x 15", restSeconds: 30 },
  { name: "Jump squats", detail: "3 x 10", restSeconds: 30 },
  { name: "Plank to push-up", detail: "3 x 10", restSeconds: 30 },
  { name: "High knees", detail: "3 x 30s", restSeconds: 30 },
];

const RING_FINISHER: Exercise = { name: "Ring support hold burnout", detail: "3 x max hold", restSeconds: 45 };
const BAR_FINISHER: Exercise = { name: "Max-rep pull-ups", detail: "2 x max reps", restSeconds: 60 };

// Simple deterministic string hash so the same day always gets the same
// warm-up/finisher pick (stable across re-renders) while still varying
// day to day.
function seededIndex(seed: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return h % mod;
}

// Picks warm-up drills by relevance to today's focus, not a flat generic
// pool — front lever day opens up scapula/shoulders/hamstrings, planche
// and handstand day lean hard on wrists, leg day gets hips/ankles, and so
// on. Rather than just ranking every drill by how many tagged areas it
// overlaps with the focus (which let multi-tagged generalist drills crowd
// out single-purpose specialists — wrist prep kept losing out to shoulder
// drills that only *also* touched wrists), this picks one drill per
// priority area in turn, matched against each drill's primary area (its
// first tag), so a planche/handstand warm-up is guaranteed to actually
// include dedicated wrist work rather than three shoulder-flavored drills
// that technically all score well. A date+focus seed still varies which
// specific drill covers each area day to day.
export function pickWarmup(dateISO: string, focus: SkillTrack, count = 3): Exercise[] {
  const areas = FOCUS_AREAS[focus] ?? [];
  const seed = seededIndex(dateISO + focus + "warmup", 9973);
  const picked: MobilityDrill[] = [];
  const used = new Set<string>();

  for (const area of areas.slice(0, count)) {
    const candidates = MOBILITY_POOL.filter((d) => d.areas[0] === area && !used.has(d.name));
    if (candidates.length === 0) continue;
    const choice = candidates[seed % candidates.length];
    picked.push(choice);
    used.add(choice.name);
  }

  if (picked.length < count) {
    const scored = MOBILITY_POOL.filter((d) => !used.has(d.name))
      .map((drill, i) => ({
        drill,
        score: drill.areas.filter((a) => areas.includes(a)).length,
        tie: (i + seed) % MOBILITY_POOL.length,
      }))
      .sort((a, b) => (b.score !== a.score ? b.score - a.score : a.tie - b.tie));
    for (const s of scored) {
      if (picked.length >= count) break;
      picked.push(s.drill);
      used.add(s.drill.name);
    }
  }

  return picked.slice(0, count).map((drill) => {
    const { areas: _areas, ...exercise } = drill;
    return exercise;
  });
}

export function pickFinisher(dateISO: string, equipment: TrainingEquipment): Exercise {
  const pool = [...FINISHER_POOL];
  if (equipment.rings) pool.push(RING_FINISHER);
  if (equipment.pullUpBar) pool.push(BAR_FINISHER);
  const idx = seededIndex(dateISO + "finisher", pool.length);
  return pool[idx];
}
