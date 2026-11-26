import type { GuideTable } from "../index";

// Planks, leg raises, hollow work, compression and the back of the body.
export const CORE: GuideTable = {
  plank: {
    setup: ["Forearms (or hands, in a high plank) on the floor with the elbows under the shoulders; feet together, toes tucked."],
    steps: [
      "Lift the knees so the body is one straight line.",
      "Squeeze glutes and abs and push the floor away slightly with the forearms.",
      "Hold the time without moving, then lower the knees.",
    ],
    targets: [
      "Head, shoulders, hips and heels in one straight line.",
      "Elbows directly under the shoulders (90° at the elbow on the forearms).",
      "Pelvis slightly tucked: no arch in the lower back; gaze at the floor.",
    ],
    mistakes: [
      ["Hips sagging", "Squeeze the glutes and tuck the pelvis."],
      ["Hips too high", "Lower them in line with the shoulders."],
      ["Holding the breath", "Breathe short and steady."],
    ],
    breath: "Breathe steadily throughout the hold.",
  },
  sidePlank: {
    setup: ["Lie on one side; forearm on the floor with the elbow under the shoulder, legs straight and stacked (knees bent for the easy version)."],
    steps: [
      "Lift the hips until the body is straight.",
      "Hold — or dip the hips and lift them, or raise the top leg, as the version asks.",
      "Lower and switch side.",
    ],
    targets: [
      "Elbow directly under the shoulder, forearm pointing forward.",
      "Head, hips and feet in a straight line, seen from the front and from the side.",
      "Hips stacked, not rolling forward or back.",
    ],
    mistakes: [
      ["Hips sagging", "Push the bottom hip up towards the ceiling."],
      ["Hips rolling forward", "Stack the top hip right over the bottom one."],
      ["Shoulder sinking into the neck", "Push the floor away with the forearm."],
    ],
    breath: "Steady breaths; breathe out as the hips rise in the dips.",
  },
  reversePlank: {
    setup: ["Sit with the legs straight; hands on the floor just behind the hips, fingers pointing towards the feet."],
    steps: [
      "Push into the hands and heels and lift the hips.",
      "Make the body a straight line from the shoulders to the heels, toes pointing.",
      "Hold the time, then lower the hips.",
    ],
    targets: [
      "Arms straight, wrists under the shoulders.",
      "Hips level: a straight line from the shoulders to the heels.",
      "Chest open, shoulders away from the ears, head neutral.",
    ],
    mistakes: [
      ["Hips sagging", "Squeeze the glutes and the hamstrings."],
      ["Shrugging", "Push the floor away."],
      ["Head dropping back", "Look slightly forward, towards the toes."],
    ],
    breath: "Steady breathing throughout.",
  },
  copenhagen: {
    setup: ["Side plank with the top leg resting on a bench — the knee on it (easier) or the inner foot (full); the bottom leg free under the bench."],
    steps: [
      "Press the top leg down into the bench and lift the hips.",
      "Bring the bottom leg up to meet the bench (full version) or keep it lightly on the floor.",
      "Hold (or walk the hands out, or reach, as asked), then lower and switch side.",
    ],
    targets: [
      "Body straight from head to feet, hips stacked.",
      "Elbow directly under the shoulder.",
      "The inner thigh of the top leg does the lifting.",
    ],
    mistakes: [
      ["Hips sagging towards the floor", "Press the top leg harder into the bench."],
      ["Long lever too soon", "Start with the knee on the bench."],
      ["Rolling forward", "Stack the hips and open the chest."],
    ],
    breath: "Short, steady breaths.",
  },
  hangingLegRaise: {
    setup: ["Hang from the bar with straight arms and active shoulders, body still."],
    steps: [
      "Lift the knees (or the straight legs) by curling the pelvis up.",
      "Reach the height asked: knees to the chest, legs horizontal, or toes to the bar.",
      "Lower slowly to the straight hang without swinging.",
    ],
    targets: [
      "The pelvis rolls up: the rep ends with the lower back rounded, not just the legs lifted.",
      "Straight-leg versions: knees locked, legs together.",
      "Toes-to-bar: the toes touch the bar between the hands.",
    ],
    mistakes: [
      ["Swinging for momentum", "Pause still at the bottom of each rep."],
      ["Dropping the legs", "Lower in 2–3 s."],
      ["Shrugged shoulders", "Pull the shoulders down before you start."],
    ],
    breath: "Breathe out as you lift, breathe in as you lower.",
  },
  lyingLegRaise: {
    setup: ["Lie on your back, hands by the hips or under the lower back, legs straight and together."],
    steps: [
      "Press the lower back into the floor.",
      "Lift the straight legs to vertical.",
      "Lower them slowly to just above the floor, without arching.",
    ],
    targets: [
      "Lower back flat on the floor the whole time.",
      "Legs straight; vertical at the top (90° at the hip).",
      "Stop the descent where the back would lift.",
    ],
    mistakes: [
      ["Lower back arching", "Lower the legs only as far as the back stays flat."],
      ["Using momentum", "Slow down: 2 s up, 3 s down."],
      ["Knees bending and straightening", "Pick straight or slightly bent and keep it."],
    ],
    breath: "Breathe out as the legs rise, breathe in as they lower.",
  },
  windshieldWipers: {
    setup: ["Hang from the bar and lift the legs to the bar (or lie on your back with the legs vertical and the arms out in a T)."],
    steps: [
      "With the legs up, rotate them slowly to one side.",
      "Return through the centre and rotate to the other side.",
      "Keep the movement controlled from start to finish.",
    ],
    targets: [
      "Legs together and straight, at about 90° from the torso.",
      "The rotation comes from the waist; the shoulders stay square.",
      "Range: as far as you control without dropping the legs.",
    ],
    mistakes: [
      ["Legs dropping as they rotate", "Keep the hip angle at 90°."],
      ["Swinging the body", "Slow down at each side."],
      ["Too much range too soon", "Increase the rotation gradually."],
    ],
    breath: "Breathe out as you rotate to the side, breathe in back to centre.",
  },
  sideLyingLift: {
    setup: ["Lie on one side, legs straight and stacked, head on the bottom arm, top hand on the floor in front of you."],
    steps: [
      "Lift the top leg (or both legs, as asked) slowly to about 45°.",
      "Pause briefly at the top.",
      "Lower slowly without touching down, then repeat; switch side.",
    ],
    targets: [
      "Body in one line from head to feet; hips stacked.",
      "Toes pointing forward, not to the ceiling.",
      "The lift comes from the side of the hip, not from rolling back.",
    ],
    mistakes: [
      ["Hip rolling back", "Stack the hips and point the toes forward."],
      ["Swinging the leg", "Slow, controlled lift."],
      ["Lifting too high", "Stop at about 45°."],
    ],
    breath: "Breathe out as you lift, breathe in as you lower.",
  },
  adductorSqueeze: {
    setup: ["Lie on your side; bend the top leg and put the foot on the floor in front of the bottom knee. The bottom leg straight."],
    steps: [
      "Lift the bottom leg by squeezing the inner thigh.",
      "Pause at the top for 1 s.",
      "Lower slowly; do the reps, then switch side.",
    ],
    targets: [
      "Bottom leg straight, lifted 10–20 cm.",
      "Hips stacked, not rolling back.",
      "Slow tempo with a clear pause at the top.",
    ],
    mistakes: [
      ["Rolling backwards", "Keep the hips stacked."],
      ["Bending the working knee", "Keep it straight."],
      ["Rushing the reps", "Pause at the top."],
    ],
    breath: "Breathe out as you lift.",
  },
  hollow: {
    setup: ["Lie on your back, arms straight overhead by the ears, legs straight and together."],
    steps: [
      "Press the lower back firmly into the floor.",
      "Lift the shoulders and the legs off the floor.",
      "Hold the shape (or rock gently in it, keeping the shape the same).",
    ],
    targets: [
      "Lower back glued to the floor — that's the whole point.",
      "Shoulder blades off the floor; legs about 15–30 cm up.",
      "Arms by the ears, legs together and straight, toes pointed.",
    ],
    mistakes: [
      ["Lower back lifting", "Raise the legs higher, bend the knees or bring the arms forward."],
      ["Chin jutting forward", "Look at your toes, neck long."],
      ["Going lower than you control", "Lower only as far as the back stays down."],
    ],
    breath: "Short, steady breaths into the belly.",
  },
  deadBug: {
    setup: ["Lie on your back, arms straight up to the ceiling, hips and knees bent at 90° (shins parallel to the floor)."],
    steps: [
      "Press the lower back into the floor.",
      "Slowly extend the opposite arm and leg until they're just above the floor.",
      "Return to the start and switch side.",
    ],
    targets: [
      "Lower back stays on the floor the whole time.",
      "Hips and knees at 90° in the start position.",
      "The extended arm and leg are long and just above the floor.",
    ],
    mistakes: [
      ["Lower back arching", "Reduce the range of the arm and leg."],
      ["Rushing", "3 s out, 3 s back."],
      ["Holding the breath", "Breathe out as you extend."],
    ],
    breath: "Breathe out as you extend, breathe in as you return.",
  },
  dragonFlag: {
    setup: ["Lie on a bench and grip it behind your head (or a post behind you)."],
    steps: [
      "Roll up onto the upper back, lifting the body straight up like a board.",
      "Lower slowly, keeping the body straight from the shoulders to the feet.",
      "Hold at the bottom just above the bench, or lift back up for raises.",
    ],
    targets: [
      "Body straight from the shoulders to the feet — no bend at the hips.",
      "Weight on the upper back and the shoulder blades, never the neck.",
      "Lowering in 3–5 s.",
    ],
    mistakes: [
      ["Bending at the hips", "Squeeze the glutes; use the tuck or straddle to shorten the lever."],
      ["Dropping fast", "Lower slowly."],
      ["Resting on the neck", "Weight on the shoulder blades."],
    ],
    breath: "Breathe out on the way up, breathe in as you lower.",
  },
  lSit: {
    setup: ["On parallettes, dip bars or the floor: hands beside the hips, arms straight, fingers forward."],
    steps: [
      "Push down hard and lift the hips off the floor.",
      "Lift the legs in front: tuck, one leg straight, or both straight.",
      "Hold with the shoulders pushed down, then lower the feet.",
    ],
    targets: [
      "Arms locked straight, shoulders depressed — long neck.",
      "Legs horizontal: 90° at the hip.",
      "Full version: knees locked, toes pointed, legs together.",
    ],
    mistakes: [
      ["Collapsed shoulders", "Push the floor or the bars down hard."],
      ["Legs drooping below horizontal", "Use the tuck until the legs stay up."],
      ["Bent knees in the full version", "Lock the knees and point the toes."],
    ],
    breath: "Short, steady breaths.",
  },
  vSit: {
    setup: ["Start in an L-sit (or sit in a pike with the hands beside the hips for compression holds), arms straight."],
    steps: [
      "Lean the shoulders slightly back while pushing down.",
      "Raise the legs above horizontal, towards the face.",
      "Hold with the legs straight, then lower.",
    ],
    targets: [
      "Legs above horizontal: the hip angle is below 90°.",
      "Arms straight, hands beside or slightly behind the hips.",
      "Legs straight and compressed towards the torso.",
    ],
    mistakes: [
      ["Bending the knees", "Keep them locked; build compression with pike holds."],
      ["Shoulders shrugging", "Push the floor down, long neck."],
      ["Leaning back too much", "Lean just enough to balance."],
    ],
    breath: "Short breaths; the belly is compressed.",
  },
  manna: {
    setup: ["Extremely advanced: own a solid V-sit first. Hands behind the hips with the fingers pointing back."],
    steps: [
      "From the V-sit, push the shoulders back behind the hands.",
      "Lift the hips higher, bringing the legs towards the face.",
      "Hold the extreme compression, then lower back to the V.",
    ],
    targets: [
      "Shoulders strongly extended behind the hands.",
      "Legs straight, well above horizontal.",
      "Arms locked straight.",
    ],
    mistakes: [
      ["Bent arms", "Lock them; go back to V-sit work."],
      ["Too much volume", "Short holds with long rests for the shoulders."],
      ["Legs dropping", "Work compression and shoulder extension separately."],
    ],
    breath: "Short breaths.",
  },
  hipToShoulderRoll: {
    setup: ["Lie on your back, arms beside the body, palms down."],
    steps: [
      "Lift the legs and roll the hips up over the shoulders.",
      "Hold briefly with the hips stacked over the shoulders.",
      "Roll back down one vertebra at a time.",
    ],
    targets: [
      "Hips stacked over the shoulders at the top.",
      "Weight on the shoulders and arms, never the neck; don't turn the head.",
      "Slow, controlled rolling both ways.",
    ],
    mistakes: [
      ["Rolling onto the neck", "Keep the weight on the shoulder blades."],
      ["Rolling down too fast", "Control the descent."],
      ["Using momentum to get up", "Lift with the abs."],
    ],
    breath: "Breathe out as you roll up, breathe in as you roll down.",
  },
  ytw: {
    setup: ["Lie face down, forehead on a towel, arms out (with light weights only if the version asks)."],
    steps: [
      "Lift the arms in a Y shape, thumbs up; hold 2 s, lower.",
      "Lift the arms in a T shape; hold 2 s, lower.",
      "Bend the elbows to 90° and lift in a W, squeezing the shoulder blades; hold, lower.",
    ],
    targets: [
      "Thumbs pointing up in the Y and T.",
      "Shoulder blades squeezed together and down — not shrugged.",
      "Neck relaxed, forehead close to the floor.",
    ],
    mistakes: [
      ["Lifting the head", "Keep the forehead down."],
      ["Shrugging", "Shoulder blades down and back."],
      ["Swinging the arms up", "Slow lifts with a pause."],
    ],
    breath: "Breathe out as you lift.",
  },
  superman: {
    setup: ["Lie face down, arms straight overhead, legs straight (or knees down for the easy version)."],
    steps: [
      "Lift the arms, the chest and the legs off the floor together.",
      "Hold, or lift and lower for raises.",
      "Lower slowly.",
    ],
    targets: [
      "Arms and legs straight and long.",
      "Head in line with the spine, eyes on the floor.",
      "Glutes squeezed; the lift is spread along the whole back.",
    ],
    mistakes: [
      ["Cranking the neck up", "Keep it neutral."],
      ["Bent knees", "Straighten the legs."],
      ["Holding the breath", "Breathe steadily."],
    ],
    breath: "Breathe out as you lift.",
  },
};
