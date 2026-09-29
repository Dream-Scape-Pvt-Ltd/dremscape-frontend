export const TREK_DIFFICULTY_GRADES = {
  easy: {
    label: "Easy / Moderate",
    description: "Gentle elevation gains, suitable for active walkers and families.",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  moderate: {
    label: "Moderate",
    description: "Daily hikes of 5-6 hours up to 4,000m with regular ascents and descents.",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  demanding: {
    label: "Demanding",
    description: "High altitude passes up to 5,000m. Requires good physical endurance.",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  strenuous: {
    label: "Strenuous",
    description: "High mountain passes (5,000m - 5,600m), glacier crossings, remote terrain.",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
  },
  extreme: {
    label: "Extreme / Alpine",
    description: "Technical mountaineering, crampon/ice axe use, extreme altitudes (6,000m+).",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
} as const;

export const TREK_SEASONS = [
  { value: "spring", label: "Spring (Mar - May)", description: "Rhododendron blossoms & clear mornings" },
  { value: "autumn", label: "Autumn (Sep - Nov)", description: "Crystal clear mountain views & festival season" },
  { value: "winter", label: "Winter (Dec - Feb)", description: "Crisp snowy landscapes, fewer crowds in lower circuits" },
  { value: "monsoon", label: "Summer / Rainshadow (Jun - Aug)", description: "Ideal for Upper Mustang, Dolpo, & Tibet" },
] as const;

export const ALTITUDE_BANDS = [
  { label: "Up to 3,500 m (Low Altitude)", max: 3500 },
  { label: "3,500 m - 4,500 m (High Altitude)", min: 3500, max: 4500 },
  { label: "4,500 m - 5,500 m (Very High Altitude)", min: 4500, max: 5500 },
  { label: "5,500 m+ (Extreme Altitude / Passes)", min: 5500 },
] as const;

export const PERMIT_TYPES = [
  "Sagarmatha National Park Permit",
  "Khumbu Pasang Lhamu Rural Municipality Permit",
  "Annapurna Conservation Area Project (ACAP)",
  "Trekkers' Information Management System (TIMS)",
  "Manaslu Restricted Area Permit (RAP)",
  "Upper Mustang Restricted Area Permit",
  "Tibet Autonomous Region (TAR) Travel Permit & Military Pass",
  "Bhutan Sustainable Development Fee (SDF) & Route Permit",
] as const;
