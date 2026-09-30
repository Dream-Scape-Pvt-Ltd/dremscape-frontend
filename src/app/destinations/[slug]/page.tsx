import {notFound,permanentRedirect} from 'next/navigation';
import {listDestinationContent} from '@/lib/destination-content';
import {destinationHref} from '@/lib/links';
import JourneyShell from '@/components/journey-shell';
import Breadcrumbs from '@/components/breadcrumbs';
import Link from 'next/link';
import DestinationPage from '../destination-page';

const countryPages:Record<string,string>={bhutan:'Bhutan',tibet:'Tibet',india:'India'};

/** Old /destinations/<slug> links: move permanently to /destinations?id=<uuid>. (Nepal and Beyond Nepal keep their own pages.) */
export default async function Page({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const destinations=await listDestinationContent();
  const destination=destinations.find(r=>r.slug===slug||r.id===slug);
  if(destination&&countryPages[slug])return <DestinationPage id={destination.id} providedDestinations={destinations}/>;
  if(!destination){
    const country=countryPages[slug];
    if(!country)notFound();
    return <JourneyShell page="destinations"><section className="beyond-nepal container"><Breadcrumbs items={[{label:'Destinations',href:'/destinations'},{label:'Beyond Nepal',href:'/destinations/beyond-nepal'},{label:country}]}/><p className="eyebrow">BEYOND NEPAL</p><h1>{country}</h1><p>The places and journeys for {country} cannot be shown right now. They will appear here when the CMS is available and the team has published them.</p><div className="button-row"><Link href="/destinations/beyond-nepal" className="button green">Explore other places</Link><Link href="/contact" className="button gold">Ask the team</Link></div></section></JourneyShell>;
  }
  permanentRedirect(destinationHref(destination.id,destination.slug));
}
