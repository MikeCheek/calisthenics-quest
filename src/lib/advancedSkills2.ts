import { Exercise, SimpleSkillStage, AssistedSkillStage } from "./types";

// ---- Simple 3-stage skills (none -> developing -> full) ----

export const CLAP_PUSHUP_TABLE: Record<SimpleSkillStage, Exercise[]> = {
  none: [
    { name: "Explosive push-ups (no clap)", detail: "4 x 6-8 reps", restSeconds: 90 },
    { name: "Push-ups off an incline", detail: "3 x 8 reps", restSeconds: 75 },
  ],
  developing: [
    { name: "Clap push-ups", detail: "4 x 4-5 reps", restSeconds: 90 },
    { name: "Explosive push-ups to a box", detail: "3 x 6 reps", restSeconds: 90 },
  ],
  full: [
    { name: "Double clap push-ups", detail: "3 x 3-4 reps", restSeconds: 120 },
    { name: "Behind-the-back clap push-ups", detail: "3 x 3 reps", restSeconds: 120 },
  ],
};

export const KIP_UP_TABLE: Record<SimpleSkillStage, Exercise[]> = {
  none: [
    { name: "Shoulder rolls to feet (kip-up drill)", detail: "4 x 5 reps", restSeconds: 75 },
    { name: "Hollow body rocks", detail: "3 x 10", restSeconds: 60 },
  ],
  developing: [
    { name: "Kip-up attempts (spotted or on mat)", detail: "6-8 attempts", restSeconds: 90 },
    { name: "Kip-up drill with hand push", detail: "4 x 4 reps", restSeconds: 75 },
  ],
  full: [
    { name: "Kip-ups", detail: "4 x 3-4 reps", restSeconds: 90 },
    { name: "Kip-up to jump", detail: "3 x 3 reps", restSeconds: 90 },
  ],
};

export const BACK_FLIP_TABLE: Record<SimpleSkillStage, Exercise[]> = {
  none: [
    { name: "Standing broad jumps", detail: "3 x 6", restSeconds: 75 },
    { name: "Box jump-backs (drill)", detail: "3 x 6", restSeconds: 75 },
  ],
  developing: [
    { name: "Back tuck drills (spotted / trampoline)", detail: "5-6 attempts", restSeconds: 90 },
    { name: "Standing back tuck on soft surface", detail: "4-5 attempts", restSeconds: 90 },
  ],
  full: [
    { name: "Standing back flip", detail: "4-5 attempts", restSeconds: 120 },
    { name: "Back flip on flat ground", detail: "3-4 attempts", restSeconds: 120 },
  ],
};

export const FRONT_FLIP_TABLE: Record<SimpleSkillStage, Exercise[]> = {
  none: [
    { name: "Dive rolls", detail: "3 x 6", restSeconds: 75 },
    { name: "Standing long jumps", detail: "3 x 6", restSeconds: 75 },
  ],
  developing: [
    { name: "Front tuck drills (spotted / trampoline)", detail: "5-6 attempts", restSeconds: 90 },
    { name: "Standing front tuck on soft surface", detail: "4-5 attempts", restSeconds: 90 },
  ],
  full: [
    { name: "Standing front flip", detail: "4-5 attempts", restSeconds: 120 },
    { name: "Front flip on flat ground", detail: "3-4 attempts", restSeconds: 120 },
  ],
};

export const WINDMILL_TABLE: Record<SimpleSkillStage, Exercise[]> = {
  none: [
    { name: "Bar swing (kip) drills", detail: "4 x 5", restSeconds: 75 },
    { name: "Hollow-to-arch swings on bar", detail: "3 x 8", restSeconds: 75 },
  ],
  developing: [
    { name: "Assisted windmill rotations", detail: "3 x 3 reps per direction", restSeconds: 90 },
    { name: "Bar spin drills (feet-assisted)", detail: "3 x 4", restSeconds: 90 },
  ],
  full: [
    { name: "Windmill (full rotation around bar)", detail: "3 x 2-3 reps", restSeconds: 120 },
    { name: "Continuous windmills", detail: "3 x 2 reps", restSeconds: 120 },
  ],
};

