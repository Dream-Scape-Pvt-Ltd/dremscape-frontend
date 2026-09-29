import type { UnitSystem } from "@/types/common";

export function metersToFeet(meters: number): number {
  return Math.round(meters * 3.28084);
}

export function formatElevation(meters: number, unit: UnitSystem = "metric"): string {
  if (unit === "imperial") {
    return `${metersToFeet(meters).toLocaleString()} ft`;
  }
  return `${meters.toLocaleString()} m`;
}

export function formatDistance(kilometers: number, unit: UnitSystem = "metric"): string {
  if (unit === "imperial") {
    const miles = (kilometers * 0.621371).toFixed(1);
    return `${miles} mi`;
  }
  return `${kilometers.toFixed(1)} km`;
}
