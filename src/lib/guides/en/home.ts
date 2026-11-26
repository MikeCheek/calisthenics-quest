import type { GuideTable } from "../index";

// Training at home without a bar: door and towel rows, chair dips.
export const HOME: GuideTable = {
  homeRow: {
    setup: [
      "Door frame: stand in an open doorway and grip both sides of the frame at chest height. Towel: loop a towel round both handles of a closed door, standing on the side it opens away from, so pulling shuts it tighter.",
    ],
    steps: [
      "Walk your feet in close to the frame or door and lean back until your arms are straight.",
      "Squeeze glutes and abs so the body is one straight line from heels to head.",
      "Row your chest to your hands, driving the elbows back past the ribs; pause 1 s.",
      "Lower slowly back to straight arms.",
    ],
    targets: [
      "Body straight from heels to head — the hips don't bend or sag.",
      "Elbows close to the body, at about 45°, finishing just behind the torso.",
      "Shoulder blades squeezed together at the top; the further your feet are in, the harder it is.",
    ],
    mistakes: [
      ["Bending at the hips to get closer", "Lock the glutes; lean back less if you can't keep the line."],
      ["Pulling on a door that opens towards you", "Use the side it opens away from, and lock it if you can."],
      ["Shrugging at the top", "Pull the shoulders down and back before you row."],
    ],
    breath: "Breathe out as you row in, breathe in as you lower.",
  },
  chairDip: {
    setup: [
      "Sit on the front edge of a sturdy chair or bench set against a wall; hands beside your hips, fingers forward. Slide off so your weight is on your hands, legs bent (easier) or straight (harder).",
    ],
    steps: [
      "Push down to straighten the arms, shoulders away from the ears.",
      "Bend the elbows straight back and lower your hips close to the seat.",
      "Stop when your upper arms are about level with the seat.",
      "Press back up to straight arms.",
    ],
    targets: [
      "Elbows pointing back, not out — about 90° at the bottom.",
      "Hips close to the chair edge, back nearly brushing it.",
      "Shoulders down and back; the chest stays open.",
    ],
    mistakes: [
      ["Going so deep the front of the shoulder aches", "Stop at 90° at the elbow."],
      ["Elbows flaring out to the sides", "Point them straight back."],
      ["Using a chair that slides or tips", "Push it against a wall, or use a step or bench."],
    ],
    breath: "Breathe in as you lower, breathe out as you press up.",
  },
};
