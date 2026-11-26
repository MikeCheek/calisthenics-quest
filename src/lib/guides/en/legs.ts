import type { GuideTable } from "../index";

// Squats, lunges, single-leg work, hamstrings and jumps.
export const LEGS: GuideTable = {
  squat: {
    setup: ["Feet shoulder-width, toes turned out 10–30°; arms forward for balance."],
    steps: [
      "Break at the hips and knees together, sitting down and slightly back.",
      "Push the knees out over the toes as you go down until the thighs are at least parallel.",
      "Stand back up pushing through the whole foot, squeezing the glutes at the top.",
    ],
    targets: [
      "Depth: hip crease at knee height or lower (thighs parallel or below).",
      "Knees in line with the toes — they may pass the toes, they must not cave in.",
      "Heels down, chest up, back neutral; shins and torso at roughly the same angle.",
    ],
    mistakes: [
      ["Knees caving in", "Push the knees out over the toes."],
      ["Heels lifting", "Shift the weight to the mid-foot; widen the stance a little."],
      ["Lower back rounding at the bottom", "Go only as deep as you keep the back neutral."],
    ],
    breath: "Breathe in on the way down, breathe out on the way up.",
  },
  jumpSquat: {
    setup: ["Feet shoulder-width, toes slightly out, arms by the sides."],
    steps: [
      "Squat to about parallel, swinging the arms back.",
      "Drive up explosively, swinging the arms up, and leave the floor.",
      "Land on the balls of the feet, roll to the heels and sink straight into the next squat.",
    ],
    targets: [
      "Full extension in the air: hips, knees and ankles straight.",
      "Landing with the knees bent at least 45° and tracking over the toes.",
      "Quiet landing — loud landings mean stiff legs.",
    ],
    mistakes: [
      ["Landing with straight knees", "Land soft, already bending."],
      ["Knees caving in on the landing", "Push the knees out as you land."],
      ["No arm swing", "Swing the arms back down, then up hard."],
    ],
    breath: "Breathe in on the way down, breathe out sharply as you jump.",
  },
  sissySquat: {
    setup: ["Stand tall with the feet hip-width; hold a support lightly in the assisted versions."],
    steps: [
      "Rise onto the balls of the feet and push the knees forward.",
      "Lean the body back as the knees go forward, keeping a straight line from knees to head.",
      "Go down until the knees are close to the floor, then push back up with the thighs.",
    ],
    targets: [
      "Straight line from the knees to the shoulders: the hips don't bend.",
      "Heels up, knees travelling well past the toes.",
      "Slow, controlled lowering (3 s); the thighs do all the work.",
    ],
    mistakes: [
      ["Bending at the hips like a normal squat", "Squeeze the glutes and keep the line."],
      ["Going too deep too soon", "Use the support and a partial range."],
      ["Dropping fast", "Count 3 s down."],
    ],
    breath: "Breathe in on the way down, breathe out on the way up.",
  },
  splitSquat: {
    setup: ["Stand in a long split stance, about a leg's length between the feet; for the Bulgarian, the back foot on a bench."],
    steps: [
      "Lower straight down, bending both knees.",
      "Stop just before the back knee touches the floor.",
      "Push through the front foot to stand back up; finish all reps, then switch legs.",
    ],
    targets: [
      "Front knee at about 90° at the bottom, over the mid-foot.",
      "Front knee in line with the second toe.",
      "Torso upright or leaning slightly forward; hips square.",
    ],
    mistakes: [
      ["Front knee caving in", "Push it out over the toes."],
      ["Torso collapsing forward", "Chest up, shoulders over the hips."],
      ["Too short a stance (heel lifting)", "Lengthen the stance."],
    ],
    breath: "Breathe in on the way down, breathe out on the way up.",
  },
  cossack: {
    setup: ["Very wide stance, about twice shoulder width, toes turned slightly out."],
    steps: [
      "Shift the weight to one side, bending that knee deeply.",
      "Let the other leg straighten, pivoting onto its heel with the toes pointing up.",
      "Push back to the centre and go to the other side.",
    ],
    targets: [
      "Bent leg: heel down, knee over the toes, hip as low as the knee or lower.",
      "Straight leg: knee locked, toes to the ceiling.",
      "Chest up and back neutral; arms forward for balance.",
    ],
    mistakes: [
      ["Heel of the bent leg lifting", "Raise the heels on a plate, or go less deep."],
      ["Knee caving in", "Push it out over the toes."],
      ["Rounding the back", "Chest up; hold the arms forward."],
    ],
    breath: "Breathe in on the way down, breathe out on the way up.",
  },
  pistol: {
    setup: ["Stand on one leg; the other leg straight in front, arms forward for balance."],
    steps: [
      "Sit down on the standing leg, reaching the arms forward and lifting the free leg.",
      "Go as deep as you control: to a box, to parallel, or all the way down.",
      "Stand back up without bouncing out of the bottom.",
    ],
    targets: [
      "Heel of the standing leg on the floor the whole time.",
      "Knee tracking over the toes; hips square.",
      "Free leg straight and off the floor, in front of you.",
    ],
    mistakes: [
      ["Heel lifting", "Raise the heel slightly or work ankle mobility."],
      ["Knee caving in", "Push it out over the toes."],
      ["Collapsing at the bottom", "Lower slowly to a box that limits the depth."],
    ],
    breath: "Breathe in on the way down, breathe out on the way up.",
  },
  shrimpSquat: {
    setup: ["Stand on one leg; bend the other knee and hold that foot behind you (or not, in the harder versions)."],
    steps: [
      "Lean the torso forward and bend the standing knee.",
      "Lower until the back knee touches the floor lightly.",
      "Push back up through the front foot.",
    ],
    targets: [
      "The back knee touches lightly — never crashing.",
      "Front knee over the toes, heel down.",
      "Torso leaning forward about 45° to balance.",
    ],
    mistakes: [
      ["Crashing the back knee into the floor", "Put a pad down and control the descent."],
      ["Front heel lifting", "Keep the weight in the mid-foot."],
      ["Losing balance backwards", "Reach the free arm forward."],
    ],
    breath: "Breathe in on the way down, breathe out on the way up.",
  },
  jumpPistol: {
    setup: ["Very advanced: own clean pistols first. Stand on one leg on a soft, non-slip surface."],
    steps: [
      "Lower into a pistol, the free leg in front.",
      "Drive up explosively and leave the floor, arms swinging up.",
      "Land softly on the same leg and sink into the next rep (or onto the box).",
    ],
    targets: [
      "Landing on the ball of the foot, then the heel, with the knee bending.",
      "Knee over the toes on take-off and landing.",
      "Free leg out in front, off the floor.",
    ],
    mistakes: [
      ["Landing stiff-legged", "Bend the knee as you land."],
      ["Knee caving in", "Push it out over the toes."],
      ["Too many reps", "Short sets with full rest; stop when height drops."],
    ],
    breath: "Breathe out as you jump.",
  },
  calfRaise: {
    setup: ["Stand on the edge of a step with the balls of the feet on it (or on the floor), a hand on the wall for balance."],
    steps: [
      "Rise onto the toes as high as you can.",
      "Pause 1–2 s at the top.",
      "Lower slowly, letting the heels drop below the step.",
    ],
    targets: [
      "Full height at the top, the ankle fully extended.",
      "Weight through the big and second toes.",
      "Full stretch at the bottom, knees straight.",
    ],
    mistakes: [
      ["Bouncing out of the bottom", "Pause at the top and at the bottom."],
      ["Partial range", "All the way up and all the way down."],
      ["Rolling onto the outside of the foot", "Push through the big toe."],
    ],
    breath: "Breathe out as you rise, breathe in as you lower.",
  },
  nordic: {
    setup: ["Kneel on a pad with the heels anchored under a bar, a partner's hands or a band; arms ready in front."],
    steps: [
      "Squeeze the glutes so the body is straight from the knees to the head.",
      "Lower forward as slowly as you can, resisting with the hamstrings.",
      "Catch yourself with the hands (push-up catch), then push back or pull back up with the hamstrings.",
    ],
    targets: [
      "Hips straight — no bend at the waist.",
      "A 3–5 s lowering; the speed stays even to the end.",
      "Heels firmly anchored, knees padded.",
    ],
    mistakes: [
      ["Bending at the hips to shorten the lever", "Squeeze the glutes and keep the line."],
      ["Dropping fast at the end", "Catch with the hands earlier."],
      ["Heels slipping out", "Secure the anchor before you start."],
    ],
    breath: "Breathe in on the way down, breathe out on the way up.",
  },
  gluteBridge: {
    setup: ["Lie on your back, knees bent, feet hip-width and flat near the glutes; arms by the sides."],
    steps: [
      "Push through the heels and lift the hips (one leg straight up in the single-leg version).",
      "Squeeze the glutes hard at the top for 1–2 s.",
      "Lower slowly to just above the floor.",
    ],
    targets: [
      "At the top, a straight line from the knees to the shoulders.",
      "Knees bent at about 90° at the top, over the ankles.",
      "Ribs down — the lift comes from the hips, not from arching.",
    ],
    mistakes: [
      ["Pushing through the toes", "Push through the heels; lift the toes if needed."],
      ["Arching the lower back at the top", "Squeeze the glutes, ribs down."],
      ["Hips tilting (single-leg)", "Keep both hip bones level."],
    ],
    breath: "Breathe out as you lift, breathe in as you lower.",
  },
  hamstringBridge: {
    setup: ["Lie on your back with the heels on a bench (or the floor), legs nearly straight; arms by the sides."],
    steps: [
      "Dig the heels down and lift the hips.",
      "Hold the top or lower slowly, as the version asks.",
      "Lower to just above the floor and repeat.",
    ],
    targets: [
      "Knees almost straight (bent about 10–20°): the hamstrings do the work.",
      "Hips lifted into a straight line from the shoulders to the heels.",
      "Ribs down, no arching.",
    ],
    mistakes: [
      ["Arching the lower back", "Squeeze the glutes, ribs down."],
      ["Knees too bent", "Move the heels further away."],
      ["Cramping in the hamstrings", "Shorter sets; build up slowly."],
    ],
    breath: "Breathe out as you lift.",
  },
  singleLegRdl: {
    setup: ["Stand on one leg with a slight bend in the knee; arms by the sides or forward."],
    steps: [
      "Hinge forward from the hips, the free leg rising straight behind you.",
      "Go until the torso is nearly horizontal or the hamstring is fully stretched.",
      "Stand back up by squeezing the glute of the standing leg.",
    ],
    targets: [
      "Back flat: head, back and free leg in one line.",
      "Hips square to the floor: the free foot's toes point down.",
      "Standing knee slightly bent (about 15°) and still.",
    ],
    mistakes: [
      ["Rounding the back", "Chest forward, back flat."],
      ["Hip of the free leg opening up", "Point the back toes at the floor."],
      ["Locking or bending the knee a lot", "Keep the same slight bend."],
    ],
    breath: "Breathe in as you hinge, breathe out as you stand.",
  },
  broadJump: {
    setup: ["Feet hip-width, arms ready to swing; open space in front."],
    steps: [
      "Swing the arms back while bending the hips and knees.",
      "Jump forward explosively, swinging the arms forward.",
      "Bring the knees forward in the air and land with bent knees; hold the landing.",
    ],
    targets: [
      "Take-off at about 45°, full extension of hips, knees and ankles.",
      "Landing with the knees over the toes and the hips back.",
      "Stick the landing for 2 s without stepping.",
    ],
    mistakes: [
      ["Landing stiff", "Bend the hips and knees to absorb."],
      ["Knees caving on the landing", "Push them out."],
      ["No arm swing", "Swing the arms hard."],
    ],
    breath: "Breathe in on the swing back, breathe out as you jump.",
  },
  boxJumpBack: {
    setup: ["Stand on a low box or step with open, soft floor behind you."],
    steps: [
      "Bend the knees slightly and swing the arms.",
      "Jump back off the box.",
      "Land softly on the floor with bent knees; step back up and repeat.",
    ],
    targets: [
      "Land on the balls of the feet, then the heels, knees bent.",
      "Look forward, not down at your feet.",
      "Hips and knees absorb the landing quietly.",
    ],
    mistakes: [
      ["Landing stiff", "Bend the knees on landing."],
      ["Starting from too high a box", "Start low and progress."],
      ["Leaning forward on landing", "Stay upright, chest up."],
    ],
    breath: "Breathe out as you land.",
  },
  singleLegHop: {
    setup: ["Stand on one leg with the knee slightly bent, arms ready."],
    steps: [
      "Hop forward (or in place) on one leg.",
      "Land softly on the same leg and freeze for 2 s.",
      "Do the reps, then switch legs.",
    ],
    targets: [
      "Land with the knee bent and tracking over the toes.",
      "Hips level, not dropping on the free-leg side.",
      "Quiet landing, balance held without a wobble.",
    ],
    mistakes: [
      ["Knee caving in on the landing", "Push it out over the toes."],
      ["Landing stiff", "Bend the knee as you land."],
      ["Losing the balance", "Make the hops smaller."],
    ],
    breath: "Breathe out as you hop.",
  },
};
