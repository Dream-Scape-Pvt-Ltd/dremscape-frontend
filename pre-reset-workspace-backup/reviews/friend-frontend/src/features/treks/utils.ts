import { TREK_DIFFICULTY_GRADES } from "@/config/constants";
import type { TrekDifficulty } from "./types";

export function getDifficultyBadgeConfig(difficulty: TrekDifficulty) {
  return (
    TREK_DIFFICULTY_GRADES[difficulty] || {
      label: "Moderate",
      badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
    }
  );
}

export function formatDuration(days: number): string {
  return `${days} Days / ${days - 1} Nights`;
}
