import {
  Exercise,
  FrontLeverStage,
  BackLeverStage,
  PlancheStage,
  HumanFlagStage,
  PistolSquatStage,
  LSitStage,
  SkillProfile,
  TrainingEquipment,
} from "./types";

// ---- Front Lever (bar) ----
export const FRONT_LEVER_TABLE: Record<FrontLeverStage, Exercise[]> = {
  none: [
    { name: "Scapula pulls (hang)", detail: "3 x 10", restSeconds: 60 },
    { name: "Tuck negatives", detail: "4 x 3 reps, 4s descent", restSeconds: 90 },
    { name: "Tuck hold from support", detail: "4 x max hold", restSeconds: 90, cue: "Pull shoulder blades down and back" },
    { name: "Body rows", detail: "3 x 10-12 reps", restSeconds: 75 },
  ],
  tuck: [
    { name: "Tuck front lever holds", detail: "4 x max hold", restSeconds: 120 },
    { name: "Tuck front lever raises", detail: "3 x 5-6 reps", restSeconds: 120 },
    { name: "Ice cream makers (tuck)", detail: "3 x 5 reps", restSeconds: 120 },
    { name: "Skin the cats", detail: "3 x 5 reps", restSeconds: 90 },
  ],
  advancedTuck: [
    { name: "Advanced tuck holds", detail: "4 x max hold", restSeconds: 120 },
    { name: "Tuck-to-one-leg negatives", detail: "4 x 3-5 reps, 4-5s descent", restSeconds: 120 },
    { name: "Ice cream makers (adv. tuck)", detail: "3 x 5 reps", restSeconds: 120 },
    { name: "Tuck front lever raises", detail: "3 x 6 reps", restSeconds: 120 },
  ],
  oneLeg: [
    { name: "One-leg front lever holds", detail: "4 x max hold (target 8-12s)", restSeconds: 150 },
    { name: "One-leg to straddle negatives", detail: "4 x 3 reps, slow", restSeconds: 150 },
    { name: "Ice cream makers (one-leg)", detail: "3 x 5-6 reps", restSeconds: 150 },
    { name: "One-leg front lever raises", detail: "3 x 4-5 reps", restSeconds: 150 },
  ],
  straddle: [
    { name: "Straddle front lever holds", detail: "4 x max hold", restSeconds: 150 },
    { name: "Straddle-to-full negatives", detail: "3 x 3 reps, slow", restSeconds: 150 },
    { name: "Front lever pulls (straddle)", detail: "3 x 4-5 reps", restSeconds: 150 },
    { name: "Straddle front lever raises", detail: "3 x 4 reps", restSeconds: 150 },
  ],
  full: [
    { name: "Full front lever holds", detail: "5-6 x max attempt, accumulate 40-60s", restSeconds: 180 },
    { name: "Front lever rows (bent-arm)", detail: "4 x 4-5 reps", restSeconds: 150 },
    { name: "One-arm tuck teaser", detail: "3 x 3-4 reps per side", restSeconds: 150 },
    { name: "Full front lever raises", detail: "3 x 3-4 reps", restSeconds: 180 },
  ],
};

// ---- Back Lever (bar) ----
export const BACK_LEVER_TABLE: Record<BackLeverStage, Exercise[]> = {
  none: [
    { name: "German hang holds", detail: "3 x 20-30s", restSeconds: 90, cue: "Open the shoulders slowly" },
    { name: "Skin the cats", detail: "3 x 5 reps", restSeconds: 90 },
    { name: "Tuck back lever negatives", detail: "3 x 4 reps, slow", restSeconds: 90 },
  ],
  tuck: [
    { name: "Tuck back lever holds", detail: "4 x max hold", restSeconds: 120 },
    { name: "German hang to tuck transitions", detail: "3 x 5 reps", restSeconds: 90 },
    { name: "Tuck back lever raises", detail: "3 x 5 reps", restSeconds: 120 },
  ],
  advancedTuck: [
    { name: "Advanced tuck back lever holds", detail: "4 x max hold", restSeconds: 120 },
    { name: "Tuck-to-straddle negatives", detail: "3 x 4 reps, slow", restSeconds: 120 },
    { name: "Advanced tuck back lever raises", detail: "3 x 5 reps", restSeconds: 120 },
  ],
  straddle: [
    { name: "Straddle back lever holds", detail: "4 x max hold", restSeconds: 150 },
    { name: "Straddle-to-full negatives", detail: "3 x 3 reps, slow", restSeconds: 150 },
    { name: "Straddle back lever raises", detail: "3 x 4 reps", restSeconds: 150 },
  ],
  full: [
    { name: "Full back lever holds", detail: "5 x max attempt, accumulate 30-45s", restSeconds: 180 },
    { name: "Back lever raises", detail: "3 x 3-4 reps", restSeconds: 180 },
    { name: "Back lever to skin-the-cat flow", detail: "3 x 3 reps", restSeconds: 150 },
  ],
};

