"use client";

import { activeSportOf } from "@/lib/sports";
import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  MapPin,
  MessageCircle,
  Play,
  Plus,
  Scale,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTrainingSession } from "@/context/TrainingSessionContext";
import { announceUrlChange } from "@/lib/featureMap";

// pages where it would get in the way (the session page has its own start button)
const HIDDEN_ON = ["/", "/it", "/onboarding", "/training", "/about", "/parks"];

// A floating button that opens the things people do most, from anywhere.
export default function QuickActions() {
  const { userDoc } = useAuth();
  const { tx } = useLanguage();
  const pathname = usePathname();
  const { session, completed, expanded, expand } = useTrainingSession();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const box = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) =>
      !box.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const live = !!session && !completed;
  // during a session the floating "resume" bubble is the one shortcut, so
  // the two don't stack in the same corner
  if (!userDoc?.onboarded || HIDDEN_ON.includes(pathname) || expanded || live)
    return null;
  const outdoor = activeSportOf(userDoc) === "calisthenics";

  const actions: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon: LucideIcon;
    primary?: boolean;
  }[] = [
    live
      ? {
          label: "Back to your session",
          onClick: expand,
          icon: Play,
          primary: true,
        }
      : {
          label: "Today's session",
          href: "/training",
          icon: Play,
          primary: true,
        },
    { label: "Do an exercise", href: "/library", icon: BookOpen },
    {
      label: "Log your weight",
      href: "/profile?tab=activity#bodyweight",
      icon: Scale,
    },
    ...(outdoor ? [{ label: "Find a bar park", href: "/parks", icon: MapPin }] : []),
    { label: "Nudge a friend", href: "/friends#friends", icon: Users },
    { label: "Ask your coach", href: "/coach#chat", icon: MessageCircle },
  ];

  const itemClass = (primary?: boolean) =>
    `flex items-center gap-3 pl-3 pr-4 py-2.5 rounded-full shadow-lg border text-sm whitespace-nowrap ${
      primary
        ? "bg-orange-500 border-orange-400 text-zinc-950 font-medium"
        : "bg-zinc-900 border-zinc-700 text-zinc-100 hover:border-orange-500"
    }`;

  return (
    <>
      {/* dims the page so the actions read clearly; a tap on it closes them */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-zinc-950/70 backdrop-blur-[2px] animate-overlay-fade-in"
          aria-hidden="true"
        />
      )}
      <nav
        ref={box}
        id="quick-actions"
        aria-label={tx("Quick actions")}
        className="fixed right-4 z-40 bottom-[calc(5rem+env(safe-area-inset-bottom))] sm:bottom-6 flex flex-col items-end gap-2"
      >
        {open && (
          <ul
            id={menuId}
            className="flex flex-col items-end gap-2 animate-overlay-fade-in"
          >
            {actions.map((a) => {
              const Icon = a.icon;
              const body = (
                <>
                  <Icon size={17} aria-hidden /> {tx(a.label)}
                </>
              );
              return (
                <li key={a.label}>
                  {a.href ? (
                    <Link
                      href={a.href}
                      className={itemClass(a.primary)}
                      onClick={() => (announceUrlChange(), setOpen(false))}
                    >
                      {body}
                    </Link>
                  ) : (
                    <button
                      className={itemClass(a.primary)}
                      onClick={() => (a.onClick?.(), setOpen(false))}
                    >
                      {body}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <button
          ref={toggleRef}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? tx("Close quick actions") : tx("Quick actions")}
          className={`relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-colors ${
            open
              ? "bg-zinc-800 border border-zinc-600 text-zinc-100"
              : "bg-orange-500 hover:bg-orange-400 text-zinc-950"
          }`}
        >
          <Plus
            size={26}
            className={`transition-transform ${open ? "rotate-45" : ""}`}
            aria-hidden
          />
          {live && !open && (
            <span
              className="absolute top-1 right-1 w-3 h-3 rounded-full bg-sky-400 ring-2 ring-zinc-950"
              aria-hidden
            />
          )}
        </button>
      </nav>
    </>
  );
}