export const AROUND_THE_WORLD_TABLE: Record<SimpleSkillStage, Exercise[]> = {
  none: [
    { name: "Giant swing drills (low bar)", detail: "3 x 4", restSeconds: 90 },
    { name: "Hip circles on bar", detail: "3 x 6", restSeconds: 75 },
  ],
  developing: [
    { name: "Assisted around-the-world attempts", detail: "4-5 attempts", restSeconds: 120 },
    { name: "Partial rotation swings", detail: "3 x 4", restSeconds: 90 },
  ],
  full: [
    { name: "Around the world (full rotation)", detail: "3-4 attempts", restSeconds: 150 },
    { name: "Around the world both directions", detail: "3 x 2 reps", restSeconds: 150 },
  ],
};

export const HANDSTAND_WALK_TABLE: Record<SimpleSkillStage, Exercise[]> = {
  none: [
    { name: "Wall handstand weight shifts", detail: "4 x 30-40s", restSeconds: 90 },
    { name: "Handstand shoulder taps", detail: "3 x 20 reps", restSeconds: 75 },
  ],
  developing: [
    { name: "Handstand walk attempts (a few steps)", detail: "6-8 attempts", restSeconds: 90 },
    { name: "Wall-assisted lateral walks", detail: "3 x 6 steps", restSeconds: 90 },
  ],
  full: [
    { name: "Handstand walk", detail: "5 x 5-10 steps", restSeconds: 120 },
    { name: "Handstand walk turns", detail: "4 x 3 reps", restSeconds: 120 },
  ],
};

export const WALL_WALK_TABLE: Record<SimpleSkillStage, Exercise[]> = {
  none: [
    { name: "Pike walk-ups (feet on wall, low)", detail: "3 x 5", restSeconds: 75 },
    { name: "Wall handstand holds", detail: "4 x 20-30s", restSeconds: 90 },
  ],
  developing: [
    { name: "Wall walks (partial height)", detail: "3 x 3-4", restSeconds: 90 },
    { name: "Wall walk negatives", detail: "3 x 3", restSeconds: 90 },
  ],
  full: [
    { name: "Wall walks (full height)", detail: "4 x 3 reps", restSeconds: 120 },
    { name: "Wall walk to handstand hold", detail: "3 x 3 reps", restSeconds: 120 },
  ],
};

export const SUPERMAN_HOLD_TABLE: Record<SimpleSkillStage, Exercise[]> = {
  none: [
    { name: "Prone Y-T-W raises", detail: "3 x 10", restSeconds: 60 },
    { name: "Superman holds (knees down)", detail: "3 x 20-30s", restSeconds: 60 },
  ],
  developing: [
    { name: "Superman holds (full extension)", detail: "4 x 20-30s", restSeconds: 75 },
    { name: "Superman raises", detail: "3 x 10", restSeconds: 60 },
  ],
  full: [
    { name: "Weighted superman holds", detail: "4 x 20-30s", restSeconds: 90 },
    { name: "Superman push-up prep", detail: "3 x 5", restSeconds: 90 },
  ],
};

export const SIDE_PLANK_TABLE: Record<SimpleSkillStage, Exercise[]> = {
  none: [
    { name: "Side plank (knees bent)", detail: "3 x 20-30s per side", restSeconds: 60 },
    { name: "Side-lying leg raises", detail: "3 x 10 per side", restSeconds: 60 },
  ],
  developing: [
    { name: "Side plank (full extension)", detail: "4 x 30-40s per side", restSeconds: 60 },
    { name: "Side plank hip dips", detail: "3 x 10 per side", restSeconds: 60 },
  ],
  full: [
    { name: "Side plank with leg raised", detail: "4 x 30-40s per side", restSeconds: 75 },
    { name: "Weighted side plank", detail: "3 x 30s per side", restSeconds: 75 },
  ],
};

