import Link from 'next/link';
import JourneyShell from '@/components/journey-shell';
export const metadata={title:'Create account | Dreamscape'};
export default function Page(){return <JourneyShell><section className="utility-page container"><p className="eyebrow">A SIMPLER START</p><h1>Your journey starts here.</h1><p>You don’t need an account to book with Dreamscape. Choose a journey and save your booking reference; your details will be available in the browser where you book.</p><Link href="/treks" className="button green">Explore journeys ↗</Link></section></JourneyShell>;}
