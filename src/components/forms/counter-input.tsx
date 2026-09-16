"use client";

import { Minus, Plus } from "lucide-react";

interface CounterInputProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  label?: string;
  sublabel?: string;
}

export function CounterInput({
  value,
  onChange,
  min = 1,
  max = 20,
  label,
  sublabel,
}: CounterInputProps) {
  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };

  const handleIncrement = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className="flex items-center justify-between py-2">
      {(label || sublabel) && (
        <div>
          {label && <p className="text-sm font-medium text-stone-900">{label}</p>}
          {sublabel && <p className="text-xs text-stone-500">{sublabel}</p>}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          aria-label="Decrease count"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>

        <span className="w-6 text-center font-bold text-stone-900">{value}</span>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          aria-label="Increase count"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