// ---- Planche (floor / parallettes) ----
export const PLANCHE_TABLE: Record<PlancheStage, Exercise[]> = {
  none: [
    { name: "Planche lean (feet down)", detail: "4 x 15-20s", restSeconds: 90 },
    { name: "Frog stand", detail: "3 x max hold", restSeconds: 90 },
    { name: "Pseudo planche push-ups", detail: "3 x 8", restSeconds: 90 },
    { name: "Wrist prep & flexibility drills", detail: "3 x 30-45s", restSeconds: 45 },
  ],
  tuck: [
    { name: "Tuck planche holds", detail: "4 x max hold (target 15s+)", restSeconds: 120 },
    { name: "Tuck planche push-ups", detail: "3 x 5-6 reps", restSeconds: 120 },
    { name: "Straddle planche leans", detail: "3 x 8-10s", restSeconds: 120 },
    { name: "Tuck planche presses", detail: "3 x 4-5 reps", restSeconds: 120 },
  ],
  advancedTuck: [
    { name: "Advanced tuck planche holds", detail: "4 x max hold (target 8-10s)", restSeconds: 150 },
    { name: "Straddle planche leans", detail: "4 x 8-10s", restSeconds: 150 },
    { name: "Adv. tuck planche push-ups", detail: "3 x 5 reps", restSeconds: 150 },
    { name: "Adv. tuck planche presses", detail: "3 x 4 reps", restSeconds: 150 },
  ],
  straddle: [
    { name: "Straddle planche holds", detail: "4 x max hold", restSeconds: 180 },
    { name: "Straddle planche negatives", detail: "3 x 4-5 reps, slow lower", restSeconds: 150 },
    { name: "Straddle planche push-ups", detail: "3 x 3-5 reps", restSeconds: 180 },
    { name: "Straddle planche presses", detail: "3 x 3 reps", restSeconds: 180 },
  ],
  full: [
    { name: "Full planche holds", detail: "5-6 x max attempt", restSeconds: 180 },
    { name: "Planche push-ups", detail: "4 x 4-5 reps", restSeconds: 180 },
    { name: "Planche press from straddle", detail: "3 x 3 reps", restSeconds: 180 },
    { name: "Maltese lean attempts", detail: "3 x 3-5s", restSeconds: 180 },
  ],
};

