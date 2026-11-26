import type { GuideTable } from "../index";

// Yoga: the foundation poses, crow family, headstand and the deeper folds.
export const YOGA4: GuideTable = {
  chaturanga: {
    setup: ["Start in a high plank: hands under the shoulders, fingers spread, body straight from head to heels."],
    steps: [
      "Shift forward onto the tips of the toes so the shoulders move past the wrists.",
      "Bend the elbows straight back, hugging them to the ribs, and lower as one piece.",
      "Stop when the elbows are at 90° and the shoulders are at elbow height; hold, then press up or move to upward dog.",
    ],
    targets: [
      "Elbows at 90°, stacked over the wrists, hugging the ribs and pointing back.",
      "Shoulders at elbow height — not lower, and not rolling forward.",
      "Body straight from head to heels, as in a plank.",
    ],
    mistakes: [
      ["Sinking below elbow height", "Stop higher; the shoulders protect themselves at 90°."],
      ["Elbows flaring out", "Squeeze them along the ribs."],
      ["Hips sagging or piking", "Lower the knees to the mat until the body stays straight."],
    ],
    breath: "Exhale as you lower.",
  },
  vinyasa: {
    setup: ["Start in a high plank (or come into it from a forward fold), hands under the shoulders."],
    steps: [
      "Exhale: lower through chaturanga, elbows by the ribs.",
      "Inhale: roll over the toes into upward dog — arms straight, chest forward and up, thighs off the floor.",
      "Exhale: lift the hips up and back into downward dog.",
    ],
    targets: [
      "Chaturanga: elbows at 90°, shoulders at elbow height.",
      "Upward dog: shoulders over the wrists, only the hands and the tops of the feet touching the floor.",
      "Downward dog: hips high, a straight line from the hands to the hips.",
    ],
    mistakes: [
      ["Collapsing into the floor in chaturanga", "Lower the knees, or go to cobra instead of upward dog."],
      ["Shoulders by the ears in upward dog", "Press down and roll the shoulders back."],
      ["Racing through it", "One movement per breath."],
    ],
    breath: "Exhale chaturanga, inhale upward dog, exhale downward dog.",
  },
  jumpBack: {
    setup: ["From a forward fold or a squat, put the hands flat on the floor shoulder-width apart, fingers spread."],
    steps: [
      "Bend the knees and lean the shoulders forward over the hands.",
      "Hop the feet back, bending the elbows as the feet land.",
      "Land in chaturanga, then continue to upward dog.",
    ],
    targets: [
      "Shoulders over or past the wrists before the jump.",
      "Land on the balls of the feet, legs straight, elbows already bent to 90°.",
      "Body straight on landing — no belly flop.",
    ],
    mistakes: [
      ["Landing with locked arms", "Bend the elbows as the feet land."],
      ["Landing heavily", "Lean further forward before jumping; jump lighter."],
      ["Hips sagging on landing", "Brace the core before you jump."],
    ],
    breath: "Exhale as you jump back.",
  },
  downDog: {
    setup: ["From all fours: hands shoulder-width, fingers spread with the middle finger forward; knees under the hips."],
    steps: [
      "Tuck the toes and lift the hips up and back.",
      "Straighten the arms and lengthen the spine from the hands to the tailbone, knees bent at first.",
      "Straighten the legs as far as the back stays long, heels reaching towards the floor; hold.",
    ],
    targets: [
      "An upside-down V: a straight line from the hands to the hips.",
      "Arms straight, ears between the upper arms, shoulders rolled away from the ears.",
      "Heels towards the floor — they don't have to touch; the knees bend if the back rounds.",
    ],
    mistakes: [
      ["Rounding the back to straighten the legs", "Bend the knees and push the hips back."],
      ["Shoulders hunched by the ears", "Roll them out and away."],
      ["Weight collapsing into the wrists", "Press through the fingertips and knuckles."],
    ],
    breath: "Slow, deep breaths through the nose.",
  },
  dogPedal: {
    setup: ["Start in downward dog, hips high, arms straight."],
    steps: [
      "Bend one knee and press the other heel towards the floor.",
      "Switch slowly, like walking in place, feeling each calf and hamstring.",
      "Continue for the time, then hold the still pose.",
    ],
    targets: [
      "Hips stay high and still — they don't sway side to side.",
      "Each heel in turn reaches towards the floor, the leg straight.",
      "Arms straight and shoulders open throughout.",
    ],
    mistakes: [
      ["Hips swaying", "Keep the hips square and high."],
      ["Pedalling fast", "Slow pedal: one breath per side."],
      ["Arms bending as you shift", "Keep pushing the floor away."],
    ],
    breath: "Breathe steadily; one breath per leg change.",
  },
  dolphin: {
    setup: ["Forearms on the floor, elbows under the shoulders and shoulder-width; hands clasped or forearms parallel."],
    steps: [
      "Tuck the toes and lift the hips into an upside-down V.",
      "Walk the feet in towards the elbows as far as the back stays long.",
      "Push the forearms down to lift the shoulders; hold.",
    ],
    targets: [
      "Elbows shoulder-width — they don't slide out.",
      "Shoulders lifted away from the floor, head off the floor.",
      "Back long; the knees bend if needed.",
    ],
    mistakes: [
      ["Elbows sliding out", "Hold a strap above the elbows or press them in."],
      ["Shoulders collapsing to the floor", "Push the forearms down actively."],
      ["Rounded back", "Bend the knees and push the hips up."],
    ],
    breath: "Slow, steady breathing.",
  },
  cobra: {
    setup: ["Lie face down, hands under the shoulders, elbows close to the body, legs together with the tops of the feet down."],
    steps: [
      "Press the tops of the feet and the pubic bone into the mat.",
      "Inhale: lift the chest using the back muscles; the hands only help a little.",
      "Hold with the elbows bent, then exhale and lower.",
    ],
    targets: [
      "Elbows bent and hugging the body; the lower ribs on or near the mat.",
      "Shoulders down and back, chest forward.",
      "Neck long — gaze forward and slightly down.",
    ],
    mistakes: [
      ["Pushing high with straight arms", "Lift with the back, keep the elbows bent."],
      ["Shoulders by the ears", "Roll them down and back."],
      ["Cranking the neck back", "Keep the gaze forward."],
    ],
    breath: "Inhale to lift, exhale to lower.",
  },
  locust: {
    setup: ["Lie face down, arms beside the body with the palms down, legs together, forehead on the mat."],
    steps: [
      "Inhale: lift the head, chest and arms off the mat.",
      "Lift the straight legs at the same time, reaching back through the toes.",
      "Hold for a few breaths, then exhale and lower.",
    ],
    targets: [
      "Legs straight and lifted from the hips, together or hip-width.",
      "Arms reaching back by the sides, shoulder blades drawn together.",
      "Neck long: gaze on the floor a little in front.",
    ],
    mistakes: [
      ["Bending the knees to lift the feet", "Lift less with straight legs."],
      ["Cranking the neck up", "Gaze at the floor."],
      ["Holding the breath", "Breathe steadily in the hold."],
    ],
    breath: "Inhale to lift, breathe steadily in the hold.",
  },
  crow: {
    setup: ["Squat with the feet together and the knees wide; hands flat on the floor shoulder-width, fingers spread."],
    steps: [
      "Bend the elbows back and place the knees high on the backs of the upper arms.",
      "Lean forward until the weight is on the hands and the feet feel light.",
      "Lift one foot, then the other, heels towards the glutes; hold, then lower softly.",
    ],
    targets: [
      "Elbows bent to about 90°, stacked over the wrists and hugging in.",
      "Knees pressing into the arms, feet together.",
      "Gaze 30 cm in front of the hands; a cushion in front of the face helps.",
    ],
    mistakes: [
      ["Jumping into it", "Lean until the feet float by themselves."],
      ["Elbows splaying out", "Squeeze them in."],
      ["Looking down at the hands", "Look forward."],
    ],
    breath: "Short, calm breaths.",
  },
  sideCrow: {
    setup: ["Squat with the knees together; twist to the right and put both hands on the floor beside the outer right thigh, shoulder-width."],
    steps: [
      "Bend the elbows and rest the outer left thigh on the back of the left upper arm.",
      "Lean forward until the feet float.",
      "Lift both feet together, legs stacked; hold, then switch side.",
    ],
    targets: [
      "Elbows at 90°, stacked over the wrists, like a chaturanga.",
      "Knees together, hips resting on the arm shelf.",
      "Gaze forward, not down.",
    ],
    mistakes: [
      ["Not twisting enough", "Twist until the thigh is well over the arm."],
      ["Elbows splaying out", "Hug them in."],
      ["Jumping the feet up", "Lean until the feet float."],
    ],
    breath: "Short breaths; exhale as you lean.",
  },
  crowJumpBack: {
    setup: ["Start in a steady crow pose."],
    steps: [
      "Lean a little further forward to make the legs light.",
      "Shoot both legs straight back at once.",
      "Land in chaturanga with the elbows bent at 90°, then continue to upward dog.",
    ],
    targets: [
      "Land on the balls of the feet, legs straight and together.",
      "Elbows stay bent at 90° — the arms don't straighten on landing.",
      "Body straight in chaturanga after the landing.",
    ],
    mistakes: [
      ["Straightening the arms on landing", "Keep the elbows bent."],
      ["Landing heavily", "Lean further forward first."],
      ["Hips sagging on landing", "Brace the core before you shoot back."],
    ],
    breath: "Exhale as you jump back.",
  },
  headstandTuck: {
    setup: ["Set up as for the headstand: forearms down, hands clasped, elbows shoulder-width, crown of the head on the floor against the hands."],
    steps: [
      "Lift the hips and walk the feet in until the hips are over the shoulders.",
      "Draw the knees to the chest and lift the feet off the floor.",
      "Hold the tuck with the back vertical, then lower the feet.",
    ],
    targets: [
      "Hips stacked over the shoulders before the feet lift.",
      "Knees tucked tight to the chest.",
      "Weight mostly on the forearms, shoulders lifted from the floor.",
    ],
    mistakes: [
      ["Hips behind the shoulders", "Walk the feet in further."],
      ["Jumping the feet up", "Lift slowly once the hips are stacked."],
      ["Weight sinking onto the neck", "Press the forearms down."],
    ],
    breath: "Steady breaths.",
  },
  headstand: {
    setup: ["In open space, with a soft surface around. Forearms down, hands clasped, crown of the head on the floor against the hands."],
    steps: [
      "Lift the hips over the shoulders by walking the feet in.",
      "Tuck the knees to the chest, then straighten the legs up to the ceiling.",
      "Hold, then come down the same way: tuck, then feet down.",
    ],
    targets: [
      "Body vertical: ankles, hips and shoulders stacked.",
      "Forearms pressing down, shoulders lifted away from the floor.",
      "Legs together, glutes and abs engaged, ribs closed.",
    ],
    mistakes: [
      ["Arching the back", "Engage the abs and close the ribs."],
      ["Weight on the neck", "Press the forearms down."],
      ["Kicking up", "Lift through the tuck."],
    ],
    breath: "Steady breaths; come down at any neck discomfort.",
  },
  boatPose: {
    setup: ["Sit with the knees bent and the feet on the mat; hands behind the thighs."],
    steps: [
      "Lean back slightly, lifting the chest and lengthening the spine.",
      "Lift the feet so the shins are parallel to the floor (or straighten the legs).",
      "Release the hands and reach the arms forward; hold.",
    ],
    targets: [
      "A V between the torso and the legs; spine long, chest lifted.",
      "Shins parallel to the floor (bent version) or legs at about 45° (straight).",
      "Balance on the sitting bones, not the tailbone.",
    ],
    mistakes: [
      ["Rounded back", "Bend the knees and lift the chest."],
      ["Shoulders hunched", "Drop them away from the ears."],
      ["Holding the breath", "Breathe steadily."],
    ],
    breath: "Steady breathing.",
  },
  halfSplit: {
    setup: ["From a low lunge with the right foot forward, shift the hips back over the left knee; hands on the floor or on blocks beside the front leg."],
    steps: [
      "Straighten the front leg, flexing the foot so the toes point up.",
      "Keep the back long and hinge forward from the hips.",
      "Hold, then switch side.",
    ],
    targets: [
      "Hips stacked over the back knee.",
      "Front leg straight, toes pointing up.",
      "Back flat — the fold comes from the hips.",
    ],
    mistakes: [
      ["Rounding the back", "Use blocks and lead with the chest."],
      ["Hips not over the back knee", "Shift them back."],
      ["Locking the front knee", "Keep a micro-bend."],
    ],
    breath: "Exhale to fold forward.",
  },
  lizard: {
    setup: ["From a low lunge with the right foot forward, put both hands inside the right foot."],
    steps: [
      "Walk the right foot slightly to the right, toes turned out a little.",
      "Sink the hips forward and down; lower onto the forearms if it comes easily.",
      "Hold, then switch side.",
    ],
    targets: [
      "Front knee over the ankle.",
      "Hips sinking towards the floor; back leg long (knee up or down).",
      "Shoulders pushed away from the floor.",
    ],
    mistakes: [
      ["Front knee caving in", "Let it open slightly out."],
      ["Shoulders collapsing", "Push the floor away."],
      ["Forcing the depth", "Stay on the hands until the forearms come easily."],
    ],
    breath: "Long exhales.",
  },
  middleSplit: {
    setup: ["Stand with the feet wide, toes forward; hands on the floor or on blocks under the shoulders."],
    steps: [
      "Slide the feet apart a few centimetres at a time, keeping the weight in the hands.",
      "Keep the hips in line with the feet and the toes pointing forward or up.",
      "Lower to the forearms only if the hips stay in line; hold, then walk the feet in to come out.",
    ],
    targets: [
      "Knees and toes pointing up or forward — never rolling in.",
      "Hips in line with the heels, not sitting back behind them.",
      "Back long, the stretch along the inner thighs, not in the knees.",
    ],
    mistakes: [
      ["Knees rolling inwards", "Turn the toes up and engage the thighs."],
      ["Hips drifting back to go lower", "Push them forward even if you stay higher."],
      ["Dropping the weight into the stretch", "Keep the hands carrying part of the weight."],
    ],
    breath: "Long exhales; relax the inner thighs on each one.",
  },
  wideFold: {
    setup: ["Stand with the feet about 1–1.2 m apart, outer edges parallel; hands on the hips."],
    steps: [
      "Inhale and lift the chest; exhale and hinge forward from the hips with a long back.",
      "Bring the hands to the floor under the shoulders, fingers in line with the toes.",
      "Bend the elbows back and fold deeper, the crown of the head towards the floor; hold.",
    ],
    targets: [
      "Feet parallel, outer edges in line, weight on the balls of the feet as much as the heels.",
      "Hips stacked over the ankles — not leaning back.",
      "The fold comes from the hips; the back stays long, elbows over the wrists.",
    ],
    mistakes: [
      ["Feet turning out", "Make the outer edges parallel."],
      ["Rounding the back to get the head down", "Hands on blocks, lead with the chest."],
      ["Weight sinking into the heels", "Shift the hips slightly forward."],
    ],
    breath: "Inhale to lengthen, exhale to fold deeper.",
  },
  headToKnee: {
    setup: ["Sit with the left leg straight; bend the right knee and put the right sole against the inner left thigh. Sit on a cushion if the back rounds."],
    steps: [
      "Turn the chest to face the straight leg, the belly over the thigh.",
      "Inhale and lengthen; exhale and fold forward over the leg from the hips.",
      "Hold the shin, ankle or foot; hold, then switch side.",
    ],
    targets: [
      "Chest centred over the straight leg, the belly moving towards the thigh first.",
      "Straight leg active: kneecap up, foot flexed.",
      "Bent knee resting out to the side at about 90° from the straight leg.",
    ],
    mistakes: [
      ["Rounding the upper back to reach the foot", "Hold the shin; lead with the chest."],
      ["Chest twisting away from the leg", "Turn the torso over the straight leg."],
      ["Forcing the fold", "Breathe and let it come."],
    ],
    breath: "Inhale to lengthen, exhale to fold a little further.",
  },
  butterfly: {
    setup: ["Sit with the soles of the feet together and the knees open; sit on a cushion if the lower back rounds."],
    steps: [
      "Hold the feet or the ankles and sit up tall.",
      "Let the knees fall towards the floor under their own weight.",
      "For more stretch, hinge forward from the hips with a long spine; hold.",
    ],
    targets: [
      "Spine tall, weight on the front of the sitting bones.",
      "Knees relaxed out to the sides — gravity, not pressure, takes them down.",
      "Feet closer to the hips for the inner thighs, further away for the hips and back.",
    ],
    mistakes: [
      ["Slumping the back", "Sit on a cushion and grow tall."],
      ["Pushing the knees down with the hands", "Let them fall on their own."],
      ["Bouncing the knees", "Stay still and breathe."],
    ],
    breath: "Slow, deep breaths into the belly.",
  },
  childsPose: {
    setup: ["Kneel with the big toes together; knees together (back stretch) or wide (hips and shoulders)."],
    steps: [
      "Sit the hips back towards the heels.",
      "Fold forward and rest the forehead on the mat (or on a cushion).",
      "Reach the arms forward or rest them beside the body; relax and hold.",
    ],
    targets: [
      "Hips sinking towards the heels.",
      "Forehead resting, neck relaxed.",
      "Shoulders soft; the back widening with each breath.",
    ],
    mistakes: [
      ["Forcing the hips down", "Put a cushion between the heels and the hips."],
      ["Shoulders tense by the ears", "Rest the arms by the sides instead."],
      ["Holding the breath", "Breathe into the back of the ribs."],
    ],
    breath: "Long, slow breaths into the back of the ribs.",
  },
};
