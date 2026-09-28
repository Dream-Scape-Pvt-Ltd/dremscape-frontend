import {getSiteSettings} from '@/lib/site-settings';
import JourneyShell from '@/components/journey-shell';
import {PageHero} from '@/components/editorial';
import Gallery from '@/components/gallery';
export const metadata={title:'A glimpse of Nepal | Dreamscape gallery'};
export default async function Page(){const settings=await getSiteSettings();return <JourneyShell page="gallery"><PageHero eyebrow="MOUNTAIN GALLERY" title={settings.gallery_title} description={settings.gallery_description}/><section className="container section"><Gallery photos={settings.gallery_images}/></section></JourneyShell>;}
