"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface AccordionItemProps {
  title: React.ReactNode;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
  badge?: React.ReactNode;
}

export function AccordionItem({
  title,
  children,
  isOpen = false,
  onToggle,
  className,
  badge,
}: AccordionItemProps) {
  const [internalOpen, setInternalOpen] = React.useState(isOpen);
  const open = onToggle ? isOpen : internalOpen;
  const toggle = onToggle ? onToggle : () => setInternalOpen((prev) => !prev);

  return (
    <div className={cn("border-b border-stone-200", className)}>
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between py-4 text-left font-medium text-stone-900 transition-all hover:text-emerald-700"
      >
        <div className="flex items-center gap-3">
          {title}
          {badge}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-stone-500 transition-transform duration-200",
            open && "rotate-180 text-emerald-600"
          )}
        />
      </button>
      {open && (
        <div className="pb-4 pt-1 text-sm text-stone-600 animate-in fade-in duration-200">
          {children}
        </div>
      )}
    </div>
  );
}
