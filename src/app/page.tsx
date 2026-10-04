import Home from '@/components/home';
import {getSiteSettings} from '@/lib/site-settings';
import {listDestinationContent} from '@/lib/destination-content';
import {listGuides} from '@/lib/guides';
import {getHomepageReviews} from '@/lib/homepage-content';
import {listJourneys} from '@/lib/journeys';
import type {Trip} from '@/lib/catalog';

type HomeCatalog={trips:Trip[];demo:boolean;error?:string};

export default async function Page(){
  const [settings,regions,guides,stories,catalog]=await Promise.all([
    getSiteSettings(),listDestinationContent(),listGuides().catch(()=>[]),getHomepageReviews(),
    listJourneys().then((value):HomeCatalog=>value).catch((error):HomeCatalog=>({trips:[],demo:false,error:error instanceof Error?error.message:'Could not load journeys.'})),
  ]);
  const countryById=new Map(regions.map(region=>[region.id,region.country]));
  const countryBySlug=new Map(regions.map(region=>[region.slug,region.country]));
  const initialCatalog={...catalog,trips:catalog.trips.map(trip=>({...trip,destination_country:countryById.get(trip.destination_id||'')||countryBySlug.get(trip.destination_slug)||trip.destination_country}))};
  return <Home heroTitle={settings.home_title} heroDescription={settings.home_description} heroEyebrow={settings.home_eyebrow} heroImage={settings.home_image_url} heroImageAlt={settings.home_image_alt}
    initialCatalog={initialCatalog}
    finderDestinations={settings.home_filter_destinations}
    finderDifficulties={settings.home_filter_difficulties}
    finderBudgets={settings.home_filter_budgets}
    destinationCountries={Object.fromEntries(regions.map(region=>[region.slug,region.country||'NEPAL']))}
    heroCaption={settings.home_caption} heroLocation={settings.home_location}
    reviews={stories.reviews} reviewsUnavailable={stories.unavailable}
    articles={guides.slice(0,3).map(guide=>({id:guide.id,slug:guide.slug,title:guide.title,image:guide.image,tag:guide.category,date:guide.reading?`${guide.reading} read`:'From the Journal',excerpt:guide.excerpt}))}
  />;
}
