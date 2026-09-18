import {apiClient} from './api-client.ts';
import {API_ENDPOINTS} from '../constants/api-endpoints.ts';
import type {QueryParams} from '../types/api.ts';

export const adminService = {
  /**
   * Fetches master inquiry lead pipeline for staff from Django /api/v1/inquiries/.
   */
  async getInquiries(params?: QueryParams) {
    return apiClient.get(API_ENDPOINTS.BACKEND.INQUIRIES.LIST_CREATE, {params});
  },

  /**
   * Updates inquiry status or assigned sales agent from Django /api/v1/inquiries/<reference>/.
   */
  async updateInquiryStatus(reference: string, status: string, assignedAgentId?: string) {
    return apiClient.patch(API_ENDPOINTS.BACKEND.INQUIRIES.DETAIL(reference), {
      status,
      assigned_agent: assignedAgentId || undefined,
    });
  },

  /**
   * Appends internal staff consultation note to inquiry thread via Django /api/v1/inquiries/<reference>/notes/.
   */
  async addInquiryNote(reference: string, noteText: string) {
    return apiClient.post(API_ENDPOINTS.BACKEND.INQUIRIES.NOTES(reference), {
      note_text: noteText,
    });
  },

  /**
   * Fetches master administrative bookings list from Django /api/v1/bookings/.
   */
  async getBookings(params?: QueryParams) {
    return apiClient.get(API_ENDPOINTS.BACKEND.BOOKINGS.LIST_CREATE, {params});
  },

  /**
   * Fetches administrative user accounts list from Django /api/v1/users/.
   */
  async getUsers(params?: QueryParams) {
    return apiClient.get(API_ENDPOINTS.BACKEND.USERS.LIST, {params});
  },
};
