/**
 * Inquiry types matching backend apps.inquiries.
 */

export type InquiryType =
  | 'GENERAL'
  | 'JOURNEY'
  | 'TAILOR_MADE'
  | 'PARTNER_DMC'
  | 'EXISTING_TRAVELLER';

export type InquiryStatus =
  | 'NEW'
  | 'ASSIGNED'
  | 'IN_CONTACT'
  | 'TRAVELING'
  | 'COMPLETED'
  | 'CLOSED';

export interface InquiryPayload {
  inquiry_type?: InquiryType;
  full_name: string;
  email: string;
  phone?: string;
  message: string;
  trip?: string; // UUID or slug
  journey?: string;
  preferred_dates?: string;
  group_size?: number;
}

export interface InquiryResponse {
  reference: string;
  inquiry_number?: string;
  message?: string;
}

export interface Inquiry extends InquiryPayload {
  id: string;
  inquiry_number: string;
  reference?: string;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
  assigned_agent?: string | null;
  whatsapp_number?: string | null;
  estimated_budget?: string | number | null;
  notes?: InquiryNote[];
}

export interface InquiryNote {
  id: string;
  author?: string;
  note_text: string;
  created_at: string;
}
