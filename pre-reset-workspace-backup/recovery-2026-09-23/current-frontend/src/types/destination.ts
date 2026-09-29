/**
 * Destination and Activity types matching backend apps.destinations.
 */

export interface Destination {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  hero_image_url?: string | null;
  best_season?: string;
  permit_requirements?: string;
  trip_count?: number;
  is_active?: boolean;
}

export interface ActivityCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  hero_image_url?: string | null;
  is_active?: boolean;
}

export interface DestinationSummary {
  id: string;
  name: string;
  slug: string;
  trip_count: number;
  hero_image_url?: string | null;
}
