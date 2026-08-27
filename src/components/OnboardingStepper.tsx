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
import { effectiveLevel } from "@/lib/levelPath";
import ScrollPicker from "@/components/ScrollPicker";
import SegmentedControl from "@/components/SegmentedControl";
import WeekdayPicker from "@/components/WeekdayPicker";
import SkillTabPicker from "@/components/SkillTabPicker";
import CalisthenicsFigure from "@/components/CalisthenicsFigure";
import { ChevronLeft } from "lucide-react";

const GOAL_TRACKS: SkillTrack[] = [
  "frontLever", "backLever", "planche", "muscleUp", "handstand",
  "humanFlag", "pullStrength", "pushStrength", "legs", "core",
];

const STEPS = ["About you", "Where you train", "Your skills", "Your goals"];

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
  const [step, setStep] = useState(0);
  const [body, setBody] = useState<BodyProfile>(initialBody);
  const [skills, setSkills] = useState<SkillProfile>(initialSkills);
  const [equipment, setEquipment] = useState<TrainingEquipment>(initialEquipment);
  const [goals, setGoals] = useState<SkillTrack[]>(initialGoals);
  const [mastery, setMastery] = useState<Partial<Record<StagedSkillKey, SkillMastery>>>(initialMastery);

  const liveLevel = effectiveLevel(currentXp, skills, mastery);

  const toggleGoal = (t: SkillTrack) => {
    setGoals((g) => (g.includes(t) ? g.filter((x) => x !== t) : g.length < 4 ? [...g, t] : g));
  };

  const setSkillStage = (skill: StagedSkillKey, stage: string) => {
    setSkills({ ...skills, [skill]: stage } as SkillProfile);
    // a brand-new claim starts conservative — the athlete raises mastery
    // deliberately rather than it defaulting to something they haven't earned
    if (stage !== "none" && mastery[skill] === undefined) {
      setMastery((m) => ({ ...m, [skill]: 1 }));
    }
  };

  const setSkillMastery = (skill: StagedSkillKey, m: SkillMastery) => {
    setMastery((prev) => ({ ...prev, [skill]: m }));
  };

  const next = () =>
    step < STEPS.length - 1 ? setStep(step + 1) : onSave(body, skills, equipment, goals, mastery);
  const back = () => step > 0 && setStep(step - 1);

  return (
    <div className="space-y-5">
      {/* progress dots */}
      <div className="flex items-center gap-2">
        {step > 0 && (
          <button onClick={back} className="p-1.5 -ml-1.5 text-zinc-400" aria-label="Back">
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
          Step {step + 1} of {STEPS.length}
        </div>
        <h2 className="heading text-xl text-zinc-100">{STEPS[step]}</h2>
      </div>

      {step === 0 && (
        <div className="space-y-5">
          <CalisthenicsFigure move="pullup" />
          <div className="grid grid-cols-3 gap-3">
            <ScrollPicker label="Age" value={body.ageYears} min={12} max={80} unit="yrs" variant="wheel"
              onChange={(v) => setBody({ ...body, ageYears: v })} />
            <ScrollPicker label="Height" value={body.heightCm} min={130} max={220} unit="cm" variant="ruler"
              onChange={(v) => setBody({ ...body, heightCm: v })} />
            <ScrollPicker label="Weight" value={body.weightKg} min={35} max={160} unit="kg" variant="wheel"
              onChange={(v) => setBody({ ...body, weightKg: v })} />
          </div>
          <SegmentedControl
            label="Sex (optional — helps calibrate a couple of exercise choices)"
            value={body.sex ?? "unspecified"}
            options={[
              { value: "unspecified", label: "Prefer not to say" },
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
            ]}
            onChange={(v) => setBody({ ...body, sex: v as BodyProfile["sex"] })}
          />
          <WeekdayPicker
            label="Which days do you train?"
            selected={body.trainingDaysOfWeek ?? []}
            onChange={(days) => setBody({ ...body, trainingDaysOfWeek: days, trainingDaysPerWeek: days.length })}
          />
          <SegmentedControl
            label="Typical session length"
            value={String(body.sessionLengthMinutes ?? 45)}
            options={[15, 30, 45, 60, 90].map((n) => ({ value: String(n), label: `${n} min` }))}
            onChange={(v) => setBody({ ...body, sessionLengthMinutes: Number(v) })}
          />
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">
            Tap everything available where you usually train. Sessions only
            suggest what you can actually do — ground work always shows up.
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <EquipmentToggle label="Pull-up bar" checked={equipment.pullUpBar}
              onChange={(v) => setEquipment({ ...equipment, pullUpBar: v })} />
            <EquipmentToggle label="Parallel bars / dip station" checked={equipment.parallelBars}
              onChange={(v) => setEquipment({ ...equipment, parallelBars: v })} />
            <EquipmentToggle label="Rings" checked={equipment.rings}
              onChange={(v) => setEquipment({ ...equipment, rings: v })} />
            <EquipmentToggle label="Wall space" checked={equipment.wallSpace}
              onChange={(v) => setEquipment({ ...equipment, wallSpace: v })} />
            <EquipmentToggle label="Vertical pole / sturdy tree" checked={equipment.verticalPole}
              onChange={(v) => setEquipment({ ...equipment, verticalPole: v })} />
            <EquipmentToggle label="Monkey bars" checked={equipment.monkeyBars}
              onChange={(v) => setEquipment({ ...equipment, monkeyBars: v })} />
            <EquipmentToggle label="Weights (vest, belt, plates, backpack)" checked={equipment.weights}
              onChange={(v) => setEquipment({ ...equipment, weights: v })} />
            <EquipmentToggle label="Elastic / resistance bands" checked={equipment.resistanceBands}
              onChange={(v) => setEquipment({ ...equipment, resistanceBands: v })} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">
            Scroll through and set your stage for each skill. For whatever
            your highest stage is, also rate how solid it really is — you
            can always log &quot;Attempted&quot; or &quot;Touched it&quot; on
            anything, even something way above your level; the higher
            ratings unlock as your level catches up.
          </p>
          <div className="panel px-3 py-2 flex items-center justify-between">
            <span className="text-xs text-zinc-400">Level so far, from what you&apos;ve set</span>
            <span className="stat-mono text-sm text-orange-400">Lv {liveLevel}</span>
          </div>
          <SkillTabPicker
            skills={skills}
            mastery={mastery}
            liveLevel={liveLevel}
            onStageChange={setSkillStage}
            onMasteryChange={setSkillMastery}
          />

          <div className="grid grid-cols-2 gap-3">
            <ScrollPicker label="Max pull-ups" value={skills.pullUpMaxReps} min={0} max={40} variant="wheel"
              onChange={(v) => setSkills({ ...skills, pullUpMaxReps: v })} />
            <ScrollPicker label="Max dips / push-ups" value={skills.dipMaxReps} min={0} max={50} variant="wheel"
              onChange={(v) => setSkills({ ...skills, dipMaxReps: v })} />
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={skills.archerPullUp}
              onChange={(e) => setSkills({ ...skills, archerPullUp: e.target.checked })}
              className="accent-orange-500 w-4 h-4"
            />
            I can do archer pull-ups
          </label>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <CalisthenicsFigure move="flag" />
          <p className="text-sm text-zinc-400">
            Pick up to 4 skills you most want to progress. Sessions targeting
            these show up more often in your rotation.
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
                {TRACK_LABEL[t]}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={next}
        disabled={saving}
        className="w-full py-3 rounded-lg heading text-sm bg-orange-500 hover:bg-orange-400 text-zinc-950 disabled:opacity-60"
      >
        {step < STEPS.length - 1 ? "Continue" : saving ? "Saving..." : "Save & start training"}
      </button>
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
