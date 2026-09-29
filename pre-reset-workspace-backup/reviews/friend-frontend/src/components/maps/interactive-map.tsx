"use client";

import * as React from "react";
import { MapPin, Navigation } from "lucide-react";
import type { GeoPoint } from "@/types/geo";

interface InteractiveMapProps {
  waypoints?: GeoPoint[];
  regionName?: string;
  className?: string;
}

export function InteractiveMap({
  waypoints = [],
  regionName = "Himalayas",
  className,
}: InteractiveMapProps) {
  return (
    <div
      className={`relative flex min-h-[350px] w-full flex-col items-center justify-between overflow-hidden rounded-2xl border border-stone-200 bg-stone-900 p-6 text-white ${className}`}
    >
      {/* Mountain Map Graphic Backdrop */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative z-10 flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            PostGIS Geospatial Coordinates: {regionName}
          </span>
        </div>
        <span className="rounded-full bg-stone-800 px-2.5 py-1 text-[10px] font-semibold text-stone-300">
          Topo 1:50,000 Map
        </span>
      </div>

      {/* Waypoints Visual Pin Grid */}
      <div className="relative z-10 my-8 grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {waypoints.map((wp, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border border-stone-800 bg-stone-950/70 p-3 backdrop-blur-md"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-white">{wp.name || `Waypoint ${i + 1}`}</p>
              <p className="text-[10px] text-stone-400">
                {wp.latitude.toFixed(3)}°N, {wp.longitude.toFixed(3)}°E
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full text-right text-[10px] text-stone-500">
        GPS WGS84 • PostGIS Route Geometry Layer
      </div>
    </div>
  );
}
