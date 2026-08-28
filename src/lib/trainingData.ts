import {
  Exercise,
  FrontLeverStage,
  BackLeverStage,
  PlancheStage,
  MuscleUpStage,
  HandstandStage,
  HumanFlagStage,
  PistolSquatStage,
  LSitStage,
  SkillProfile,
  TrainingEquipment,
} from "./types";

// ---- Front Lever (bar) ----
export const FRONT_LEVER_TABLE: Record<FrontLeverStage, Exercise[]> = {
  none: [
    { name: "Scapula pulls (hang)", detail: "3 x 10", restSeconds: 60, description: "Hang from a bar with straight arms, then without bending your elbows, pull your shoulder blades down and together to raise your body slightly, and lower back down." },
    { name: "Tuck negatives", detail: "4 x 3 reps, 4s descent", restSeconds: 90, description: "Pull yourself up to a tucked front lever position (knees to chest, back horizontal) and lower yourself back down to a hang as slowly as possible over about 4 seconds." },
    { name: "Tuck hold from support", detail: "4 x max hold", restSeconds: 90, cue: "Pull shoulder blades down and back", description: "Starting from a support position above the bar, lower into a tucked front lever (knees pulled to chest, back parallel to the ground) and hold." },
    { name: "Body rows", detail: "3 x 10-12 reps", restSeconds: 75, description: "Lie under a low bar with your body straight and heels on the ground, then pull your chest up to the bar by driving your elbows back, and lower with control." },
  ],
  tuck: [
    { name: "Tuck front lever holds", detail: "4 x max hold", restSeconds: 120, description: "Hang from the bar and pull your knees to your chest while leaning your torso back to horizontal, holding the tucked position with your back parallel to the ground." },
    { name: "Tuck front lever raises", detail: "3 x 5-6 reps", restSeconds: 120, description: "From a hang, pull your knees to your chest and lean back into a tucked front lever, then return to the hang, treating each rep as a controlled raise into and out of the hold." },
    { name: "Ice cream makers (tuck)", detail: "3 x 5 reps", restSeconds: 120, description: "From a tucked front lever hold, rotate your body around the bar in a continuous circle while maintaining the tuck, like stirring a giant ice cream cone." },
    { name: "Skin the cats", detail: "3 x 5 reps", restSeconds: 90, description: "Hanging from a bar, tuck your knees and rotate your legs and hips backward through your arms and behind you, then reverse the motion back to the starting hang." },
  ],
  advancedTuck: [
    { name: "Advanced tuck holds", detail: "4 x max hold", restSeconds: 120, description: "Hold a front lever with your hips extended further than a basic tuck — knees still bent but hips opened out flatter — keeping your back horizontal." },
    { name: "Tuck-to-one-leg negatives", detail: "4 x 3-5 reps, 4-5s descent", restSeconds: 120, description: "Start in an advanced tuck front lever, extend one leg straight out, and lower slowly toward a hang over 4-5 seconds while keeping the extended leg controlled." },
    { name: "Ice cream makers (adv. tuck)", detail: "3 x 5 reps", restSeconds: 120, description: "From an advanced tuck front lever hold, rotate your whole body around the bar in a continuous circle while maintaining the position." },
    { name: "Tuck front lever raises", detail: "3 x 6 reps", restSeconds: 120, description: "From a hang, pull into an advanced tuck front lever position and return to the hang, treating each rep as a controlled raise into and out of the hold." },
  ],
  oneLeg: [
    { name: "One-leg front lever holds", detail: "4 x max hold (target 8-12s)", restSeconds: 150, description: "Hold a front lever with one leg extended straight and the other tucked toward your chest, keeping your hips level and back horizontal." },
    { name: "One-leg to straddle negatives", detail: "4 x 3 reps, slow", restSeconds: 150, description: "Start in a one-leg front lever, extend the tucked leg out to the side into a straddle, then lower slowly toward a hang under full control." },
    { name: "Ice cream makers (one-leg)", detail: "3 x 5-6 reps", restSeconds: 150, description: "From a one-leg front lever hold, rotate your whole body around the bar in a continuous circle while maintaining the position, switching which leg leads between sets." },
    { name: "One-leg front lever raises", detail: "3 x 4-5 reps", restSeconds: 150, description: "From a hang, pull into a one-leg front lever position and return to the hang, treating each rep as a controlled raise into and out of the hold." },
  ],
  straddle: [
    { name: "Straddle front lever holds", detail: "4 x max hold", restSeconds: 150, description: "Hold a front lever with both legs extended straight and spread wide apart, keeping your back horizontal and hips level with your shoulders." },
    { name: "Straddle-to-full negatives", detail: "3 x 3 reps, slow", restSeconds: 150, description: "Start in a straddle front lever, slowly bring your legs together into a full front lever as you lower, resisting the descent the whole way to a hang." },
    { name: "Front lever pulls (straddle)", detail: "3 x 4-5 reps", restSeconds: 150, description: "Holding a straddle front lever position, pull your chest toward the bar and back out again while keeping your body horizontal throughout." },
    { name: "Straddle front lever raises", detail: "3 x 4 reps", restSeconds: 150, description: "From a hang, pull into a straddle front lever position and return to the hang, treating each rep as a controlled raise into and out of the hold." },
  ],
  full: [
    { name: "Full front lever holds", detail: "5-6 x max attempt, accumulate 40-60s", restSeconds: 180, description: "Hold your entire body horizontal and straight (legs together, no tuck or straddle) while hanging from the bar with straight arms." },
    { name: "Front lever rows (bent-arm)", detail: "4 x 4-5 reps", restSeconds: 150, description: "Holding a full front lever position, bend your elbows to pull your chest toward the bar, then extend back out to the straight-arm hold." },
    { name: "One-arm tuck teaser", detail: "3 x 3-4 reps per side", restSeconds: 150, description: "Hold a tucked front lever using only one arm on the bar, keeping your body as level as possible, and switch arms between sets." },
    { name: "Full front lever raises", detail: "3 x 3-4 reps", restSeconds: 180, description: "From a hang, pull your entire straight body up into a full horizontal front lever and return to the hang, treating each rep as a controlled raise into and out of the hold." },
  ],
};

