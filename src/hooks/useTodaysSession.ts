"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SkillTrack, UserDoc } from "@/lib/types";
import { availableFocuses, generateSession } from "@/lib/trainingGenerator";
import { adaptSession } from "@/lib/adaptation";
import { addSkillChecks, checksPerSession, pickSkillChecks, skillsForTraining, syncClaims } from "@/lib/verification";
import { fitSessionToMinutes } from "@/lib/sessionFit";
import { balanceSession, effortCapacity } from "@/lib/effort";
import { atHome, readTodayEquipment, onTodayEquipment, type TodayEquipment } from "@/lib/todayEquipment";
import { applyDeload, blockWeek, focusWithBlock, isActive, phaseOf } from "@/lib/trainingBlock";
import { FOCUS_LABEL } from "@/lib/trainingGenerator";
import { SPORTS, activeSportOf, isExtraSport, type SportId } from "@/lib/sports";
import { focusOptions, generateSportSession, groupLabel, pickSportFocus } from "@/lib/sports/generator";
import { habitualMinutes, type HabitualLength } from "@/lib/sessionLength";
import { restAwareFocus } from "@/lib/muscleLoad";
import { applyReadiness, lighterActive, lighterDay, readReadiness, saveReadiness, scaleSets, type Readiness } from "@/lib/readiness";
import type { TrainingSession } from "@/lib/types";
import { applyBlockPrefs } from "@/lib/trainingHabits";
import { comeback as comebackOf, COMEBACK_FACTOR } from "@/lib/comeback";

// Today's session, built once and shared by the Today screen and the full
// session page so both always show the same exercises. A focus the athlete
// picks is remembered for the rest of the day (this tab only).

const KEY = "barquests:focusOverride";
const today = () => new Date().toISOString().slice(0, 10);

function readOverride(): SkillTrack | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as { day: string; focus: SkillTrack };
    return v.day === today() ? v.focus : null;
  } catch {
    return null;
  }
}

// "Use my full length today": planning around your usual length can be
// switched off for the day (this tab only)
const FULL_KEY = (s: string) => `barquests:fullLength:${s}`;
function useFullLength(sport: string) {
  const [full, setFull] = useState(false);
  useEffect(() => {
    try {
      setFull(sessionStorage.getItem(FULL_KEY(sport)) === today());
    } catch {
      setFull(false);
    }
  }, [sport]);
  const fullToday = useCallback(() => {
    setFull(true);
    try {
      sessionStorage.setItem(FULL_KEY(sport), today());
    } catch {
      // this page only
    }
  }, [sport]);
  return [full, fullToday] as const;
}

// how you said you feel today (readiness.ts), remembered for the day
function useReadiness() {
  const [readiness, setR] = useState<Readiness | null>(null);
  useEffect(() => setR(readReadiness()), []);
  const setReadiness = useCallback((r: Readiness | null) => {
    setR(r);
    saveReadiness(r);
  }, []);
  return [readiness, setReadiness] as const;
}

const LIGHTER_FACTOR = 0.6;
const CHECKS_FROM_DAY = 6; // a lighter week's skill checks wait for its last two days

/** a running lighter week, then how you feel today */
function forToday(session: TrainingSession, userDoc: UserDoc | null, readiness: Readiness | null): TrainingSession {
  const lighter = lighterActive(userDoc?.lighterWeek) ? scaleSets(session, LIGHTER_FACTOR, "Lighter week: recovering on purpose") : session;
  // and the blocks you've chosen to shorten (trainingHabits.ts)
  return applyBlockPrefs(applyReadiness(lighter, readiness), userDoc?.blockPrefs);
}

/** the length to plan for: your chosen one, or what you usually get through */
function planLength(chosen: number | undefined, userDoc: UserDoc | null, sport: SportId, full: boolean): HabitualLength | null {
  const h = habitualMinutes(chosen, userDoc?.lengthHistory, sport);
  return h && full ? { ...h, minutes: h.chosen, shorter: false } : h;
}

