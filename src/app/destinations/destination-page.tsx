import Link from 'next/link';
import {notFound} from 'next/navigation';
import {listDestinationContent,type Region} from '@/lib/destination-content';
import {listJourneys} from '@/lib/journeys';
import {normalize} from '@/lib/search';
import {destinationHref} from '@/lib/links';
import type {Metadata} from 'next';
import JourneyShell from '@/components/journey-shell';
import DestinationJourneys from '@/components/destination-journeys';
import {PageHero} from '@/components/editorial';
import DestinationGallery from '@/components/destination-gallery';
import type {Crumb} from '@/components/breadcrumbs';

/** A country-level destination ("Bhutan") also gathers the journeys of its regions. */
const isCountry=(r:Region)=>!!r.country&&normalize(r.slug)===normalize(r.country);

export async function destinationMetadata(id:string):Promise<Metadata>{
 const region=(await listDestinationContent()).find(r=>r.id===id);
 return {title:region?`${region.name} treks & expeditions | Dreamscape`:'Destination | Dreamscape',description:region?.description||undefined,alternates:region?{canonical:destinationHref(region.id,region.slug)}:undefined};
}
/** A destination's page, shown at /destinations?id=<uuid>. */
export default async function DestinationPage({id,providedDestinations}:{id:string;providedDestinations?:Region[]}){
 const destinations=providedDestinations||await listDestinationContent();const r=destinations.find(r=>r.id===id);if(!r)notFound();
 let catalog:Awaited<ReturnType<typeof listJourneys>>|null=null;try{catalog=await listJourneys();}catch{}
 const covered=new Set(isCountry(r)?destinations.filter(d=>d.country===r.country).map(d=>d.slug):[r.slug]);
 const trips=catalog?.trips.filter(t=>covered.has(t.destination_slug))||[];
 const related=destinations.filter(x=>x.slug!==r.slug&&x.country===r.country&&(!isCountry(r)||!isCountry(x)));
 // A region links up to its country's page when there is one (Nepal has its own collection page).
 const country=isCountry(r)?undefined:destinations.find(d=>d.slug!==r.slug&&isCountry(d)&&d.country===r.country);
 const crumbs:Crumb[]=[{label:'Destinations',href:'/destinations'},...(country?[{label:country.name,href:destinationHref(country.id,country.slug)}]:[]),{label:r.name}];
 // Only facts the team has written are shown.
 const facts=([['Elevation',r.altitudeMeters!=null?`${r.altitudeMeters.toLocaleString()} m`:''],['Trail character',r.style],['The pace',r.pace],['A place along the way',r.base],['On the horizon',r.highlights]] as const).filter(([,value])=>value);
 const gallery=r.galleryImages||[];
 return <JourneyShell page="destinations"><PageHero crumbs={crumbs} eyebrow={(r.country||'Destination').replaceAll('_',' ')} title={r.name} accent={r.title||undefined} description={r.description||undefined} image={r.image}/><div className="container">
  <section className="section destination-journeys-section" id="journeys" aria-label={`Treks and expeditions in ${r.name}`}><div className="section-heading"><div><h2>Treks and expeditions in {r.short}</h2></div><Link href="/treks" className="text-link">Explore all journeys</Link></div>
   {!catalog?<div className="status" role="alert"><p>The journey collection is temporarily unavailable. Refresh the page in a moment, or ask the team directly.</p><Link href="/contact" className="button green">Ask the team</Link></div>:<DestinationJourneys trips={trips} place={r.short} preview={catalog.demo}/>}
  </section>
  {facts.length>0&&<section className="section region-introduction"><h2>About {r.short}</h2><dl className="region-fact-sheet">{facts.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>}
  {gallery.length>0&&<section className="section region-photos"><h2>Photos from {r.short}</h2><DestinationGallery name={r.name} images={[r.image,...gallery]}/></section>}
  {related.length>0&&<section className="section other-regions"><h2>{isCountry(r)?`Places to visit in ${r.name}`:`More places in ${r.country?.replaceAll('_',' ').toLowerCase()}`}</h2><div>{related.map(x=><Link key={x.slug} href={destinationHref(x.id,x.slug)}><span>{x.name}</span><span className="ui-arrow" aria-hidden="true" /></Link>)}</div></section>}
 </div></JourneyShell>;
}