export const COPENHAGEN_PLANK_TABLE: Record<SimpleSkillStage, Exercise[]> = {
  none: [
    { name: "Copenhagen plank (top leg bent)", detail: "3 x 15-20s per side", restSeconds: 60 },
    { name: "Adductor squeezes (side-lying)", detail: "3 x 12 per side", restSeconds: 60 },
  ],
  developing: [
    { name: "Copenhagen plank (knee support)", detail: "3 x 20-25s per side", restSeconds: 75 },
    { name: "Adductor plank walkouts", detail: "3 x 6 per side", restSeconds: 75 },
  ],
  full: [
    { name: "Full Copenhagen plank", detail: "4 x 20-30s per side", restSeconds: 90 },
    { name: "Copenhagen plank with reach", detail: "3 x 8 per side", restSeconds: 90 },
  ],
};

export const BRIDGE_TABLE: Record<SimpleSkillStage, Exercise[]> = {
  none: [
    { name: "Glute bridges", detail: "3 x 15", restSeconds: 60 },
    { name: "Wall-assisted bridge holds", detail: "3 x 15-20s", restSeconds: 75 },
  ],
  developing: [
    { name: "Full bridge holds (floor)", detail: "4 x 15-20s", restSeconds: 75 },
    { name: "Bridge walk-ups (wall)", detail: "3 x 3", restSeconds: 90 },
  ],
  full: [
    { name: "Standing-to-bridge (drop back)", detail: "4 x 3 reps", restSeconds: 120 },
    { name: "One-leg bridge holds", detail: "3 x 10-15s per side", restSeconds: 90 },
  ],
};

export const TURKISH_GETUP_TABLE: Record<SimpleSkillStage, Exercise[]> = {
  none: [
    { name: "Half get-ups (no load)", detail: "3 x 5 per side", restSeconds: 75 },
    { name: "Bridge-to-sit transitions", detail: "3 x 6 per side", restSeconds: 60 },
  ],
  developing: [
    { name: "Turkish get-ups (light load)", detail: "3 x 3 per side", restSeconds: 90 },
    { name: "Get-up to lunge", detail: "3 x 4 per side", restSeconds: 90 },
  ],
  full: [
    { name: "Turkish get-ups (moderate load)", detail: "4 x 3 per side", restSeconds: 120 },
    { name: "Slow-tempo get-ups", detail: "3 x 2 per side", restSeconds: 120 },
  ],
};

export const PIKE_PRESS_TABLE: Record<SimpleSkillStage, Exercise[]> = {
  none: [
    { name: "Pike push-ups", detail: "4 x 8-10", restSeconds: 90 },
    { name: "Elevated pike holds", detail: "3 x 20-30s", restSeconds: 75 },
  ],
  developing: [
    { name: "Pike press negatives", detail: "3 x 5, slow", restSeconds: 90 },
    { name: "Elevated pike push-ups", detail: "3 x 6-8", restSeconds: 90 },
  ],
  full: [
    { name: "Pike press to handstand", detail: "4 x 3-4", restSeconds: 120 },
    { name: "Straddle pike press", detail: "3 x 2-3", restSeconds: 120 },
  ],
};

export const ROPE_CLIMB_TABLE: Record<SimpleSkillStage, Exercise[]> = {
  none: [
    { name: "Rope pulls (seated)", detail: "3 x 8", restSeconds: 90 },
    { name: "Dead hang on rope", detail: "3 x max hold", restSeconds: 75 },
  ],
  developing: [
    { name: "Rope climb (using legs)", detail: "3 x 1 ascent", restSeconds: 120 },
    { name: "Rope climb negatives", detail: "3 x 1, slow descent", restSeconds: 120 },
  ],
  full: [
    { name: "Legless rope climb", detail: "3 x 1 ascent", restSeconds: 150 },
    { name: "Rope climb for speed", detail: "3 x 1 ascent", restSeconds: 150 },
  ],
};