function useCalisthenicsSession(userDoc: UserDoc | null) {
  const [focusOverride, setOverride] = useState<SkillTrack | null>(null);
  useEffect(() => setOverride(readOverride()), []);

  const setFocusOverride = useCallback((f: SkillTrack | null) => {
    setOverride(f);
    try {
      if (f) sessionStorage.setItem(KEY, JSON.stringify({ day: today(), focus: f }));
      else sessionStorage.removeItem(KEY);
    } catch {
      // storage unavailable — the choice still applies on this page
    }
  }, []);

  // equipment for today only (indoors when it rains, or a bar park)
  const [today_, setToday] = useState<TodayEquipment | null>(null);
  useEffect(() => {
    const read = () => setToday(readTodayEquipment());
    read();
    return onTodayEquipment(read);
  }, []);
  // at home it's always your current kit (it may have changed since you chose home)
  const equipment = today_ && userDoc && today_.kind !== "park" ? atHome(userDoc.equipment) : (today_?.equipment ?? userDoc?.equipment);
  const options = useMemo(() => (equipment ? availableFocuses(equipment) : []), [equipment]);
  // a training block steers the focus (two days in three on its skill)
  const block = userDoc?.trainingBlock ?? undefined;
  const picked = equipment ? focusWithBlock(new Date(), equipment, userDoc?.goalTracks ?? [], block) : null;
  const deload = isActive(block) && phaseOf(block, blockWeek(block)) === "deload";
  // a muscle group that had a hard day yesterday rests: the day moves to a goal that trains something else
  const rested = picked && !focusOverride ? restAwareFocus(picked, options, userDoc?.goalTracks ?? [], userDoc?.loadLog, today(), (t) => FOCUS_LABEL[t]) : null;
  const focus = focusOverride && options.includes(focusOverride) ? focusOverride : (rested?.focus ?? picked);
  // a focus you picked that this place can't do (no bar at home): say so, don't just swap it
  const notHere = focusOverride && !options.includes(focusOverride) && focus ? `${FOCUS_LABEL[focusOverride]} needs kit you don't have here — today is ${FOCUS_LABEL[focus]}` : undefined;
  const focusWhy = notHere ?? (focus === rested?.focus ? rested?.why : undefined);
  // back after a week or more off: a gentler restart (comeback.ts)
  const back = comebackOf(userDoc);

  const [fullLength, setFullToday] = useFullLength("calisthenics");
  const [readiness, setReadiness] = useReadiness();
  const lighter = lighterActive(userDoc?.lighterWeek) ? userDoc!.lighterWeek! : null;
  const checksWait = !!lighter && lighterDay(lighter as typeof lighter & { from: string }) < CHECKS_FROM_DAY;
  const length = planLength(userDoc?.body?.sessionLengthMinutes, userDoc, "calisthenics", fullLength);
  const minutes = length?.minutes;
  // what you usually get through, offered as a shorter plan (sessionLength.ts)
  const usual = length?.shorter ? length : null;

  const skillsKey = JSON.stringify([userDoc?.skills ?? null, Object.entries(userDoc?.claims ?? {}).map(([k, c]) => `${k}:${c?.status}`)]);
  const equipmentKey = JSON.stringify(equipment ?? null);
  const built = useMemo(() => {
    if (!userDoc || !focus) return null;
    // generated from the athlete's stages, then adapted to their own history
    // of completing, skipping and struggling with specific exercises
    // a claim that failed its check is trained one stage lower until confirmed
    const claims = syncClaims(userDoc.claims, userDoc.skills);
    const trainSkills = skillsForTraining(userDoc.skills, claims);
    const adapted = adaptSession(
      // rotates away from what you did most recently, so the same focus isn't the same session
      generateSession(trainSkills, equipment!, focus, new Date(), minutes, { stats: userDoc.exerciseStats, records: userDoc.records, load: userDoc.loadLog }),
      userDoc.exerciseStats,
      equipment!,
      trainSkills,
      userDoc.records
    );
    // a Skill Check (two while much is unchecked), verifying what the athlete claimed
    // a lighter week saves its skill checks for its last days, when you're fresh
    // …and the first session after a break leaves them for the next one
    const checks = checksWait || back ? [] : pickSkillChecks(claims, equipment!, focus, checksPerSession(claims));
    const check = checks[0] ?? null;
    // fit everything to the athlete's chosen session length…
    const fitted = fitSessionToMinutes(addSkillChecks(adapted, checks), minutes);
    // …and within the effort they've had energy for lately (effort.ts)
    const balanced = balanceSession(fitted.session, effortCapacity(userDoc.effortHistory));
    // a block's deload week: lighter on purpose
    // a block's deload week, or else a lighter week; then how you feel today
    const eased = deload ? applyBlockPrefs(applyReadiness(applyDeload(balanced.session), readiness), userDoc.blockPrefs) : forToday(balanced.session, userDoc, readiness);
    const restarted = back ? scaleSets(eased, COMEBACK_FACTOR, "Back after a break: easing in") : eased;
    const session = focusWhy ? { ...restarted, why: focusWhy } : restarted;
    return { fitted: { ...fitted, session }, check, lighterBy: balanced.trimmed };
    // Only re-generate when stages, equipment or focus actually change — not
    // when exercise stats update after logging, so the session just logged
    // stays on screen (its adaptations kick in on the next visit).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillsKey, equipmentKey, focus, !!userDoc, deload, minutes, focusWhy, readiness, lighter?.from, checksWait, back?.days, JSON.stringify(userDoc?.blockPrefs ?? null)]);

  return { todayEquipment: today_, focus, options, fitted: built?.fitted ?? null, check: built?.check ?? null, lighterBy: built?.lighterBy ?? 0, setFocusOverride, usualLength: usual, fullLengthToday: setFullToday, readiness, setReadiness, lighterWeek: lighter, comeback: back };
}

// ---- another sport (sports/): today's session from its own track ----

const SPORT_KEY = (s: string) => `barquests:focusOverride:${s}`;

function useSportSession(userDoc: UserDoc | null, sport: SportId) {
  const def = isExtraSport(sport) ? SPORTS[sport] : null;
  const track = def ? userDoc?.sports?.[def.id] : undefined;
  const [override, setOverride] = useState<string | null>(null);
  useEffect(() => {
    try {
      const v = JSON.parse(sessionStorage.getItem(SPORT_KEY(sport)) ?? "null") as { day: string; focus: string } | null;
      setOverride(v && v.day === today() ? v.focus : null);
    } catch {
      setOverride(null);
    }
  }, [sport]);
  const setFocusOverride = useCallback(
    (f: string | null) => {
      setOverride(f);
      try {
        if (f) sessionStorage.setItem(SPORT_KEY(sport), JSON.stringify({ day: today(), focus: f }));
        else sessionStorage.removeItem(SPORT_KEY(sport));
      } catch {
        // this page only
      }
    },
    [sport]
  );
  const options = useMemo(() => (def ? focusOptions(def) : []), [def]);
  const focus = def && track ? (override && options.includes(override) ? override : pickSportFocus(def, track, new Date())) : null;
  const [fullLength, setFullToday] = useFullLength(sport);
  const [readiness, setReadiness] = useReadiness();
  const lighter = lighterActive(userDoc?.lighterWeek) ? userDoc!.lighterWeek! : null;
  const length = planLength(track?.sessionLengthMinutes ?? userDoc?.body?.sessionLengthMinutes, userDoc, sport, fullLength);
  const minutes = length?.minutes;
  const trackKey = JSON.stringify(track ? { stage: track.stage, mastery: track.mastery, minutes } : null);
  const built = useMemo(() => {
    if (!def || !track || !focus) return null;
    // the same pipeline as calisthenics: adapted to your history, fitted to
    // your time, balanced against your recent energy
    const adapted = adaptSession(generateSportSession(def, track, focus), track.exerciseStats, userDoc!.equipment);
    const fitted = fitSessionToMinutes(adapted, minutes);
    const balanced = balanceSession(fitted.session, effortCapacity(userDoc?.effortHistory));
    return { fitted: { ...fitted, session: { ...forToday(balanced.session, userDoc, readiness), sport: def.id } }, lighterBy: balanced.trimmed };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackKey, focus, def, readiness, lighter?.from, JSON.stringify(userDoc?.blockPrefs ?? null)]);
  return { focus, options, fitted: built?.fitted ?? null, lighterBy: built?.lighterBy ?? 0, setFocusOverride, usualLength: length?.shorter ? length : null, fullLengthToday: setFullToday, readiness, setReadiness, lighterWeek: lighter, labelOf: (f: string) => (def ? groupLabel(def, f) : f) };
}

// Today's session in the sport you're following now (calisthenics unless
// you picked another), in one shape for the Today screen and the session page.
export function useTodaysSession(userDoc: UserDoc | null) {
  const sport = activeSportOf(userDoc);
  const cal = useCalisthenicsSession(userDoc);
  const other = useSportSession(userDoc, sport);
  if (sport === "calisthenics") {
    return {
      sport,
      ...cal,
      focus: cal.focus as string | null,
      options: cal.options as string[],
      setFocusOverride: (f: string | null) => cal.setFocusOverride(f as SkillTrack | null),
      labelOf: (f: string) => FOCUS_LABEL[f as SkillTrack] ?? f,
    };
  }
  return { sport, ...other, check: null, todayEquipment: null, comeback: null };
}
