import {
  Exercise,
  IronCrossStage,
  MalteseStage,
  OneArmPullUpStage,
  OneArmHandstandStage,
  DragonFlagStage,
  ElbowLeverStage,
  OneArmPushUpStage,
  NordicCurlStage,
  ShrimpSquatStage,
  HandstandPushUpStage,
  ImpossibleDipStage,
  MannaStage,
  AdvancedSkill,
  ADVANCED_SKILL_LABEL,
  TrainingEquipment,
} from "./types";
import {
  CLAP_PUSHUP_TABLE,
  KIP_UP_TABLE,
  BACK_FLIP_TABLE,
  FRONT_FLIP_TABLE,
  WINDMILL_TABLE,
  AROUND_THE_WORLD_TABLE,
  HANDSTAND_WALK_TABLE,
  WALL_WALK_TABLE,
  SUPERMAN_HOLD_TABLE,
  SIDE_PLANK_TABLE,
  COPENHAGEN_PLANK_TABLE,
  BRIDGE_TABLE,
  TURKISH_GETUP_TABLE,
  PIKE_PRESS_TABLE,
  ROPE_CLIMB_TABLE,
  SKIN_THE_CAT_TABLE,
  GERMAN_HANG_TABLE,
  CHEST_TO_BAR_TABLE,
  WIDE_GRIP_PULLUP_TABLE,
  RING_MUSCLEUP_TABLE,
  NINETY_DEGREE_PUSHUP_TABLE,
  JUMP_PISTOL_TABLE,
  SISSY_SQUAT_TABLE,
  COSSACK_SQUAT_TABLE,
  FLAG_PULLUP_TABLE,
  LSIT_PULLUP_TABLE,
  TYPEWRITER_PULLUP_TABLE,
  TOES_TO_BAR_TABLE,
  INVERTED_CROSS_TABLE,
  VICTORIAN_CROSS_TABLE,
} from "./advancedSkills2";

// Equipment each advanced skill genuinely needs to be trainable at all.
// Empty array = bodyweight/floor only, always available.
export const ADVANCED_SKILL_EQUIPMENT: Partial<Record<AdvancedSkill, (keyof TrainingEquipment)[]>> = {
  ironCross: ["rings"],
  maltese: ["rings", "parallelBars"],
  oneArmPullUp: ["pullUpBar"],
  oneArmHandstand: ["wallSpace"],
  handstandPushUp: ["wallSpace"],
  impossibleDip: ["parallelBars", "rings", "pullUpBar"],
  handstandWalk: ["wallSpace"],
  wallWalk: ["wallSpace"],
  pikePress: ["wallSpace"],
  ringMuscleUp: ["rings"],
  windmill: ["pullUpBar"],
  aroundTheWorld: ["pullUpBar"],
  chestToBarPullUp: ["pullUpBar"],
  wideGripPullUp: ["pullUpBar"],
  flagPullUp: ["verticalPole"],
  lSitPullUp: ["pullUpBar"],
  typewriterPullUp: ["pullUpBar"],
  toesToBar: ["pullUpBar"],
  invertedCross: ["rings"],
  victorianCross: ["rings"],
  ropeClimb: ["pullUpBar", "verticalPole"],
};

export function advancedSkillAvailable(skill: AdvancedSkill, equipment: TrainingEquipment): boolean {
  const req = ADVANCED_SKILL_EQUIPMENT[skill];
  if (!req) return true;
  return req.some((key) => equipment[key]);
}

export const IRON_CROSS_TABLE: Record<IronCrossStage, Exercise[]> = {
  none: [
    { name: "Ring support hold", detail: "4 x max hold", restSeconds: 90 },
    { name: "Scapula depressions on rings", detail: "3 x 10", restSeconds: 60 },
    { name: "Straight-arm pull-downs (band)", detail: "3 x 12", restSeconds: 60 },
  ],
  support: [
    { name: "Ring support hold with turnout", detail: "4 x max hold", restSeconds: 90 },
    { name: "Ring pull-outs (support to inverted hang)", detail: "3 x 5 reps", restSeconds: 120 },
    { name: "Assisted cross negatives (feet on box)", detail: "3 x 4 reps, slow", restSeconds: 120 },
  ],
  tuckCross: [
    { name: "Tuck cross holds", detail: "4 x max hold", restSeconds: 120 },
    { name: "Tuck cross negatives", detail: "3 x 4 reps, slow", restSeconds: 120 },
    { name: "Cross pull-outs (support to slight turnout)", detail: "3 x 4 reps", restSeconds: 120 },
  ],
  full: [
    { name: "Full iron cross holds", detail: "5 x max attempt", restSeconds: 180 },
    { name: "Cross negatives from support", detail: "3 x 3 reps, slow", restSeconds: 180 },
    { name: "Cross press to support", detail: "3 x 3 reps", restSeconds: 180 },
  ],
};

