"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

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
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

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

  if (!open || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-zinc-950/75 backdrop-blur-sm animate-overlay-fade-in"
      onClick={onClose}
    >
      <div
        className="panel w-full sm:max-w-md max-h-[85vh] overflow-y-auto rounded-b-none sm:rounded-b-lg animate-slide-up-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden flex justify-center pt-2">
          <span className="w-10 h-1 rounded-full bg-zinc-700" />
        </div>
        <div className="sticky top-0 bg-zinc-900 flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="heading text-lg text-zinc-100">{title}</div>
          <button onClick={onClose} className="p-1 text-muted hover:text-zinc-200" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="p-4 safe-bottom">{children}</div>
      </div>
    </div>,
    document.body
  );
}
