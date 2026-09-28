import {redirect} from 'next/navigation';
import {ROUTES} from '@/constants/routes';
import {isUuid} from '@/lib/links';
export const dynamic='force-dynamic';
export const metadata={title:'Your booking request | Dreamscape',robots:{index:false,follow:false}};
/** Booking requests now happen in a popup on the trek page; old links land there with that date open. */
export default async function Page({searchParams}:{searchParams:Promise<{trek?:string;departure?:string}>}) {
  const query=await searchParams;
  // ?trek= may be the trek's id or, in older links, its slug; ROUTES.BOOKING handles both.
  if(query.trek&&/^[\w-]+$/.test(query.trek)&&query.departure&&isUuid(query.departure))redirect(ROUTES.BOOKING(query.trek,query.departure));
  if(query.trek&&/^[\w-]+$/.test(query.trek))redirect(isUuid(query.trek)?`/treks?id=${query.trek}`:`/treks/${encodeURIComponent(query.trek)}`);
  redirect('/treks');
}
