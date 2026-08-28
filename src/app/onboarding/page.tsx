"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { saveProfile } from "@/lib/store";
import {
  DEFAULT_BODY,
  DEFAULT_EQUIPMENT,
  DEFAULT_SKILLS,
  BodyProfile,
  SkillProfile,
  TrainingEquipment,
  SkillTrack,
  StagedSkillKey,
  SkillMastery,
} from "@/lib/types";
import { effectiveLevel } from "@/lib/levelPath";
import OnboardingStepper from "@/components/OnboardingStepper";
import CelebrationOverlay from "@/components/CelebrationOverlay";
import { Celebration } from "@/lib/sessionComplete";
import { useToast } from "@/context/ToastContext";

const CELEBRATION_MS = 2600;

export default function OnboardingPage() {
  const { user, userDoc, loading, refreshUserDoc } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [celebration, setCelebration] = useState<Celebration | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  if (loading || !userDoc) {
    return <main className="min-h-screen flex items-center justify-center text-zinc-400">Loading...</main>;
  }

  const handleSave = async (
    body: BodyProfile,
    skills: SkillProfile,
    equipment: TrainingEquipment,
    goals: SkillTrack[],
    skillMastery: Partial<Record<StagedSkillKey, SkillMastery>>
  ) => {
    setSaving(true);
    const oldLevel = effectiveLevel(userDoc.xp, userDoc.skills, userDoc.skillMastery);
    try {
      await saveProfile(userDoc.uid, body, skills, equipment, goals, skillMastery);
    } catch {
      toast.error("Couldn't save your profile — check your connection and try again.");
      setSaving(false);
      return;
    }
    await refreshUserDoc();
    setSaving(false);

    // Marking skills you already have can push your level floor up on the
    // spot — if it does, celebrate it just like a session-driven level-up
    // before heading to the dashboard.
    const newLevel = effectiveLevel(userDoc.xp, skills, skillMastery);
    if (newLevel > oldLevel) {
      setCelebration({ leveledUp: true, newLevel, streakEvent: "none", newStreak: userDoc.streak });
      setTimeout(() => router.replace("/dashboard"), CELEBRATION_MS);
    } else {
      router.replace("/dashboard");
    }
  };

  return (
    <main className="min-h-screen px-4 py-6 pb-10 max-w-md mx-auto">
      <CelebrationOverlay celebration={celebration} />
      <OnboardingStepper
        initialBody={userDoc.body ?? DEFAULT_BODY}
        initialSkills={userDoc.skills ?? DEFAULT_SKILLS}
        initialEquipment={userDoc.equipment ?? DEFAULT_EQUIPMENT}
        initialGoals={userDoc.goalTracks ?? []}
        initialMastery={userDoc.skillMastery ?? {}}
        currentXp={userDoc.xp}
        onSave={handleSave}
        saving={saving}
      />
    </main>
  );
}