// ---- Back Lever (bar) ----
export const BACK_LEVER_TABLE: Record<BackLeverStage, Exercise[]> = {
  none: [
    { name: "German hang holds", detail: "3 x 20-30s", restSeconds: 90, cue: "Open the shoulders slowly", description: "Hang from a bar with your shoulders rotated so your body hangs below with arms overhead behind you, letting the shoulders open into a deep stretch." },
    { name: "Skin the cats", detail: "3 x 5 reps", restSeconds: 90, description: "Hanging from a bar, tuck your knees and rotate your legs and hips backward through your arms and behind you, then reverse the motion back to the starting hang." },
    { name: "Tuck back lever negatives", detail: "3 x 4 reps, slow", restSeconds: 90, description: "From a skin-the-cat position, slowly extend into a tucked back lever (face down, knees tucked, back horizontal) and lower with control, resisting the whole way." },
  ],
  tuck: [
    { name: "Tuck back lever holds", detail: "4 x max hold", restSeconds: 120, description: "Hang face-down from the bar with your knees tucked to your chest and your back horizontal, holding the position." },
    { name: "German hang to tuck transitions", detail: "3 x 5 reps", restSeconds: 90, description: "From a German hang, pull your knees up and rotate into a tucked back lever position, then reverse back to the German hang." },
    { name: "Tuck back lever raises", detail: "3 x 5 reps", restSeconds: 120, description: "From a hang, pull into a tucked back lever position and return to the hang, treating each rep as a controlled raise into and out of the hold." },
  ],
  advancedTuck: [
    { name: "Advanced tuck back lever holds", detail: "4 x max hold", restSeconds: 120, description: "Hold a back lever with your hips extended further than a basic tuck — knees still bent but hips opened out flatter — keeping your back horizontal." },
    { name: "Tuck-to-one-leg negatives", detail: "4 x 3-5 reps, slow", restSeconds: 120, description: "Start in an advanced tuck back lever, extend one leg straight out, and lower slowly toward a hang while keeping the extended leg controlled." },
    { name: "Advanced tuck back lever raises", detail: "3 x 5 reps", restSeconds: 120, description: "From a hang, pull into an advanced tuck back lever position and return to the hang, treating each rep as a controlled raise into and out of the hold." },
  ],
  oneLeg: [
    { name: "One-leg back lever holds", detail: "4 x max hold (target 8-12s)", restSeconds: 150, description: "Hold a back lever with one leg extended straight and the other tucked toward your chest, keeping your hips level and back horizontal." },
    { name: "One-leg to straddle negatives", detail: "4 x 3 reps, slow", restSeconds: 150, description: "Start in a one-leg back lever, extend the tucked leg out to the side into a straddle, then lower slowly toward a hang under full control." },
    { name: "One-leg back lever raises", detail: "3 x 4-5 reps", restSeconds: 150, description: "From a hang, pull into a one-leg back lever position and return to the hang, treating each rep as a controlled raise into and out of the hold." },
  ],
  straddle: [
    { name: "Straddle back lever holds", detail: "4 x max hold", restSeconds: 150, description: "Hold a back lever with both legs extended straight and spread wide apart, keeping your back horizontal and hips level." },
    { name: "Straddle-to-full negatives", detail: "3 x 3 reps, slow", restSeconds: 150, description: "Start in a straddle back lever, slowly bring your legs together into a full back lever as you lower, resisting the descent the whole way to a hang." },
    { name: "Straddle back lever raises", detail: "3 x 4 reps", restSeconds: 150, description: "From a hang, pull into a straddle back lever position and return to the hang, treating each rep as a controlled raise into and out of the hold." },
  ],
  full: [
    { name: "Full back lever holds", detail: "5 x max attempt, accumulate 30-45s", restSeconds: 180, description: "Hold your entire body horizontal and straight, face down, while hanging from the bar with straight arms." },
    { name: "Back lever raises", detail: "3 x 3-4 reps", restSeconds: 180, description: "From a hang, pull your entire straight body up into a full horizontal back lever and return to the hang, treating each rep as a controlled raise into and out of the hold." },
    { name: "Back lever to skin-the-cat flow", detail: "3 x 3 reps", restSeconds: 150, description: "From a full back lever, rotate continuously through a skin-the-cat and back into the back lever, linking the two movements smoothly." },
  ],
};