// ---- Assisted 4-stage skills (none -> assisted -> developing -> full) ----

export const SKIN_THE_CAT_TABLE: Record<AssistedSkillStage, Exercise[]> = {
  none: [
    { name: "Scapula pulls (hang)", detail: "3 x 10", restSeconds: 60 },
    { name: "Tucked hang rocks", detail: "3 x 8", restSeconds: 60 },
  ],
  assisted: [
    { name: "Skin the cat (partial rotation)", detail: "3 x 5", restSeconds: 90 },
    { name: "Assisted skin the cat (spotted)", detail: "3 x 4", restSeconds: 90 },
  ],
  developing: [
    { name: "Skin the cat (full rotation)", detail: "4 x 4", restSeconds: 90 },
    { name: "Skin the cat with pause at bottom", detail: "3 x 3", restSeconds: 90 },
  ],
  full: [
    { name: "Skin the cat to back lever", detail: "3 x 3", restSeconds: 120 },
    { name: "Weighted skin the cat", detail: "3 x 3", restSeconds: 120 },
  ],
};

export const GERMAN_HANG_TABLE: Record<AssistedSkillStage, Exercise[]> = {
  none: [
    { name: "Shoulder dislocates (band or stick)", detail: "3 x 10", restSeconds: 60 },
    { name: "Passive hang", detail: "3 x 20-30s", restSeconds: 60 },
  ],
  assisted: [
    { name: "German hang (brief, spotted)", detail: "3 x 10-15s", restSeconds: 75 },
    { name: "Assisted shoulder opening drills", detail: "3 x 8", restSeconds: 60 },
  ],
  developing: [
    { name: "German hang holds", detail: "4 x 20-30s", restSeconds: 90 },
    { name: "German hang to tuck transitions", detail: "3 x 5", restSeconds: 90 },
  ],
  full: [
    { name: "Deep German hang holds", detail: "4 x 30-40s", restSeconds: 90 },
    { name: "German hang pull-through", detail: "3 x 5", restSeconds: 90 },
  ],
};

export const CHEST_TO_BAR_TABLE: Record<AssistedSkillStage, Exercise[]> = {
  none: [
    { name: "Pull-ups (chin over bar)", detail: "4 x 6-8", restSeconds: 90 },
    { name: "High pulls to chest (band)", detail: "3 x 8", restSeconds: 75 },
  ],
  assisted: [
    { name: "Band-assisted chest-to-bar pull-ups", detail: "3 x 6", restSeconds: 90 },
    { name: "Kipping chest-to-bar drills", detail: "3 x 5", restSeconds: 90 },
  ],
  developing: [
    { name: "Chest-to-bar pull-ups", detail: "4 x 4-5", restSeconds: 120 },
    { name: "Strict chest-to-bar pull-ups", detail: "3 x 3-4", restSeconds: 120 },
  ],
  full: [
    { name: "Weighted chest-to-bar pull-ups", detail: "4 x 3-4", restSeconds: 150 },
    { name: "Chest-to-bar cluster sets", detail: "3 x 5, rest-pause", restSeconds: 150 },
  ],
};

export const WIDE_GRIP_PULLUP_TABLE: Record<AssistedSkillStage, Exercise[]> = {
  none: [
    { name: "Wide-grip dead hangs", detail: "3 x max hold", restSeconds: 60 },
    { name: "Wide-grip negatives", detail: "3 x 5, slow", restSeconds: 90 },
  ],
  assisted: [
    { name: "Band-assisted wide-grip pull-ups", detail: "3 x 6", restSeconds: 90 },
    { name: "Wide-grip rows", detail: "3 x 10", restSeconds: 75 },
  ],
  developing: [
    { name: "Wide-grip pull-ups", detail: "4 x 5-6", restSeconds: 120 },
    { name: "Wide-grip pull-ups (pause at top)", detail: "3 x 4", restSeconds: 120 },
  ],
  full: [
    { name: "Weighted wide-grip pull-ups", detail: "4 x 4-5", restSeconds: 150 },
    { name: "Wide-grip pull-up cluster sets", detail: "3 x 6, rest-pause", restSeconds: 150 },
  ],
};

