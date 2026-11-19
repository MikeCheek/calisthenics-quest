"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import SkillTabPicker from "@/components/SkillTabPicker";
import { saveProfile } from "@/lib/store";
import { levelFromXp } from "@/lib/xp";
import { UserDoc, SkillProfile, StagedSkillKey, SkillMastery } from "@/lib/types";
import { useToast } from "@/context/ToastContext";
import { useLanguage } from "@/context/LanguageContext";

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
  const toast = useToast();
  const { tx } = useLanguage();
  const [skills, setSkills] = useState<SkillProfile>(userDoc.skills);
  const [mastery, setMastery] = useState<Partial<Record<StagedSkillKey, SkillMastery>>>(userDoc.skillMastery);
  const [saving, setSaving] = useState(false);

  const liveLevel = levelFromXp(userDoc.xp);

  const close = () => {
    // reset drafts so reopening later starts from the real saved state,
    // not whatever was left over from a cancelled edit
    setSkills(userDoc.skills);
    setMastery(userDoc.skillMastery);
    onClose();
  };

  // Declared skills shape your sessions, not your level (it comes from
  // training XP), so saving is just that.
  const save = async () => {
    setSaving(true);
    try {
      await saveProfile(userDoc.uid, userDoc.body, skills, userDoc.equipment, userDoc.goalTracks, mastery);
    } catch {
      toast.error("Couldn't save — check your connection and try again.");
      setSaving(false);
      return;
    }
    await onSaved();
    setSaving(false);
    toast.success("Saved!");
    close();
  };

  return (
    <>
      <Modal open={open} onClose={close} title={tx("Declare a new skill")}>
        <p className="text-xs text-muted mb-3">
          {tx("Just hit something new? Update it here — no need to redo the whole assessment.")}
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
          {saving ? tx("Saving...") : tx("Save")}
        </button>
      </Modal>
    </>
  );
}