// ---- Muscle-up (bar or rings) ----
export function muscleUpTrack(skills: SkillProfile, equipment: TrainingEquipment): Exercise[] {
  const table: Record<string, Exercise[]> = {
    none: [
      { name: "High pull-ups (chest to bar)", detail: "4 x 5-6 reps", restSeconds: 120 },
      { name: "Straight bar dips", detail: "4 x 6-8 reps", restSeconds: 90 },
      { name: "Explosive pull-ups", detail: "3 x 5 reps", restSeconds: 120 },
    ],
    band: [
      { name: "Band-assisted muscle-ups", detail: "4 x 4-5 reps", restSeconds: 120 },
      { name: "Transition drills (low bar)", detail: "3 x 6 reps", restSeconds: 120 },
      { name: "False grip hangs", detail: "3 x max hold", restSeconds: 90 },
    ],
    single: [
      { name: "Strict muscle-ups", detail: "4 x 2-3 reps", restSeconds: 150 },
      { name: "Slow-eccentric muscle-ups", detail: "3 x 3 reps, 5s negative", restSeconds: 150 },
      { name: "False grip pull-ups", detail: "3 x 5 reps", restSeconds: 120 },
    ],
    multiple: [
      { name: "Weighted muscle-ups", detail: "4 x 3-4 reps (+5-10kg)", restSeconds: 180 },
      { name: "Muscle-up EMOM", detail: "8 min, 1-2 reps per minute", restSeconds: 0 },
      { name: "High muscle-ups (sternum to bar)", detail: "3 x 3-4 reps", restSeconds: 150 },
    ],
  };
  const list = [...table[skills.muscleUp]];
  if (equipment.rings && (skills.muscleUp === "single" || skills.muscleUp === "multiple")) {
    list.push({ name: "Ring muscle-ups", detail: "3 x 2-3 reps, control the turnover", restSeconds: 150 });
  }
  return list;
}

// ---- Handstand (wall-assisted vs freestanding-only) ----
export function handstandTrack(skills: SkillProfile, equipment: TrainingEquipment): Exercise[] {
  if (skills.handstand === "freestanding") {
    return [
      { name: "Freestanding handstand holds", detail: "6-8 x max attempt, accumulate 60-90s", restSeconds: 120 },
      { name: "Handstand push-ups (parallettes)", detail: "4 x 4-6 reps", restSeconds: 150 },
      { name: "Handstand press or straddle-to-HS", detail: "3 x 3-5 reps", restSeconds: 150 },
    ];
  }
  if (!equipment.wallSpace) {
    return skills.handstand === "wall"
      ? [
          { name: "Freestanding kick-up attempts", detail: "8-10 attempts", restSeconds: 90 },
          { name: "Pike push-ups (elevated feet)", detail: "3 x 8-10", restSeconds: 90 },
          { name: "Crow / frog stand holds", detail: "4 x max hold", restSeconds: 90 },
        ]
      : [
          { name: "Crow / frog stand holds", detail: "4 x max hold", restSeconds: 90 },
          { name: "Pike push-ups", detail: "3 x 8-10", restSeconds: 90 },
          { name: "Kick-up attempts (spotted or open grass)", detail: "8-10 attempts", restSeconds: 90 },
        ];
  }
  const table: Record<"none" | "wall", Exercise[]> = {
    none: [
      { name: "Wall walks", detail: "3 x 3 reps", restSeconds: 90 },
      { name: "Wall handstand holds (chest to wall)", detail: "4 x 20-30s", restSeconds: 90 },
      { name: "Pike push-ups", detail: "3 x 8-10", restSeconds: 90 },
    ],
    wall: [
      { name: "Wall handstand shoulder taps", detail: "3 x 30-40s", restSeconds: 90 },
      { name: "Handstand push-up negatives", detail: "4 x 3-5 reps", restSeconds: 120 },
      { name: "Freestanding kick-up attempts", detail: "5-6 attempts", restSeconds: 90 },
    ],
  };
  return table[skills.handstand as "none" | "wall"];
}

// ---- Human Flag (vertical pole/tree required) ----
export const HUMAN_FLAG_TABLE: Record<HumanFlagStage, Exercise[]> = {
  none: [
    { name: "Vertical pole holds (both hands, feet down)", detail: "4 x 15-20s", restSeconds: 90 },
    { name: "Side plank holds", detail: "3 x 30-40s per side", restSeconds: 75 },
    { name: "Pole pull-to-hip drills", detail: "3 x 5 reps", restSeconds: 90 },
  ],
  tuck: [
    { name: "Tuck human flag holds", detail: "4 x max hold per side", restSeconds: 120 },
    { name: "Tuck flag negatives", detail: "3 x 4 reps, slow", restSeconds: 120 },
    { name: "Oblique-focused side planks", detail: "3 x 30-40s per side", restSeconds: 75 },
  ],
  straddle: [
    { name: "Straddle human flag holds", detail: "4 x max hold per side", restSeconds: 150 },
    { name: "Straddle-to-full negatives", detail: "3 x 3 reps, slow", restSeconds: 150 },
    { name: "Windshield wipers (pole-assisted)", detail: "3 x 5 reps per side", restSeconds: 120 },
  ],
  full: [
    { name: "Full human flag holds", detail: "5 x max attempt per side", restSeconds: 180 },
    { name: "Flag raises", detail: "3 x 3-4 reps per side", restSeconds: 180 },
    { name: "Flag pull-ins", detail: "3 x 4-5 reps per side", restSeconds: 150 },
  ],
};