// ---- Planche (floor / parallettes) ----
export const PLANCHE_TABLE: Record<PlancheStage, Exercise[]> = {
  none: [
    { name: "Planche lean (feet down)", detail: "4 x 15-20s", restSeconds: 90, description: "In a push-up position, lean your shoulders forward past your hands while keeping your feet on the ground for support, holding the lean." },
    { name: "Frog stand", detail: "3 x max hold", restSeconds: 90, description: "Squat down and place your hands on the ground, then rest your knees on the backs of your upper arms and lean forward to balance your feet off the floor." },
    { name: "Pseudo planche push-ups", detail: "3 x 8", restSeconds: 90, description: "In a push-up position, lean your shoulders forward past your hands (fingers pointing toward your feet if comfortable) and perform push-ups from that forward-leaning position." },
    { name: "Wrist prep & flexibility drills", detail: "3 x 30-45s", restSeconds: 45, description: "Work through wrist circles, palm-down stretches, and gentle weight-bearing rocks on your hands to build the wrist flexibility planche training demands." },
  ],
  tuck: [
    { name: "Tuck planche holds", detail: "4 x max hold (target 15s+)", restSeconds: 120, description: "Support your body on your hands with knees tucked to your chest and hips raised, balancing with no other part of your body touching the ground." },
    { name: "Tuck planche push-ups", detail: "3 x 5-6 reps", restSeconds: 120, description: "From a tuck planche hold, bend your elbows to lower your chest toward your hands, then press back up without your feet touching down." },
    { name: "Straddle planche leans", detail: "3 x 8-10s", restSeconds: 120, description: "Support your body on your hands with legs straight and spread wide in a straddle, leaning your shoulders forward as far as you can hold." },
    { name: "Tuck planche presses", detail: "3 x 4-5 reps", restSeconds: 120, description: "From a seated or crouched position, press your body up into a tuck planche hold using arm and shoulder strength, then lower back down with control." },
  ],
  advancedTuck: [
    { name: "Advanced tuck planche holds", detail: "4 x max hold (target 8-10s)", restSeconds: 150, description: "Hold a planche with your knees still tucked but your hips extended further open than a basic tuck, increasing the lever length." },
    { name: "Straddle planche leans", detail: "4 x 8-10s", restSeconds: 150, description: "Support your body on your hands with legs straight and spread wide in a straddle, leaning your shoulders forward as far as you can hold." },
    { name: "Adv. tuck planche push-ups", detail: "3 x 5 reps", restSeconds: 150, description: "From an advanced tuck planche hold, bend your elbows to lower your chest toward your hands, then press back up without your feet touching down." },
    { name: "Adv. tuck planche presses", detail: "3 x 4 reps", restSeconds: 150, description: "From a seated or crouched position, press your body up into an advanced tuck planche hold using arm and shoulder strength, then lower back down with control." },
  ],
  straddle: [
    { name: "Straddle planche holds", detail: "4 x max hold", restSeconds: 180, description: "Support your body on your hands with both legs straight and spread wide apart, holding your whole body horizontal with no part touching the ground besides your hands." },
    { name: "Straddle planche negatives", detail: "3 x 4-5 reps, slow lower", restSeconds: 150, description: "From a straddle planche support, slowly lower your hips toward the ground under control, resisting the descent the whole way." },
    { name: "Straddle planche push-ups", detail: "3 x 3-5 reps", restSeconds: 180, description: "From a straddle planche hold, bend your elbows to lower your chest toward your hands, then press back up without any part of your body touching down." },
    { name: "Straddle planche presses", detail: "3 x 3 reps", restSeconds: 180, description: "From a seated or crouched position, press your body up into a straddle planche hold using arm and shoulder strength, then lower back down with control." },
  ],
  full: [
    { name: "Full planche holds", detail: "5-6 x max attempt", restSeconds: 180, description: "Support your body on your hands with your entire body horizontal and legs together straight out behind you, no part of your body besides your hands touching the ground." },
    { name: "Planche push-ups", detail: "4 x 4-5 reps", restSeconds: 180, description: "From a full planche hold, bend your elbows to lower your chest toward your hands, then press back up while keeping your body horizontal." },
    { name: "Planche press from straddle", detail: "3 x 3 reps", restSeconds: 180, description: "Press your body up from a straddle position on the ground into a full planche hold using arm and shoulder strength, then lower back down with control." },
    { name: "Maltese lean attempts", detail: "3 x 3-5s", restSeconds: 180, description: "From a full planche, spread your arms wider out to the sides and lean your shoulders further forward, briefly holding the more extreme maltese-style position." },
  ],
};

