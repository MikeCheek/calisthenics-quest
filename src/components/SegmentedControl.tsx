"use client";

export default function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className={disabled ? "opacity-40 pointer-events-none" : ""}>
      <div className="text-xs text-zinc-400 mb-1.5">{label}</div>
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`shrink-0 px-3 py-2 rounded-lg text-sm border whitespace-nowrap transition-colors ${
              value === o.value
                ? "border-orange-500 bg-orange-500/10 text-zinc-100"
                : "border-zinc-700 text-zinc-400"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
