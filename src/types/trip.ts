/**
 * Trip catalog and Departure types matching backend apps.trips.
 */
import type {QueryParams} from './api.ts';

export type TripDifficulty =
  | 'EASY'
  | 'NORMAL'
  | 'DIFFICULT'
  | 'EXTREME';

/** Mirrors the backend DepartureStatus enum exactly. */
export type DepartureStatus =
  | 'GUARANTEED'
  | 'LIMITED'
  | 'SOLD_OUT'
  | 'WAITLIST'
  | 'CANCELLED';

/** Derived, client-facing availability indicator. */
export type AvailabilityState =
  | 'AVAILABLE'
  | 'FEW_SEATS_LEFT'
  | 'SOLD_OUT'
  | 'WAITLIST'
  | 'CANCELLED';

export interface ItineraryDay {
  id?: string;
  day_number: number;
  title: string;
  description: string;
  elevation_meters?: number | null;
  accommodation?: string;
  meals?: string;
  distance_km?: number | null;
  walking_hours?: number | null;
  overnight_stay?: string;
  is_acclimatization_day?: boolean;
}

export interface Departure {
  id: string;
  trip_id?: string;
  trip_title?: string;
  start_date: string;
  end_date: string;
  price_usd: string | number;
  /** Derived on the server from max_seats - reserved_seats - booked_seats. */
  available_seats: number;
  max_seats?: number;
  total_seats?: number;
  availability_state?: AvailabilityState;
  status: DepartureStatus | string;
  is_guaranteed?: boolean;
  waitlist_enabled?: boolean;
}

export interface TripInclusions {
  included: string[];
  excluded: string[];
}

export interface TripHighlight {
  id: string;
  title: string;
  description?: string;
  icon?: string;
}

export interface TripSummary {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  overview?: string;
  destination_name: string;
  destination_slug: string;
  category_name?: string;
  category_slug?: string;
  duration_days: number;
  difficulty?: TripDifficulty | string;
  difficulty_grade?: string;
  max_altitude_meters?: number;
  altitude_max_meters?: number;
  base_price_usd?: string | number;
  starting_price_usd?: string | number;
  hero_image_url?: string | null;
  image?: string;
  tags?: string;
  is_featured?: boolean;
  is_highlighted?: boolean;
  rating_avg?: number | null;
  reviews_count?: number;
}

export interface TripDetail extends TripSummary {
  description?: string;
  route_map_url?: string | null;
  best_seasons?: string[];
  fitness_level?: string;
  packing_list?: string[];
  inclusions?: string[] | TripInclusions;
  exclusions?: string[];
  min_group_size?: number;
  max_group_size?: number;
  itinerary?: ItineraryDay[];
  itinerary_days?: ItineraryDay[];
  departures?: Departure[];
  highlights?: TripHighlight[];
}

export interface TripFilterParams extends QueryParams {
  destination?: string;
  category?: string;
  difficulty?: TripDifficulty;
  min_duration?: number;
  max_duration?: number;
  min_price?: number;
  max_price?: number;
  search?: string;
  ordering?: 'price_usd' | '-price_usd' | 'duration_days' | '-duration_days' | 'created_at' | '-created_at';
  page?: number;
  page_size?: number;
}
