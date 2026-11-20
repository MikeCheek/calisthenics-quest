"use client";

import { useEffect, useState } from "react";
import { onTuningChange, tuning, Tuning } from "@/lib/tuning";

// Current tuning values, re-rendering when Remote Config updates them.
export function useTuning(): Tuning {
  const [t, setT] = useState<Tuning>(tuning());
  useEffect(() => onTuningChange(() => setT(tuning())), []);
  return t;
}