// ---- Legs — pistol squat progression (no equipment needed) ----
export const LEGS_TABLE: Record<PistolSquatStage, Exercise[]> = {
  none: [
    { name: "Bodyweight squats", detail: "4 x 15-20 reps", restSeconds: 60 },
    { name: "Split squats", detail: "3 x 10 reps per side", restSeconds: 75 },
    { name: "Box / bench pistol negatives", detail: "3 x 5 reps per side, slow lower", restSeconds: 90 },
    { name: "Calf raises", detail: "3 x 15-20 reps", restSeconds: 60 },
  ],
  assisted: [
    { name: "Assisted pistol squats (rail/bar support)", detail: "4 x 5-6 reps per side", restSeconds: 90 },
    { name: "Bulgarian split squats", detail: "3 x 8-10 reps per side", restSeconds: 90 },
    { name: "Cossack squats", detail: "3 x 6-8 reps per side", restSeconds: 90 },
    { name: "Single-leg glute bridges", detail: "3 x 10 reps per side", restSeconds: 75 },
  ],
  full: [
    { name: "Pistol squats", detail: "4 x 5-6 reps per side", restSeconds: 120 },
    { name: "Shrimp squat progression", detail: "3 x 4-5 reps per side", restSeconds: 120 },
    { name: "Jump squats", detail: "3 x 8 reps", restSeconds: 90 },
    { name: "Weighted pistol squats", detail: "3 x 4-5 reps per side", restSeconds: 120 },
  ],
};

// ---- Core — L-sit progression (floor or bars) ----
export const CORE_TABLE: Record<LSitStage, Exercise[]> = {
  none: [
    { name: "Hollow body holds", detail: "4 x max hold (target 20-30s)", restSeconds: 60 },
    { name: "Knee raises (hang or support)", detail: "3 x 10-12 reps", restSeconds: 75 },
    { name: "Plank holds", detail: "3 x 40-60s", restSeconds: 60 },
    { name: "Dead bug", detail: "3 x 10 reps per side", restSeconds: 60 },
  ],
  tuck: [
    { name: "Tuck L-sit holds", detail: "4 x max hold", restSeconds: 90 },
    { name: "Tuck-to-extend negatives", detail: "3 x 5 reps per side", restSeconds: 90 },
    { name: "Hanging knee raises", detail: "3 x 10 reps", restSeconds: 75 },
    { name: "Hollow body rocks", detail: "3 x 10-12 reps", restSeconds: 75 },
  ],
  advanced: [
    { name: "One-leg extended L-sit holds", detail: "4 x max hold per side", restSeconds: 90 },
    { name: "V-sit progressions", detail: "3 x 5-8s hold", restSeconds: 120 },
    { name: "Hanging leg raises (straight legs)", detail: "3 x 8-10 reps", restSeconds: 90 },
    { name: "Windshield wipers", detail: "3 x 6 reps per side", restSeconds: 90 },
  ],
  full: [
    { name: "Full L-sit holds", detail: "5 x max hold, accumulate 40-60s", restSeconds: 120 },
    { name: "L-sit pull-ups", detail: "3 x 4-5 reps", restSeconds: 120 },
    { name: "V-sit / manna lean attempts", detail: "3 x 3-5s", restSeconds: 120 },
    { name: "L-sit to handstand kick-ups", detail: "3 x 5 attempts", restSeconds: 120 },
  ],
};

