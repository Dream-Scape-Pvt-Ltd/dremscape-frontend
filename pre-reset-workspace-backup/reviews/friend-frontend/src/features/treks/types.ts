import type { ElevationPoint, GeoPoint } from "@/types/geo";

export type TrekDifficulty = "easy" | "moderate" | "demanding" | "strenuous" | "extreme";

export interface TrekItineraryDay {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  startPoint: string;
  endPoint: string;
  elevationMeters: number;
  walkingHours: number;
  accommodation: string;
  mealsProvided: ("breakfast" | "lunch" | "dinner")[];
  coordinates?: GeoPoint;
}

export interface TrekSummary {
  id: string;
  slug: string;
  title: string;
  region: { id: string; name: string; slug: string };
  destination: { id: string; name: string; slug: string };
  difficulty: TrekDifficulty;
  durationDays: number;
  maxAltitudeMeters: number;
  priceFromUSD: number;
  featuredImageUrl: string;
  summary: string;
  ratingAverage: number;
  reviewCount: number;
  bestSeasons?: ("spring" | "autumn" | "monsoon" | "winter")[];
}

export interface TrekDetail extends TrekSummary {
  metaDescription: string;
  heroImage: { url: string; alt: string; blurDataUrl?: string };
  galleryImages: { id: string; url: string; caption: string }[];
  overviewHtml: string;
  highlights: string[];
  permitTypesRequired: string[];
  itinerary: TrekItineraryDay[];
  elevationPoints: ElevationPoint[];
  inclusions: string[];
  exclusions: string[];
  packingChecklist: { category: string; items: string[] }[];
  updatedAt: string;
}

export interface TrekFilters {
  region?: string;
  destination?: string;
  difficulty?: TrekDifficulty;
  minDays?: number;
  maxDays?: number;
  maxAltitude?: number;
  search?: string;
  page?: number;
  ordering?: "price" | "-price" | "duration" | "-duration" | "-rating";
}
