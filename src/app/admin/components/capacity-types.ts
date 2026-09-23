export type CapacityState = 'HEALTHY' | 'NEARLY_FULL' | 'FULL' | 'OVERSUBSCRIBED';
export type AvailabilityState = 'AVAILABLE' | 'FEW_SEATS_LEFT' | 'SOLD_OUT' | 'WAITLIST' | 'CANCELLED';
export type DepartureStatus = 'GUARANTEED' | 'LIMITED' | 'SOLD_OUT' | 'WAITLIST' | 'CANCELLED';

export const departureStatuses: DepartureStatus[] = [
  'GUARANTEED', 'LIMITED', 'SOLD_OUT', 'WAITLIST', 'CANCELLED'
];

/** A departure row as the admin capacity board and the trek editor see it. */
export type AdminDeparture = {
  id: string;
  trip_title?: string;
  trip_slug?: string;
  start_date: string;
  end_date: string;
  price_usd: string;
  max_seats: number;
  booked_seats: number;
  reserved_seats: number;
  available_seats: number;
  utilization_pct?: number;
  open_inquiry_count?: number;
  waitlisted_count?: number;
  capacity_state?: CapacityState;
  availability_state: AvailabilityState;
  status: DepartureStatus;
  status_locked: boolean;
  waitlist_enabled: boolean;
  few_seats_threshold: number;
  is_guaranteed: boolean;
};

export type Agent = {id: string; email: string; full_name: string; role: string};

export type WaitlistEntry = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  num_travelers: number;
  position: number;
  status: 'WAITING' | 'OFFERED' | 'CONVERTED' | 'EXPIRED' | 'CANCELLED';
  offered_at: string | null;
  offer_expires_at: string | null;
  created_at: string;
};

export const capacityStateLabel: Record<CapacityState, string> = {
  HEALTHY: 'Healthy',
  NEARLY_FULL: 'Nearly full',
  FULL: 'Full',
  OVERSUBSCRIBED: 'Oversubscribed'
};
