import { Exercise, StagedSkillKey, TrainingEquipment, AdvancedSkill } from "./types";
import { STAGE_ORDER } from "./stageOrder";
import {
  FRONT_LEVER_TABLE,
  BACK_LEVER_TABLE,
  PLANCHE_TABLE,
  HUMAN_FLAG_TABLE,
  CORE_TABLE,
  muscleUpStageTable,
  handstandStageTable,
  legsStageTable,
} from "./trainingData";
import { advancedSkillTable } from "./advancedSkills";

const CORE_SKILLS: StagedSkillKey[] = [
  "frontLever", "backLever", "planche", "muscleUp", "handstand", "humanFlag", "pistolSquat", "lSit",
];

const ADVANCED_SKILLS: AdvancedSkill[] = [
  "ironCross", "maltese", "oneArmPullUp", "oneArmHandstand", "dragonFlag", "elbowLever",
  "oneArmPushUp", "nordicCurl", "shrimpSquat", "handstandPushUp", "impossibleDip", "manna",
  "clapPushUp", "kipUp", "backFlip", "frontFlip", "windmill", "aroundTheWorld", "handstandWalk",
  "wallWalk", "supermanHold", "sidePlank", "copenhagenPlank", "bridge", "turkishGetUp", "pikePress",
  "ropeClimb", "skinTheCat", "germanHang", "chestToBarPullUp", "wideGripPullUp", "ringMuscleUp",
  "ninetyDegreePushUp", "jumpPistol", "sissySquat", "cossackSquat", "flagPullUp", "lSitPullUp",
  "typewriterPullUp", "toesToBar", "invertedCross", "victorianCross",
];

// "General purpose" categories — not tied to a single tracked skill/stage,
// so they get their own hand-ordered easy-to-hard progressions instead.
export type HierarchyGroup = StagedSkillKey | "pullStrength" | "pushStrength";

function tableForSkill(skill: StagedSkillKey, equipment: TrainingEquipment): Record<string, Exercise[]> {
  switch (skill) {
    case "frontLever": return FRONT_LEVER_TABLE;
    case "backLever": return BACK_LEVER_TABLE;
    case "planche": return PLANCHE_TABLE;
    case "humanFlag": return HUMAN_FLAG_TABLE;
    case "lSit": return CORE_TABLE;
    case "muscleUp": return muscleUpStageTable(equipment);
    case "handstand": return handstandStageTable(equipment);
    case "pistolSquat": return legsStageTable(equipment);
    default: return advancedSkillTable(skill as AdvancedSkill);
  }
}

// Flattens a skill's stage table into ONE ordered easy-to-hard list —
// every stage in order, and within a stage, the table's own listed order
// (these were authored foundational-drill-first, harder-variant-last, so
// that order already carries real difficulty information, not just
// grouping). This is the actual hierarchy a "can't do this" swap or a
// whole-session difficulty change steps through, one rung at a time,
// rather than jumping a whole stage — which is what used to make "no
// easier found" so common even when a gentler option genuinely existed.
function skillHierarchy(skill: StagedSkillKey, equipment: TrainingEquipment): Exercise[] {
  const table = tableForSkill(skill, equipment);
  const order = STAGE_ORDER[skill] ?? [];
  const flat: Exercise[] = [];
  for (const stage of order) {
    for (const ex of table[stage] ?? []) flat.push(ex);
  }
  return flat;
}