export const RING_MUSCLEUP_TABLE: Record<AssistedSkillStage, Exercise[]> = {
  none: [
    { name: "Ring support hold", detail: "4 x max hold", restSeconds: 90 },
    { name: "Ring dips", detail: "3 x 6-8", restSeconds: 90 },
  ],
  assisted: [
    { name: "Band-assisted ring muscle-ups", detail: "4 x 4", restSeconds: 120 },
    { name: "Ring transition drills", detail: "3 x 5", restSeconds: 120 },
  ],
  developing: [
    { name: "Ring muscle-ups", detail: "4 x 2-3", restSeconds: 150 },
    { name: "Slow-eccentric ring muscle-ups", detail: "3 x 3, 5s negative", restSeconds: 150 },
  ],
  full: [
    { name: "Weighted ring muscle-ups", detail: "4 x 3", restSeconds: 180 },
    { name: "Ring muscle-up cluster sets", detail: "3 x 3, rest-pause", restSeconds: 180 },
  ],
};

export const NINETY_DEGREE_PUSHUP_TABLE: Record<AssistedSkillStage, Exercise[]> = {
  none: [
    { name: "Pseudo planche push-ups", detail: "3 x 8", restSeconds: 90 },
    { name: "Tuck planche holds", detail: "3 x max hold", restSeconds: 90 },
  ],
  assisted: [
    { name: "90° push-ups (elevated feet)", detail: "3 x 5", restSeconds: 90 },
    { name: "Tuck planche push-up negatives", detail: "3 x 4, slow", restSeconds: 90 },
  ],
  developing: [
    { name: "90° push-ups", detail: "4 x 4-5", restSeconds: 120 },
    { name: "90° push-up holds at bottom", detail: "3 x 3", restSeconds: 120 },
  ],
  full: [
    { name: "Weighted 90° push-ups", detail: "3 x 4", restSeconds: 120 },
    { name: "90° push-up cluster sets", detail: "3 x 5, rest-pause", restSeconds: 120 },
  ],
};

export const JUMP_PISTOL_TABLE: Record<AssistedSkillStage, Exercise[]> = {
  none: [
    { name: "Bodyweight jump squats", detail: "3 x 10", restSeconds: 75 },
    { name: "Single-leg box step-offs", detail: "3 x 6 per side", restSeconds: 75 },
  ],
  assisted: [
    { name: "Assisted jump pistols (rail support)", detail: "3 x 5 per side", restSeconds: 90 },
    { name: "Single-leg hops (stick landing)", detail: "3 x 6 per side", restSeconds: 90 },
  ],
  developing: [
    { name: "Jump pistols", detail: "4 x 4 per side", restSeconds: 120 },
    { name: "Jump pistols onto a box", detail: "3 x 4 per side", restSeconds: 120 },
  ],
  full: [
    { name: "Jump pistols (max height)", detail: "4 x 3 per side", restSeconds: 120 },
    { name: "Continuous jump pistols", detail: "3 x 5 per side", restSeconds: 120 },
  ],
};

