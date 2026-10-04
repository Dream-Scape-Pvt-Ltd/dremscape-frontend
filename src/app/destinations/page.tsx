import UiArrow from '@/components/ui-arrow';
import type {Metadata} from 'next';
import {getSiteSettings} from '@/lib/site-settings';
import Link from 'next/link';
import JourneyShell from '@/components/journey-shell';
import {notFound} from 'next/navigation';
import {isUuid} from '@/lib/links';
import DestinationPage,{destinationMetadata} from './destination-page';
const collectionsMetadata:Metadata={title:'Destinations in Nepal | Dreamscape Treks',description:'Find your Himalayan region. Explore Everest and Khumbu, Annapurna and Mustang, Manaslu and Tsum Valley, and Dolpo with Dreamscape Treks.'};
type Props={searchParams:Promise<{id?:string|string[]}>};

export async function generateMetadata({searchParams}:Props):Promise<Metadata>{
  const {id}=await searchParams;
  return isUuid(id)?destinationMetadata(id):collectionsMetadata;
}

/** /destinations shows the collections; /destinations?id=<uuid> opens one destination. Any other id is not a page. */
export default async function Page({searchParams}:Props){
  const {id}=await searchParams;
  if(id!==undefined){
    if(!isUuid(id))notFound();
    return <DestinationPage id={id}/>;
  }
  return <DestinationsPage/>;
}

async function DestinationsPage(){const s=await getSiteSettings();return <JourneyShell page="destinations"><section className="destination-collections container"><div className="collection-heading"><p className="eyebrow">A WORLD OF POSSIBILITY</p><h1>Where will your<br/><em>curiosity take you?</em></h1><p>Start close to our heart, or look a little further. Choose your next horizon.</p></div><div className="collection-grid"><Link href="/destinations/nepal" className="collection-card collection-nepal"><img src={s.nepal_image} alt="Snow-covered Himalayan peaks in Nepal" width="2048" height="1536"/><div><span className="collection-kicker">ROOTED IN THE HIMALAYA</span><h2>{s.nepal_title}</h2><p>{s.nepal_description}</p><span className="collection-action">Explore Nepal <span className="ui-arrow" aria-hidden="true" /></span></div></Link><Link href="/destinations/beyond-nepal" className="collection-card collection-beyond"><img src={s.beyond_image} alt="" width="4095" height="1624"/><div><span className="collection-kicker">NEW HORIZONS</span><h2>{s.beyond_title}</h2><p>{s.beyond_description}</p><span className="collection-action">Discover what’s next <span className="ui-arrow" aria-hidden="true" /></span></div></Link></div><p className="collection-note">Have a place in mind? <Link href="/contact">Let’s talk about your journey <UiArrow/></Link></p></section></JourneyShell>;}
