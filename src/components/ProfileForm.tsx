"use client";

import { useState } from "react";
import {
  BodyProfile,
  SkillProfile,
  TrainingEquipment,
  FrontLeverStage,
  PlancheStage,
  MuscleUpStage,
  HandstandStage,
  PistolSquatStage,
  LSitStage,
} from "@/lib/types";

const FRONT_LEVER_OPTIONS: { value: FrontLeverStage; label: string }[] = [
  { value: "none", label: "Not started" },
  { value: "tuck", label: "Tuck" },
  { value: "advancedTuck", label: "Advanced tuck" },
  { value: "oneLeg", label: "One leg" },
  { value: "straddle", label: "Straddle" },
  { value: "full", label: "Full" },
];

const PLANCHE_OPTIONS: { value: PlancheStage; label: string }[] = [
  { value: "none", label: "Not started" },
  { value: "tuck", label: "Tuck" },
  { value: "advancedTuck", label: "Advanced tuck" },
  { value: "straddle", label: "Straddle" },
  { value: "full", label: "Full" },
];

const MUSCLE_UP_OPTIONS: { value: MuscleUpStage; label: string }[] = [
  { value: "none", label: "Not yet" },
  { value: "band", label: "Band-assisted" },
  { value: "single", label: "A few strict" },
  { value: "multiple", label: "Multiple in a row" },
];

const HANDSTAND_OPTIONS: { value: HandstandStage; label: string }[] = [
  { value: "none", label: "Not started" },
  { value: "wall", label: "Wall-assisted" },
  { value: "freestanding", label: "Freestanding" },
];

const PISTOL_OPTIONS: { value: PistolSquatStage; label: string }[] = [
  { value: "none", label: "Not started" },
  { value: "assisted", label: "Assisted" },
  { value: "full", label: "Full pistol squat" },
];

const LSIT_OPTIONS: { value: LSitStage; label: string }[] = [
  { value: "none", label: "Not started" },
  { value: "tuck", label: "Tuck L-sit" },
  { value: "advanced", label: "One-leg extended" },
  { value: "full", label: "Full L-sit" },
];

const selectClass =
  "bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm";
const labelClass = "flex flex-col gap-1.5 text-xs text-zinc-400";

export default function ProfileForm({
  initialBody,
  initialSkills,
  initialEquipment,
  onSave,
  saving,
}: {
  initialBody: BodyProfile;
  initialSkills: SkillProfile;
  initialEquipment: TrainingEquipment;
  onSave: (body: BodyProfile, skills: SkillProfile, equipment: TrainingEquipment) => void;
  saving?: boolean;
}) {
  const [body, setBody] = useState<BodyProfile>(initialBody);
  const [skills, setSkills] = useState<SkillProfile>(initialSkills);
  const [equipment, setEquipment] = useState<TrainingEquipment>(initialEquipment);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(body, skills, equipment);
      }}
      className="space-y-5"
    >
      <div className="panel p-4">
        <div className="heading text-base text-zinc-100 mb-1">Where do you train?</div>
        <p className="text-xs text-zinc-500 mb-3">
          This decides which exercises get suggested — ground work always
          shows up, even with nothing else available.
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          <EquipmentToggle
            label="Pull-up bar"
            checked={equipment.pullUpBar}
            onChange={(v) => setEquipment({ ...equipment, pullUpBar: v })}
          />
          <EquipmentToggle
            label="Parallel bars / dip station"
            checked={equipment.parallelBars}
            onChange={(v) => setEquipment({ ...equipment, parallelBars: v })}
          />
          <EquipmentToggle
            label="Rings"
            checked={equipment.rings}
            onChange={(v) => setEquipment({ ...equipment, rings: v })}
          />
          <EquipmentToggle
            label="Wall space"
            checked={equipment.wallSpace}
            onChange={(v) => setEquipment({ ...equipment, wallSpace: v })}
          />
        </div>
      </div>

      <div className="panel p-4">
        <div className="heading text-base text-zinc-100 mb-3">Body</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <label className={labelClass}>
            Age
            <input
              type="number"
              value={body.ageYears}
              onChange={(e) => setBody({ ...body, ageYears: Number(e.target.value) })}
              className={selectClass}
            />
          </label>
          <label className={labelClass}>
            Weight (kg)
            <input
              type="number"
              value={body.weightKg}
              onChange={(e) => setBody({ ...body, weightKg: Number(e.target.value) })}
              className={selectClass}
            />
          </label>
          <label className={labelClass}>
            Height (cm)
            <input
              type="number"
              value={body.heightCm}
              onChange={(e) => setBody({ ...body, heightCm: Number(e.target.value) })}
              className={selectClass}
            />
          </label>
          <label className={labelClass}>
            Training since (yrs)
            <input
              type="number"
              value={body.experienceYears ?? 0}
              onChange={(e) => setBody({ ...body, experienceYears: Number(e.target.value) })}
              className={selectClass}
            />
          </label>
        </div>
      </div>

      <div className="panel p-4">
        <div className="heading text-base text-zinc-100 mb-3">Skills</div>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className={labelClass}>
            Front lever
            <select
              value={skills.frontLever}
              onChange={(e) => setSkills({ ...skills, frontLever: e.target.value as FrontLeverStage })}
              className={selectClass}
            >
              {FRONT_LEVER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Planche
            <select
              value={skills.planche}
              onChange={(e) => setSkills({ ...skills, planche: e.target.value as PlancheStage })}
              className={selectClass}
            >
              {PLANCHE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Muscle-up
            <select
              value={skills.muscleUp}
              onChange={(e) => setSkills({ ...skills, muscleUp: e.target.value as MuscleUpStage })}
              className={selectClass}
            >
              {MUSCLE_UP_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Handstand
            <select
              value={skills.handstand}
              onChange={(e) => setSkills({ ...skills, handstand: e.target.value as HandstandStage })}
              className={selectClass}
            >
              {HANDSTAND_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Pistol squat
            <select
              value={skills.pistolSquat}
              onChange={(e) => setSkills({ ...skills, pistolSquat: e.target.value as PistolSquatStage })}
              className={selectClass}
            >
              {PISTOL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            L-sit
            <select
              value={skills.lSit}
              onChange={(e) => setSkills({ ...skills, lSit: e.target.value as LSitStage })}
              className={selectClass}
            >
              {LSIT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Max strict pull-ups
            <input
              type="number"
              min={0}
              value={skills.pullUpMaxReps}
              onChange={(e) => setSkills({ ...skills, pullUpMaxReps: Number(e.target.value) })}
              className={selectClass}
            />
          </label>
          <label className={labelClass}>
            Max dips (or push-ups if no bars)
            <input
              type="number"
              min={0}
              value={skills.dipMaxReps}
              onChange={(e) => setSkills({ ...skills, dipMaxReps: Number(e.target.value) })}
              className={selectClass}
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300 sm:col-span-2">
            <input
              type="checkbox"
              checked={skills.archerPullUp}
              onChange={(e) => setSkills({ ...skills, archerPullUp: e.target.checked })}
              className="accent-orange-500 w-4 h-4"
            />
            I can do archer pull-ups
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full py-3 rounded-lg heading text-sm bg-orange-500 hover:bg-orange-400 text-zinc-950 disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save & Continue"}
      </button>
    </form>
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
        checked
          ? "border-orange-500 bg-orange-500/10 text-zinc-100"
          : "border-zinc-700 text-zinc-500"
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
