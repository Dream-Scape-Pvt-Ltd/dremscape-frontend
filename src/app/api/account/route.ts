import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {backend,apiError,BackendError,noStore} from '@/lib/backend';
export async function GET(request:Request) {
  try {
    const token=(await cookies()).get('dreamscape_session')?.value;
    if(!token)throw new BackendError('Sign in to see your journeys.',401);
    const page=Number(new URL(request.url).searchParams.get('page')||1);
    if(!Number.isInteger(page)||page<1||page>10000)throw new BackendError('Invalid page.',400);
    const headers={Authorization:`Bearer ${token}`};
    const [user,bookings]=await Promise.all([backend<{first_name:string}>('users/me/',{headers}),backend<{results:unknown[];next:string|null;previous:string|null}>(`bookings/?page=${page}`,{headers})]);
    return NextResponse.json({name:user.first_name,bookings:bookings.results,next:Boolean(bookings.next),previous:Boolean(bookings.previous)},{headers:noStore});
  }catch(error){return apiError(error);}
}