function pullStrengthHierarchy(equipment: TrainingEquipment): Exercise[] {
  const list: Exercise[] = [
    { name: "Dead hangs", detail: "3 x max hold", restSeconds: 90, description: "Hang from a pull-up bar with straight arms and an active grip, holding for as long as you can without your shoulders fully collapsing." },
    { name: "Australian / inverted rows", detail: "3 x 10-12 reps", restSeconds: 90, description: "Lie under a low bar with your body straight and heels on the ground, then pull your chest up to the bar by driving your elbows back, and lower with control." },
    { name: "Negative pull-ups", detail: "3 x 4-5 reps, 4-5s descent", restSeconds: 90, description: "Jump or step up to the top pull-up position (chin over the bar), then lower yourself down as slowly as you can, aiming for a full 4-5 second descent." },
    { name: "Pull-ups", detail: "5 x max reps", restSeconds: 120, description: "From a dead hang, pull yourself up until your chin clears the bar, then lower back to a full hang with control." },
  ];
  if (equipment.rings) list.push({ name: "Ring rows (false grip)", detail: "3 x 8-10 reps", restSeconds: 90, description: "Set rings low, take a false grip (wrist over the top of the ring), and row your chest up toward the rings while keeping your body straight, then lower with control." });
  list.push(
    { name: "L-sit pull-ups", detail: "3 x 5 reps", restSeconds: 150, description: "Hold your legs out straight in front of you in an L-sit position and perform pull-ups without letting your legs drop, keeping your core engaged throughout." },
    { name: "Archer pull-ups", detail: "4 x 3-4 reps per side", restSeconds: 120, description: "Using a wide grip, pull yourself up toward one hand while keeping the other arm nearly straight out to the side, then alternate sides between reps." },
    { name: "Typewriter pull-ups", detail: "3 x 4-5 reps per side", restSeconds: 150, description: "Pull yourself up to the top of a wide-grip pull-up, then shift your whole body sideways from one hand to the other while staying at the top, like sliding along a typewriter carriage." },
    { name: "Tempo pull-ups (5s up, 3s hold, 5s down)", detail: "3 x 5 reps", restSeconds: 180, description: "Perform a pull-up taking a full 5 seconds to rise, pause and hold for 3 seconds at the top with your chin over the bar, then take 5 seconds to lower back down." }
  );
  if (equipment.weights) {
    list.push({ name: "Weighted pull-ups", detail: "4 x 4-5 reps (+15-20% bodyweight)", restSeconds: 180, description: "Attach extra weight via a dip belt, weighted vest, or held dumbbell, then perform standard pull-ups through a full range of motion." });
  }
  list.push(
    { name: "One-arm chin negatives (assisted)", detail: "4 x 2-3 reps per side", restSeconds: 150, description: "Starting at the top of a chin-up using mostly one arm (the other lightly assisting on a towel or the wrist), lower yourself down as slowly as possible under control." },
    { name: "Front lever pulls", detail: "3 x 4-5 reps", restSeconds: 150, description: "From a hanging front lever position (or the closest tuck/straddle variation you can hold), pull your chest toward the bar while keeping your body horizontal, then lower back to the hang." }
  );
  if (equipment.monkeyBars) {
    list.push({
      name: "Monkey bar traverse",
      detail: "3 x 1-2 laps",
      restSeconds: 90,
      cue: "Keep it continuous, don't rest mid-bar",
      description: "Swing hand over hand across a row of monkey bars without touching the ground, keeping a steady rhythm and letting your hips help drive momentum.",
    });
  }
  return list;
}

function pushStrengthHierarchy(equipment: TrainingEquipment): Exercise[] {
  if (equipment.parallelBars || equipment.rings) {
    const apparatus = equipment.rings && !equipment.parallelBars ? "Ring" : "Parallel bar";
    const list: Exercise[] = [
      { name: "Pike push-ups", detail: "3 x 8-10 reps", restSeconds: 75, description: "Start in a pike position with hips high and hands on the ground, then bend your elbows to lower your head toward the floor, and press back up." },
      { name: "Negative dips", detail: "3 x 5 reps, 4s descent", restSeconds: 90, description: "Support yourself at the top of a dip on bars or rings, then lower yourself as slowly as possible until your shoulders reach elbow height, taking about 4 seconds." },
      { name: `${apparatus} dips`, detail: "4 x max reps", restSeconds: 90, description: "Support yourself above parallel bars or rings with arms straight, then lower your body by bending your elbows until your shoulders are roughly level with them, and press back up." },
      { name: "Deficit dips (parallettes for extra ROM)", detail: "4 x 6-8 reps", restSeconds: 120, description: "Perform dips on raised parallettes or blocks so your hands start higher than a normal bar, allowing you to descend further than your shoulders for extra range of motion." },
      { name: "Slow-tempo dips", detail: "3 x 6 reps, 3s down / 3s up", restSeconds: 90, description: "Perform a standard dip but count a full 3 seconds on the way down and another 3 seconds pressing back up, staying controlled throughout." },
      { name: "Pseudo planche push-ups", detail: "3 x 8-10 reps", restSeconds: 90, description: "In a push-up position, lean your shoulders forward past your hands (fingers pointing toward your feet if comfortable) and perform push-ups from that forward-leaning position." },
    ];
    if (equipment.weights) {
      list.push({ name: "Weighted dips", detail: "4 x 5-6 reps (+15-20% bodyweight)", restSeconds: 150, description: "Attach extra weight via a dip belt or weighted vest, then perform standard dips through a full range of motion." });
    } else {
      list.push({ name: "Tempo dips (4s down, 2s up)", detail: "4 x 5-6 reps", restSeconds: 150, description: "Perform a dip taking 4 full seconds to lower and 2 seconds to press back up, keeping the movement smooth and controlled the whole way." });
    }
    list.push(
      { name: "Ring / bar support hold", detail: "3 x max hold", restSeconds: 90, description: "Support your body above rings or parallel bars with arms fully locked and shoulders depressed, holding the position as long as you can maintain good posture." },
      { name: "Planche push-ups", detail: "3 x 5 reps", restSeconds: 150, description: "Starting in a planche lean or tuck planche position (feet off the ground, shoulders well past your hands), bend your elbows to lower your chest and press back up without your feet touching down." }
    );
    return list;
  }
  return [
    { name: "Decline push-ups", detail: "3 x 8-10 reps", restSeconds: 90, description: "With your feet elevated on a step or bench, perform a push-up by bending your elbows to lower your chest toward the ground and pressing back up." },
    { name: "Push-ups", detail: "4 x max reps", restSeconds: 90, description: "Starting in a plank with hands under your shoulders, lower your chest toward the ground by bending your elbows, keeping your body in a straight line, then press back up." },
    { name: "Pike push-ups", detail: "3 x 8-10 reps", restSeconds: 75, description: "Start in a pike position with hips high and hands on the ground, then bend your elbows to lower your head toward the floor, and press back up." },
    { name: "Diamond push-ups", detail: "3 x 10-12 reps", restSeconds: 90, description: "Place your hands close together under your chest with thumbs and index fingers touching to form a diamond shape, then perform a push-up, keeping your elbows closer to your body." },
    { name: "Archer push-ups", detail: "4 x 5-6 reps per side", restSeconds: 90, description: "With hands set wide, lower your chest toward one hand while keeping the other arm nearly straight out to the side, then press back up and alternate sides." },
    { name: "Pseudo planche push-ups", detail: "3 x 8-10 reps", restSeconds: 90, description: "In a push-up position, lean your shoulders forward past your hands (fingers pointing toward your feet if comfortable) and perform push-ups from that forward-leaning position." },
  ];
}

