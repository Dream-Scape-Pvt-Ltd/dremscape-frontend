import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {backend,apiError,BackendError,noStore} from '@/lib/backend';
import {bookingCookie,publicReceipt} from '@/lib/booking-access';
import type {BookingReceipt} from '@/lib/booking';
export async function GET(_:Request,{params}:{params:Promise<{reference:string}>}){
 try{
  const {reference}=await params;
  if(!/^[\w-]{1,100}$/.test(reference))throw new BackendError('Invalid booking reference.',400);
  const jar=await cookies(),session=jar.get('dreamscape_session')?.value,guest=jar.get(bookingCookie(reference))?.value;
  if(!session&&!guest)throw new BackendError('Open this booking in the browser where you booked, or contact the team with your reference for secure access.',401);
  const headers:Record<string,string>=guest?{'X-Booking-Token':guest}:{Authorization:`Bearer ${session}`};
  const data=await backend<BookingReceipt>(`bookings/${reference}/`,{headers});
  if(data.booking_reference!==reference)throw new BackendError('The booking response was incomplete.');
  return NextResponse.json({receipt:publicReceipt(data)},{headers:noStore});
 }catch(e){return apiError(e);}
}
