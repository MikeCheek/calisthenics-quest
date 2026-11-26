import type { GuideTable } from "../index";

// Yoga poses and flows.
export const YOGA: GuideTable = {
  halfSun: {
    setup: ["Stand at the front of the mat, feet hip-width, arms by the sides (mountain pose)."],
    steps: [
      "Inhale: sweep the arms up overhead.",
      "Exhale: hinge at the hips and fold forward.",
      "Inhale: lift halfway, back flat, hands on the shins.",
      "Exhale: fold; inhale: rise all the way up with the arms overhead; exhale: hands to the chest.",
    ],
    targets: [
      "Hinge from the hips, not the waist; bend the knees as much as needed.",
      "Halfway lift: back flat, torso about parallel to the floor.",
      "One movement per breath.",
    ],
    mistakes: [
      ["Rounding the back in the halfway lift", "Hands higher on the shins, chest forward."],
      ["Locking the knees in the fold", "Soften them."],
      ["Moving faster than the breath", "Let the breath lead."],
    ],
    breath: "One movement per breath: inhale to rise, exhale to fold.",
  },
  sunA: {
    setup: ["Stand at the front of the mat in mountain pose."],
    steps: [
      "Inhale arms up; exhale fold; inhale halfway lift.",
      "Exhale step or jump back and lower in chaturanga.",
      "Inhale upward dog (or cobra); exhale downward dog for 5 breaths.",
      "Step or jump forward, halfway lift, fold, rise up and return to mountain.",
    ],
    targets: [
      "Chaturanga: elbows at 90°, tucked by the ribs, body straight.",
      "Upward dog: arms straight, thighs off the floor, shoulders down.",
      "Downward dog: hips high, a straight line from hands to hips.",
    ],
    mistakes: [
      ["Dropping the hips in chaturanga", "Lower the knees if needed."],
      ["Shoulders by the ears in upward dog", "Press down and roll the shoulders back."],
      ["Rushing", "One movement per breath."],
    ],
    breath: "One movement per breath; five breaths in downward dog.",
  },
  sunB: {
    setup: ["Stand at the front of the mat in mountain pose."],
    steps: [
      "Inhale: chair pose with the arms up; exhale: fold.",
      "Halfway lift, then step back and lower through chaturanga, then upward dog, then downward dog.",
      "Step the right foot forward into warrior I; flow through the vinyasa; repeat on the left.",
      "Downward dog 5 breaths, then forward to chair pose and stand.",
    ],
    targets: [
      "Chair: knees bent about 90–120°, weight in the heels, arms by the ears.",
      "Warrior I: front knee over the ankle, back heel down at 45°, hips forward.",
      "The vinyasa as in sun salutation A.",
    ],
    mistakes: [
      ["Knees past the toes in chair", "Sit back more."],
      ["Back heel up in warrior I", "Shorten the stance."],
      ["Rushing", "Breath leads the movement."],
    ],
    breath: "One movement per breath.",
  },
};
