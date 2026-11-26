import { test } from "node:test";
import assert from "node:assert/strict";
import { SPORTS, EXTRA_SPORTS, activeSportOf, enrolledSports, newTrack, sportExercises, locate, SPORT_DESCRIPTIONS_IT } from "../src/lib/sports";
import { generateSportSession, pickSportFocus, focusOptions } from "../src/lib/sports/generator";
import { applySportSession } from "../src/lib/sports/progress";
import { parseTiming } from "../src/lib/exerciseTiming";
import { localizeDetail, ENGLISH_DETAIL_WORDS } from "../src/lib/i18n/detail";
import { localizedDescription } from "../src/lib/exerciseTiming";
import { translate } from "../src/lib/i18n/tx";
import type { ExerciseFeedback } from "../src/lib/types";

test("every sport skill has stages, every stage has exercises with a description in both languages", () => {
  for (const id of EXTRA_SPORTS) {
    const def = SPORTS[id];
    assert.ok(def.skills.length >= 6, id);
    for (const sk of def.skills) {
      assert.ok(def.groups.some((g) => g.key === sk.group), `${sk.key}: unknown group`);
      assert.ok(sk.stages.length >= 2, sk.key);
      for (const st of sk.stages) assert.ok(st.exercises.length >= 1, `${sk.key}/${st.id}`);
    }
    for (const { exercise } of sportExercises(def)) {
      assert.ok(exercise.description, exercise.name);
      assert.ok(SPORT_DESCRIPTIONS_IT[exercise.name] || localizedDescription(exercise, "it") !== exercise.description, `${exercise.name}: no Italian description`);
      if (exercise.cue) assert.notEqual(translate("it", exercise.cue), exercise.cue, `${exercise.name}: cue not in Italian`);
    }
  }
});

test("prescriptions parse (sets, holds) and read in Italian", () => {
  for (const id of EXTRA_SPORTS)
    for (const { exercise } of sportExercises(SPORTS[id])) {
      const t = parseTiming(exercise.detail);
      assert.ok(t.sets >= 1, exercise.detail);
      if (/\ds\b/.test(exercise.detail)) assert.equal(t.isTimed, true, exercise.detail);
      assert.ok(!ENGLISH_DETAIL_WORDS.test(localizeDetail(exercise.detail, "it")), `${exercise.detail} → ${localizeDetail(exercise.detail, "it")}`);
    }
});

test("sport names, groups and taglines are in Italian", () => {
  for (const id of EXTRA_SPORTS) {
    const def = SPORTS[id];
    assert.notEqual(translate("it", def.tagline), def.tagline);
    // "Flow" and "Core" are the words Italian practitioners use too
    for (const g of def.groups.filter((g) => !["Flow", "Core"].includes(g.label))) assert.notEqual(translate("it", g.label), g.label, g.label);
  }
});

test("a new track starts where your experience says", () => {
  const def = SPORTS.yoga;
  const t = newTrack(def, "some", ["crow", "nope"], 30);
  assert.equal(t.stage.crow, 1);
  assert.equal(t.stage.headstand, 1);
  assert.deepEqual(t.goals, ["crow"]); // unknown skills dropped
  assert.equal(newTrack(def, "experienced", []).stage.headstand, 2);
  assert.equal(newTrack(def, "new", []).stage.wheel, 0);
});

test("today's session: warm-up, the focus at your stage, one other skill, cool-down", () => {
  const def = SPORTS.yoga;
  const track = newTrack(def, "some", []);
  const s = generateSportSession(def, track, "strength", new Date(2026, 10, 25));
  assert.equal(s.sport, "yoga");
  assert.deepEqual(s.sets.map((x) => x.title), ["Warm-Up", "Arm balances & inversions", "Supporting work", "Cool-Down"]);
  const names = s.sets[1].exercises.map((e) => e.name);
  assert.ok(names.includes("Crow pose") && names.includes("Supported headstand at the wall"));
  // a shaky stage starts with a step back
  assert.ok(names.includes("Garland squat"));
  assert.ok(!s.sets[1].exercises.some((e) => "it" in e)); // translations stay out of the session
});

