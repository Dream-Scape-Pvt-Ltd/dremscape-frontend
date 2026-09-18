import {apiClient} from './api-client.ts';
import {API_ENDPOINTS} from '../constants/api-endpoints.ts';
import type {
  TripSummary,
  TripDetail,
  Departure,
  ItineraryDay,
  TripFilterParams,
} from '../types/trip.ts';
import type {PaginatedData} from '../types/api.ts';

export const tripsService = {
  /**
   * Fetches paginated list of trips from Django /api/v1/trips/ with optional filters.
   */
  async getTrips(params?: TripFilterParams): Promise<PaginatedData<TripSummary>> {
    return apiClient.get<PaginatedData<TripSummary>>(API_ENDPOINTS.BACKEND.TRIPS.LIST, {
      params,
    });
  },

  /**
   * Fetches highlighted/featured trips from Django /api/v1/trips/highlights/.
   */
  async getTripHighlights(): Promise<TripSummary[]> {
    return apiClient.get<TripSummary[]>(API_ENDPOINTS.BACKEND.TRIPS.HIGHLIGHTS);
  },

  /**
   * Fetches full trip detail from Django /api/v1/trips/<slug>/.
   */
  async getTripBySlug(slug: string): Promise<TripDetail> {
    return apiClient.get<TripDetail>(API_ENDPOINTS.BACKEND.TRIPS.DETAIL(slug));
  },

  /**
   * Fetches live departure dates from Django /api/v1/trips/<slug>/departures/.
   */
  async getTripDepartures(slug: string): Promise<Departure[]> {
    return apiClient.get<Departure[]>(API_ENDPOINTS.BACKEND.TRIPS.DEPARTURES(slug));
  },

  /**
   * Fetches day-by-day itinerary from Django /api/v1/trips/<slug>/itinerary/.
   */
  async getTripItinerary(slug: string): Promise<ItineraryDay[]> {
    return apiClient.get<ItineraryDay[]>(API_ENDPOINTS.BACKEND.TRIPS.ITINERARY(slug));
  },
};
