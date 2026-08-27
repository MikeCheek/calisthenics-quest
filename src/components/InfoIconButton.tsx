"use client";

import { Info } from "lucide-react";

export default function InfoIconButton({
  onClick,
  label,
  size = 13,
}: {
  onClick: () => void;
  label: string;
  size?: number;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="p-1 -m-1 text-zinc-500 hover:text-orange-400 shrink-0"
      aria-label={label}
    >
      <Info size={size} />
    </button>
  );
}
