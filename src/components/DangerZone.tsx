"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Modal from "@/components/Modal";
import {
  DeleteStep,
  deleteAccount,
  exportUserData,
  resetAllProgress,
  resetSkills,
  resetTrainingMemory,
  resetVerifications,
} from "@/lib/account";
import { AlertTriangle, Brain, BadgeCheck, Download, RotateCcw, Trash2, Layers, Loader2, LogOut } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import SaveProgressPrompt from "@/components/SaveProgressPrompt";

type ActionId = "memory" | "verifications" | "skills" | "all" | "delete";

interface Action {
  id: ActionId;
  title: string;
  summary: string;
  icon: typeof Brain;
  severity: "mild" | "serious" | "fatal";
  removes: string[];
  keeps: string[];
  confirmWord?: string; // typed confirmation for the irreversible ones
  cta: string;
}

const ACTIONS: Action[] = [
  {
    id: "memory",
    title: "Reset training memory",
    summary: "Forget what the coach learned from your sessions.",
    icon: Brain,
    severity: "mild",
    removes: ["Learned rest times and hold targets", "Eased / stepped-up exercises", "Pending skill-level suggestions"],
    keeps: ["Skills, XP, streak and history", "Verified skills"],
    cta: "Reset memory",
  },
  {
    id: "verifications",
    title: "Reset verifications",
    summary: "Re-prove your skills from scratch with new Skill Checks.",
    icon: BadgeCheck,
    severity: "mild",
    removes: ["Every verified / retest status", "Recorded Skill Check clips on this device"],
    keeps: ["Your skill levels", "XP, streak and history"],
    cta: "Reset verifications",
  },
  {
    id: "skills",
    title: "Reset skills & retake assessment",
    summary: "Set every skill back to “not started” and redo the assessment.",
    icon: Layers,
    severity: "serious",
    removes: ["All 50 skill levels and mastery", "Goals", "Training memory and verifications"],
    keeps: ["XP, streak, sessions and missions", "Body stats and equipment", "Friends"],
    confirmWord: "RESET",
    cta: "Reset skills",
  },
  {
    id: "all",
    title: "Start over",
    summary: "Wipe all progress and set up again, keeping your account and friends.",
    icon: RotateCcw,
    severity: "serious",
    removes: ["XP, level, streak and session count", "Session history and personal records", "XP history and missions", "Skills, goals, body stats, equipment", "Training memory and verifications"],
    keeps: ["Your account, name and friend code", "Friends, reminders and language"],
    confirmWord: "RESET",
    cta: "Start over",
  },
  {
    id: "delete",
    title: "Delete account",
    summary: "Permanently delete your account and all your data.",
    icon: Trash2,
    severity: "fatal",
    removes: [
      "Your profile, progress and history",
      "Your public profile and friend code",
      "You from your friends’ lists",
      "Your Google sign-in link to BarQuests",
    ],
    keeps: [],
    confirmWord: "DELETE",
    cta: "Delete forever",
  },
];

const SEVERITY_STYLE = {
  mild: "border-zinc-700 hover:border-zinc-500",
  serious: "border-orange-500/30 hover:border-orange-500/60",
  fatal: "border-red-500/40 hover:border-red-500/70",
};

const DELETE_STEP_LABEL: Record<DeleteStep, string> = {
  reauth: "Confirm with Google…",
  data: "Deleting your data…",
  account: "Removing your account…",
};

