"use client";

import { KIT_LABEL, SPOT_LABEL } from "@/lib/equipmentLabels";
import { useEffect, useRef, useState } from "react";
import {
  BodyProfile,
  SkillProfile,
  TrainingEquipment,
  SkillTrack,
  StagedSkillKey,
  SkillMastery,
  TRACK_LABEL,
  KIT_KEYS,
  SPOT_KEYS,
} from "@/lib/types";
import ScrollPicker from "@/components/ScrollPicker";
import SegmentedControl from "@/components/SegmentedControl";
import WeekdayPicker from "@/components/WeekdayPicker";
import SkillAssessmentStep from "@/components/SkillAssessmentStep";
import CalisthenicsFigure from "@/components/CalisthenicsFigure";
import { ChevronLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const GOAL_TRACKS: SkillTrack[] = [
  "frontLever", "backLever", "planche", "muscleUp", "handstand",
  "humanFlag", "pullStrength", "pushStrength", "legs", "core",
];

const STEPS = ["About you", "Where you train", "Your level", "Your goals"];

export default function OnboardingStepper({
  initialBody,
  initialSkills,
  initialEquipment,
  initialGoals,
  initialMastery,
  currentXp,
  onSave,
  saving,
  onBackFromStart,
  initialStep = 0,
  saveLabel = "Save & start training",
}: {
  initialBody: BodyProfile;
  initialSkills: SkillProfile;
  initialEquipment: TrainingEquipment;
  initialGoals: SkillTrack[];
  initialMastery: Partial<Record<StagedSkillKey, SkillMastery>>;
  currentXp: number;
  onSave: (
    body: BodyProfile,
    skills: SkillProfile,
    equipment: TrainingEquipment,
    goals: SkillTrack[],
    mastery: Partial<Record<StagedSkillKey, SkillMastery>>
  ) => void;
  saving?: boolean;
  onBackFromStart?: () => void; // back from the first step (to the sport picker)
  initialStep?: number; // open on this step (editing one part from Settings)
  saveLabel?: string; // the last button (editing later: "Save changes")
}) {
  const { tx } = useLanguage();
  const [step, setStep] = useState(Math.min(Math.max(0, initialStep), STEPS.length - 1));
  // on each new step, focus its title so screen readers announce where you are
  const titleRef = useRef<HTMLHeadingElement>(null);
  const firstStep = useRef(true);
  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false;
      return;
    }
    titleRef.current?.focus();
  }, [step]);
  const [body, setBody] = useState<BodyProfile>(initialBody);
  const [skills, setSkills] = useState<SkillProfile>(initialSkills);
  const [equipment, setEquipment] = useState<TrainingEquipment>(initialEquipment);
  const [goals, setGoals] = useState<SkillTrack[]>(initialGoals);
  const [mastery, setMastery] = useState<Partial<Record<StagedSkillKey, SkillMastery>>>(initialMastery);
  // the per-area assessment has its own Back/Next — hide ours meanwhile
  const [assessing, setAssessing] = useState(false);
  // on "Your level", the assessment's own intro is the choice (no Continue that skips it)
  const [atIntro, setAtIntro] = useState(true);
  const hasLevels = Object.values(initialSkills as unknown as Record<string, unknown>).some((v) => typeof v === "string" && v !== "none");

  const toggleGoal = (t: SkillTrack) => {
    setGoals((g) => (g.includes(t) ? g.filter((x) => x !== t) : g.length < 4 ? [...g, t] : g));
  };

  const next = () =>
    step < STEPS.length - 1 ? setStep(step + 1) : onSave(body, skills, equipment, goals, mastery);
  const back = () => (step > 0 ? setStep(step - 1) : onBackFromStart?.());

  return (
    <div className="space-y-5">
      {/* progress dots */}
      <div className="flex items-center gap-2">
        {(step > 0 || onBackFromStart) && (
          <button onClick={back} className="p-1.5 -ml-1.5 text-zinc-400" aria-label={tx("Back")}>
            <ChevronLeft size={20} />
          </button>
        )}
        <div className="flex gap-1.5 flex-1">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-orange-500" : "bg-zinc-800"}`}
            />
          ))}
        </div>
      </div>
      <div>
        <div className="text-xs text-orange-400 mb-0.5">
          {tx("Step {a} of {b}", { a: step + 1, b: STEPS.length })}
        </div>
        <h1 ref={titleRef} tabIndex={-1} className="heading text-xl text-zinc-100">
          {tx(STEPS[step])}
        </h1>
      </div>

      {step === 0 && (
        <div className="space-y-5">
          <CalisthenicsFigure move="pullup" />
          <div className="grid grid-cols-3 gap-3">
            <ScrollPicker label={tx("Age")} value={body.ageYears} min={12} max={80} unit={tx("yrs")} variant="wheel"
              onChange={(v) => setBody({ ...body, ageYears: v })} />
            <ScrollPicker label={tx("Height")} value={body.heightCm} min={130} max={220} unit="cm" variant="ruler"
              onChange={(v) => setBody({ ...body, heightCm: v })} />
            <ScrollPicker label={tx("Weight")} value={body.weightKg} min={35} max={160} unit="kg" variant="wheel"
              onChange={(v) => setBody({ ...body, weightKg: v })} />
          </div>
          <SegmentedControl
            label={tx("Sex (optional — helps calibrate a couple of exercise choices)")}
            value={body.sex ?? "unspecified"}
            options={[
              { value: "unspecified", label: tx("Prefer not to say") },
              { value: "male", label: tx("Male") },
              { value: "female", label: tx("Female") },
            ]}
            onChange={(v) => setBody({ ...body, sex: v as BodyProfile["sex"] })}
          />
          <WeekdayPicker
            label={tx("Which days do you train?")}
            selected={body.trainingDaysOfWeek ?? []}
            onChange={(days) => setBody({ ...body, trainingDaysOfWeek: days, trainingDaysPerWeek: days.length })}
          />
          <SegmentedControl
            label={tx("Typical session length")}
            value={String(body.sessionLengthMinutes ?? 45)}
            options={[15, 30, 45, 60, 90].map((n) => ({ value: String(n), label: `${n} min` }))}
            onChange={(v) => setBody({ ...body, sessionLengthMinutes: Number(v) })}
          />
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <div className="space-y-2.5">
            <h3 className="text-sm text-zinc-100">{tx("Your usual spot")}</h3>
            <p className="text-sm text-zinc-400">
              {tx("What the place you usually train at has. On any day you can pick a different park, or home, from Today — ground work always shows up.")}
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {SPOT_KEYS.map((k) => (
                <EquipmentToggle key={k} label={tx(SPOT_LABEL[k])} checked={equipment[k]} onChange={(v) => setEquipment({ ...equipment, [k]: v })} />
              ))}
            </div>
          </div>
          <div className="space-y-2.5">
            <h3 className="text-sm text-zinc-100">{tx("Your kit")}</h3>
            <p className="text-sm text-zinc-400">{tx("What you own and bring along. It comes with you to any park — and makes home sessions better.")}</p>
            <div className="grid grid-cols-2 gap-2.5">
              {KIT_KEYS.map((k) => (
                <EquipmentToggle key={k} label={tx(KIT_LABEL[k][0])} checked={!!equipment[k]} onChange={(v) => setEquipment({ ...equipment, [k]: v })} />
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <SkillAssessmentStep
            skills={skills}
            mastery={mastery}
            equipment={equipment}
            currentXp={currentXp}
            onInProgressChange={setAssessing}
            onAtIntro={setAtIntro}
            onSkip={next}
            skipLabel={hasLevels ? "Keep my current levels" : "Skip — start me as a beginner"}
            onChange={(nextSkills, nextMastery) => {
              setSkills(nextSkills);
              setMastery(nextMastery);
            }}
          />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <CalisthenicsFigure move="flag" />
          <p className="text-sm text-zinc-400">
            {tx("Pick up to 4 skills you most want to progress. Sessions targeting these show up more often in your rotation.")}
          </p>
          <div className="flex flex-wrap gap-2">
            {GOAL_TRACKS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggleGoal(t)}
                className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                  goals.includes(t)
                    ? "border-orange-500 bg-orange-500/10 text-zinc-100"
                    : "border-zinc-700 text-zinc-400"
                }`}
              >
                {tx(TRACK_LABEL[t])}
              </button>
            ))}
          </div>
        </div>
      )}

      {!(step === 2 && (assessing || atIntro)) && (
      <button
        onClick={next}
        disabled={saving}
        className="w-full py-3 rounded-lg heading text-sm bg-orange-500 hover:bg-orange-400 text-zinc-950 disabled:opacity-60"
      >
        {step < STEPS.length - 1 ? tx("Continue") : saving ? tx("Saving...") : tx(saveLabel)}
      </button>
      )}
    </div>
  );
}

function EquipmentToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2 text-left text-sm px-3 py-2.5 rounded-lg border transition-colors ${
        checked ? "border-orange-500 bg-orange-500/10 text-zinc-100" : "border-zinc-700 text-muted"
      }`}
    >
      <span
        className={`w-4 h-4 shrink-0 rounded-md border flex items-center justify-center ${
          checked ? "bg-orange-500 border-orange-500" : "border-zinc-600"
        }`}
      >
        {checked && <span className="w-1.5 h-1.5 rounded-full bg-zinc-950" />}
      </span>
      {label}
    </button>
  );
}