export const SISSY_SQUAT_TABLE: Record<AssistedSkillStage, Exercise[]> = {
  none: [
    { name: "Assisted sissy squats (holding support)", detail: "3 x 8", restSeconds: 75 },
    { name: "Bodyweight squats (pause at bottom)", detail: "3 x 12", restSeconds: 60 },
  ],
  assisted: [
    { name: "Sissy squats (light fingertip support)", detail: "3 x 6", restSeconds: 90 },
    { name: "Sissy squat negatives", detail: "3 x 5, slow", restSeconds: 90 },
  ],
  developing: [
    { name: "Sissy squats (unassisted)", detail: "4 x 5-6", restSeconds: 120 },
    { name: "Sissy squats (pause at bottom)", detail: "3 x 4", restSeconds: 120 },
  ],
  full: [
    { name: "Weighted sissy squats", detail: "3 x 5", restSeconds: 120 },
    { name: "Sissy squat cluster sets", detail: "3 x 6, rest-pause", restSeconds: 120 },
  ],
};

export const COSSACK_SQUAT_TABLE: Record<AssistedSkillStage, Exercise[]> = {
  none: [
    { name: "Lateral lunges", detail: "3 x 10 per side", restSeconds: 60 },
    { name: "Assisted cossack squats (holding support)", detail: "3 x 8 per side", restSeconds: 75 },
  ],
  assisted: [
    { name: "Cossack squats (heel-elevated)", detail: "3 x 8 per side", restSeconds: 90 },
    { name: "Cossack squat negatives", detail: "3 x 6 per side, slow", restSeconds: 90 },
  ],
  developing: [
    { name: "Cossack squats", detail: "4 x 6-8 per side", restSeconds: 90 },
    { name: "Cossack squats (pause at bottom)", detail: "3 x 5 per side", restSeconds: 90 },
  ],
  full: [
    { name: "Weighted cossack squats", detail: "3 x 6 per side", restSeconds: 120 },
    { name: "Cossack squat to pistol transition", detail: "3 x 4 per side", restSeconds: 120 },
  ],
};

export const FLAG_PULLUP_TABLE: Record<AssistedSkillStage, Exercise[]> = {
  none: [
    { name: "Vertical pole pull-ups (both hands)", detail: "3 x 6", restSeconds: 90 },
    { name: "Side plank holds", detail: "3 x 30s per side", restSeconds: 60 },
  ],
  assisted: [
    { name: "Assisted flag pull-ups (feet down)", detail: "3 x 4 per side", restSeconds: 90 },
    { name: "Flag pull-up negatives", detail: "3 x 3 per side, slow", restSeconds: 90 },
  ],
  developing: [
    { name: "Flag pull-ups", detail: "4 x 3 per side", restSeconds: 120 },
    { name: "Flag pull-up holds at top", detail: "3 x 2 per side", restSeconds: 120 },
  ],
  full: [
    { name: "Weighted flag pull-ups", detail: "3 x 2-3 per side", restSeconds: 150 },
    { name: "Flag pull-up cluster sets", detail: "3 x 3 per side, rest-pause", restSeconds: 150 },
  ],
};

export const LSIT_PULLUP_TABLE: Record<AssistedSkillStage, Exercise[]> = {
  none: [
    { name: "L-sit holds (bent knees)", detail: "3 x max hold", restSeconds: 75 },
    { name: "Pull-ups (standard)", detail: "3 x 6-8", restSeconds: 90 },
  ],
  assisted: [
    { name: "Tuck L-sit pull-ups", detail: "3 x 4", restSeconds: 90 },
    { name: "L-sit holds during dead hang", detail: "3 x 15-20s", restSeconds: 75 },
  ],
  developing: [
    { name: "L-sit pull-ups", detail: "4 x 3-4", restSeconds: 120 },
    { name: "L-sit pull-up negatives", detail: "3 x 4, slow", restSeconds: 120 },
  ],
  full: [
    { name: "Weighted L-sit pull-ups", detail: "3 x 3", restSeconds: 150 },
    { name: "L-sit pull-up cluster sets", detail: "3 x 4, rest-pause", restSeconds: 150 },
  ],
};

