"use client";

import { useEffect, useState } from "react";
import { Vibrate } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { buzz, hapticsOn, hapticsSupported, setHaptics } from "@/lib/haptics";

// The vibration switch (Me > Settings); hidden where the phone can't vibrate
export function useHaptics(): [boolean, boolean, (on: boolean) => void] {
  const [supported, setSupported] = useState(false);
  const [on, setOn] = useState(false);
  useEffect(() => {
    setSupported(hapticsSupported());
    setOn(hapticsOn());
  }, []);
  const toggle = (v: boolean) => {
    setHaptics(v);
    setOn(v);
    if (v) buzz("go"); // feel what it's like
  };
  return [supported, on, toggle];
}

export default function HapticsToggle() {
  const { tx } = useLanguage();
  const [supported, on, toggle] = useHaptics();
  if (!supported) return null;
  return (
    <section className="panel p-4">
      <button role="switch" aria-checked={on} onClick={() => toggle(!on)} className="w-full flex items-center gap-3 text-left">
        <Vibrate size={20} className="text-orange-400 shrink-0" />
        <span className="flex-1">
          <span className="block heading text-base text-zinc-100">{tx("Vibration cues")}</span>
          <span className="block text-sm text-zinc-400">{tx("The phone vibrates when a set starts, rest starts and an exercise is done — handy with it in your pocket.")}</span>
        </span>
        <span className={`w-11 h-6 rounded-full p-0.5 shrink-0 transition-colors ${on ? "bg-orange-500" : "bg-zinc-600"}`} aria-hidden="true">
          <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${on ? "translate-x-5" : ""}`} />
        </span>
      </button>
    </section>
  );
}
