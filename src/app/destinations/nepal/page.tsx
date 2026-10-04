import {getSiteSettings} from '@/lib/site-settings';
import Destinations from '@/components/destinations';
import {listDestinationContent} from '@/lib/destination-content';
export const metadata={title:'Trekking regions of Nepal | Dreamscape Treks',description:'Explore Nepal’s trekking regions, from the eastern Himalaya to the far west, and find journeys shaped around each place.'};
export default async function Page(){
  const settings=await getSiteSettings();
  const nepal=(await listDestinationContent()).filter(r=>r.country==='NEPAL');
  // The country-level "Nepal" record is this page, so it is not shown as one of its own regions.
  return <Destinations regions={nepal.filter(r=>r.slug!=='nepal')} journeyDestinations={nepal.map(r=>r.slug)} cover={settings.nepal_image} title={settings.nepal_title} description={settings.nepal_description}/>;
}
