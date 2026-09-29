import { Clock, Mountain, Gauge, Calendar, ShieldCheck, MapPin } from "lucide-react";
import type { TrekDetail } from "../types";
import { getDifficultyBadgeConfig } from "../utils";

export function TrekQuickFacts({ trek }: { trek: TrekDetail }) {
  const diffConfig = getDifficultyBadgeConfig(trek.difficulty);

  const facts = [
    {
      icon: Clock,
      label: "Duration",
      value: `${trek.durationDays} Days / ${trek.durationDays - 1} Nights`,
      sub: "Roundtrip from Kathmandu",
    },
    {
      icon: Mountain,
      label: "Max Altitude",
      value: `${trek.maxAltitudeMeters.toLocaleString()} m`,
      sub: "High altitude acclimatization included",
    },
    {
      icon: Gauge,
      label: "Physical Grade",
      value: diffConfig.label,
      sub: "High stamina required",
    },
    {
      icon: Calendar,
      label: "Best Season",
      value: "Spring & Autumn",
      sub: "Mar - May & Sep - Nov",
    },
    {
      icon: ShieldCheck,
      label: "Permits Included",
      value: `${trek.permitTypesRequired.length} Permits`,
      sub: "All conservation fees arranged",
    },
    {
      icon: MapPin,
      label: "Start / Finish",
      value: `${trek.region.name}`,
      sub: "Scenic mountain flight / private transfer",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      {facts.map((fact, index) => {
        const Icon = fact.icon;
        return (
          <div key={index} className="flex items-start gap-3 p-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                {fact.label}
              </span>
              <p className="text-sm font-bold text-stone-900 mt-0.5">{fact.value}</p>
              <p className="text-[11px] text-stone-500">{fact.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