test("the focus rotates and comes round more for your goals", () => {
  const def = SPORTS.pilates;
  const plain = newTrack(def, "new", []);
  const seen = new Set([...Array(10)].map((_, i) => pickSportFocus(def, plain, new Date(2026, 0, 1 + i))));
  assert.deepEqual([...seen].sort(), [...focusOptions(def)].sort());
  const withGoal = newTrack(def, "new", ["teaser"]); // a core skill
  const days = [...Array(30)].map((_, i) => pickSportFocus(def, withGoal, new Date(2026, 0, 1 + i)));
  assert.ok(days.filter((f) => f === "core").length > days.filter((f) => f === "spine").length);
});

const fb = (name: string, outcome: ExerciseFeedback["outcome"], setTitle = "Balance"): ExerciseFeedback => ({ name, outcome, setTitle }) as ExerciseFeedback;

test("mastery grows with good sessions and moves you up a stage", () => {
  const def = SPORTS.yoga;
  let track = newTrack(def, "new", []);
  const up: string[] = [];
  for (let i = 0; i < 4; i++) {
    const r = applySportSession(def, track, [fb("Tree pose", "done"), fb("Warrior II", "done")]);
    track = r.track;
    up.push(...r.stageUps.map((u) => `${u.from}→${u.to}`));
  }
  assert.deepEqual(up, ["Tree→Warrior III"]);
  assert.equal(track.stage.standingBalance, 1);
  assert.equal(track.sessions, 4);
  // too hard takes it back down; warm-ups don't count
  const r = applySportSession(def, track, [fb("Warrior III", "tooHard"), fb("Child's pose", "done", "Warm-Up")]);
  assert.ok(r.track.mastery.standingBalance < track.mastery.standingBalance);
  assert.deepEqual(locate(def, "Crow pose"), { skill: "crow", stage: 1 });
});

test("the active sport: calisthenics unless another is started and picked", () => {
  assert.equal(activeSportOf({}), "calisthenics");
  assert.equal(activeSportOf({ activeSport: "yoga" }), "calisthenics"); // not started
  const sports = { yoga: newTrack(SPORTS.yoga, "new", []) };
  assert.equal(activeSportOf({ activeSport: "yoga", sports }), "yoga");
  assert.deepEqual(enrolledSports({ sports }), ["calisthenics", "yoga"]);
});