export const MALTESE_TABLE: Record<MalteseStage, Exercise[]> = {
  none: [
    { name: "Planche lean progressions", detail: "4 x 15-20s", restSeconds: 90 },
    { name: "Ring/parallette support hold", detail: "4 x max hold", restSeconds: 90 },
    { name: "Pseudo planche push-ups", detail: "3 x 8", restSeconds: 90 },
  ],
  tuck: [
    { name: "Tuck maltese holds", detail: "4 x max hold", restSeconds: 120 },
    { name: "Tuck maltese push-ups", detail: "3 x 5", restSeconds: 120 },
    { name: "Tuck planche-to-maltese transitions", detail: "3 x 4 reps", restSeconds: 120 },
  ],
  straddle: [
    { name: "Straddle maltese holds", detail: "4 x max hold", restSeconds: 150 },
    { name: "Straddle maltese negatives", detail: "3 x 3 reps, slow", restSeconds: 150 },
    { name: "Straddle maltese presses", detail: "3 x 3 reps", restSeconds: 150 },
  ],
  full: [
    { name: "Full maltese holds", detail: "5 x max attempt", restSeconds: 180 },
    { name: "Maltese press attempts", detail: "3 x 3 reps", restSeconds: 180 },
    { name: "Maltese negatives from support", detail: "3 x 3 reps, slow", restSeconds: 180 },
  ],
};

export const ONE_ARM_PULLUP_TABLE: Record<OneArmPullUpStage, Exercise[]> = {
  none: [
    { name: "Deep archer pull-ups", detail: "4 x 3-4 reps per side", restSeconds: 120 },
    { name: "Typewriter pull-ups", detail: "3 x 4 reps per side", restSeconds: 120 },
    { name: "Uneven-grip pull-ups (towel assist)", detail: "3 x 4-5 reps", restSeconds: 120 },
  ],
  assisted: [
    { name: "Band-assisted one-arm pull-ups", detail: "4 x 3-4 reps per side", restSeconds: 120 },
    { name: "One-arm pull-up, other hand on wrist", detail: "3 x 3-4 reps per side", restSeconds: 120 },
    { name: "Weighted archer pull-ups", detail: "3 x 3 reps per side", restSeconds: 150 },
  ],
  negative: [
    { name: "One-arm negatives (5s+ descent)", detail: "4 x 2-3 reps per side", restSeconds: 150 },
    { name: "One-arm flexed-arm hangs", detail: "3 x max hold per side", restSeconds: 120 },
    { name: "Assisted one-arm pull-up (foot on box)", detail: "3 x 3 reps per side", restSeconds: 120 },
  ],
  full: [
    { name: "One-arm pull-ups", detail: "4 x 1-2 reps per side", restSeconds: 180 },
    { name: "One-arm pull-up cluster sets", detail: "3 x 3 reps per side, rest-pause", restSeconds: 180 },
    { name: "Weighted one-arm negatives", detail: "3 x 2 reps per side", restSeconds: 180 },
  ],
};

