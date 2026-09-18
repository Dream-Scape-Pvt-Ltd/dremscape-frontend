import Link from 'next/link';
import {getJourney,bookable} from '@/lib/journeys';
import BookingForm from '@/components/booking-form';
import JourneyShell from '@/components/journey-shell';
export const dynamic='force-dynamic';
export const metadata={title:'Your booking request | Dreamscape',robots:{index:false,follow:false}};
export default async function Page({searchParams}:{searchParams:Promise<{trek?:string;departure?:string}>}) {
  const query=await searchParams;
  if(query.trek&&query.departure)try{const {journey}=await getJourney(query.trek);const departure=journey.departures.find(d=>d.id===query.departure);if(departure&&bookable(departure))return <BookingForm journey={journey} departure={departure}/>;}catch{/* The page remains a selection prompt if the catalog cannot confirm this departure. */}
  return <JourneyShell><section className="utility-page container status"><p className="eyebrow">START WITH YOUR TRAIL</p><h1>Find your departure.</h1><p>Choose an available date on a live journey to begin a booking request.</p><Link href="/treks" className="button gold">Explore treks ↗</Link></section></JourneyShell>;
}