// ---- Muscle-up (bar or rings) ----
export function muscleUpStageTable(equipment: TrainingEquipment): Record<MuscleUpStage, Exercise[]> {
  const table: Record<MuscleUpStage, Exercise[]> = {
    none: [
      { name: "High pull-ups (chest to bar)", detail: "4 x 5-6 reps", restSeconds: 120, description: "Pull yourself up higher than a standard pull-up so your chest, not just your chin, reaches the bar." },
      { name: "Straight bar dips", detail: "4 x 6-8 reps", restSeconds: 90, description: "Support yourself above a straight bar or rail with arms straight, then lower by bending your elbows until your shoulders are near the bar, and press back up." },
      { name: "Explosive pull-ups", detail: "3 x 5 reps", restSeconds: 120, description: "Perform a pull-up as explosively as possible, driving your chest high toward the bar, then lower back to a hang with control." },
    ],
    band: [
      { name: "Band-assisted muscle-ups", detail: "4 x 4-5 reps", restSeconds: 120, description: "Loop a resistance band under your feet or knees and over the bar to reduce your effective bodyweight, then perform the full pull-transition-push muscle-up motion." },
      { name: "Transition drills (low bar)", detail: "3 x 6 reps", restSeconds: 120, description: "On a low bar where your feet can support some weight, practice rolling your wrists over the bar from the top of a pull to a supported dip position." },
      { name: "False grip hangs", detail: "3 x max hold", restSeconds: 90, description: "Grip the bar with your wrist rolled over the top of it (false grip) rather than underneath, and hang, building the wrist and forearm strength the muscle-up transition needs." },
    ],
    single: [
      { name: "Strict muscle-ups", detail: "4 x 2-3 reps", restSeconds: 150, description: "From a dead hang with a false grip, pull yourself up and roll over the bar into a support position without kipping or swinging, then press to full lockout." },
      { name: "Slow-eccentric muscle-ups", detail: "3 x 3 reps, 5s negative", restSeconds: 150, description: "Perform a muscle-up, then on the way down, take a full 5 seconds to lower back through the transition and into a dead hang." },
      { name: "False grip pull-ups", detail: "3 x 5 reps", restSeconds: 120, description: "Using a false grip (wrist rolled over the top of the bar), perform standard pull-ups to build strength and comfort in that grip position." },
      ...(equipment.rings ? [{ name: "Ring muscle-ups", detail: "3 x 2-3 reps, control the turnover", restSeconds: 150, description: "Perform a muscle-up on gymnastic rings, pulling up with a false grip and carefully controlling the turnover as the rings are less stable than a fixed bar." }] : []),
    ],
    multiple: [
      equipment.weights
        ? { name: "Weighted muscle-ups", detail: "4 x 3-4 reps (+5-10kg)", restSeconds: 180, description: "Attach extra weight via a dip belt or weighted vest, then perform standard strict muscle-ups through the full pull-transition-press sequence." }
        : { name: "Muscle-up cluster sets", detail: "4 x max unbroken reps, rest-pause 15s between", restSeconds: 180, description: "Perform as many consecutive muscle-ups as you can without dropping off the bar, rest briefly for 15 seconds, then continue for more reps within the same set." },
      { name: "Muscle-up EMOM", detail: "8 min, 1-2 reps per minute", restSeconds: 0, description: "At the start of every minute for 8 minutes, perform 1-2 clean muscle-ups, resting for whatever time remains in that minute." },
      { name: "High muscle-ups (sternum to bar)", detail: "3 x 3-4 reps", restSeconds: 150, description: "Perform a muscle-up but continue pressing until your sternum, not just your hips, reaches bar height, adding extra range at the top." },
      ...(equipment.rings ? [{ name: "Ring muscle-ups", detail: "3 x 2-3 reps, control the turnover", restSeconds: 150, description: "Perform a muscle-up on gymnastic rings, pulling up with a false grip and carefully controlling the turnover as the rings are less stable than a fixed bar." }] : []),
    ],
  };
  return table;
}

export function muscleUpTrack(skills: SkillProfile, equipment: TrainingEquipment): Exercise[] {
  return muscleUpStageTable(equipment)[skills.muscleUp];
}

// ---- Handstand (wall-assisted vs freestanding-only) ----
export function handstandStageTable(equipment: TrainingEquipment): Record<HandstandStage, Exercise[]> {
  const freestanding: Exercise[] = [
    { name: "Freestanding handstand holds", detail: "6-8 x max attempt, accumulate 60-90s", restSeconds: 120, description: "Kick up into a handstand with no wall support and balance using small finger and wrist adjustments, holding for as long as you can." },
    { name: "Handstand push-ups (parallettes)", detail: "4 x 4-6 reps", restSeconds: 150, description: "Balance in a freestanding handstand on parallettes, then bend your elbows to lower your head between your hands, and press back up to full lockout." },
    { name: "Handstand press or straddle-to-HS", detail: "3 x 3-5 reps", restSeconds: 150, description: "From a straddle sit or pike position on the ground, press your hips up and shoulders forward to rise directly into a freestanding handstand." },
  ];
  if (!equipment.wallSpace) {
    return {
      none: [
        { name: "Crow / frog stand holds", detail: "4 x max hold", restSeconds: 90, description: "Squat down, place your hands on the ground, rest your knees on the backs of your upper arms, and lean forward to balance with your feet off the floor." },
        { name: "Pike push-ups", detail: "3 x 8-10", restSeconds: 90, description: "Start in a pike position with hips high and hands on the ground, then bend your elbows to lower your head toward the floor, and press back up." },
        { name: "Kick-up attempts (spotted or open grass)", detail: "8-10 attempts", restSeconds: 90, description: "Practice kicking one leg up toward a handstand while the other follows, aiming to briefly find your balance point above your hands, ideally with a spotter or on a soft surface." },
      ],
      wall: [
        { name: "Freestanding kick-up attempts", detail: "8-10 attempts", restSeconds: 90, description: "Practice kicking up into a handstand away from any wall, focusing on finding your balance point over your hands for a moment before coming back down." },
        { name: "Pike push-ups (elevated feet)", detail: "3 x 8-10", restSeconds: 90, description: "With your feet raised on a step or box in a pike position, bend your elbows to lower your head toward the floor, and press back up." },
        { name: "Crow / frog stand holds", detail: "4 x max hold", restSeconds: 90, description: "Squat down, place your hands on the ground, rest your knees on the backs of your upper arms, and lean forward to balance with your feet off the floor." },
      ],
      freestanding,
    };
  }
  return {
    none: [
      { name: "Wall walks", detail: "3 x 3 reps", restSeconds: 90, description: "Starting in a push-up position with feet against a wall, walk your feet up the wall while walking your hands in, until you reach a vertical handstand position against the wall." },
      { name: "Wall handstand holds (chest to wall)", detail: "4 x 20-30s", restSeconds: 90, description: "Kick up into a handstand facing the wall so your chest is close to it, and hold the position with the wall as a light safety net." },
      { name: "Pike push-ups", detail: "3 x 8-10", restSeconds: 90, description: "Start in a pike position with hips high and hands on the ground, then bend your elbows to lower your head toward the floor, and press back up." },
    ],
    wall: [
      { name: "Wall handstand shoulder taps", detail: "3 x 30-40s", restSeconds: 90, description: "Hold a handstand with your back to the wall for support, and alternate lifting one hand at a time to tap the opposite shoulder, building single-arm balance." },
      { name: "Handstand push-up negatives", detail: "4 x 3-5 reps", restSeconds: 120, description: "From a wall handstand, lower your head toward the ground as slowly as you can under control, then walk your feet down or carefully reset rather than pressing back up." },
      { name: "Freestanding kick-up attempts", detail: "5-6 attempts", restSeconds: 90, description: "Practice kicking up into a handstand away from any wall, focusing on finding your balance point over your hands for a moment before coming back down." },
    ],
    freestanding,
  };
}

