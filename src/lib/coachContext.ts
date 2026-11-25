import {
  SessionRecord,
  UserDoc,
  SKILL_FIELD_LABEL,
  TRACK_LABEL,
  StagedSkillKey,
  MASTERY_LABEL,
  DEFAULT_MASTERY,
} from "./types";
import { STAGE_LABEL } from "./stageOrder";
import { levelFromXp } from "./xp";
import { syncClaims, claimLabel } from "./verification";
import { historySummary } from "./adaptation";
import { SPORTS, SPORT_META, activeSportOf, enrolledSports } from "./sports";

// ---------------------------------------------------------------------------
// What the AI coach knows about the athlete: training data only — level,
// skills, what's verified, goals, equipment, recent sessions and what the
// learning engine has noticed. Never name, email, body stats or friends.
// Kept compact (a few hundred tokens) and capped.
// ---------------------------------------------------------------------------

export const MAX_CONTEXT_CHARS = 3000;

export function buildCoachContext(
  userDoc: UserDoc,
  recent: SessionRecord[] = [],
): string {
  const lines: string[] = [];
  const level = levelFromXp(userDoc.xp);
  lines.push(
    `Level ${level}; ${userDoc.totalSessionsCompleted} sessions logged; current streak ${userDoc.streak} weeks in a row with at least one session.`,
  );

  const rec = userDoc.skills as unknown as Record<string, string>;
  const started = (Object.keys(SKILL_FIELD_LABEL) as StagedSkillKey[])
    .filter((k) => rec[k] && rec[k] !== "none")
    .map((k) => {
      const m = userDoc.skillMastery?.[k] ?? DEFAULT_MASTERY;
      return `${SKILL_FIELD_LABEL[k]}: ${STAGE_LABEL[rec[k]] ?? rec[k]} (${MASTERY_LABEL[m].toLowerCase()})`;
    });
  lines.push(
    `Skills: ${started.length ? started.join("; ") : "none started yet"}.`,
  );
  lines.push(
    `Strength numbers: max pull-ups ${userDoc.skills.pullUpMaxReps}, max dips ${userDoc.skills.dipMaxReps}` +
      (userDoc.skills.pushUpMaxReps !== undefined
        ? `, max push-ups ${userDoc.skills.pushUpMaxReps}`
        : "") +
      ".",
  );

  const claims = syncClaims(userDoc.claims, userDoc.skills);
  const verified = Object.entries(claims)
    .filter(([, c]) => c?.status === "verified")
    .map(([k, c]) => `${claimLabel(k as never)} (${c!.value})`);
  const shaky = Object.entries(claims)
    .filter(([, c]) => c?.status === "unconfirmed")
    .map(([k, c]) => `${claimLabel(k as never)} (${c!.value})`);
  if (verified.length)
    lines.push(`Proven in training: ${verified.join(", ")}.`);
  if (shaky.length)
    lines.push(`Claimed but failed a skill check: ${shaky.join(", ")}.`);

  if (userDoc.goalTracks?.length)
    lines.push(
      `Goals: ${userDoc.goalTracks.map((g) => TRACK_LABEL[g]).join(", ")}.`,
    );
  const eq = Object.entries(userDoc.equipment ?? {})
    .filter(([, v]) => v)
    .map(([k]) => k);
  lines.push(`Equipment: ${eq.length ? eq.join(", ") : "floor only"}.`);
  if (userDoc.body?.trainingDaysPerWeek || userDoc.body?.sessionLengthMinutes) {
    lines.push(
      `Trains ${userDoc.body.trainingDaysPerWeek ?? "?"} days/week, ~${userDoc.body.sessionLengthMinutes ?? "?"} min sessions.`,
    );
  }

  // the other sports they follow: stage per skill and goals
  for (const id of enrolledSports(userDoc)) {
    if (id === "calisthenics") continue;
    const t = userDoc.sports?.[id];
    if (!t) continue;
    const def = SPORTS[id];
    const stages = def.skills
      .map(
        (sk) =>
          `${sk.name}: ${sk.stages[Math.min(t.stage[sk.key] ?? 0, sk.stages.length - 1)].label}`,
      )
      .join("; ");
    const goals = t.goals
      .map((g) => def.skills.find((sk) => sk.key === g)?.name)
      .filter(Boolean);
    lines.push(
      `Also follows ${SPORT_META[id].name} (${t.sessions} sessions${goals.length ? `, goals: ${goals.join(", ")}` : ""}): ${stages}.`,
    );
  }
  const active = activeSportOf(userDoc);
  if (active !== "calisthenics")
    lines.push(
      `Currently training ${SPORT_META[active].name}; questions are likely about it.`,
    );

  const learned = historySummary(userDoc.exerciseStats, undefined, (k) =>
    k.replace(/_/g, " "),
  );
  if (learned) lines.push(`Learned from training: ${learned}.`);

  for (const s of recent.slice(0, 6)) {
    const main = s.exercises.filter(
      (e) => e.setTitle !== "Warm-Up" && e.setTitle !== "Final Hits",
    );
    const done = main.filter((e) => e.outcome === "done").length;
    const hard = main.filter((e) => e.outcome === "tooHard").map((e) => e.name);
    const skipped = main.filter((e) => e.outcome === "skipped").length;
    lines.push(
      `Session ${s.finishedAt.slice(0, 10)} (${s.sport && s.sport !== "calisthenics" ? `${SPORT_META[s.sport].name}: ` : ""}${s.focusLabel}${s.durationMin ? `, ${s.durationMin} min` : ""}): ${done}/${main.length} done` +
        (skipped ? `, ${skipped} skipped` : "") +
        (hard.length ? `, too hard: ${hard.join(", ")}` : "") +
        ".",
    );
  }

  const text = lines.join("\n");
  return text.length > MAX_CONTEXT_CHARS
    ? text.slice(0, MAX_CONTEXT_CHARS - 1) + "…"
    : text;
}