function hierarchyFor(group: HierarchyGroup, equipment: TrainingEquipment): Exercise[] {
  if (group === "pullStrength") return pullStrengthHierarchy(equipment);
  if (group === "pushStrength") return pushStrengthHierarchy(equipment);
  return skillHierarchy(group, equipment);
}

// Warm-up and finisher exercises are generic conditioning, not part of any
// skill's difficulty hierarchy — shared by every difficulty control
// (whole-session feedback, "can't do this," "I'm tired") so none of them
// touch these two blocks. Matched against `TrainingSet.title`.
export const HIERARCHY_EXEMPT_SETS = new Set(["Warm-Up", "Final Hits"]);

interface ExerciseLocation {
  group: HierarchyGroup;
}

// Every equipment flag enabled — building the reverse index with maximal
// equipment means every *additive* variant name is covered. But a few
// hierarchies (push strength, chiefly) branch into a completely different,
// mutually-exclusive list depending on equipment rather than just adding
// one extra item — "all equipment on" alone would never see the floor-only
// branch. So the index is built by unioning across both equipment extremes.
const ALL_EQUIPMENT: TrainingEquipment = {
  pullUpBar: true, parallelBars: true, rings: true, wallSpace: true,
  verticalPole: true, monkeyBars: true, weights: true, resistanceBands: true,
};
const NO_EQUIPMENT: TrainingEquipment = {
  pullUpBar: false, parallelBars: false, rings: false, wallSpace: false,
  verticalPole: false, monkeyBars: false, weights: false, resistanceBands: false,
};

let index: Map<string, ExerciseLocation> | null = null;

function buildIndex(): Map<string, ExerciseLocation> {
  const map = new Map<string, ExerciseLocation>();
  const groups: HierarchyGroup[] = [...CORE_SKILLS, ...ADVANCED_SKILLS, "pullStrength", "pushStrength"];
  for (const group of groups) {
    for (const equipmentPreset of [ALL_EQUIPMENT, NO_EQUIPMENT]) {
      for (const ex of hierarchyFor(group, equipmentPreset)) {
        // first hierarchy to claim a name wins — a handful of generic drill
        // names legitimately appear in more than one list; best-effort match
        if (!map.has(ex.name)) map.set(ex.name, { group });
      }
    }
  }
  return map;
}

function getIndex(): Map<string, ExerciseLocation> {
  if (!index) index = buildIndex();
  return index;
}

export function findExerciseGroup(name: string): HierarchyGroup | null {
  return getIndex().get(name)?.group ?? null;
}

function locateInHierarchy(
  name: string,
  equipment: TrainingEquipment
): { list: Exercise[]; index: number } | null {
  const group = findExerciseGroup(name);
  if (!group) return null;
  const list = hierarchyFor(group, equipment);
  const idx = list.findIndex((e) => e.name === name);
  if (idx === -1) return null;
  return { list, index: idx };
}

// One rung easier — not a whole stage down, the very next exercise back in
// the flattened hierarchy. Returns null only when the exercise isn't in
// any hierarchy at all, or is already the very first (easiest) rung.
export function findEasierExercise(currentName: string, equipment: TrainingEquipment): Exercise | null {
  const loc = locateInHierarchy(currentName, equipment);
  if (!loc || loc.index <= 0) return null;
  return loc.list[loc.index - 1];
}

// The symmetric step up, for "today's session feels too easy."
export function findHarderExercise(currentName: string, equipment: TrainingEquipment): Exercise | null {
  const loc = locateInHierarchy(currentName, equipment);
  if (!loc || loc.index >= loc.list.length - 1) return null;
  return loc.list[loc.index + 1];
}
