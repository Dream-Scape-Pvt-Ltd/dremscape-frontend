/**
 * Booking and Passenger types matching backend apps.bookings.
 */

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'WAITLISTED';

export type PaymentStatus =
  | 'UNPAID'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'REFUNDED';

export type PaymentType = 'DEPOSIT_20' | 'FULL_100';

export interface Passenger {
  id?: string;
  full_name: string;
  date_of_birth: string;
  nationality: string;
  passport_number: string;
  passport_expiry_date: string;
  insurance_provider: string;
  insurance_policy_number: string;
  insurance_emergency_phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  special_requirements?: string;
  dietary_requirements?: string;
}

export interface BookingRequestPayload {
  departure_id: string;
  trek_slug?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  payment_type: PaymentType;
  passengers: Passenger[];
  special_requests?: string;
}

export interface BookingReceipt {
  booking_reference: string;
  trip_title: string;
  trip_start_date: string;
  trip_end_date?: string;
  num_travelers: number;
  currency: string;
  total_amount_usd: string;
  deposit_amount_usd: string;
  amount_paid_usd: string;
  status: BookingStatus | string;
  payment_status?: PaymentStatus | string;
  created_at?: string;
}

export interface Booking extends BookingReceipt {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  passengers?: Passenger[];
}
