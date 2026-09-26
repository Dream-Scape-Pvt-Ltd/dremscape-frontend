import Link from 'next/link';
import JourneyCard from './journey-card';
import {isExpedition,type Trip} from '@/lib/catalog';

/** A destination's journeys, with treks and peak expeditions listed separately. */
export default function DestinationJourneys({trips,place}:{trips:Trip[];place:string}) {
  const treks=trips.filter(t=>!isExpedition(t)),expeditions=trips.filter(isExpedition);
  if(!trips.length)return <div className="quiet-panel destination-journeys-empty"><h3>No treks or expeditions are listed for {place} yet.</h3><p>The team can still arrange a trip here. Tell us your dates and what you’d like to see.</p><Link href="/contact" className="button gold">Ask about {place}</Link></div>;
  const groups=[
    {id:'treks',title:'Treks',items:treks,empty:`No treks are listed for ${place} yet.`,ask:'Ask about a trek here'},
    {id:'expeditions',title:'Expeditions',items:expeditions,empty:`No peak expeditions are listed for ${place} yet.`,ask:'Ask about an expedition here'},
  ];
  return <div className="destination-journeys">
    <nav className="destination-journeys-jump" aria-label={`Journeys in ${place}`}>{groups.map(g=><a key={g.id} href={`#${g.id}`}>{g.title} <span>{g.items.length}</span></a>)}</nav>
    {groups.map(g=><section key={g.id} id={g.id} className="destination-journey-group" aria-labelledby={`${g.id}-heading`}>
      <div className="section-heading"><h3 id={`${g.id}-heading`}>{g.title}</h3></div>
      {g.items.length?<div className="trip-grid catalogue-grid">{g.items.map(t=><JourneyCard key={t.slug} trip={t}/>)}</div>:<p className="destination-journey-none">{g.empty} <Link href="/contact" className="text-link">{g.ask}</Link></p>}
    </section>)}
  </div>;
}