export function handstandTrack(skills: SkillProfile, equipment: TrainingEquipment): Exercise[] {
  return handstandStageTable(equipment)[skills.handstand];
}

// ---- Human Flag (vertical pole/tree required) ----
export const HUMAN_FLAG_TABLE: Record<HumanFlagStage, Exercise[]> = {
  none: [
    { name: "Vertical pole holds (both hands, feet down)", detail: "4 x 15-20s", restSeconds: 90, description: "Grip a vertical pole with one hand above the other and lean your body sideways away from it, keeping your feet lightly on the ground for support." },
    { name: "Side plank holds", detail: "3 x 30-40s per side", restSeconds: 75, description: "Balance on one forearm and the side of one foot with your body in a straight line, holding the position without letting your hips sag." },
    { name: "Pole pull-to-hip drills", detail: "3 x 5 reps", restSeconds: 90, description: "Gripping a vertical pole with both hands, pull your hips up sideways toward the pole and lower back down with control, feet staying near the ground." },
  ],
  tuck: [
    { name: "Tuck human flag holds", detail: "4 x max hold per side", restSeconds: 120, description: "Grip a vertical pole with both hands and lift your knees toward your chest while your body hangs sideways off the ground, holding the tucked position." },
    { name: "Tuck flag negatives", detail: "3 x 4 reps, slow", restSeconds: 120, description: "Lift into a tucked human flag position and lower yourself back down to standing as slowly as possible under control." },
    { name: "Oblique-focused side planks", detail: "3 x 30-40s per side", restSeconds: 75, description: "Hold a side plank and add a slight hip dip and lift, actively engaging your obliques rather than staying perfectly rigid." },
  ],
  advancedTuck: [
    { name: "Advanced tuck (one-leg) human flag holds", detail: "4 x max hold per side", restSeconds: 135, description: "Grip the pole and extend one leg straight while keeping the other tucked, holding your body sideways off the ground." },
    { name: "Advanced tuck-to-straddle negatives", detail: "3 x 3-4 reps, slow", restSeconds: 135, description: "From an advanced tuck human flag, extend your legs out into a straddle as you lower yourself back down under control." },
    { name: "Single-leg extended side planks", detail: "3 x 25-35s per side", restSeconds: 90, description: "Hold a side plank while raising your top leg straight up, adding extra hip and oblique demand to the standard hold." },
  ],
  straddle: [
    { name: "Straddle human flag holds", detail: "4 x max hold per side", restSeconds: 150, description: "Grip the pole and hold your body sideways off the ground with both legs straight and spread wide apart in a straddle." },
    { name: "Straddle-to-full negatives", detail: "3 x 3 reps, slow", restSeconds: 150, description: "From a straddle human flag, bring your legs together into a full flag position as you lower yourself back down under control." },
    { name: "Windshield wipers (pole-assisted)", detail: "3 x 5 reps per side", restSeconds: 120, description: "Gripping the pole in a flag-adjacent position, sweep your straight legs from side to side like windshield wipers while keeping your core engaged." },
  ],
  full: [
    { name: "Full human flag holds", detail: "5 x max attempt per side", restSeconds: 180, description: "Grip a vertical pole with both hands and hold your entire body straight and horizontal, legs together, extending sideways off the ground." },
    { name: "Flag raises", detail: "3 x 3-4 reps per side", restSeconds: 180, description: "From standing next to the pole, pull your whole straight body up into a horizontal human flag and lower back down, treating each rep as a controlled raise." },
    { name: "Flag pull-ins", detail: "3 x 4-5 reps per side", restSeconds: 150, description: "Holding a human flag position, pull your body slightly closer to the pole and back out again while maintaining the horizontal line." },
  ],
};

