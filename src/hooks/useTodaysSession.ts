"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SkillTrack, UserDoc } from "@/lib/types";
import { availableFocuses, generateSession } from "@/lib/trainingGenerator";
import { adaptSession } from "@/lib/adaptation";
import { addSkillCheck, pickSkillCheck, syncClaims } from "@/lib/verification";
import { fitSessionToMinutes } from "@/lib/sessionFit";
import { balanceSession, effortCapacity } from "@/lib/effort";
import { applyDeload, blockWeek, focusWithBlock, isActive, phaseOf } from "@/lib/trainingBlock";

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

export function useTodaysSession(userDoc: UserDoc | null) {
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

  const equipment = userDoc?.equipment;
  const options = useMemo(() => (equipment ? availableFocuses(equipment) : []), [equipment]);
  // a training block steers the focus (two days in three on its skill)
  const block = userDoc?.trainingBlock ?? undefined;
  const picked = equipment ? focusWithBlock(new Date(), equipment, userDoc?.goalTracks ?? [], block) : null;
  const deload = isActive(block) && phaseOf(block, blockWeek(block)) === "deload";
  const focus = focusOverride && options.includes(focusOverride) ? focusOverride : picked;

  const skillsKey = JSON.stringify(userDoc?.skills ?? null);
  const equipmentKey = JSON.stringify(userDoc?.equipment ?? null);
  const built = useMemo(() => {
    if (!userDoc || !focus) return null;
    // generated from the athlete's stages, then adapted to their own history
    // of completing, skipping and struggling with specific exercises
    const adapted = adaptSession(
      generateSession(userDoc.skills, userDoc.equipment, focus, new Date(), userDoc.body?.sessionLengthMinutes),
      userDoc.exerciseStats,
      userDoc.equipment
    );
    // one Skill Check per session, verifying something the athlete claimed
    const check = pickSkillCheck(syncClaims(userDoc.claims, userDoc.skills), userDoc.equipment, focus);
    // fit everything to the athlete's chosen session length…
    const fitted = fitSessionToMinutes(addSkillCheck(adapted, check), userDoc.body?.sessionLengthMinutes);
    // …and within the effort they've had energy for lately (effort.ts)
    const balanced = balanceSession(fitted.session, effortCapacity(userDoc.effortHistory));
    // a block's deload week: lighter on purpose
    const session = deload ? applyDeload(balanced.session) : balanced.session;
    return { fitted: { ...fitted, session }, check, lighterBy: balanced.trimmed };
    // Only re-generate when stages, equipment or focus actually change — not
    // when exercise stats update after logging, so the session just logged
    // stays on screen (its adaptations kick in on the next visit).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillsKey, equipmentKey, focus, !!userDoc, deload]);

  return { focus, options, fitted: built?.fitted ?? null, check: built?.check ?? null, lighterBy: built?.lighterBy ?? 0, setFocusOverride };
}
