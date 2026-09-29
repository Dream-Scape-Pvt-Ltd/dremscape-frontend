import {apiClient} from './api-client.ts';
import {API_ENDPOINTS} from '../constants/api-endpoints.ts';
import type {PaginatedData, QueryParams} from '../types/api.ts';

export interface TravelGuide {
  id: string;
  title: string;
  slug: string;
  destination_name?: string;
  summary: string;
  body_markdown?: string;
  hero_image_url?: string | null;
  reading_time_minutes?: number;
  published_at?: string;
}

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  display_order?: number;
}

export interface SearchResults {
  trips?: unknown[];
  destinations?: unknown[];
  guides?: unknown[];
}

export const contentService = {
  /**
   * Fetches published travel guides from Django /api/v1/content/guides/.
   */
  async getGuides(params?: QueryParams): Promise<PaginatedData<TravelGuide> | TravelGuide[]> {
    return apiClient.get<PaginatedData<TravelGuide> | TravelGuide[]>(
      API_ENDPOINTS.BACKEND.CONTENT.GUIDES,
      {params}
    );
  },

  /**
   * Fetches full travel guide by slug from Django /api/v1/content/guides/<slug>/.
   */
  async getGuideBySlug(slug: string): Promise<TravelGuide> {
    return apiClient.get<TravelGuide>(
      API_ENDPOINTS.BACKEND.CONTENT.GUIDE_DETAIL(slug)
    );
  },

  /**
   * Fetches frequently asked questions from Django /api/v1/faqs/.
   */
  async getFaqs(): Promise<FAQItem[]> {
    const data = await apiClient.get<FAQItem[] | { results: FAQItem[] }>(
      API_ENDPOINTS.BACKEND.FAQS.LIST
    );
    if (Array.isArray(data)) return data;
    return data?.results || [];
  },

  /**
   * Executes multi-resource global search across Django /api/v1/search/?q=<term>.
   */
  async search(query: string): Promise<SearchResults> {
    return apiClient.get<SearchResults>(
      API_ENDPOINTS.BACKEND.SEARCH.QUERY,
      {params: {q: query}}
    );
  },
};
