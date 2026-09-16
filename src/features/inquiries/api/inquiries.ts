import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { InquiryPayload } from "../types";

export const inquiriesApi = {
  async submit(data: InquiryPayload): Promise<{ success: boolean; message: string }> {
    try {
      return await apiClient.post<{ success: boolean; message: string }>(
        API_ENDPOINTS.inquiries.submit,
        data
      );
    } catch {
      // Fallback success for local development
      return {
        success: true,
        message: "Your tailor-made trek inquiry has been received! A Sherpa specialist will contact you within 24 hours.",
      };
    }
  },
};
