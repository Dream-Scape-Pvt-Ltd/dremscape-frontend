import Link from 'next/link';
import {notFound} from 'next/navigation';
import {regions} from '@/lib/destinations';
import {listDestinationContent} from '@/lib/destination-content';
import {listJourneys} from '@/lib/journeys';
import JourneyShell from '@/components/journey-shell';
import JourneyCard from '@/components/journey-card';
import {PageHero,PlanInvitation} from '@/components/editorial';
import {asset} from '@/lib/assets';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const region=regions.find(r=>r.slug===slug);return {title:region?`${region.name} | Dreamscape destinations`:'Destination | Dreamscape'};}
export default async function Page({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const regions=await listDestinationContent();const r=regions.find(r=>r.slug===slug);if(!r)notFound();
 let catalog:Awaited<ReturnType<typeof listJourneys>>|null=null;try{catalog=await listJourneys();}catch{}
 const trips=catalog?.trips.filter(t=>t.destination_slug.includes(r.slug))||[];
  return <JourneyShell page="destinations"><PageHero eyebrow={`NEPAL / ${r.tag}`} title={r.name} accent={r.title} description={r.description} image={r.image}/><div className="container"><nav className="light-breadcrumb" aria-label="Breadcrumb"><Link href="/destinations">All destinations</Link><span>/</span><span>{r.short}</span></nav><section className="editorial-split section region-introduction"><div><p className="eyebrow">GET TO KNOW THE REGION</p><h2>A landscape.<br/><em>A different rhythm.</em></h2><p>{r.description}</p><Link className="button green" href={`/treks?region=${r.slug}`}>Find a journey here ↗</Link></div><dl className="region-fact-sheet">{[['Trail character',r.style],['The pace',r.pace],['A place along the way',r.base],['On the horizon',r.highlights]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section><section className="region-feature"><img src={asset(r.image)} alt={`A view of ${r.name}`} loading="lazy"/><div><p className="eyebrow">TAKE YOUR TIME</p><h2>{r.title}</h2><p>A region is a starting point, not a fixed itinerary. Tell us how much time you have and what draws you here. We’ll discuss the route, the pace and the details together.</p><Link className="text-link" href="/contact">Plan something personal ↗</Link></div></section><section className="section"><div className="section-heading"><div><p className="eyebrow">FOLLOW THE TRAIL</p><h2>{r.short} journeys.</h2></div><Link href="/treks" className="text-link">Explore all treks ↗</Link></div>{!catalog?<div className="status" role="alert"><p>The journey collection is temporarily unavailable.</p><Link href="/contact" className="button green">Ask the team</Link></div>:trips.length?<div className="trip-grid catalogue-grid">{trips.map(t=><JourneyCard key={t.slug} trip={t}/>)}</div>:<div className="quiet-panel"><h3>Your journey can begin with a conversation.</h3><p>No itineraries are listed for this region yet. Tell us what you have in mind.</p><Link href="/contact" className="button gold">Plan a private journey</Link></div>}</section><section className="section other-regions"><p className="eyebrow">ANOTHER PERSPECTIVE</p><h2>Keep exploring.</h2><div>{regions.filter(x=>x.slug!==r.slug).map(x=><Link key={x.slug} href={`/destinations/${x.slug}`}><span>{x.name}</span><span>↗</span></Link>)}</div></section></div><PlanInvitation/></JourneyShell>;

}