export const ONE_ARM_HANDSTAND_TABLE: Record<OneArmHandstandStage, Exercise[]> = {
  none: [
    { name: "Two-hand handstand weight shifts", detail: "4 x 30-40s", restSeconds: 90 },
    { name: "One-arm wall handstand shifts", detail: "3 x 10-15s per side", restSeconds: 90 },
    { name: "Planche-to-handstand shoulder prep", detail: "3 x 8", restSeconds: 75 },
  ],
  wall: [
    { name: "Wall one-arm handstand holds", detail: "4 x 8-12s per side", restSeconds: 90 },
    { name: "One-arm wall walks", detail: "3 x 3 reps", restSeconds: 90 },
    { name: "Handstand finger-release drills", detail: "3 x 6 reps per side", restSeconds: 75 },
  ],
  freestandingAttempts: [
    { name: "Freestanding one-arm attempts (spotted)", detail: "8 attempts", restSeconds: 90 },
    { name: "One-arm handstand brief lifts off wall", detail: "4 x 6 attempts", restSeconds: 90 },
    { name: "Handstand balance drills (finger releases)", detail: "3 x 8 reps per side", restSeconds: 75 },
  ],
  full: [
    { name: "Freestanding one-arm handstand holds", detail: "6 x max attempt per side", restSeconds: 150 },
    { name: "One-arm handstand presses", detail: "3 x 2-3 reps per side", restSeconds: 150 },
    { name: "One-arm handstand walk attempts", detail: "5 attempts", restSeconds: 120 },
  ],
};

export const DRAGON_FLAG_TABLE: Record<DragonFlagStage, Exercise[]> = {
  none: [
    { name: "Hollow body holds", detail: "4 x 30-40s", restSeconds: 60 },
    { name: "Reverse plank holds", detail: "3 x 30s", restSeconds: 60 },
    { name: "Lying leg raises", detail: "3 x 12", restSeconds: 60 },
  ],
  tuck: [
    { name: "Tuck dragon flag holds", detail: "4 x max hold", restSeconds: 90 },
    { name: "Tuck dragon flag negatives", detail: "3 x 5 reps, slow", restSeconds: 90 },
    { name: "Hip-to-shoulder rolls", detail: "3 x 8", restSeconds: 75 },
  ],
  straddle: [
    { name: "Straddle dragon flag holds", detail: "4 x max hold", restSeconds: 120 },
    { name: "Straddle dragon flag negatives", detail: "3 x 4 reps, slow", restSeconds: 120 },
    { name: "Straddle dragon flag raises", detail: "3 x 4 reps", restSeconds: 120 },
  ],
  full: [
    { name: "Full dragon flag holds", detail: "4 x max hold", restSeconds: 150 },
    { name: "Dragon flag negatives (full)", detail: "3 x 3-4 reps, slow", restSeconds: 150 },
    { name: "Dragon flag raises", detail: "3 x 3-4 reps", restSeconds: 150 },
  ],
};

export const ELBOW_LEVER_TABLE: Record<ElbowLeverStage, Exercise[]> = {
  none: [
    { name: "Crow stand holds", detail: "4 x max hold", restSeconds: 75 },
    { name: "Forearm plank holds", detail: "3 x 40-60s", restSeconds: 60 },
    { name: "Wrist and forearm mobility prep", detail: "3 x 30-45s", restSeconds: 45 },
  ],
  tuck: [
    { name: "Tuck elbow lever holds", detail: "4 x max hold", restSeconds: 90 },
    { name: "Tuck elbow lever balance shifts", detail: "3 x 20-30s", restSeconds: 75 },
    { name: "Elbow-lever entry drills", detail: "3 x 6 reps", restSeconds: 75 },
  ],
  straddle: [
    { name: "Straddle elbow lever holds", detail: "4 x max hold", restSeconds: 120 },
    { name: "Straddle elbow lever balance", detail: "3 x 20-30s", restSeconds: 90 },
    { name: "One-leg extensions from tuck", detail: "3 x 5 reps per side", restSeconds: 90 },
  ],
  full: [
    { name: "Full elbow lever holds", detail: "4 x max hold", restSeconds: 120 },
    { name: "Elbow lever presses", detail: "3 x 4 reps", restSeconds: 120 },
    { name: "Elbow lever to handstand attempts", detail: "4 attempts", restSeconds: 120 },
  ],
};

