import StructuredData from '@/components/structured-data';
import {absolutePublicUrl} from '@/lib/structured-data';
import {asset} from '@/lib/assets';
import Link from 'next/link';
import {notFound,redirect} from 'next/navigation';
import {cache,Suspense} from 'react';
import type {Metadata} from 'next';
import {getJourney} from '@/lib/journeys';
import {BackendError} from '@/lib/backend';
import {trekHref} from '@/lib/links';
import JourneyDetail from '@/components/journey-detail';
import JourneyShell from '@/components/journey-shell';
import RelatedTreks from './components/related-treks';

/** One request per render: metadata and the page share the fetched trek. */
export const loadJourney=cache(getJourney);

export async function trekMetadata(id:string):Promise<Metadata>{
  try{const {journey,demo}=await loadJourney(id);return {title:`${journey.title} | Dreamscape Treks`,description:journey.overview.slice(0,155),alternates:{canonical:trekHref(journey.id)},robots:demo?{index:false,follow:true}:undefined};}
  catch{return {title:'Journey | Dreamscape Treks'};}
}

/** A trek's page, shown at /treks?id=<uuid>. */
export default async function TrekDetailPage({id}:{id:string}){
  let data;
  try{data=await loadJourney(id);}
  catch(error){
    if(error instanceof BackendError&&error.status===404)notFound();
    return <JourneyShell><div className="container utility-page status" role="alert"><h1>This trail will be back soon.</h1><p>We couldn’t load the itinerary. Please try again shortly.</p><Link href="/treks" className="button green">Back to journeys</Link></div></JourneyShell>;
  }
  const t=data.journey;
  if(!data.demo&&t.id!==id)redirect(trekHref(t.id));
  const schema={"@context":"https://schema.org","@type":"TouristTrip",name:t.title,description:t.overview,url:absolutePublicUrl(trekHref(t.id)),image:t.image?absolutePublicUrl(asset(t.image)):undefined,provider:{"@type":"TravelAgency",name:"Dreamscape Treks"},itinerary:{"@type":"ItemList",itemListElement:t.itinerary_days.map(day=>({"@type":"ListItem",position:day.day_number,name:day.title,item:{"@type":"Place",name:day.overnight_stay||day.title}}))}};
  return <>{!data.demo&&<StructuredData data={schema}/>}<JourneyDetail {...data} related={<Suspense key="related-treks" fallback={null}><RelatedTreks current={data.journey} preview={data.demo}/></Suspense>}/></>;
}
