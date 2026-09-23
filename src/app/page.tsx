import {getSiteSettings} from '@/lib/site-settings';
import Home from './components/home';
import {listDestinationContent} from '@/lib/destination-content';
import {listGuides} from '@/lib/guides';
export default async function Page(){
 const [settings,regions,guides]=await Promise.all([getSiteSettings(),listDestinationContent().catch(()=>[]),listGuides().catch(()=>[])]);
 return <Home heroImage={settings.home_image_url} heroAlt={settings.home_image_alt} destinations={regions.map(r=>({name:r.name,slug:r.slug,image:r.image,tag:r.tag,description:r.highlights}))} articles={guides.slice(0,3).map(g=>({slug:g.slug,title:g.title,image:g.image||'/images/trek-memories/sunlit-summits.jpg',tag:g.category,date:g.reading?`${g.reading} read`:'From the Journal',excerpt:g.excerpt}))}/>;
}
