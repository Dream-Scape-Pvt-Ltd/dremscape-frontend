"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex space-x-1 border-b border-stone-200", className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer",
              isActive
                ? "border-emerald-600 text-emerald-700 font-semibold"
                : "border-transparent text-stone-500 hover:border-stone-300 hover:text-stone-700"
            )}
          >
            {tab.label}
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  isActive ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-600"
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
