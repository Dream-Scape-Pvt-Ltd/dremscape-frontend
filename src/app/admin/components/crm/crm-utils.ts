import type {InquiryNote, InquiryStatus, LostReason} from '@/types/inquiry';

export const statuses: InquiryStatus[] = ['NEW','IN_CONTACT','BOOKED','TRAVELING','COMPLETED','CLOSED'];
/** Which departure a lead is booked onto, and for how many people. */
export type BookingChoice = {departureId: string; travelersCount: number};
/** Statuses in which a lead's travellers occupy seats on its departure. */
export function holdsSeats(value: InquiryStatus) {
  return value === 'BOOKED' || value === 'TRAVELING' || value === 'COMPLETED';
}
export const lostReasonOptions: {value: LostReason; label: string}[] = [
  {value: 'PRICE', label: 'Price Too High'},
  {value: 'DATES', label: "Dates Didn't Work"},
  {value: 'COMPETITOR', label: 'Booked With Competitor'},
  {value: 'NO_RESPONSE', label: 'Went Unresponsive'},
  {value: 'NOT_SUITABLE', label: 'Trip Not Suitable'},
  {value: 'OTHER', label: 'Other'},
];

/** What a lead is about: its trek, or its kind when it has none (B2B partnership, general…). */
export function interestLabel(item: {trip_title?: string | null; inquiry_type?: string | null}) {
  if (item.trip_title) return item.trip_title;
  if (item.inquiry_type === 'PARTNER_DMC') return 'B2B partnership';
  if (item.inquiry_type === 'TAILOR_MADE') return 'Tailor-made trip';
  return 'General inquiry';
}

// Django nests the note author as a user object; older payloads sent a plain name.
export function authorName(author?: InquiryNote['author']) {
  return (typeof author === 'string' ? author : author?.full_name || author?.email) || 'Staff';
}
