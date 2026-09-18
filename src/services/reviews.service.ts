import {apiClient} from './api-client.ts';
import {API_ENDPOINTS} from '../constants/api-endpoints.ts';
import type {Review, ReviewSubmissionPayload} from '../types/review.ts';

export const reviewsService = {
  /**
   * Fetches published customer reviews for a trip from Django /api/v1/trips/<slug>/reviews/.
   */
  async getTripReviews(tripSlug: string): Promise<Review[]> {
    const data = await apiClient.get<Review[] | { results: Review[] }>(
      API_ENDPOINTS.BACKEND.TRIPS.REVIEWS(tripSlug)
    );

    if (Array.isArray(data)) {
      return data;
    }
    return data?.results || [];
  },

  /**
   * Submits a customer review to Django /api/v1/trips/<slug>/reviews/ for moderation.
   */
  async submitReview(payload: ReviewSubmissionPayload): Promise<{ message: string; review?: Review }> {
    const slug = payload.trip_slug || 'general';
    const reviewData = {
      reviewer_name: payload.reviewer_name || payload.author_name,
      reviewer_country: payload.reviewer_country || payload.author_country,
      rating_overall: payload.rating_overall || payload.rating || 5,
      title: payload.title,
      content: payload.content,
      travel_date: payload.travel_date || payload.trek_date,
      booking_id: payload.booking_id || undefined,
    };

    const data = await apiClient.post<Review>(
      API_ENDPOINTS.BACKEND.TRIPS.REVIEWS(slug),
      reviewData
    );

    return {
      message: 'Thank you! Your review has been submitted for moderation.',
      review: data,
    };
  },
};