export const ONE_ARM_PUSHUP_TABLE: Record<OneArmPushUpStage, Exercise[]> = {
  none: [
    { name: "Archer push-ups", detail: "4 x 5-6 reps per side", restSeconds: 90 },
    { name: "Deep archer push-ups", detail: "3 x 4-5 reps per side", restSeconds: 90 },
    { name: "Diamond push-ups", detail: "3 x 10-12 reps", restSeconds: 75 },
  ],
  assisted: [
    { name: "One-arm push-ups (wide stance assist)", detail: "4 x 3-4 reps per side", restSeconds: 90 },
    { name: "Band-assisted one-arm push-ups", detail: "3 x 4-5 reps per side", restSeconds: 90 },
    { name: "Incline one-arm push-ups", detail: "3 x 5 reps per side", restSeconds: 90 },
  ],
  negative: [
    { name: "One-arm negatives (5s descent)", detail: "4 x 3 reps per side", restSeconds: 90 },
    { name: "One-arm push-up to knee", detail: "3 x 4 reps per side", restSeconds: 90 },
    { name: "Weighted archer push-ups", detail: "3 x 4 reps per side", restSeconds: 90 },
  ],
  full: [
    { name: "One-arm push-ups", detail: "4 x 3-5 reps per side", restSeconds: 120 },
    { name: "One-arm push-up cluster sets", detail: "3 x 5 reps per side, rest-pause", restSeconds: 120 },
    { name: "Deficit one-arm push-ups", detail: "3 x 3-4 reps per side", restSeconds: 120 },
  ],
};

export const NORDIC_CURL_TABLE: Record<NordicCurlStage, Exercise[]> = {
  none: [
    { name: "Glute-ham raises (band-assisted)", detail: "3 x 8", restSeconds: 75 },
    { name: "Hamstring bridges", detail: "3 x 12", restSeconds: 60 },
    { name: "Slow eccentric leg curls (partner-held feet)", detail: "3 x 6, slow", restSeconds: 75 },
  ],
  assisted: [
    { name: "Band-assisted Nordic curls", detail: "3 x 6-8 reps", restSeconds: 90 },
    { name: "Nordic curl negatives (partial ROM)", detail: "3 x 5 reps, slow", restSeconds: 90 },
    { name: "Partner-assisted Nordic curls", detail: "3 x 6 reps", restSeconds: 90 },
  ],
  negative: [
    { name: "Nordic curl negatives (full ROM, slow)", detail: "3 x 4-5 reps, slow", restSeconds: 120 },
    { name: "Nordic curl with push-up catch", detail: "3 x 4 reps", restSeconds: 120 },
    { name: "Weighted hamstring bridges", detail: "3 x 10", restSeconds: 75 },
  ],
  full: [
    { name: "Full Nordic curls", detail: "3 x 4-6 reps", restSeconds: 150 },
    { name: "Nordic curl to push-up", detail: "3 x 3-4 reps", restSeconds: 150 },
    { name: "Weighted Nordic curls", detail: "3 x 3-4 reps", restSeconds: 150 },
  ],
};

export const SHRIMP_SQUAT_TABLE: Record<ShrimpSquatStage, Exercise[]> = {
  none: [
    { name: "Assisted shrimp squats (hand support)", detail: "3 x 6 reps per side", restSeconds: 90 },
    { name: "Rear-foot-elevated split squats", detail: "3 x 8 reps per side", restSeconds: 90 },
    { name: "Single-leg RDLs", detail: "3 x 8 reps per side", restSeconds: 75 },
  ],
  assisted: [
    { name: "Shrimp squats (fingertip support)", detail: "3 x 5-6 reps per side", restSeconds: 90 },
    { name: "Shrimp squat negatives", detail: "3 x 5 reps per side, slow", restSeconds: 90 },
    { name: "Deficit split squats", detail: "3 x 8 reps per side", restSeconds: 90 },
  ],
  full: [
    { name: "Shrimp squats", detail: "4 x 5-6 reps per side", restSeconds: 120 },
    { name: "Weighted shrimp squats", detail: "3 x 4-5 reps per side", restSeconds: 120 },
    { name: "Shrimp squat to jump", detail: "3 x 5 reps per side", restSeconds: 90 },
  ],
};

