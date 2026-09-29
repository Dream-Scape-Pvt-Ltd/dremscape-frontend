import {getSiteSettings} from '@/lib/site-settings';
import Destinations from '@/components/destinations';
import {listDestinationContent} from '@/lib/destination-content';
export default async function Page(){const settings=await getSiteSettings();const regions=(await listDestinationContent()).filter(r=>r.country==='NEPAL');return <Destinations regions={regions} cover={settings.nepal_image} title={settings.nepal_title} description={settings.nepal_description}/>;}
