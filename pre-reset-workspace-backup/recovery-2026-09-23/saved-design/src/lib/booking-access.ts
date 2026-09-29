import type {BookingReceipt} from './booking';
export const bookingCookiePrefix='dreamscape_booking_';
export function bookingCookie(reference:string){
  if(!/^[\w-]{1,100}$/.test(reference))throw new Error('Invalid booking reference.');
  return bookingCookiePrefix+reference;
}
export function publicReceipt(data:BookingReceipt):BookingReceipt{
  const {booking_reference,trip_title,trip_start_date,num_travelers,currency,total_amount_usd,deposit_amount_usd,amount_paid_usd,status}=data;
  return {booking_reference,trip_title,trip_start_date,num_travelers,currency,total_amount_usd,deposit_amount_usd,amount_paid_usd,status};
}
