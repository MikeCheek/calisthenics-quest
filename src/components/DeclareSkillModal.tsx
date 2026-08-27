"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import SkillTabPicker from "@/components/SkillTabPicker";
import CelebrationOverlay from "@/components/CelebrationOverlay";
import { saveProfile } from "@/lib/store";
import { effectiveLevel } from "@/lib/levelPath";
import { UserDoc, SkillProfile, StagedSkillKey, SkillMastery } from "@/lib/types";
import { Celebration } from "@/lib/sessionComplete";

export default function DeclareSkillModal({
  open,
  onClose,
  userDoc,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  userDoc: UserDoc;
  onSaved: () => Promise<void>;
}) {
  const [skills, setSkills] = useState<SkillProfile>(userDoc.skills);
  const [mastery, setMastery] = useState<Partial<Record<StagedSkillKey, SkillMastery>>>(userDoc.skillMastery);
  const [saving, setSaving] = useState(false);
  const [celebration, setCelebration] = useState<Celebration | null>(null);

  const liveLevel = effectiveLevel(userDoc.xp, skills, mastery);

  const close = () => {
    // reset drafts so reopening later starts from the real saved state,
    // not whatever was left over from a cancelled edit
    setSkills(userDoc.skills);
    setMastery(userDoc.skillMastery);
    onClose();
  };

  const save = async () => {
    setSaving(true);
    const oldLevel = effectiveLevel(userDoc.xp, userDoc.skills, userDoc.skillMastery);
    await saveProfile(userDoc.uid, userDoc.body, skills, userDoc.equipment, userDoc.goalTracks, mastery);
    await onSaved();
    setSaving(false);
    const newLevel = effectiveLevel(userDoc.xp, skills, mastery);
    if (newLevel > oldLevel) {
      setCelebration({ leveledUp: true, newLevel, streakEvent: "none", newStreak: userDoc.streak });
      setTimeout(() => {
        setCelebration(null);
        close();
      }, 2600);
    } else {
      close();
    }
  };

  return (
    <>
      <CelebrationOverlay celebration={celebration} />
      <Modal open={open} onClose={close} title="Declare a new skill">
        <p className="text-xs text-zinc-500 mb-3">
          Just hit something new? Update it here — no need to redo the whole assessment.
        </p>
        <SkillTabPicker
          skills={skills}
          mastery={mastery}
          liveLevel={liveLevel}
          onStageChange={(skill, stage) => setSkills({ ...skills, [skill]: stage } as SkillProfile)}
          onMasteryChange={(skill, m) => setMastery({ ...mastery, [skill]: m })}
        />
        <button
          onClick={save}
          disabled={saving}
          className="w-full mt-4 py-2.5 rounded-lg heading text-sm bg-orange-500 hover:bg-orange-400 text-zinc-950 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </Modal>
    </>
  );
}
