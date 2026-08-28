"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Info, CheckCircle2, AlertTriangle, AlertCircle, X } from "lucide-react";

export type ToastKind = "info" | "success" | "warning" | "error";

interface ToastItem {
  id: string;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  show: (kind: ToastKind, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// info/success are quick acknowledgements; warning/error need a beat longer
// to actually read before they disappear.
const DURATION_MS: Record<ToastKind, number> = {
  info: 3500,
  success: 3500,
  warning: 5500,
  error: 6500,
};

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const t = timers.current.get(id);
    if (t) {
      clearTimeout(t);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback(
    (kind: ToastKind, message: string) => {
      const id = `t${nextId++}`;
      setToasts((prev) => [...prev, { id, kind, message }]);
      const timer = setTimeout(() => dismiss(id), DURATION_MS[kind]);
      timers.current.set(id, timer);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// Every info/success/warning/error message in the app funnels through this
// one hook rather than each screen inventing its own inline banner —
// `toast.error("Couldn't save — try again.")` etc.
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return {
    info: (message: string) => ctx.show("info", message),
    success: (message: string) => ctx.show("success", message),
    warning: (message: string) => ctx.show("warning", message),
    error: (message: string) => ctx.show("error", message),
  };
}

const KIND_STYLE: Record<ToastKind, { icon: typeof Info; classes: string; iconClass: string }> = {
  info: { icon: Info, classes: "border-zinc-700 bg-zinc-900", iconClass: "text-zinc-400" },
  success: { icon: CheckCircle2, classes: "border-emerald-600 bg-zinc-900", iconClass: "text-emerald-400" },
  warning: { icon: AlertTriangle, classes: "border-orange-500 bg-zinc-900", iconClass: "text-orange-400" },
  error: { icon: AlertCircle, classes: "border-red-600 bg-zinc-900", iconClass: "text-red-400" },
};

function ToastViewport({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none"
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }}
    >
      {toasts.map((t) => {
        const { icon: Icon, classes, iconClass } = KIND_STYLE[t.kind];
        return (
          <div
            key={t.id}
            className={`pointer-events-auto w-full panel border ${classes} shadow-lg px-3.5 py-3 flex items-start gap-2.5 animate-slide-down-in`}
            role={t.kind === "error" || t.kind === "warning" ? "alert" : "status"}
          >
            <Icon size={17} className={`shrink-0 mt-0.5 ${iconClass}`} />
            <div className="flex-1 text-sm text-zinc-100 leading-snug">{t.message}</div>
            <button
              onClick={() => onDismiss(t.id)}
              className="text-zinc-500 hover:text-zinc-300 shrink-0 -mt-0.5"
              aria-label="Dismiss"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
