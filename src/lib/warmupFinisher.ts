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
  { name: "Wrist circles & stretch", detail: "2 x 10 each direction", restSeconds: 15, areas: ["wrists"], description: "Rotate your wrists through their full range, then interlace fingers and gently push palms away from you, and pull the back of one hand down with the other to stretch the top and underside of the wrist." },
  { name: "Wrist push-up rocks (flexor/extensor prep)", detail: "2 x 10", restSeconds: 15, areas: ["wrists"], description: "In a push-up position, rock your weight forward and back over your hands, then rotate to rock side to side on your knuckles and on the backs of your hands, loading the wrist through several angles." },
  { name: "Arm circles", detail: "2 x 15 each direction", restSeconds: 15, areas: ["shoulders"], description: "Extend your arms out to your sides and draw slow, controlled circles, starting small and gradually making them larger, then reverse direction." },
  { name: "Shoulder dislocates (band or stick)", detail: "2 x 10", restSeconds: 20, areas: ["shoulders", "thoracic"], description: "Hold a band or stick with a wide overhand grip in front of you, and with straight arms, raise it overhead and continue the arc down behind your back, then reverse — widen your grip if your shoulders can't stay straight through the movement." },
  { name: "Scapula pulls (hang or support)", detail: "2 x 10", restSeconds: 30, areas: ["scapula", "shoulders", "grip"], description: "Hang from a bar with straight arms, then without bending your elbows, pull your shoulder blades down and together to raise your body slightly, and let them spread back out to lower — the arms stay locked the whole time." },
  { name: "Band pull-aparts (or arm swings)", detail: "2 x 15", restSeconds: 20, areas: ["scapula", "shoulders"], description: "Hold a light resistance band with both hands at shoulder height and pull it apart by driving your shoulder blades together, then return with control; without a band, swing both arms out to the sides and back across your chest." },
  { name: "Prone Y-T-W raises (light)", detail: "2 x 8 each position", restSeconds: 20, areas: ["scapula", "shoulders"], description: "Lying face-down, raise your arms slightly off the ground into a Y shape overhead, then a T shape out to the sides, then a W with elbows bent close to your ribs — squeezing your shoulder blades at the top of each." },
  { name: "Dead hang", detail: "2 x 15-20s", restSeconds: 30, areas: ["shoulders", "scapula", "grip", "wrists"], description: "Hang from a pull-up bar with straight arms and relaxed shoulders, letting your body weight gently decompress your spine and stretch your shoulders and grip." },
  { name: "Cat-cow spinal rocks", detail: "2 x 10", restSeconds: 15, areas: ["thoracic", "core"], description: "On hands and knees, alternate between arching your back up toward the ceiling (rounding through the spine, chin tucked) and dropping your belly down while lifting your chest and tailbone (arching the spine)." },
  { name: "Thoracic spine rotations (quadruped)", detail: "2 x 8 each side", restSeconds: 15, areas: ["thoracic"], description: "On hands and knees, place one hand behind your head and rotate your elbow down toward the opposite arm, then open back up and rotate your chest toward the ceiling, following the movement with your eyes." },
  { name: "Chest opener doorway stretch", detail: "2 x 20-30s", restSeconds: 15, areas: ["chest", "shoulders"], description: "Place your forearm on a doorframe or pole with your elbow at roughly shoulder height, then gently step or lean forward until you feel a stretch across the front of your shoulder and chest." },
  { name: "Passive shoulder hang stretch", detail: "2 x 15-20s", restSeconds: 20, areas: ["shoulders", "wrists"], description: "Hang from a bar and let your shoulders relax fully upward toward your ears without actively pulling, allowing gravity to open up the shoulder joint." },
  { name: "Hip circles", detail: "2 x 10 each direction", restSeconds: 15, areas: ["hips"], description: "Standing on one leg, lift the other knee and draw slow circles with it, opening the hip out to the side and back, then reverse direction; repeat on the other leg." },
  { name: "Leg swings", detail: "2 x 10 each leg", restSeconds: 15, areas: ["hips", "hamstrings"], description: "Holding onto something for balance, swing one leg forward and back in a controlled arc, gradually increasing the range, then switch to swinging it side to side across your body." },
  { name: "World's greatest stretch", detail: "2 x 5 each side", restSeconds: 20, areas: ["hips", "thoracic", "hamstrings"], description: "From a deep forward lunge, plant both hands inside your front foot, drop your back knee if needed, then rotate your torso and reach one arm toward the ceiling, following it with your eyes before switching sides." },
  { name: "Couch stretch (hip flexor)", detail: "2 x 20-30s each side", restSeconds: 20, areas: ["hips"], description: "Kneel in front of a couch or wall with your back foot propped up behind you (shin vertical), then bring your torso upright and squeeze the glute on that side until you feel a stretch down the front of the hip." },
  { name: "Ankle circles & calf raises", detail: "2 x 10 each", restSeconds: 15, areas: ["ankles"], description: "Rotate each ankle slowly through its full range in both directions, then stand and rise onto the balls of your feet and lower back down with control." },
  { name: "Bodyweight squats", detail: "2 x 12", restSeconds: 20, areas: ["hips", "ankles", "general"], description: "Stand with feet shoulder-width apart and squat down by bending your hips and knees together, keeping your chest up and heels on the ground, then stand back up." },
  { name: "Hollow body activation hold", detail: "2 x 15-20s", restSeconds: 20, areas: ["core"], description: "Lying on your back, press your lower back into the floor and lift your shoulders and legs slightly off the ground, forming a shallow curve — hold without letting your back arch." },
  { name: "Jumping jacks", detail: "2 x 30s", restSeconds: 20, areas: ["general"], description: "Jump your feet out wide while raising your arms overhead, then jump back to the starting position with arms at your sides, repeating at a steady rhythm." },
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
  { name: "Burpees", detail: "3 x 10", restSeconds: 45, description: "From standing, drop into a squat, kick your feet back into a plank, do a push-up, jump your feet back to your hands, then explode upward into a jump." },
  { name: "Mountain climbers", detail: "3 x 20 (10 per side)", restSeconds: 30, description: "In a plank position, drive one knee toward your chest and back, then quickly alternate legs at a running pace while keeping your hips low and core braced." },
  { name: "Hollow body rocks", detail: "3 x 15", restSeconds: 30, description: "Hold a hollow body position (lower back pressed down, shoulders and legs slightly raised) and rock gently forward and back along your spine without losing the shape." },
  { name: "Jump squats", detail: "3 x 10", restSeconds: 30, description: "Squat down as in a bodyweight squat, then explode upward into a jump, landing softly back into the squat position to absorb the impact." },
  { name: "Plank to push-up", detail: "3 x 10", restSeconds: 30, description: "Starting in a forearm plank, press up one arm at a time into a push-up (high plank) position, then lower back down one arm at a time to forearms." },
  { name: "High knees", detail: "3 x 30s", restSeconds: 30, description: "Run in place, driving your knees up toward your chest as high and quickly as you can while pumping your arms." },
];

const RING_FINISHER: Exercise = { name: "Ring support hold burnout", detail: "3 x max hold", restSeconds: 45, description: "Support yourself above a set of rings with arms straight and rings turned out slightly, holding the position for as long as you can maintain good form." };
const BAR_FINISHER: Exercise = { name: "Max-rep pull-ups", detail: "2 x max reps", restSeconds: 60, description: "From a dead hang, pull yourself up until your chin clears the bar, then lower back to a full hang with control, repeating for as many clean reps as you can." };

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
