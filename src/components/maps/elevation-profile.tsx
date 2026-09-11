"use client";

import * as React from "react";
import type { ElevationPoint } from "@/types/geo";
import { formatElevation } from "@/lib/formatters/geo";
import { usePreferencesStore } from "@/features/preferences/store";

interface ElevationProfileProps {
  points: ElevationPoint[];
  height?: number;
  className?: string;
}

export function ElevationProfile({
  points,
  height = 200,
  className,
}: ElevationProfileProps) {
  const { unitSystem } = usePreferencesStore();
  const [activePoint, setActivePoint] = React.useState<ElevationPoint | null>(null);

  if (!points || points.length === 0) return null;

  const maxElevation = Math.max(...points.map((p) => p.elevationMeters), 5500);
  const minElevation = Math.min(...points.map((p) => p.elevationMeters), 1000);
  const maxDistance = Math.max(...points.map((p) => p.distanceKm));

  const padding = 40;
  const width = 800;
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;

  // Convert points to SVG coordinates
  const coords = points.map((p) => {
    const x = padding + (p.distanceKm / (maxDistance || 1)) * plotWidth;
    const y =
      height -
      padding -
      ((p.elevationMeters - minElevation) / (maxElevation - minElevation || 1)) *
        plotHeight;
    return { x, y, point: p };
  });

  const pathD = coords.reduce((acc, curr, idx) => {
    return `${acc} ${idx === 0 ? "M" : "L"} ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
  }, "");

  const areaD = `${pathD} L ${coords[coords.length - 1]?.x.toFixed(1)} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-stone-200 bg-stone-900 p-4 text-white ${className}`}>
      <div className="flex items-center justify-between pb-2 border-b border-stone-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          Trek Elevation & Altitude Profile
        </h4>
        {activePoint && (
          <div className="text-xs font-semibold text-stone-300">
            {activePoint.waypointName ? `${activePoint.waypointName}: ` : ""}
            <span className="text-emerald-400 font-bold">
              {formatElevation(activePoint.elevationMeters, unitSystem)}
            </span>{" "}
            at {activePoint.distanceKm} km
          </div>
        )}
      </div>

      <div className="relative mt-2 w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[600px]"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="altitudeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Elevation Area Fill */}
          <path d={areaD} fill="url(#altitudeGradient)" />

          {/* Stroke Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Waypoint Dots */}
          {coords.map((c, i) => (
            <g
              key={i}
              className="cursor-pointer"
              onMouseEnter={() => setActivePoint(c.point)}
              onMouseLeave={() => setActivePoint(null)}
            >
              <circle
                cx={c.x}
                cy={c.y}
                r={c.point.isPass ? 6 : c.point.isCamp ? 4 : 3}
                className={
                  c.point.isPass
                    ? "fill-rose-500 stroke-2 stroke-white animate-pulse"
                    : c.point.isCamp
                    ? "fill-amber-400 stroke-2 stroke-stone-900"
                    : "fill-white stroke-stone-800"
                }
              />
              {c.point.waypointName && (
                <text
                  x={c.x}
                  y={c.y - 10}
                  textAnchor="middle"
                  className="text-[10px] fill-stone-300 font-semibold select-none"
                >
                  {c.point.waypointName}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-stone-500">
        <span>Min: {formatElevation(minElevation, unitSystem)}</span>
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" /> High Pass
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-400 inline-block" /> Night Camp
          </span>
        </div>
        <span>Max: {formatElevation(maxElevation, unitSystem)}</span>
      </div>
    </div>
  );
}