export const TYPEWRITER_PULLUP_TABLE: Record<AssistedSkillStage, Exercise[]> = {
  none: [
    { name: "Wide-grip pull-ups", detail: "4 x 5-6", restSeconds: 90 },
    { name: "Pull-up holds at top", detail: "3 x 10-15s", restSeconds: 75 },
  ],
  assisted: [
    { name: "Typewriter pull-ups (partial travel)", detail: "3 x 3 per side", restSeconds: 90 },
    { name: "Assisted typewriter pull-ups", detail: "3 x 3 per side", restSeconds: 90 },
  ],
  developing: [
    { name: "Typewriter pull-ups", detail: "4 x 3-4 per side", restSeconds: 120 },
    { name: "Typewriter pull-ups (slow travel)", detail: "3 x 3 per side", restSeconds: 120 },
  ],
  full: [
    { name: "Weighted typewriter pull-ups", detail: "3 x 3 per side", restSeconds: 150 },
    { name: "Typewriter pull-up cluster sets", detail: "3 x 4 per side, rest-pause", restSeconds: 150 },
  ],
};

export const TOES_TO_BAR_TABLE: Record<AssistedSkillStage, Exercise[]> = {
  none: [
    { name: "Hanging knee raises", detail: "3 x 10", restSeconds: 60 },
    { name: "Hanging bent-knee leg raises", detail: "3 x 10", restSeconds: 60 },
  ],
  assisted: [
    { name: "Hanging straight leg raises (partial)", detail: "3 x 8", restSeconds: 75 },
    { name: "Toes-to-bar negatives", detail: "3 x 6, slow", restSeconds: 75 },
  ],
  developing: [
    { name: "Toes-to-bar", detail: "4 x 8-10", restSeconds: 90 },
    { name: "Strict toes-to-bar", detail: "3 x 6", restSeconds: 90 },
  ],
  full: [
    { name: "Toes-to-bar cluster sets", detail: "4 x 10, rest-pause", restSeconds: 90 },
    { name: "Weighted toes-to-bar", detail: "3 x 8", restSeconds: 90 },
  ],
};

export const INVERTED_CROSS_TABLE: Record<AssistedSkillStage, Exercise[]> = {
  none: [
    { name: "Ring support hold", detail: "4 x max hold", restSeconds: 90 },
    { name: "Inverted hang on rings", detail: "3 x 15-20s", restSeconds: 90 },
  ],
  assisted: [
    { name: "Assisted inverted cross negatives", detail: "3 x 3, slow", restSeconds: 120 },
    { name: "Inverted tuck cross holds", detail: "3 x max hold", restSeconds: 120 },
  ],
  developing: [
    { name: "Inverted cross negatives (full ROM)", detail: "3 x 3, slow", restSeconds: 150 },
    { name: "Inverted straddle cross holds", detail: "3 x max hold", restSeconds: 150 },
  ],
  full: [
    { name: "Inverted cross holds", detail: "4 x max attempt", restSeconds: 180 },
    { name: "Inverted cross negatives", detail: "3 x 2, slow", restSeconds: 180 },
  ],
};

export const VICTORIAN_CROSS_TABLE: Record<AssistedSkillStage, Exercise[]> = {
  none: [
    { name: "Iron cross holds", detail: "4 x max hold", restSeconds: 120 },
    { name: "Ring support hold with turnout", detail: "3 x max hold", restSeconds: 90 },
  ],
  assisted: [
    { name: "Assisted Victorian negatives (feet supported)", detail: "3 x 2, slow", restSeconds: 150 },
    { name: "Deep cross holds (below horizontal)", detail: "3 x max hold", restSeconds: 150 },
  ],
  developing: [
    { name: "Victorian cross negatives", detail: "3 x 2, slow", restSeconds: 180 },
    { name: "Victorian cross pull-outs", detail: "3 x 2", restSeconds: 180 },
  ],
  full: [
    { name: "Victorian cross holds", detail: "3 x max attempt", restSeconds: 200 },
    { name: "Victorian cross negatives (full ROM)", detail: "3 x 1-2, slow", restSeconds: 200 },
  ],
};
