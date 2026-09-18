import {apiClient} from './api-client.ts';
import {API_ENDPOINTS} from '../constants/api-endpoints.ts';
import type {Destination, ActivityCategory} from '../types/destination.ts';

export const destinationsService = {
  /**
   * Fetches active destinations from Django /api/v1/destinations/.
   */
  async getDestinations(): Promise<Destination[]> {
    return apiClient.get<Destination[]>(API_ENDPOINTS.BACKEND.DESTINATIONS.LIST);
  },

  /**
   * Fetches destination details by slug from Django /api/v1/destinations/<slug>/.
   */
  async getDestinationBySlug(slug: string): Promise<Destination> {
    return apiClient.get<Destination>(API_ENDPOINTS.BACKEND.DESTINATIONS.DETAIL(slug));
  },

  /**
   * Fetches activity categories from Django /api/v1/destinations/activity-categories/.
   */
  async getActivityCategories(): Promise<ActivityCategory[]> {
    return apiClient.get<ActivityCategory[]>(API_ENDPOINTS.BACKEND.DESTINATIONS.CATEGORIES);
  },
};