// ---- Pull strength (bar-gated: unilateral / weighted pulling) ----
export function pullStrengthTrack(skills: SkillProfile, equipment: TrainingEquipment): Exercise[] {
  const { pullUpMaxReps, archerPullUp } = skills;
  let list: Exercise[];
  if (pullUpMaxReps < 6) {
    list = [
      { name: "Pull-ups", detail: "5 x max reps", restSeconds: 120 },
      { name: "Negative pull-ups", detail: "3 x 4-5 reps, 4-5s descent", restSeconds: 90 },
      { name: "Australian / inverted rows", detail: "3 x 10-12 reps", restSeconds: 90 },
      { name: "Dead hangs", detail: "3 x max hold", restSeconds: 90 },
    ];
  } else if (pullUpMaxReps < 12 || !archerPullUp) {
    list = [
      { name: "Archer pull-ups", detail: "4 x 3-4 reps per side", restSeconds: 120 },
      { name: "Weighted pull-ups", detail: "3 x 5 reps (+5-10kg)", restSeconds: 150 },
      { name: "Typewriter pull-ups", detail: "3 x 4 reps per side", restSeconds: 120 },
    ];
  } else {
    list = [
      { name: "One-arm chin negatives", detail: "4 x 2-3 reps per side (assisted)", restSeconds: 150 },
      { name: "Weighted pull-ups", detail: "4 x 4-5 reps (+15-20% bodyweight)", restSeconds: 180 },
      { name: "Typewriter pull-ups", detail: "3 x 4-5 reps per side", restSeconds: 150 },
      { name: "Front lever pulls", detail: "3 x 4-5 reps", restSeconds: 150 },
    ];
  }
  if (equipment.rings) {
    list.push({ name: "Ring rows (false grip)", detail: "3 x 8-10 reps", restSeconds: 90 });
  }
  if (equipment.monkeyBars) {
    list.push({ name: "Monkey bar traverse", detail: "3 x 1-2 laps", restSeconds: 90, cue: "Keep it continuous, don't rest mid-bar" });
  }
  return list;
}

// ---- Push strength — dips if bars/rings available, otherwise floor push-up progressions ----
export function pushStrengthTrack(skills: SkillProfile, equipment: TrainingEquipment): Exercise[] {
  const { dipMaxReps } = skills;
  if (equipment.parallelBars || equipment.rings) {
    const apparatus = equipment.rings && !equipment.parallelBars ? "ring" : "bar";
    if (dipMaxReps < 8) {
      return [
        { name: `${apparatus === "ring" ? "Ring" : "Parallel bar"} dips`, detail: "4 x max reps", restSeconds: 90 },
        { name: "Negative dips", detail: "3 x 5 reps, 4s descent", restSeconds: 90 },
        { name: "Pike push-ups", detail: "3 x 8-10 reps", restSeconds: 75 },
      ];
    }
    if (dipMaxReps < 15) {
      return [
        { name: "Weighted dips", detail: "4 x 6-8 reps", restSeconds: 120 },
        { name: "Slow-tempo dips", detail: "3 x 6 reps, 3s down / 3s up", restSeconds: 90 },
        { name: "Pseudo planche push-ups", detail: "3 x 8-10 reps", restSeconds: 90 },
      ];
    }
    return [
      { name: "Weighted dips", detail: "4 x 5-6 reps (+15-20% bodyweight)", restSeconds: 150 },
      { name: "Ring / bar support hold", detail: "3 x max hold", restSeconds: 90 },
      { name: "Planche push-ups", detail: "3 x 5 reps", restSeconds: 150 },
    ];
  }
  if (dipMaxReps < 8) {
    return [
      { name: "Push-ups", detail: "4 x max reps", restSeconds: 90 },
      { name: "Decline push-ups", detail: "3 x 8-10 reps", restSeconds: 90 },
      { name: "Pike push-ups", detail: "3 x 8-10 reps", restSeconds: 75 },
    ];
  }
  return [
    { name: "Archer push-ups", detail: "4 x 5-6 reps per side", restSeconds: 90 },
    { name: "Diamond push-ups", detail: "3 x 10-12 reps", restSeconds: 90 },
    { name: "Pseudo planche push-ups", detail: "3 x 8-10 reps", restSeconds: 90 },
  ];
}
