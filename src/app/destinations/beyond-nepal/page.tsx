import Link from 'next/link';
import JourneyShell from '@/components/journey-shell';
import DestinationScope from '@/components/destination-scope';
import {listDestinationContent} from '@/lib/destination-content';
import {asset} from '@/lib/assets';
export default async function BeyondNepalPage(){
 const destinations=(await listDestinationContent()).filter(d=>d.country!=='NEPAL');
 return <JourneyShell page="destinations"><section className="beyond-nepal container"><DestinationScope beyond/><p className="eyebrow">BEYOND THE HORIZON</p><h1>A little further.<br/>Beyond Nepal.</h1><p>New places. New perspectives. Journeys shaped around your curiosity.</p>{destinations.length>0?<div className="beyond-cards">{destinations.map(d=><Link className="beyond-card" href={`/destinations/${d.slug}`} key={d.slug}><img src={asset(d.image)} alt={d.name} loading="lazy" width="640" height="420"/><div><p className="eyebrow">{d.tag}</p><h2>{d.name}</h2><p>{d.description}</p><span>Discover this destination ↗</span></div></Link>)}</div>:<div className="beyond-nepal-note"><span className="eyebrow">LET’S EXPLORE THE POSSIBILITIES</span><h2>Where would you like to go?</h2><p>Our journeys beyond Nepal are being prepared. Talk to the team about Tibet, Bhutan or India, and the kind of experience you have in mind.</p><Link href="/contact" className="button gold">Plan a personal journey ↗</Link><Link href="/destinations/nepal" className="text-link">Explore Nepal ↗</Link></div>}</section></JourneyShell>;
}