export const HANDSTAND_PUSHUP_TABLE: Record<HandstandPushUpStage, Exercise[]> = {
  none: [
    { name: "Pike push-ups (elevated feet)", detail: "4 x 8-10 reps", restSeconds: 90 },
    { name: "Wall handstand holds", detail: "4 x 20-30s", restSeconds: 90 },
    { name: "Box HSPU (partial range)", detail: "3 x 6 reps", restSeconds: 90 },
  ],
  negative: [
    { name: "Wall HSPU negatives", detail: "4 x 4-5 reps, slow", restSeconds: 120 },
    { name: "Deficit pike push-ups", detail: "3 x 8 reps", restSeconds: 90 },
    { name: "Wall handstand shoulder taps", detail: "3 x 30-40s", restSeconds: 90 },
  ],
  wallFull: [
    { name: "Wall HSPU (full range)", detail: "4 x 5-6 reps", restSeconds: 120 },
    { name: "Wall HSPU cluster sets", detail: "3 x 6 reps, rest-pause", restSeconds: 120 },
    { name: "Weighted pike push-ups", detail: "3 x 6 reps", restSeconds: 120 },
  ],
  freestanding: [
    { name: "Freestanding HSPU", detail: "4 x 3-4 reps", restSeconds: 150 },
    { name: "Deficit freestanding HSPU", detail: "3 x 2-3 reps", restSeconds: 150 },
    { name: "HSPU to press handstand", detail: "3 x 2-3 reps", restSeconds: 150 },
  ],
};

export const IMPOSSIBLE_DIP_TABLE: Record<ImpossibleDipStage, Exercise[]> = {
  none: [
    { name: "Deep ring/bar dips", detail: "4 x 6-8 reps", restSeconds: 90 },
    { name: "Straight bar dips (full ROM)", detail: "3 x 8 reps", restSeconds: 90 },
    { name: "Weighted dips", detail: "3 x 6 reps", restSeconds: 120 },
  ],
  band: [
    { name: "Band-assisted impossible dips", detail: "3 x 4-5 reps", restSeconds: 120 },
    { name: "Impossible dip negatives (partial)", detail: "3 x 4 reps, slow", restSeconds: 120 },
    { name: "False-grip dip transitions", detail: "3 x 4 reps", restSeconds: 90 },
  ],
  negative: [
    { name: "Impossible dip negatives (full ROM)", detail: "3 x 3-4 reps, slow", restSeconds: 150 },
    { name: "Impossible dip from deficit", detail: "3 x 3 reps", restSeconds: 150 },
    { name: "Assisted impossible dip (foot support)", detail: "3 x 4 reps", restSeconds: 120 },
  ],
  full: [
    { name: "Impossible dips", detail: "4 x 2-3 reps", restSeconds: 180 },
    { name: "Weighted impossible dips", detail: "3 x 2 reps", restSeconds: 180 },
    { name: "Impossible dip cluster sets", detail: "3 x 3 reps, rest-pause", restSeconds: 180 },
  ],
};

export const MANNA_TABLE: Record<MannaStage, Exercise[]> = {
  none: [
    { name: "L-sit holds (extended time)", detail: "4 x max hold", restSeconds: 90 },
    { name: "Compression holds (knees to chest)", detail: "3 x 20-30s", restSeconds: 75 },
    { name: "Passive hamstring/hip flexibility drills", detail: "3 x 45-60s", restSeconds: 45 },
  ],
  vSit: [
    { name: "V-sit holds", detail: "4 x max hold", restSeconds: 90 },
    { name: "V-sit presses", detail: "3 x 4 reps", restSeconds: 120 },
    { name: "Pike compression holds", detail: "3 x 20-30s", restSeconds: 75 },
  ],
  straddle: [
    { name: "Straddle manna holds", detail: "4 x max hold", restSeconds: 120 },
    { name: "Straddle manna negatives", detail: "3 x 3 reps, slow", restSeconds: 150 },
    { name: "Straddle manna presses from V-sit", detail: "3 x 3 reps", restSeconds: 150 },
  ],
  full: [
    { name: "Full manna holds", detail: "4 x max attempt", restSeconds: 150 },
    { name: "Manna presses", detail: "3 x 2-3 reps", restSeconds: 180 },
    { name: "Manna negatives from support", detail: "3 x 3 reps, slow", restSeconds: 180 },
  ],
};

