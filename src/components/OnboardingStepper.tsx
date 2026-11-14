"use client";

import { useState } from "react";
import {
  BodyProfile,
  SkillProfile,
  TrainingEquipment,
  SkillTrack,
  StagedSkillKey,
  SkillMastery,
  TRACK_LABEL,
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
}) {
  const { tx } = useLanguage();
  const [step, setStep] = useState(0);
  const [body, setBody] = useState<BodyProfile>(initialBody);
  const [skills, setSkills] = useState<SkillProfile>(initialSkills);
  const [equipment, setEquipment] = useState<TrainingEquipment>(initialEquipment);
  const [goals, setGoals] = useState<SkillTrack[]>(initialGoals);
  const [mastery, setMastery] = useState<Partial<Record<StagedSkillKey, SkillMastery>>>(initialMastery);
  // the per-area assessment has its own Back/Next — hide ours meanwhile
  const [assessing, setAssessing] = useState(false);

  const toggleGoal = (t: SkillTrack) => {
    setGoals((g) => (g.includes(t) ? g.filter((x) => x !== t) : g.length < 4 ? [...g, t] : g));
  };

  const next = () =>
    step < STEPS.length - 1 ? setStep(step + 1) : onSave(body, skills, equipment, goals, mastery);
  const back = () => step > 0 && setStep(step - 1);

  return (
    <div className="space-y-5">
      {/* progress dots */}
      <div className="flex items-center gap-2">
        {step > 0 && (
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
        <h2 className="heading text-xl text-zinc-100">{tx(STEPS[step])}</h2>
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
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">
            {tx("Tap everything available where you usually train. Sessions only suggest what you can actually do — ground work always shows up.")}
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <EquipmentToggle label={tx("Pull-up bar")} checked={equipment.pullUpBar}
              onChange={(v) => setEquipment({ ...equipment, pullUpBar: v })} />
            <EquipmentToggle label={tx("Parallel bars / dip station")} checked={equipment.parallelBars}
              onChange={(v) => setEquipment({ ...equipment, parallelBars: v })} />
            <EquipmentToggle label={tx("Rings")} checked={equipment.rings}
              onChange={(v) => setEquipment({ ...equipment, rings: v })} />
            <EquipmentToggle label={tx("Wall space")} checked={equipment.wallSpace}
              onChange={(v) => setEquipment({ ...equipment, wallSpace: v })} />
            <EquipmentToggle label={tx("Vertical pole / sturdy tree")} checked={equipment.verticalPole}
              onChange={(v) => setEquipment({ ...equipment, verticalPole: v })} />
            <EquipmentToggle label={tx("Monkey bars")} checked={equipment.monkeyBars}
              onChange={(v) => setEquipment({ ...equipment, monkeyBars: v })} />
            <EquipmentToggle label={tx("Weights (vest, belt, plates, backpack)")} checked={equipment.weights}
              onChange={(v) => setEquipment({ ...equipment, weights: v })} />
            <EquipmentToggle label={tx("Elastic / resistance bands")} checked={equipment.resistanceBands}
              onChange={(v) => setEquipment({ ...equipment, resistanceBands: v })} />
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

      {!(step === 2 && assessing) && (
      <button
        onClick={next}
        disabled={saving}
        className="w-full py-3 rounded-lg heading text-sm bg-orange-500 hover:bg-orange-400 text-zinc-950 disabled:opacity-60"
      >
        {step < STEPS.length - 1 ? tx("Continue") : saving ? tx("Saving...") : tx("Save & start training")}
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
        checked ? "border-orange-500 bg-orange-500/10 text-zinc-100" : "border-zinc-700 text-zinc-500"
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
