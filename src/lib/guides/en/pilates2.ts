import type { GuideTable } from "../index";

// Mat Pilates: seated spine work, extension, side-lying and plank series.
export const PILATES2: GuideTable = {
  spineStretch: {
    setup: ["Sit tall with the legs straight and a little wider than the hips, feet flexed; arms reaching forward at shoulder height."],
    steps: [
      "Inhale and grow tall through the crown of the head.",
      "Exhale: nod the chin and round forward one vertebra at a time, as if over a big ball, reaching the hands forward.",
      "Inhale and restack the spine from the bottom up to sitting tall.",
    ],
    targets: [
      "A C curve: the stretch is along the whole back, the hips stay stacked and still.",
      "Sitting bones heavy on the mat; legs straight, kneecaps up.",
      "Arms parallel to the floor, shoulders relaxed.",
    ],
    mistakes: [
      ["Hinging forward with a flat back", "Round the spine as if over a ball."],
      ["Rocking back off the sitting bones", "Sit on a cushion if the pelvis tips back."],
      ["Shoulders creeping up", "Reach forward, shoulders down."],
    ],
    breath: "Exhale as you round forward, inhale as you restack.",
  },
  mermaid: {
    setup: ["Sit with both legs bent to the right (z-sit); left hand on the left shin, right hand on the floor beside you."],
    steps: [
      "Inhale: lift the left arm up by the ear.",
      "Exhale: side-bend to the right, reaching up and over.",
      "Inhale to come back up; reach the other way with the right hand on the floor; then switch the leg side.",
    ],
    targets: [
      "A pure side bend: the chest faces forward, not down.",
      "Both sitting bones heavy on the mat.",
      "Long arc from the hip to the fingertips.",
    ],
    mistakes: [
      ["Collapsing forward", "Keep the chest open to the front."],
      ["Lifting the opposite hip", "Anchor both sitting bones."],
      ["Shrugging the reaching shoulder", "Reach long, shoulder down."],
    ],
    breath: "Exhale into the side bend, inhale back to centre.",
  },
  spineTwist: {
    setup: ["Sit tall with the legs straight and together, feet flexed; arms out to the sides at shoulder height."],
    steps: [
      "Inhale and lengthen up.",
      "Exhale: twist the torso to one side in two pulses, growing taller.",
      "Inhale back to centre; repeat the other way.",
    ],
    targets: [
      "The pelvis stays still and square; the feet stay level.",
      "Rotation from the ribs up, arms in one line with the shoulders.",
      "Spine tall — no leaning back.",
    ],
    mistakes: [
      ["Hips shifting", "Press the sitting bones down evenly."],
      ["Leaning back", "Sit on a cushion; grow tall."],
      ["Arms moving on their own", "Arms travel with the chest."],
    ],
    breath: "Exhale to twist, inhale back to centre.",
  },
  saw: {
    setup: ["Sit tall with the legs straight and wider than the hips, feet flexed; arms out to the sides."],
    steps: [
      "Inhale: twist the torso to the right.",
      "Exhale: fold forward over the right leg, reaching the left little finger past the right little toe, as if sawing it off.",
      "Inhale back up, untwist, and repeat to the left.",
    ],
    targets: [
      "Both sitting bones stay down as you reach.",
      "Back arm reaches behind, palm turned down.",
      "Fold comes after the twist, not instead of it.",
    ],
    mistakes: [
      ["Lifting the hip to reach further", "Reach only as far as both sitting bones stay down."],
      ["Losing the twist when folding", "Twist first, then fold."],
      ["Bent knees", "Straighten them, or sit on a cushion."],
    ],
    breath: "Exhale as you reach and saw; inhale to come up.",
  },
  swanPrep: {
    setup: ["Lie face down, hands under the shoulders, elbows close to the body, legs straight and hip-width."],
    steps: [
      "Lengthen the body from the head to the toes, belly lightly lifted.",
      "Inhale: lift the head, then the chest, pressing the hands lightly.",
      "Exhale: lower back down with control.",
    ],
    targets: [
      "Lift to the bottom of the sternum; the lower ribs and the hips stay down.",
      "Neck long, in line with the spine.",
      "Shoulders down away from the ears.",
    ],
    mistakes: [
      ["Pushing up with the arms", "Lift with the back muscles."],
      ["Cranking the neck back", "Look slightly forward."],
      ["Squeezing the lower back", "Lengthen the legs away from you."],
    ],
    breath: "Inhale to lift, exhale to lower.",
  },
  swan: {
    setup: ["Lie face down, hands under the shoulders, elbows close to the body."],
    steps: [
      "Inhale: press the hands down and lift the head, chest and upper belly.",
      "Straighten the arms as far as the back allows, the hips staying down.",
      "Exhale: lower with control, one vertebra at a time.",
    ],
    targets: [
      "Even arc through the whole spine, hips on the mat.",
      "Shoulders down, elbows close to the body.",
      "Legs long and lightly engaged.",
    ],
    mistakes: [
      ["Hips lifting off the mat", "Lift less high."],
      ["Shoulders by the ears", "Draw them down."],
      ["Squeezing into the lower back", "Lengthen first, then lift."],
    ],
    breath: "Inhale to lift, exhale to lower.",
  },
  swanDive: {
    setup: ["Advanced. Start in the swan, arms straight."],
    steps: [
      "Release the hands and reach the arms forward.",
      "Rock forward onto the chest as the legs lift.",
      "Rock back as the chest lifts, keeping the arc.",
    ],
    targets: [
      "The body keeps a constant arc, like a rocking chair.",
      "Legs straight and together.",
      "Arms reaching forward in line with the ears.",
    ],
    mistakes: [
      ["Losing the arc", "Keep the back engaged."],
      ["Bending the knees", "Squeeze the legs straight."],
      ["Landing on the face", "Keep the chest lifted as you rock forward."],
    ],
    breath: "Inhale as you rock up, exhale as you rock forward.",
  },
};
