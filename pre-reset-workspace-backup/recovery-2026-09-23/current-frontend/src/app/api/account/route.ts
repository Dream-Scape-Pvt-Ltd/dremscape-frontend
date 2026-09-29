import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {backend,apiError,BackendError,noStore} from '@/lib/backend';
import {bookingCookiePrefix,publicReceipt} from '@/lib/booking-access';
import type {BookingReceipt} from '@/lib/booking';
export async function GET(request:Request){
 try{
  const jar=await cookies(),token=jar.get('dreamscape_session')?.value;
  const page=Number(new URL(request.url).searchParams.get('page')||1);
  if(!Number.isInteger(page)||page<1||page>10000)throw new BackendError('Invalid page.',400);
  if(token){
   const headers={Authorization:`Bearer ${token}`};
   const user=await backend<{first_name:string;role:string}>('users/me/',{headers});
   if(['ADMIN','SALES_AGENT'].includes(user.role)){
    const data=await backend<{results:BookingReceipt[];next:string|null;previous:string|null}>(`bookings/?page=${page}`,{headers});
    return NextResponse.json({name:user.first_name,bookings:data.results.map(publicReceipt),next:!!data.next,previous:!!data.previous},{headers:noStore});
   }
  }
  const saved=jar.getAll().filter(c=>c.name.startsWith(bookingCookiePrefix)&&/^[\w-]{1,100}$/.test(c.name.slice(bookingCookiePrefix.length))).slice(0,20);
  const bookings=await Promise.all(saved.map(async c=>{
   try{return publicReceipt(await backend<BookingReceipt>(`bookings/${c.name.slice(bookingCookiePrefix.length)}/`,{headers:{'X-Booking-Token':c.value}}));}
   catch(error){if(error instanceof BackendError&&[401,403,404].includes(error.status))return null;throw error;}
  }));
  return NextResponse.json({name:'',bookings:bookings.filter(Boolean),next:false,previous:false,guest:true},{headers:noStore});
 }catch(error){return apiError(error);}
}
