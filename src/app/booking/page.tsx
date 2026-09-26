import Link from 'next/link';
import {redirect} from 'next/navigation';
import JourneyShell from '@/components/journey-shell';
import {ROUTES} from '@/constants/routes';
import {isUuid} from '@/lib/links';
export const dynamic='force-dynamic';
export const metadata={title:'Your booking request | Dreamscape',robots:{index:false,follow:false}};
/** Booking requests now happen in a popup on the trek page; old links land there with that date open. */
export default async function Page({searchParams}:{searchParams:Promise<{trek?:string;departure?:string}>}) {
  const query=await searchParams;
  // ?trek= may be the trek's id or, in older links, its slug; ROUTES.BOOKING handles both.
  if(query.trek&&/^[\w-]+$/.test(query.trek)&&query.departure&&isUuid(query.departure))redirect(ROUTES.BOOKING(query.trek,query.departure));
  return <JourneyShell><section className="utility-page container status"><p className="eyebrow">START WITH YOUR TRAIL</p><h1>Find your departure.</h1><p>Open a trek and choose an available date to send a booking request. Sample journeys cannot be booked.</p><Link href="/treks" className="button gold">Explore treks ↗</Link></section></JourneyShell>;
}
