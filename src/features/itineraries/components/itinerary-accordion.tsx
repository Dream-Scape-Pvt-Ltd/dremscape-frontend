"use client";

import * as React from "react";
import { ChevronDown, MapPin, Bed, Coffee, Clock } from "lucide-react";
import type { TrekItineraryDay } from "@/features/treks/types";
import { formatElevation } from "@/lib/formatters/geo";
import { usePreferencesStore } from "@/features/preferences/store";

export function ItineraryAccordion({ days }: { days: TrekItineraryDay[] }) {
  const { unitSystem } = usePreferencesStore();
  const [openDay, setOpenDay] = React.useState<number | null>(1);

  if (!days || days.length === 0) {
    return (
      <p className="text-xs text-stone-500 italic">
        Detailed day-by-day briefing notes available upon inquiry.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {days.map((day) => {
        const isOpen = openDay === day.dayNumber;
        return (
          <div
            key={day.id}
            className="overflow-hidden rounded-xl border border-stone-200 bg-white transition-all shadow-sm"
          >
            <button
              type="button"
              onClick={() => setOpenDay(isOpen ? null : day.dayNumber)}
              className="flex w-full items-center justify-between p-4 text-left font-semibold text-stone-900 hover:bg-stone-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-800">
                  {day.dayNumber}
                </span>
                <span className="text-sm font-bold text-stone-900">{day.title}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-block rounded-md bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-600">
                  {formatElevation(day.elevationMeters, unitSystem)}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-stone-400 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-emerald-600" : ""
                  }`}
                />
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-stone-100 bg-stone-50/50 p-4 pt-3 text-xs text-stone-600 animate-in fade-in duration-150">
                <p className="leading-relaxed">{day.description}</p>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-stone-200/60 pt-3 text-[11px] text-stone-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{day.walkingHours} hrs hike</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{day.endPoint}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bed className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{day.accommodation}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Coffee className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="capitalize">{day.mealsProvided.join(", ")}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