test("every string in the sport screens has Italian", async () => {
  const { readFileSync, readdirSync } = await import("node:fs");
  const dir = "src/components/sports";
  const strings = new Set<string>();
  for (const f of readdirSync(dir)) {
    const src = readFileSync(`${dir}/${f}`, "utf8");
    for (const m of src.matchAll(/(?:tx\(|tx\(goal \? |label: |hint: )"([^"]{2,})"/g)) if (/[a-z]{3}/.test(m[1]) && !/^(text|bg|border|px|py|flex|h-|w-|grid|rounded)/.test(m[1])) strings.add(m[1]);
  }
  const missing = [...strings].filter((s) => translate("it", s) === s && !["Calisthenics", "Yoga", "Pilates", "{n} min", "Skill", "{skill} → {stage}"].includes(s));
  assert.deepEqual(missing, []);
});

test("every yoga and Pilates exercise has a demo that's drawn right", async () => {
  const { demoFor } = await import("../src/lib/demos/catalog");
  const { skeleton, poseAt, demoDuration } = await import("../src/lib/demos/figure");
  const problems: string[] = [];
  for (const def of EXTRA_SPORTS.map((s) => SPORTS[s]))
    for (const { exercise: { name } } of sportExercises(def)) {
      const e = demoFor(name);
      if (!e) {
        problems.push(`${name}: no demo`);
        continue;
      }
      const [x0, y0, w, h] = e.demo.viewBox;
      const total = demoDuration(e.demo);
      let prev: ReturnType<typeof skeleton> | null = null;
      for (let ms = 0; ms <= total; ms += 20) {
        const sk = skeleton(poseAt(e.demo, ms), e.demo.view);
        const pts = [sk.hip, sk.shoulder, ...sk.arms.flatMap((a) => [a.joint, a.end]), ...sk.legs.flatMap((l) => [l.joint, l.end])];
        const err = Math.max(...[...sk.arms, ...sk.legs].map((l) => l.error));
        const issue =
          err > 2 ? `misses its anchor by ${err.toFixed(1)}` :
          [...pts, sk.head].some(([x, y]) => x < x0 - 2 || y < y0 - 2 || x > x0 + w + 2 || y > y0 + h + 2) ? "leaves the frame" :
          pts.some(([, y]) => y > 108 + 2.5) || sk.head[1] > 108 + 2.5 ? `goes through the floor (${pts.findIndex(([, y]) => y > 110.5)})` :
          prev && Math.max(...pts.map((p, i) => Math.hypot(p[0] - [prev!.hip, prev!.shoulder, ...prev!.arms.flatMap((a) => [a.joint, a.end]), ...prev!.legs.flatMap((l) => [l.joint, l.end])][i][0], p[1] - [prev!.hip, prev!.shoulder, ...prev!.arms.flatMap((a) => [a.joint, a.end]), ...prev!.legs.flatMap((l) => [l.joint, l.end])][i][1]))) > 12 ? "jumps" : null;
        if (issue) {
          problems.push(`${name} @${ms}ms: ${issue}`);
          break;
        }
        prev = sk;
      }
    }
  assert.deepEqual(problems, []);
});

test("the coach knows the other sports: stages, goals, the active one, and which sport each session was", async () => {
  const { buildCoachContext } = await import("../src/lib/coachContext");
  const { DEFAULT_SKILLS, DEFAULT_EQUIPMENT } = await import("../src/lib/types");
  const yoga = newTrack(SPORTS.yoga, "some", ["crow"]);
  const u = { xp: 500, totalSessionsCompleted: 3, streak: 1, skills: DEFAULT_SKILLS, equipment: DEFAULT_EQUIPMENT, sports: { yoga }, activeSport: "yoga" } as never;
  const ctx = buildCoachContext(u, [{ finishedAt: "2026-11-20T10:00:00Z", focusLabel: "Balance", sport: "yoga", exercises: [] } as never]);
  assert.match(ctx, /Also follows Yoga \(0 sessions, goals: Crow\): Sun Salutation: Sun A; /);
  assert.match(ctx, /Currently training Yoga/);
  assert.match(ctx, /Session 2026-11-20 \(Yoga: Balance/);
});

test("sport landing pages: a line for every skill in both languages, and every move shown has an animation", async () => {
  const { SPORT_COPY, SPORTS_SECTION, SPORT_PAGE } = await import("../src/lib/sportLandingCopy");
  const { demoFor } = await import("../src/lib/demos/catalog");
  const { PUBLIC_PATHS } = await import("../src/lib/site");
  for (const s of EXTRA_SPORTS) {
    const c = SPORT_COPY[s];
    assert.deepEqual(Object.keys(c.skills).sort(), SPORTS[s].skills.map((k) => k.key).sort(), s);
    for (const name of [c.demo, ...c.showcase]) assert.ok(demoFor(name), `${name} has no animation`);
    const texts = [c.card, c.title, c.description, c.tagline, c.lead, ...c.points, ...Object.values(c.skills), ...c.faq.flatMap((f) => [f.q, f.a])];
    for (const t of texts) assert.ok(t.en && t.it && (t.en !== t.it || /^[A-Z][a-z]+(-| )/.test(t.en)), t.en);
    assert.ok(PUBLIC_PATHS.includes(c.path) && PUBLIC_PATHS.includes(`/it${c.path}`), c.path);
  }
  for (const t of [...Object.values(SPORTS_SECTION), ...Object.values(SPORT_PAGE)]) assert.notEqual(t.en, t.it);
});

test("sport page titles and descriptions fit search results", async () => {
  const { SPORT_COPY } = await import("../src/lib/sportLandingCopy");
  for (const s of EXTRA_SPORTS)
    for (const l of ["en", "it"] as const) {
      assert.ok(SPORT_COPY[s].title[l].length <= 60, SPORT_COPY[s].title[l]);
      const d = SPORT_COPY[s].description[l].length;
      assert.ok(d >= 100 && d <= 230, `${s} ${l}: ${d}`);
    }
});

test("a yoga week plan: your training days, today's focus first, no focus twice in a row, all yoga", async () => {
  const { generateSportPlan } = await import("../src/lib/planGenerator");
  const { pickSportFocus } = await import("../src/lib/sports/generator");
  const { DEFAULT_BODY, DEFAULT_EQUIPMENT } = await import("../src/lib/types");
  const track = newTrack(SPORTS.yoga, "some", ["crow"], 25);
  const start = new Date(2026, 10, 23); // a Monday
  const body = { ...DEFAULT_BODY, trainingDaysOfWeek: [1, 3, 5] };
  const plan = generateSportPlan(SPORTS.yoga, track, body, DEFAULT_EQUIPMENT, "week", start);
  assert.equal(plan.length, 7);
  const days = plan.filter((d) => !d.isRestDay);
  assert.deepEqual(days.map((d) => d.weekday), ["Mon", "Wed", "Fri"]);
  assert.ok(days.every((d) => d.session?.sport === "yoga"));
  const foci = days.map((d) => d.session!.sets.find((s) => s.track === "sport")!.title);
  const { groupLabel } = await import("../src/lib/sports/generator");
  assert.equal(foci[0], groupLabel(SPORTS.yoga, pickSportFocus(SPORTS.yoga, track, start)));
  for (let i = 1; i < foci.length; i++) assert.notEqual(foci[i], foci[i - 1]);
});

test("an invite opened before signing in is kept once, then cleared", async () => {
  const store = new Map<string, string>();
  (globalThis as { localStorage?: unknown }).localStorage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v), removeItem: (k: string) => store.delete(k) };
  const { rememberInvite, takeInvitePath } = await import("../src/lib/pendingInvite");
  rememberInvite("ab12cd");
  assert.equal(takeInvitePath(), "/friends?code=AB12CD");
  assert.equal(takeInvitePath(), null);
  rememberInvite("<script>");
  assert.equal(takeInvitePath(), null); // only real codes come back
  delete (globalThis as { localStorage?: unknown }).localStorage;
});

test("trackView: every sport in one shape, and stats saved back where they belong", async () => {
  const { trackView, allRecords, recordFor, sportOfSession } = await import("../src/lib/sports/trackView");
  const yoga = { ...newTrack(SPORTS.yoga, "some", []), xp: 300, sessions: 4, mastery: { crow: 4.5 }, exerciseStats: { crow_pose: { p: 0, done: 3 } }, records: { crow_pose: { name: "Crow pose", hold: 20, dateISO: "2026-11-20" } } };
  const u = {
    xp: 1000, totalSessionsCompleted: 10, activeSport: "yoga" as const,
    exerciseStats: { pull_ups: { p: -3, done: 9 } },
    records: { pull_ups: { name: "Pull-ups", reps: 12, dateISO: "2026-11-01" } },
    skillProgress: { frontLever: { score: 3 } },
    sports: { yoga },
  } as never;
  const y = trackView(u);
  assert.equal(y.sport, "yoga");
  assert.equal(y.xp, 300);
  assert.equal(y.sessions, 4);
  assert.deepEqual(Object.keys(y.exerciseStats), ["crow_pose"]);
  assert.deepEqual(y.rising, ["Crow"]);
  const c = trackView(u, "calisthenics");
  assert.equal(c.xp, 700); // the rest of the total
  assert.equal(c.sessions, 6);
  assert.deepEqual(Object.keys(c.exerciseStats), ["pull_ups"]);
  assert.deepEqual(c.rising, ["Front Lever"]);
  // stats go back to the right place, and nothing else is touched
  const ys = y.statsPatch({}) as { sports: { yoga: { exerciseStats: object; xp: number } } };
  assert.deepEqual(ys.sports.yoga.exerciseStats, {});
  assert.equal(ys.sports.yoga.xp, 300);
  assert.deepEqual(c.statsPatch({}), { exerciseStats: {} });
  assert.equal(allRecords(u).length, 2);
  assert.equal(recordFor(u, "crow_pose")?.hold, 20);
  assert.equal(recordFor(u, "pull_ups")?.reps, 12);
  assert.equal(sportOfSession({}), "calisthenics");
  assert.equal(sportOfSession({ sport: "pilates" }), "pilates");
});

test("yoga extras: stage-ups from the start, stage checks once nearly mastered, blocks that finish themselves, the road", async () => {
  const X = await import("../src/lib/sports/extras");
  const { pickSportFocus } = await import("../src/lib/sports/generator");
  const { applySportSession } = await import("../src/lib/sports/progress");
  const def = SPORTS.yoga;
  const t0 = newTrack(def, "some", []); // every skill starts at stage 1
  assert.equal(X.sportStageUps(def, t0), 0);
  // a stage check needs mastery 4 of 5, and isn't offered at the last stage
  assert.equal(X.canCheckStage(def, t0, "crow"), false);
  const ready = { ...t0, mastery: { ...t0.mastery, crow: 4 } };
  assert.equal(X.canCheckStage(def, ready, "crow"), true);
  const blocked = X.startBlock(def, ready, "crow", 4, new Date(2026, 10, 1));
  assert.deepEqual({ skill: blocked.block!.skill, target: blocked.block!.target, weeks: blocked.block!.weeks }, { skill: "crow", target: 2, weeks: 4 });
  assert.equal(X.blockStatus(blocked, new Date(2026, 10, 10))!.week, 2);
  assert.equal(X.blockStatus(blocked, new Date(2026, 11, 10))!.overdue, true);
  // passing the check: up a stage, XP, and the block on that skill is done
  const { track: up, xp } = X.passStageCheck(def, blocked, "crow", new Date(2026, 10, 12));
  assert.equal(up.stage.crow, 2);
  assert.equal(up.mastery.crow, 2.5);
  assert.ok(xp > 0 && up.xp === blocked.xp + xp);
  assert.equal(up.block, undefined);
  assert.equal(up.blocksReached, 1);
  assert.equal(X.sportStageUps(def, up), 1);
  // the road marks reached and current stages
  const road = X.sportRoad(def, up);
  const crow = road.flatMap((r) => r.nodes).filter((n) => n.skill === "crow");
  assert.deepEqual(crow.map((n) => [n.reached, n.current]), crow.map((_, i) => [i <= 2, i === 2]));
  // a block's skill comes up most often in the rotation
  const days = Array.from({ length: 60 }, (_, i) => new Date(2026, 0, 1 + i));
  const crowGroup = def.skills.find((s) => s.key === "crow")!.group;
  const share = (t: typeof t0) => days.filter((d) => pickSportFocus(def, t, d) === crowGroup).length;
  assert.ok(share(X.startBlock(def, t0, "crow", 4)) > share(t0));
  // a block also finishes when a regular session moves the skill up
  const nearly = X.startBlock(def, { ...t0, mastery: { ...t0.mastery, crow: 4.5 } }, "crow", 2);
  const crowEx = def.skills.find((s) => s.key === "crow")!.stages[1].exercises[0].name;
  const after = applySportSession(def, nearly, [{ name: crowEx, setTitle: "Arm balances & inversions", outcome: "done" }] as never).track;
  assert.equal(after.stage.crow, 2);
  assert.equal(after.block, undefined);
  assert.equal(after.blocksReached, 1);
});

test("yoga and Pilates count toward badges", async () => {
  const { ACHIEVEMENTS, isEarned } = await import("../src/lib/achievements");
  const X = await import("../src/lib/sports/extras");
  const def = SPORTS.yoga;
  let t = { ...newTrack(def, "new", []), sessions: 26 };
  for (let i = 0; i < 5; i++) t = X.passStageCheck(def, { ...t, mastery: { ...t.mastery, crow: 4 } }, "crow").track;
  const u = { totalSessionsCompleted: 30, streak: 0, xp: 0, skills: {}, sports: { yoga: t } } as never;
  const earned = (id: string) => isEarned(ACHIEVEMENTS.find((a) => a.id === id)!, u);
  assert.equal(earned("sport-first"), true);
  assert.equal(earned("sport-sessions-25"), true);
  assert.equal(earned("sport-stage-5"), X.sportStageUps(def, t) >= 5);
  assert.equal(earned("stage-up-1"), true);
  assert.equal(earned("all-sports"), false); // no Pilates yet
});
