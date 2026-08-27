import { Exercise, SkillProfile, SkillTrack, TrainingEquipment } from "./types";

const EARLY_STAGES = new Set(["none", "tuck", "band", "wall", "negative", "assisted"]);

// Only meaningful for tracks where band-assisted work is the standard way
// to bridge toward the unassisted movement, and only while the athlete is
// still in an early stage of that specific skill (bands stop being useful
// once you're doing straddle/full-level work).
export function bandAssistanceBonus(
  track: SkillTrack,
  skills: SkillProfile,
  equipment: TrainingEquipment
): Exercise | null {
  if (!equipment.resistanceBands) return null;

  switch (track) {
    case "frontLever":
      if (!EARLY_STAGES.has(skills.frontLever)) return null;
      return { name: "Band-assisted front lever holds", detail: "3 x 15-20s", restSeconds: 90, cue: "Loop a band over the bar under your hips" };
    case "backLever":
      if (!EARLY_STAGES.has(skills.backLever)) return null;
      return { name: "Band-assisted back lever holds", detail: "3 x 15-20s", restSeconds: 90 };
    case "planche":
      if (!EARLY_STAGES.has(skills.planche)) return null;
      return { name: "Band-assisted planche lean", detail: "3 x 15-20s", restSeconds: 90, cue: "Band anchored low, looped around the hips" };
    case "humanFlag":
      if (!EARLY_STAGES.has(skills.humanFlag)) return null;
      return { name: "Band-assisted human flag holds", detail: "3 x 10-15s per side", restSeconds: 90 };
    case "muscleUp":
      if (skills.muscleUp !== "none" && skills.muscleUp !== "band") return null;
      return { name: "Band-assisted muscle-up transitions", detail: "3 x 5 reps", restSeconds: 90 };
    case "pullStrength":
      if (skills.pullUpMaxReps >= 8) return null;
      return { name: "Band-assisted pull-ups", detail: "3 x 6-8 reps", restSeconds: 75 };
    case "pushStrength":
      if (skills.dipMaxReps >= 8) return null;
      return { name: "Band-assisted dips", detail: "3 x 6-8 reps", restSeconds: 75 };
    case "legs":
      if (!EARLY_STAGES.has(skills.pistolSquat)) return null;
      return { name: "Band-assisted pistol squats", detail: "3 x 6-8 reps per side", restSeconds: 75, cue: "Band anchored overhead or held for counterbalance" };
    default:
      return null;
  }
}