// ---- Legs — pistol squat progression (no equipment needed, weight optional) ----
export function legsStageTable(equipment: TrainingEquipment): Record<PistolSquatStage, Exercise[]> {
  return {
    none: [
      { name: "Bodyweight squats", detail: "4 x 15-20 reps", restSeconds: 60, description: "Stand with feet shoulder-width apart and squat down by bending your hips and knees together, keeping your chest up, then stand back up." },
      { name: "Split squats", detail: "3 x 10 reps per side", restSeconds: 75, description: "Stand in a staggered stance with one foot forward and one back, then lower your back knee toward the ground by bending both knees, and push back up." },
      { name: "Calf raises", detail: "3 x 15-20 reps", restSeconds: 60, description: "Stand with feet flat and rise onto the balls of your feet as high as you can, then lower back down with control." },
    ],
    negative: [
      { name: "Box / bench pistol negatives", detail: "3 x 5 reps per side, slow lower", restSeconds: 90, description: "Standing on one leg in front of a box or bench, lower yourself down slowly on that leg until you're seated, using the box as a controlled endpoint." },
      { name: "Single-leg step-downs", detail: "3 x 8 reps per side", restSeconds: 75, description: "Stand on a step or box on one leg, then slowly lower your other foot to tap the ground before returning to standing, keeping the working leg controlled throughout." },
      { name: "Wall-assisted single-leg sits", detail: "3 x 20-30s per side", restSeconds: 75, description: "With your back against a wall, lower into a single-leg squat position and hold, using the wall to help maintain balance and support." },
    ],
    assisted: [
      { name: "Assisted pistol squats (rail/bar support)", detail: "4 x 5-6 reps per side", restSeconds: 90, description: "Holding a rail or bar lightly for balance, lower into a full single-leg squat with the other leg extended forward, then stand back up." },
      { name: "Bulgarian split squats", detail: "3 x 8-10 reps per side", restSeconds: 90, description: "With your rear foot elevated on a bench behind you, lower your back knee toward the ground on the front leg, then push back up through the front foot." },
      { name: "Cossack squats", detail: "3 x 6-8 reps per side", restSeconds: 90, description: "From a wide stance, shift your weight onto one bent leg while keeping the other leg straight out to the side, then push back to center and repeat on the other side." },
      { name: "Single-leg glute bridges", detail: "3 x 10 reps per side", restSeconds: 75, description: "Lying on your back with one foot planted and the other leg extended, drive your hips up through the planted heel, then lower with control." },
    ],
    full: [
      { name: "Pistol squats", detail: "4 x 5-6 reps per side", restSeconds: 120, description: "Standing on one leg with the other extended straight in front of you, squat all the way down and stand back up without any support." },
      { name: "Shrimp squat progression", detail: "3 x 4-5 reps per side", restSeconds: 120, description: "Standing on one leg with the other bent behind you held near your hand, lower until your back knee lightly touches the ground behind your heel, then stand back up." },
      { name: "Jump squats", detail: "3 x 8 reps", restSeconds: 90, description: "Squat down as in a bodyweight squat, then explode upward into a jump, landing softly back into the squat position." },
      equipment.weights
        ? { name: "Weighted pistol squats", detail: "3 x 4-5 reps per side", restSeconds: 120, description: "Holding extra weight such as a dumbbell or kettlebell, perform a full single-leg squat and stand back up under the added load." }
        : { name: "Deficit pistol squats (raised surface)", detail: "3 x 4-5 reps per side", restSeconds: 120, description: "Standing on a raised platform, perform a pistol squat allowing your extended leg to drop below the level of your standing foot for extra range of motion." },
    ],
  };
}

export function legsTrack(skills: SkillProfile, equipment: TrainingEquipment): Exercise[] {
  return legsStageTable(equipment)[skills.pistolSquat];
}

