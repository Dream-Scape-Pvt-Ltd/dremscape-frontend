"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { TREK_DIFFICULTY_GRADES } from "@/config/constants";
import type { TrekDifficulty } from "../types";

export function TrekFilterDrawer() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedRegion = searchParams.get("region") || "";
  const selectedDifficulty = searchParams.get("difficulty") || "";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`/treks?${params.toString()}`);
  };

  const handleReset = () => {
    router.push("/treks");
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-emerald-600" />
          <h3 className="font-bold text-stone-900 text-sm">Filter Expeditions</h3>
        </div>
        {(selectedRegion || selectedDifficulty) && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        )}
      </div>

      {/* Region Filter */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-2">
          Himalayan Region
        </label>
        <select
          value={selectedRegion}
          onChange={(e) => updateParam("region", e.target.value)}
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">All Regions ({siteConfig.majorRegions.length})</option>
          {siteConfig.majorRegions.map((region) => (
            <option key={region} value={region.toLowerCase()}>
              {region}
            </option>
          ))}
        </select>
      </div>

      {/* Difficulty Filter */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-2">
          Difficulty Grade
        </label>
        <div className="space-y-1.5">
          {Object.entries(TREK_DIFFICULTY_GRADES).map(([key, config]) => {
            const isSelected = selectedDifficulty === key;
            return (
              <button
                key={key}
                onClick={() => updateParam("difficulty", isSelected ? "" : key)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                    : "text-stone-700 hover:bg-stone-50 border border-transparent"
                }`}
              >
                <span>{config.label}</span>
                {isSelected && <span className="text-emerald-600 text-xs font-bold">✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
