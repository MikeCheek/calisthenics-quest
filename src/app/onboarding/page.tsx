"use client";

import { skillHistoryPatch } from "@/lib/skillHistory";
import { useEffect, useRef, useState } from "react";
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
import SportPicker from "@/components/sports/SportPicker";
import SportSetupForm from "@/components/sports/SportSetupForm";
import { useToast } from "@/context/ToastContext";
import { useLanguage } from "@/context/LanguageContext";
import PageLoading from "@/components/PageLoading";
import { SPORTS, SPORT_META, newTrack, type Experience, type ExtraSport, type SportId } from "@/lib/sports";
import { takeSportIntent } from "@/lib/sports/intent";

type Phase = "pick" | "calisthenics" | ExtraSport;

export default function OnboardingPage() {
  const { user, userDoc, loading, refreshUserDoc } = useAuth();
  const { tx } = useLanguage();
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [phase, setPhase] = useState<Phase | null>(null);
  const [suggested, setSuggested] = useState<SportId | null>(null);
  const intentRef = useRef<SportId | null | undefined>(undefined);

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  // a first login (nothing set up, nothing logged) starts by picking a
  // sport; coming back here later is the calisthenics check
  const firstTime = !!userDoc && !userDoc.onboarded && !userDoc.totalSessionsCompleted;
  useEffect(() => {
    if (!userDoc || phase) return;
    // a sport chosen on its landing page is suggested, and used up here
    // (read once: effects can run twice)
    if (intentRef.current === undefined) intentRef.current = takeSportIntent();
    const intent = intentRef.current;
    if (firstTime) {
      setSuggested(intent);
      setPhase("pick");
    } else setPhase("calisthenics");
  }, [userDoc, phase, firstTime]);

  if (loading || !userDoc || !phase) {
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
      await saveProfile(userDoc.uid, body, skills, equipment, goals, skillMastery, {
        ...skillHistoryPatch(userDoc, skills),
        ...(userDoc.calisthenicsPending ? { calisthenicsPending: false, activeSport: "calisthenics" } : {}),
      });
    } catch {
      toast.error("Couldn't save your profile — check your connection and try again.");
      setSaving(false);
      return;
    }
    await refreshUserDoc();
    setSaving(false);
    router.replace("/dashboard");
  };

  // starting with yoga or Pilates: its three questions, and in
  const startSport = async (sport: ExtraSport, experience: Experience, goals: string[], minutes: number) => {
    setSaving(true);
    try {
      await saveProfile(
        userDoc.uid,
        userDoc.body ?? DEFAULT_BODY,
        userDoc.skills ?? DEFAULT_SKILLS,
        userDoc.equipment ?? DEFAULT_EQUIPMENT,
        userDoc.goalTracks ?? [],
        userDoc.skillMastery ?? {},
        { sports: { ...(userDoc.sports ?? {}), [sport]: newTrack(SPORTS[sport], experience, goals, minutes) }, activeSport: sport, calisthenicsPending: true }
      );
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
    <main id="main" tabIndex={-1} className="min-h-screen px-4 py-6 pb-10 max-w-md mx-auto">
      {phase === "pick" ? (
        <SportPicker suggested={suggested} onPick={(s) => setPhase(s)} />
      ) : phase === "calisthenics" ? (
        <OnboardingStepper
          initialBody={userDoc.body ?? DEFAULT_BODY}
          initialSkills={userDoc.skills ?? DEFAULT_SKILLS}
          initialEquipment={userDoc.equipment ?? DEFAULT_EQUIPMENT}
          initialGoals={userDoc.goalTracks ?? []}
          initialMastery={userDoc.skillMastery ?? {}}
          currentXp={userDoc.xp}
          onSave={handleSave}
          saving={saving}
          onBackFromStart={firstTime ? () => setPhase("pick") : undefined}
        />
      ) : (
        <div className="space-y-4">
          <h1 className="heading text-2xl text-zinc-100">
            <span aria-hidden="true">{SPORT_META[phase].emoji}</span> {tx("Start {name}", { name: tx(SPORT_META[phase].name) })}
          </h1>
          <SportSetupForm
            sport={phase}
            busy={saving}
            onBack={() => setPhase("pick")}
            onStart={(e, g, m) => startSport(phase, e, g, m)}
          />
        </div>
      )}
    </main>
  );
}