// ---- Core — L-sit progression (floor or bars) ----
export const CORE_TABLE: Record<LSitStage, Exercise[]> = {
  none: [
    { name: "Hollow body holds", detail: "4 x max hold (target 20-30s)", restSeconds: 60, description: "Lying on your back, press your lower back into the floor and lift your shoulders and legs slightly off the ground, holding the shallow curved position." },
    { name: "Knee raises (hang or support)", detail: "3 x 10-12 reps", restSeconds: 75, description: "Hanging from a bar or supported on parallel bars, raise your knees up toward your chest and lower back down with control." },
    { name: "Plank holds", detail: "3 x 40-60s", restSeconds: 60, description: "Hold a straight-body position supported on your forearms and toes, keeping your hips level and core braced." },
    { name: "Dead bug", detail: "3 x 10 reps per side", restSeconds: 60, description: "Lying on your back with arms up and knees bent at 90 degrees, slowly extend one arm overhead and the opposite leg out straight while keeping your lower back pressed to the floor, then return and switch sides." },
  ],
  tuck: [
    { name: "Tuck L-sit holds", detail: "4 x max hold", restSeconds: 90, description: "Support your body on your hands (or a bar) with your knees pulled up toward your chest and feet off the ground, holding the position." },
    { name: "Tuck-to-extend negatives", detail: "3 x 5 reps per side", restSeconds: 90, description: "From a tuck L-sit, slowly extend one leg out straight and lower it back down under control while keeping the other tucked." },
    { name: "Hanging knee raises", detail: "3 x 10 reps", restSeconds: 75, description: "Hanging from a bar, raise your knees up toward your chest and lower back down with control." },
    { name: "Hollow body rocks", detail: "3 x 10-12 reps", restSeconds: 75, description: "Hold a hollow body position and rock gently forward and back along your spine without losing the shape." },
  ],
  advanced: [
    { name: "One-leg extended L-sit holds", detail: "4 x max hold per side", restSeconds: 90, description: "Support your body with one leg extended straight out and the other tucked toward your chest, holding the position and switching legs between sets." },
    { name: "V-sit progressions", detail: "3 x 5-8s hold", restSeconds: 120, description: "Support your body with both legs raised higher than a standard L-sit, aiming to bring your feet up toward head height, forming a V shape with your torso and legs." },
    { name: "Hanging leg raises (straight legs)", detail: "3 x 8-10 reps", restSeconds: 90, description: "Hanging from a bar with legs straight, raise them up in front of you as high as you can with control, then lower back down." },
    { name: "Windshield wipers", detail: "3 x 6 reps per side", restSeconds: 90, description: "Hanging from a bar with your legs raised in front of you, sweep them from side to side like windshield wipers while keeping your core engaged." },
  ],
  full: [
    { name: "Full L-sit holds", detail: "5 x max hold, accumulate 40-60s", restSeconds: 120, description: "Support your body on your hands (or a bar) with both legs held straight out in front of you, forming a full L shape, and hold the position." },
    { name: "L-sit pull-ups", detail: "3 x 4-5 reps", restSeconds: 120, description: "Perform pull-ups while holding your legs straight out in front of you in an L-sit position throughout the movement, without letting them drop." },
    { name: "V-sit / manna lean attempts", detail: "3 x 3-5s", restSeconds: 120, description: "From a full L-sit, raise your legs higher toward your head, briefly holding the more extreme V-sit or manna-style position." },
    { name: "L-sit to handstand kick-ups", detail: "3 x 5 attempts", restSeconds: 120, description: "From a full L-sit support, use your hip and shoulder strength to press or kick your legs up overhead into a handstand." },
  ],
};

