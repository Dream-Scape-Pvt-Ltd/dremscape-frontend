import Link from 'next/link';
import JourneyShell from '@/components/journey-shell';
import type {Metadata} from 'next';
export const metadata:Metadata={title:'Page not found | Dreamscape Treks',description:'This Dreamscape Treks page could not be found. Explore the journeys or return to the homepage.'};
export default function NotFound(){return <JourneyShell><section className="utility-page container status"><p className="eyebrow">A DIFFERENT TRAIL</p><h1>This page isn’t on the map.</h1><p>Let’s find your way back to the mountains.</p><Link className="button gold" href="/treks">Explore journeys ↗︎</Link></section></JourneyShell>;}
