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
  | 'BOOKED'
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

export type LostReason =
  | 'PRICE'
  | 'DATES'
  | 'COMPETITOR'
  | 'NO_RESPONSE'
  | 'NOT_SUITABLE'
  | 'OTHER';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Inquiry extends InquiryPayload {
  id: string;
  inquiry_number: string;
  reference?: string;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
  assigned_agent?: string | null;
  /** Display name of the owning agent, sent by the list and detail serializers. */
  assigned_agent_name?: string | null;
  assigned_agent_id?: string | null;
  /** Title of the tour this lead is about. The API sends this, not `trip`. */
  trip_title?: string | null;
  trip_slug?: string | null;
  /** UUID of the departure batch, when the lead named one. */
  departure?: string | null;
  /** Human-readable batch dates, e.g. "12 Mar 2026 – 28 Mar 2026". */
  departure_label?: string | null;
  whatsapp_number?: string | null;
  estimated_budget?: string | number | null;
  notes?: InquiryNote[];
  lost_reason?: LostReason | '';
  tags?: Tag[];
  sla_breached?: boolean;
  first_response_at?: string | null;
  converted_booking_reference?: string | null;
  converted_at?: string | null;
  /** People on the booked departure, fixed when the lead moves to BOOKED. */
  travelers_count?: number | null;
  /** Departure price x travellers, set once the trip completes. */
  revenue_usd?: string | null;
}

export interface InquiryNote {
  id: string;
  author?: string | {id?: string; email?: string; full_name?: string; role?: string} | null;
  note_text: string;
  created_at: string;
}

export type ActivityChannel =
  | 'CALL'
  | 'EMAIL'
  | 'WHATSAPP'
  | 'NOTE'
  | 'STATUS_CHANGE'
  | 'SYSTEM';

export interface Activity {
  id: string;
  author?: {full_name?: string; email?: string} | null;
  channel: ActivityChannel;
  body: string;
  created_at: string;
}

export interface TimelineEntry {
  entry_type: 'activity' | 'note';
  created_at: string;
  data: Activity | InquiryNote;
}

export type TaskStatus = 'OPEN' | 'DONE' | 'CANCELLED';

export interface Task {
  id: string;
  inquiry_number?: string;
  inquiry_full_name?: string;
  assigned_agent?: {full_name?: string; email?: string};
  title: string;
  due_at: string;
  status: TaskStatus;
  completed_at?: string | null;
  created_at: string;
}

export interface PipelineSummary {
  by_status: Record<string, number>;
  by_type: Record<string, number>;
  by_agent: Array<{
    assigned_agent_id: string;
    assigned_agent__first_name?: string;
    assigned_agent__last_name?: string;
    assigned_agent__email: string;
    open_leads: number;
  }>;
  unassigned_open_leads: number;
  sla_breached_count: number;
}

export interface FunnelData {
  total_leads: number;
  converted: number;
  closed_lost: number;
  conversion_rate_percent: number;
  funnel_stages: Array<{status: InquiryStatus; label: string; count: number}>;
  lost_reasons: Record<string, number>;
  avg_days_to_close: number | null;
}

/** One active trek's slice of the CRM, from /crm/treks/. */
export interface TrekPipelineRow {
  id: string;
  slug: string;
  title: string;
  destination_name: string | null;
  by_status: Record<InquiryStatus, number>;
  total_leads: number;
  travelers_completed: number;
  revenue_usd: string;
}

export interface TrekPipeline {
  results: TrekPipelineRow[];
  total_revenue_usd: string;
}

export interface CustomerProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  whatsapp_number: string;
  lifetime_inquiries: number;
  lifetime_bookings: number;
  lifetime_value_usd: string;
  inquiries: Array<{
    id: string;
    inquiry_number: string;
    inquiry_type: InquiryType;
    status: InquiryStatus;
    trip_title?: string;
    created_at: string;
  }>;
  bookings: Array<{
    id: string;
    booking_reference: string;
    status: string;
    total_amount_usd: string;
    trip_start_date: string;
    created_at: string;
  }>;
  created_at: string;
}
