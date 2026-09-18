/**
 * Review types matching backend apps.trips review system.
 */

export interface Review {
  id: string;
  trip_slug?: string;
  trip_title?: string;
  reviewer_name?: string;
  author_name?: string;
  reviewer_country?: string;
  author_country?: string;
  rating_overall?: number; // 1 to 5
  rating?: number; // 1 to 5
  rating_guide?: number;
  rating_itinerary?: number;
  rating_safety?: number;
  title: string;
  content: string;
  travel_date?: string;
  trek_date?: string;
  is_verified?: boolean;
  created_at: string;
}

export interface ReviewSubmissionPayload {
  trip?: string; // UUID of trip
  trip_slug?: string;
  booking_id?: string;
  reviewer_name?: string;
  author_name?: string;
  author_email?: string;
  reviewer_country?: string;
  author_country?: string;
  rating_overall?: number;
  rating?: number;
  title: string;
  content: string;
  travel_date?: string;
  trek_date?: string;
}
