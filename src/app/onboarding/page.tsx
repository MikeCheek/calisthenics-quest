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
import OnboardingStepper from "@/components/OnboardingStepper";
import { useToast } from "@/context/ToastContext";
import PageLoading from "@/components/PageLoading";


export default function OnboardingPage() {
  const { user, userDoc, loading, refreshUserDoc } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  if (loading || !userDoc) {
    return <PageLoading />;
  }

  const handleSave = async (
    body: BodyProfile,
    skills: SkillProfile,
    equipment: TrainingEquipment,
    goals: SkillTrack[],
    skillMastery: Partial<Record<StagedSkillKey, SkillMastery>>
  ) => {
    setSaving(true);
    try {
      await saveProfile(userDoc.uid, body, skills, equipment, goals, skillMastery);
    } catch {
      toast.error("Couldn't save your profile — check your connection and try again.");
      setSaving(false);
      return;
    }
    await refreshUserDoc();
    setSaving(false);
    router.replace("/dashboard");
  };

  return (
    <main className="min-h-screen px-4 py-6 pb-10 max-w-md mx-auto">
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
