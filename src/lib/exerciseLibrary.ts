import type { Exercise, StagedSkillKey, TrainingEquipment } from "./types";
import { SKILL_FIELD_LABEL } from "./types";
import { allExercises, type HierarchyGroup } from "./exerciseHierarchy";
import { MOBILITY_POOL, FINISHER_POOL } from "./warmupFinisher";
import { exerciseArea, AREA_LABEL, type Area } from "./compare";
import { exerciseNeeds, fitsEquipment, type Needs } from "./equipmentNeeds";
import { exerciseDifficulty } from "./effort";
import { demoFor } from "./demos/catalog";
import { SPORTS, type ExtraSport, type SportId } from "./sports";

// ---------------------------------------------------------------------------
// The exercise library: everything the app can give, browsable and
// searchable — what it is, how to do it, what it needs, where it sits in a
// skill's progression, and whether it fits your equipment.
// ---------------------------------------------------------------------------

export type LibraryKind = "skill" | "strength" | "mobility" | "conditioning";

export interface LibraryEntry {
  exercise: Exercise;
  kind: LibraryKind;
  skill?: StagedSkillKey;
  stage?: string;
  group?: HierarchyGroup;
  area: Area;
  needs: Needs;
  difficulty: number; // 1 easy … 5 elite (effort.ts)
  hasDemo: boolean;
  sport?: ExtraSport; // yoga, Pilates… (none = calisthenics)
  sportSkill?: string; // that sport's skill name; stage holds the stage label
}

let cache: LibraryEntry[] | null = null;

const sportCache: Partial<Record<ExtraSport, LibraryEntry[]>> = {};

// One sport's exercises: its skills' stages, then warm-up and cool-down
function sportEntries(sport: ExtraSport): LibraryEntry[] {
  if (sportCache[sport]) return sportCache[sport]!;
  const def = SPORTS[sport];
  const out: LibraryEntry[] = [];
  const seen = new Set<string>();
  const add = (
    x: Exercise & { it?: unknown },
    kind: LibraryKind,
    extra: Partial<LibraryEntry> = {},
  ) => {
    if (seen.has(x.name)) return;
    seen.add(x.name);
    const { it: _it, ...exercise } = x;
    out.push({
      exercise,
      kind,
      area: exerciseArea(exercise.name),
      needs: [],
      difficulty: 1,
      hasDemo: !!demoFor(exercise.name),
      sport,
      ...extra,
    });
  };
  for (const sk of def.skills)
    sk.stages.forEach((st, i) => {
      const difficulty = Math.min(
        5,
        1 + Math.round((i * 4) / Math.max(1, sk.stages.length - 1)),
      );
      for (const e of st.exercises)
        add(e, "skill", { sportSkill: sk.name, stage: st.label, difficulty });
    });
  for (const e of [...def.warmup, ...def.cooldown]) add(e, "mobility");
  return (sportCache[sport] = out);
}

export function libraryEntries(
  sport: SportId = "calisthenics",
): LibraryEntry[] {
  if (sport !== "calisthenics") return sportEntries(sport);
  if (cache) return cache;
  const out: LibraryEntry[] = [];
  const seen = new Set<string>();
  const add = (
    exercise: Exercise,
    kind: LibraryKind,
    extra: Partial<LibraryEntry> = {},
    setTitle = "Strength",
  ) => {
    if (seen.has(exercise.name)) return;
    seen.add(exercise.name);
    out.push({
      exercise,
      kind,
      area: exerciseArea(exercise.name),
      needs: exerciseNeeds(exercise.name),
      difficulty: exerciseDifficulty(exercise.name, setTitle),
      hasDemo: !!demoFor(exercise.name),
      ...extra,
    });
  };
  for (const { exercise, group, stage } of allExercises()) {
    if (group === "pullStrength" || group === "pushStrength")
      add(exercise, "strength", { group });
    else
      add(exercise, "skill", { skill: group as StagedSkillKey, stage, group });
  }
  for (const d of MOBILITY_POOL) {
    const { areas: _a, ...exercise } = d;
    add(exercise, "mobility", {}, "Warm-Up");
  }
  for (const f of FINISHER_POOL) add(f, "conditioning", {}, "Final Hits");
  cache = out;
  return out;
}

export interface LibraryFilter {
  query?: string;
  kind?: LibraryKind | "all";
  area?: Area | "all";
  skill?: StagedSkillKey | "all";
  equipment?: TrainingEquipment; // only what this kit allows
}

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function searchLibrary(
  entries: LibraryEntry[],
  f: LibraryFilter,
  describe: (e: LibraryEntry) => string = () => "",
): LibraryEntry[] {
  const q = norm(f.query?.trim() ?? "");
  return entries
    .filter((e) => !f.kind || f.kind === "all" || e.kind === f.kind)
    .filter((e) => !f.area || f.area === "all" || e.area === f.area)
    .filter((e) => !f.skill || f.skill === "all" || e.skill === f.skill)
    .filter((e) => !f.equipment || fitsEquipment(e.exercise, f.equipment))
    .filter((e) => {
      if (!q) return true;
      const hay = norm(
        [
          e.exercise.name,
          e.skill ? SKILL_FIELD_LABEL[e.skill] : "",
          AREA_LABEL[e.area],
          describe(e),
        ].join(" "),
      );
      return q.split(/\s+/).every((w) => hay.includes(w));
    })
    .sort(
      (a, b) =>
        a.difficulty - b.difficulty ||
        a.exercise.name.localeCompare(b.exercise.name),
    );
}

export const findEntry = (name: string) =>
  libraryEntries().find((e) => e.exercise.name === name) ??
  (Object.keys(SPORTS) as ExtraSport[])
    .map((s) => sportEntries(s).find((e) => e.exercise.name === name))
    .find(Boolean);
