import {bookingCookie} from '@/lib/booking-access';
import {NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {backend,apiError,BackendError,readInput,requiredText,emailInput,noStore} from '@/lib/backend';
import {getJourney,bookable} from '@/lib/journeys';
import {passengerFields,type BookingReceipt} from '@/lib/booking';
export async function POST(request:Request) {
  try {
    const input=await readInput(request);
    const {journey}=await getJourney(requiredText(input,'trek_slug'));
    const departure=journey.departures.find(d=>d.id===input.departure_id);
    if(!departure||!bookable(departure))throw new BackendError('This departure is no longer available. Please choose another date.',409);
    if(!Array.isArray(input.passengers)||!input.passengers.length||input.passengers.length>Math.min(departure.available_seats,journey.max_group_size))throw new BackendError('Please check the number of travellers and available seats.',400);
    const passengers=input.passengers.map(raw=>{
      if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new BackendError('Please check traveller details.',400);
      const item=raw as Record<string,unknown>,clean:Record<string,string>={};
      for(const [key] of passengerFields)clean[key]=requiredText(item,key,key.includes('phone')?50:key==='full_name'||key==='emergency_contact_name'?255:100);
      const birth=new Date(clean.date_of_birth),expiry=new Date(clean.passport_expiry_date);
      const minimum=new Date(departure.start_date+'T00:00:00Z');minimum.setUTCDate(minimum.getUTCDate()+180);
      if(!/^\d{4}-\d{2}-\d{2}$/.test(clean.date_of_birth)||Number.isNaN(birth.valueOf())||birth>new Date())throw new BackendError('Please check each traveller’s date of birth.',400);
      if(!/^\d{4}-\d{2}-\d{2}$/.test(clean.passport_expiry_date)||Number.isNaN(expiry.valueOf())||expiry<minimum)throw new BackendError('Each passport must remain valid for at least 180 days after departure.',400);
      return clean;
    });
    if(!['DEPOSIT_20','FULL_100'].includes(String(input.payment_type)))throw new BackendError('Choose a payment plan.',400);
    const payload={departure_id:departure.id,customer_name:requiredText(input,'customer_name'),customer_email:emailInput(input,'customer_email'),customer_phone:input.customer_phone?requiredText(input,'customer_phone',50):'',payment_type:input.payment_type,passengers};
    const token=(await cookies()).get('dreamscape_session')?.value;
    const data=await backend<BookingReceipt & {access_token?:string}>('bookings/',{method:'POST',headers:token?{Authorization:`Bearer ${token}`}:{},body:JSON.stringify(payload)});
    if(!data.booking_reference||!data.status||!Number.isFinite(Number(data.total_amount_usd)))throw new BackendError('Your booking result could not be confirmed. Please contact the team before submitting again.');
    // Return a receipt only; passport and insurance details stay off the confirmation page.
    const {booking_reference,trip_title,trip_start_date,num_travelers,currency,total_amount_usd,deposit_amount_usd,amount_paid_usd,status}=data;
    const response=NextResponse.json({success:true,receipt:{booking_reference,trip_title,trip_start_date,num_travelers,currency,total_amount_usd,deposit_amount_usd,amount_paid_usd,status}},{status:201,headers:noStore});
    if(data.access_token)response.cookies.set(bookingCookie(data.booking_reference),data.access_token,{httpOnly:true,sameSite:"lax",secure:new URL(request.url).protocol==="https:"||request.headers.get("x-forwarded-proto")==="https",path:"/",maxAge:60*60*24*30});
    return response;
  }catch(error){return apiError(error);}
}