export default function DangerZone() {
  const { user, userDoc, refreshUserDoc, signOut, isGuest } = useAuth();
  const toast = useToast();
  const { tx } = useLanguage();
  const router = useRouter();
  const [active, setActive] = useState<Action | null>(null);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<DeleteStep | null>(null);
  const [exporting, setExporting] = useState(false);

  if (!user || !userDoc) return null;

  const open = (a: Action) => {
    setActive(a);
    setTyped("");
    setStep(null);
  };
  const close = () => !busy && setActive(null);

  const confirmed = !active?.confirmWord || typed.trim().toUpperCase() === active.confirmWord;

  const run = async () => {
    if (!active || !confirmed) return;
    setBusy(true);
    try {
      switch (active.id) {
        case "memory":
          await resetTrainingMemory(userDoc.uid);
          await refreshUserDoc();
          toast.success("Training memory cleared — sessions start fresh from your skill levels.");
          break;
        case "verifications":
          await resetVerifications(userDoc.uid);
          await refreshUserDoc();
          toast.success("Verifications reset — Skill Checks will re-prove your levels.");
          break;
        case "skills":
          await resetSkills(userDoc);
          await refreshUserDoc();
          router.replace("/onboarding");
          toast.info("Skills reset — let's find your level again.");
          break;
        case "all":
          await resetAllProgress(userDoc);
          await refreshUserDoc();
          router.replace("/onboarding");
          toast.info("Fresh start — set up your profile again.");
          break;
        case "delete":
          await deleteAccount(user, userDoc, setStep);
          router.replace("/");
          toast.success("Your account and data have been deleted.");
          break;
      }
      setActive(null);
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        toast.info("Cancelled — nothing was deleted.");
      } else if (code === "auth/user-mismatch") {
        toast.error("That's a different Google account — sign in with the one you use here.");
      } else {
        toast.error(
          active.id === "delete" && step !== "reauth"
            ? "Deletion didn't finish — check your connection and try again."
            : "Something went wrong — check your connection and try again."
        );
      }
    } finally {
      setBusy(false);
    }
  };

  const doExport = async () => {
    setExporting(true);
    try {
      await exportUserData(userDoc);
      toast.success("Your data was downloaded as a JSON file.");
    } catch {
      toast.error("Couldn't export your data — try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <SaveProgressPrompt />
      <section className="panel p-4 space-y-3">
        <div>
          <h2 className="heading text-base text-zinc-100">{tx("Your data")}</h2>
          <p className="text-xs text-muted">{tx("Everything BarQuests stores about you, yours to take.")}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={doExport}
            disabled={exporting}
            className="py-2.5 rounded-xl border border-zinc-700 text-sm text-zinc-200 hover:border-orange-500 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {exporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />} {tx("Export data")}
          </button>
          {!isGuest && (
          <button
            onClick={signOut}
            className="py-2.5 rounded-xl border border-zinc-700 text-sm text-zinc-200 hover:border-orange-500 flex items-center justify-center gap-2"
          >
            <LogOut size={15} /> {tx("Sign out")}
          </button>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-red-500/30 bg-red-500/[0.03] p-4 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-400" />
          <h2 className="heading text-base text-red-300">{tx("Danger zone")}</h2>
        </div>
        <p className="text-xs text-muted -mt-1">{tx("From a gentle refresh to permanent deletion. Each one tells you exactly what goes.")}</p>
        <ul className="space-y-2">
          {ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <li key={a.id}>
                <button
                  onClick={() => open(a)}
                  className={`w-full text-left rounded-xl border bg-zinc-900/60 p-3 flex items-center gap-3 transition-colors ${SEVERITY_STYLE[a.severity]}`}
                >
                  <span
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      a.severity === "fatal" ? "bg-red-500/15 text-red-400" : a.severity === "serious" ? "bg-orange-500/15 text-orange-400" : "bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    <Icon size={17} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className={`block text-sm ${a.severity === "fatal" ? "text-red-300" : "text-zinc-100"}`}>{tx(a.title)}</span>
                    <span className="block text-xs text-muted">{tx(a.summary)}</span>
                  </span>
                  <span className="text-muted">›</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <Modal open={!!active} onClose={close} title={tx(active?.title ?? "")}>
        {active && (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300">{tx(active.summary)}</p>
            <div className={`grid gap-3 ${active.keeps.length ? "grid-cols-2" : "grid-cols-1"}`}>
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3">
                <div className="text-xs uppercase tracking-wide text-red-300 mb-1.5">{tx("Removes")}</div>
                <ul className="space-y-1 text-xs text-zinc-300">
                  {active.removes.map((r) => (
                    <li key={r}>− {tx(r)}</li>
                  ))}
                </ul>
              </div>
              {active.keeps.length > 0 && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
                  <div className="text-xs uppercase tracking-wide text-emerald-300 mb-1.5">{tx("Keeps")}</div>
                  <ul className="space-y-1 text-xs text-zinc-300">
                    {active.keeps.map((k) => (
                      <li key={k}>+ {tx(k)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {active.id === "delete" && (
              <p className="text-xs text-zinc-400">
                {tx("This can't be undone. You'll be asked to confirm with Google first — cancelling there leaves everything untouched. Tip: export your data first.")}
              </p>
            )}

            {active.confirmWord && (
              <label className="block">
                <span className="text-xs text-zinc-400">
                  {tx("Type")} <span className="stat-mono text-zinc-100">{active.confirmWord}</span> {tx("to confirm")}
                </span>
                <input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  autoCapitalize="characters"
                  autoComplete="off"
                  disabled={busy}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-700 focus:border-red-500 outline-none rounded-lg px-3 py-2 text-sm text-zinc-100 stat-mono tracking-widest"
                />
              </label>
            )}

            <div className="flex gap-2">
              <button
                onClick={close}
                disabled={busy}
                className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-sm text-zinc-300 disabled:opacity-50"
              >
                {tx("Cancel")}
              </button>
              <button
                onClick={run}
                disabled={!confirmed || busy}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40 ${
                  active.severity === "mild" ? "bg-zinc-100 text-zinc-950" : "bg-red-500 hover:bg-red-400 text-zinc-950"
                }`}
              >
                {busy && <Loader2 size={15} className="animate-spin" />}
                {busy && step ? tx(DELETE_STEP_LABEL[step]) : tx(active.cta)}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
