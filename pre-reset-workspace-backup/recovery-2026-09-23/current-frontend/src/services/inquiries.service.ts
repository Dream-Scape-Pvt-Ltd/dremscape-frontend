import {apiClient} from './api-client.ts';
import {API_ENDPOINTS} from '../constants/api-endpoints.ts';
import type {InquiryPayload, InquiryResponse} from '../types/inquiry.ts';
import type {QueryParams} from '../types/api.ts';

export const inquiriesService = {
  /**
   * Submits a customer inquiry to Django /api/v1/inquiries/.
   */
  async submitInquiry(payload: InquiryPayload): Promise<InquiryResponse> {
    const res = await apiClient.post<{
      id: string;
      inquiry_number: string;
      reference?: string;
      message?: string;
    }>(API_ENDPOINTS.BACKEND.INQUIRIES.LIST_CREATE, {
      inquiry_type: payload.inquiry_type || (payload.trip ? 'JOURNEY' : 'GENERAL'),
      full_name: payload.full_name,
      email: payload.email,
      phone: payload.phone || undefined,
      message: payload.message,
      trip: payload.trip || undefined,
    }, {skipAuth: true});

    const ref = res?.inquiry_number || res?.reference || res?.id;
    return {
      reference: ref,
      message: res?.message || 'Your inquiry has been submitted successfully.',
    };
  },

  /**
   * Fetches list of inquiries for staff/admin from Django /api/v1/inquiries/.
   */
  async getInquiries(params?: QueryParams) {
    return apiClient.get(API_ENDPOINTS.BACKEND.INQUIRIES.LIST_CREATE, {params});
  },

  /**
   * Fetches inquiry detail by inquiry_number from Django /api/v1/inquiries/<reference>/.
   */
  async getInquiryDetail(inquiryNumber: string) {
    return apiClient.get(API_ENDPOINTS.BACKEND.INQUIRIES.DETAIL(inquiryNumber));
  },
};
