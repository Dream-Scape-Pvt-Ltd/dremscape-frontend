import {apiClient} from './api-client.ts';
import {API_ENDPOINTS} from '../constants/api-endpoints.ts';
import type {BookingReceipt, BookingRequestPayload} from '../types/booking.ts';
import type {PaginatedData} from '../types/api.ts';

export const bookingsService = {
  /**
   * Submits a new booking checkout with atomic seat locking to Django /api/v1/bookings/.
   */
  async createBooking(payload: BookingRequestPayload): Promise<{ receipt: BookingReceipt }> {
    const data = await apiClient.post<BookingReceipt & { booking_reference: string }>(
      API_ENDPOINTS.BACKEND.BOOKINGS.LIST_CREATE,
      payload
    );

    return {
      receipt: data,
    };
  },

  /**
   * Retrieves authenticated user's booking history from Django /api/v1/bookings/.
   */
  async getUserBookings(page = 1): Promise<{
    name?: string;
    bookings: BookingReceipt[];
    next: boolean;
    previous: boolean;
  }> {
    const data = await apiClient.get<PaginatedData<BookingReceipt> | BookingReceipt[]>(
      API_ENDPOINTS.BACKEND.BOOKINGS.LIST_CREATE,
      {
        params: {page},
      }
    );

    if (Array.isArray(data)) {
      return {
        bookings: data,
        next: false,
        previous: false,
      };
    }

    return {
      bookings: data.results || [],
      next: Boolean(data.next),
      previous: Boolean(data.previous),
    };
  },

  /**
   * Retrieves verified booking receipt details by booking reference.
   */
  async getBookingByReference(reference: string): Promise<BookingReceipt> {
    return apiClient.get<BookingReceipt>(
      API_ENDPOINTS.BACKEND.BOOKINGS.DETAIL(reference)
    );
  },

  /**
   * Requests cancellation of a booking.
   */
  async cancelBooking(reference: string, reason?: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      API_ENDPOINTS.BACKEND.BOOKINGS.CANCEL(reference),
      {cancellation_reason: reason}
    );
  },
};
