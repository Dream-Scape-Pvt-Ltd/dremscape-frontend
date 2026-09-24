import Link from 'next/link';
import {notFound} from 'next/navigation';
import {getJourney} from '@/lib/journeys';
import RelatedTreks from '../components/related-treks';
import {BackendError} from '@/lib/backend';
import JourneyDetail from '../components/journey-detail';
import JourneyShell from '@/components/journey-shell';
import {cache,Suspense} from 'react';
const load=cache(getJourney);
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}) {
  try {const {journey}=await load((await params).slug);return {title:`${journey.title} | Dreamscape Treks`,description:journey.overview.slice(0,155)};}catch{return {title:'Journey | Dreamscape Treks'};}
}
export default async function Page({params}:{params:Promise<{slug:string}>}) {
  try {const data=await load((await params).slug);return <JourneyDetail {...data} related={<Suspense key="related-treks" fallback={null}><RelatedTreks current={data.journey}/></Suspense>}/>;} catch(error){
    if(error instanceof BackendError&&error.status===404) notFound();
    return <JourneyShell><div className="container utility-page status" role="alert"><h1>This trail will be back soon.</h1><p>We couldn’t load the itinerary. Please try again shortly.</p><Link href="/treks" className="button green">Back to journeys</Link></div></JourneyShell>;
  }
}