const ADVANCED_TABLES: Record<AdvancedSkill, Record<string, Exercise[]>> = {
  ironCross: IRON_CROSS_TABLE,
  maltese: MALTESE_TABLE,
  oneArmPullUp: ONE_ARM_PULLUP_TABLE,
  oneArmHandstand: ONE_ARM_HANDSTAND_TABLE,
  dragonFlag: DRAGON_FLAG_TABLE,
  elbowLever: ELBOW_LEVER_TABLE,
  oneArmPushUp: ONE_ARM_PUSHUP_TABLE,
  nordicCurl: NORDIC_CURL_TABLE,
  shrimpSquat: SHRIMP_SQUAT_TABLE,
  handstandPushUp: HANDSTAND_PUSHUP_TABLE,
  impossibleDip: IMPOSSIBLE_DIP_TABLE,
  manna: MANNA_TABLE,
  clapPushUp: CLAP_PUSHUP_TABLE,
  kipUp: KIP_UP_TABLE,
  backFlip: BACK_FLIP_TABLE,
  frontFlip: FRONT_FLIP_TABLE,
  windmill: WINDMILL_TABLE,
  aroundTheWorld: AROUND_THE_WORLD_TABLE,
  handstandWalk: HANDSTAND_WALK_TABLE,
  wallWalk: WALL_WALK_TABLE,
  supermanHold: SUPERMAN_HOLD_TABLE,
  sidePlank: SIDE_PLANK_TABLE,
  copenhagenPlank: COPENHAGEN_PLANK_TABLE,
  bridge: BRIDGE_TABLE,
  turkishGetUp: TURKISH_GETUP_TABLE,
  pikePress: PIKE_PRESS_TABLE,
  ropeClimb: ROPE_CLIMB_TABLE,
  skinTheCat: SKIN_THE_CAT_TABLE,
  germanHang: GERMAN_HANG_TABLE,
  chestToBarPullUp: CHEST_TO_BAR_TABLE,
  wideGripPullUp: WIDE_GRIP_PULLUP_TABLE,
  ringMuscleUp: RING_MUSCLEUP_TABLE,
  ninetyDegreePushUp: NINETY_DEGREE_PUSHUP_TABLE,
  jumpPistol: JUMP_PISTOL_TABLE,
  sissySquat: SISSY_SQUAT_TABLE,
  cossackSquat: COSSACK_SQUAT_TABLE,
  flagPullUp: FLAG_PULLUP_TABLE,
  lSitPullUp: LSIT_PULLUP_TABLE,
  typewriterPullUp: TYPEWRITER_PULLUP_TABLE,
  toesToBar: TOES_TO_BAR_TABLE,
  invertedCross: INVERTED_CROSS_TABLE,
  victorianCross: VICTORIAN_CROSS_TABLE,
};

export function advancedSkillTable(skill: AdvancedSkill): Record<string, Exercise[]> {
  return ADVANCED_TABLES[skill];
}

export function advancedSkillExercises(skill: AdvancedSkill, stage: string): Exercise[] {
  return ADVANCED_TABLES[skill][stage] ?? [];
}

export function allAdvancedSkillExercises(skill: AdvancedSkill): Exercise[] {
  return Object.values(ADVANCED_TABLES[skill]).flat();
}

// If the athlete has any advanced skill past "none" (and the equipment for
// it), surface one as a bonus block in the day's session — deterministic
// per day so it doesn't flicker between re-renders, rotating across
// whichever advanced skills are actively in progress.
export function advancedSkillBonusSet(
  skills: import("./types").SkillProfile,
  equipment: TrainingEquipment,
  dateISO: string
): import("./types").TrainingSet | null {
  const allSkills = Object.keys(ADVANCED_TABLES) as AdvancedSkill[];
  const active = allSkills.filter(
    (s) => skills[s] !== "none" && advancedSkillAvailable(s, equipment)
  );
  if (active.length === 0) return null;

  let h = 0;
  for (let i = 0; i < dateISO.length; i++) h = (h * 31 + dateISO.charCodeAt(i)) >>> 0;
  const skill = active[h % active.length];
  const stage = skills[skill] as string;
  const exercises = advancedSkillExercises(skill, stage).slice(0, 2);
  if (exercises.length === 0) return null;

  return {
    track: "bonusSkill",
    title: `Bonus Skill — ${ADVANCED_SKILL_LABEL[skill]}`,
    exercises,
  };
}
