"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const { tx } = useLanguage();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  // Escape closes; Tab stays inside the dialog
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return closeRef.current();
      if (e.key !== "Tab" || !panelRef.current) return;
      const items = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || !panelRef.current.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Rendered at <body> level: an ancestor with a transform, opacity
  // animation or its own z-index would otherwise trap the overlay beneath
  // sibling content (e.g. the bottom nav). Also locks background scroll.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // focus moves into the dialog when it opens (an autofocus field wins), and
  // back to whatever opened it when it closes
  useEffect(() => {
    if (!open || !mounted) return;
    const opener = document.activeElement as HTMLElement | null;
    const id = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (panel && !panel.contains(document.activeElement)) panel.focus();
    });
    return () => {
      cancelAnimationFrame(id);
      if (opener && document.contains(opener)) opener.focus();
    };
  }, [open, mounted]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-zinc-950/75 backdrop-blur-sm animate-overlay-fade-in"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="panel outline-none w-full sm:max-w-md max-h-[85vh] overflow-y-auto rounded-b-none sm:rounded-b-lg animate-slide-up-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden flex justify-center pt-2">
          <span className="w-10 h-1 rounded-full bg-zinc-700" aria-hidden="true" />
        </div>
        <div className="sticky top-0 bg-zinc-900 flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 id={titleId} className="heading text-lg text-zinc-100">
            {title}
          </h2>
          <button onClick={onClose} className="p-2 -m-1 text-muted hover:text-zinc-200" aria-label={tx("Close")}>
            <X size={18} />
          </button>
        </div>
        <div className="p-4 safe-bottom">{children}</div>
      </div>
    </div>,
    document.body
  );
}
