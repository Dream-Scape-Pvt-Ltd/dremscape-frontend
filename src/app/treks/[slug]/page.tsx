import Link from 'next/link';
import {notFound,permanentRedirect} from 'next/navigation';
import {getJourney} from '@/lib/journeys';
import {BackendError} from '@/lib/backend';
import {isUuid,trekHref} from '@/lib/links';
import JourneyShell from '@/components/journey-shell';

/** Old /treks/<slug> links: find the trek and move permanently to /treks?id=<uuid>, keeping a chosen departure. */
export default async function Page({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{departure?:string|string[]}>}){
  const [{slug},{departure}]=await Promise.all([params,searchParams]);
  let id:string;
  try{id=(await getJourney(slug)).journey.id;}
  catch(error){
    if(error instanceof BackendError&&error.status===404)notFound();
    return <JourneyShell><div className="container utility-page status" role="alert"><h1>This trail will be back soon.</h1><p>We couldn’t load the itinerary. Please try again shortly.</p><Link href="/treks" className="button green">Back to journeys</Link></div></JourneyShell>;
  }
  // Called outside the try: permanentRedirect works by throwing.
  permanentRedirect(trekHref(id,{departure:isUuid(departure)?departure:undefined}));
}