// ---- Pull strength (bar-gated: unilateral / weighted pulling) ----
export function pullStrengthTrack(skills: SkillProfile, equipment: TrainingEquipment): Exercise[] {
  const { pullUpMaxReps, archerPullUp } = skills;
  let list: Exercise[];
  if (pullUpMaxReps < 6) {
    list = [
      { name: "Pull-ups", detail: "5 x max reps", restSeconds: 120, description: "From a dead hang, pull yourself up until your chin clears the bar, then lower back to a full hang with control." },
      { name: "Negative pull-ups", detail: "3 x 4-5 reps, 4-5s descent", restSeconds: 90, description: "Jump or step up to the top pull-up position (chin over the bar), then lower yourself down as slowly as you can, aiming for a full 4-5 second descent." },
      { name: "Australian / inverted rows", detail: "3 x 10-12 reps", restSeconds: 90, description: "Lie under a low bar with your body straight and heels on the ground, then pull your chest up to the bar by driving your elbows back, and lower with control." },
      { name: "Dead hangs", detail: "3 x max hold", restSeconds: 90, description: "Hang from a pull-up bar with straight arms and an active grip, holding for as long as you can without your shoulders fully collapsing." },
    ];
  } else if (pullUpMaxReps < 12 || !archerPullUp) {
    list = [
      { name: "Archer pull-ups", detail: "4 x 3-4 reps per side", restSeconds: 120, description: "Using a wide grip, pull yourself up toward one hand while keeping the other arm nearly straight out to the side, then alternate sides between reps." },
      equipment.weights
        ? { name: "Weighted pull-ups", detail: "3 x 5 reps (+5-10kg)", restSeconds: 150, description: "Attach extra weight via a dip belt, weighted vest, or held dumbbell, then perform standard pull-ups through a full range of motion." }
        : { name: "L-sit pull-ups", detail: "3 x 5 reps", restSeconds: 150, description: "Hold your legs out straight in front of you in an L-sit position and perform pull-ups without letting your legs drop." },
      { name: "Typewriter pull-ups", detail: "3 x 4 reps per side", restSeconds: 120, description: "Pull yourself up to the top of a wide-grip pull-up, then shift your whole body sideways from one hand to the other while staying at the top, like sliding along a typewriter carriage." },
    ];
  } else {
    list = [
      { name: "One-arm chin negatives", detail: "4 x 2-3 reps per side (assisted)", restSeconds: 150, description: "Starting at the top of a chin-up using mostly one arm (the other lightly assisting on a towel or the wrist), lower yourself down as slowly as possible under control." },
      equipment.weights
        ? { name: "Weighted pull-ups", detail: "4 x 4-5 reps (+15-20% bodyweight)", restSeconds: 180, description: "Attach extra weight via a dip belt, weighted vest, or held dumbbell, then perform standard pull-ups through a full range of motion." }
        : { name: "Tempo pull-ups (5s up, 3s hold, 5s down)", detail: "3 x 5 reps", restSeconds: 180, description: "Perform a pull-up taking a full 5 seconds to rise, pause and hold for 3 seconds at the top with your chin over the bar, then take 5 seconds to lower back down." },
      { name: "Typewriter pull-ups", detail: "3 x 4-5 reps per side", restSeconds: 150, description: "Pull yourself up to the top of a wide-grip pull-up, then shift your whole body sideways from one hand to the other while staying at the top, like sliding along a typewriter carriage." },
      { name: "Front lever pulls", detail: "3 x 4-5 reps", restSeconds: 150, description: "From a hanging front lever position (or the closest tuck/straddle variation you can hold), pull your chest toward the bar while keeping your body horizontal, then lower back to the hang." },
    ];
  }
  if (equipment.rings) {
    list.push({ name: "Ring rows (false grip)", detail: "3 x 8-10 reps", restSeconds: 90, description: "Set rings low, take a false grip (wrist over the top of the ring), and row your chest up toward the rings while keeping your body straight, then lower with control." });
  }
  if (equipment.monkeyBars) {
    list.push({ name: "Monkey bar traverse", detail: "3 x 1-2 laps", restSeconds: 90, cue: "Keep it continuous, don't rest mid-bar", description: "Swing hand over hand across a row of monkey bars without touching the ground, keeping a steady rhythm and letting your hips help drive momentum." });
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
        { name: `${apparatus === "ring" ? "Ring" : "Parallel bar"} dips`, detail: "4 x max reps", restSeconds: 90, description: "Support yourself above parallel bars or rings with arms straight, then lower your body by bending your elbows until your shoulders are roughly level with them, and press back up." },
        { name: "Negative dips", detail: "3 x 5 reps, 4s descent", restSeconds: 90, description: "Support yourself at the top of a dip on bars or rings, then lower yourself as slowly as possible until your shoulders reach elbow height, taking about 4 seconds." },
        { name: "Pike push-ups", detail: "3 x 8-10 reps", restSeconds: 75, description: "Start in a pike position with hips high and hands on the ground, then bend your elbows to lower your head toward the floor, and press back up." },
      ];
    }
    if (dipMaxReps < 15) {
      return [
        equipment.weights
          ? { name: "Weighted dips", detail: "4 x 6-8 reps", restSeconds: 120, description: "Attach extra weight via a dip belt or weighted vest, then perform standard dips through a full range of motion." }
          : { name: "Deficit dips (parallettes for extra ROM)", detail: "4 x 6-8 reps", restSeconds: 120, description: "Perform dips on raised parallettes or blocks so your hands start higher than a normal bar, allowing you to descend further than your shoulders for extra range of motion." },
        { name: "Slow-tempo dips", detail: "3 x 6 reps, 3s down / 3s up", restSeconds: 90, description: "Perform a standard dip but count a full 3 seconds on the way down and another 3 seconds pressing back up, staying controlled throughout." },
        { name: "Pseudo planche push-ups", detail: "3 x 8-10 reps", restSeconds: 90, description: "In a push-up position, lean your shoulders forward past your hands (fingers pointing toward your feet if comfortable) and perform push-ups from that forward-leaning position." },
      ];
    }
    return [
      equipment.weights
        ? { name: "Weighted dips", detail: "4 x 5-6 reps (+15-20% bodyweight)", restSeconds: 150, description: "Attach extra weight via a dip belt or weighted vest, then perform standard dips through a full range of motion." }
        : { name: "Tempo dips (4s down, 2s up)", detail: "4 x 5-6 reps", restSeconds: 150, description: "Perform a dip taking 4 full seconds to lower and 2 seconds to press back up, keeping the movement smooth and controlled the whole way." },
      { name: "Ring / bar support hold", detail: "3 x max hold", restSeconds: 90, description: "Support your body above rings or parallel bars with arms fully locked and shoulders depressed, holding the position as long as you can maintain good posture." },
      { name: "Planche push-ups", detail: "3 x 5 reps", restSeconds: 150, description: "Starting in a planche lean or tuck planche position (feet off the ground, shoulders well past your hands), bend your elbows to lower your chest and press back up without your feet touching down." },
    ];
  }
  if (dipMaxReps < 8) {
    return [
      { name: "Push-ups", detail: "4 x max reps", restSeconds: 90, description: "Starting in a plank with hands under your shoulders, lower your chest toward the ground by bending your elbows, keeping your body in a straight line, then press back up." },
      { name: "Decline push-ups", detail: "3 x 8-10 reps", restSeconds: 90, description: "With your feet elevated on a step or bench, perform a push-up by bending your elbows to lower your chest toward the ground and pressing back up." },
      { name: "Pike push-ups", detail: "3 x 8-10 reps", restSeconds: 75, description: "Start in a pike position with hips high and hands on the ground, then bend your elbows to lower your head toward the floor, and press back up." },
    ];
  }
  return [
    { name: "Archer push-ups", detail: "4 x 5-6 reps per side", restSeconds: 90, description: "With hands set wide, lower your chest toward one hand while keeping the other arm nearly straight out to the side, then press back up and alternate sides." },
    { name: "Diamond push-ups", detail: "3 x 10-12 reps", restSeconds: 90, description: "Place your hands close together under your chest with thumbs and index fingers touching to form a diamond shape, then perform a push-up, keeping your elbows closer to your body." },
    { name: "Pseudo planche push-ups", detail: "3 x 8-10 reps", restSeconds: 90, description: "In a push-up position, lean your shoulders forward past your hands (fingers pointing toward your feet if comfortable) and perform push-ups from that forward-leaning position." },
  ];
}
