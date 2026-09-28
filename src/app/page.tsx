import Home from '@/components/home';
import {getSiteSettings} from '@/lib/site-settings';
import {listDestinationContent} from '@/lib/destination-content';
import {listGuides} from '@/lib/guides';
import {getHomepageReviews} from '@/lib/homepage-content';

export default async function Page(){
  const [settings,regions,guides,stories]=await Promise.all([
    getSiteSettings(),listDestinationContent(),listGuides(),getHomepageReviews(),
  ]);
  return <Home heroTitle={settings.home_title} heroDescription={settings.home_description} heroEyebrow={settings.home_eyebrow} heroImage={settings.home_image_url} heroImageAlt={settings.home_image_alt}
    finderDestinations={settings.home_filter_destinations}
    finderDifficulties={settings.home_filter_difficulties}
    finderBudgets={settings.home_filter_budgets}
    destinationCountries={Object.fromEntries(regions.map(region=>[region.slug,region.country||'NEPAL']))}
    heroCaption={settings.home_caption} heroLocation={settings.home_location}
    reviews={stories.reviews} reviewsUnavailable={stories.unavailable}
    articles={guides.slice(0,3).map(guide=>({id:guide.id,slug:guide.slug,title:guide.title,image:guide.image,tag:guide.category,date:guide.reading?`${guide.reading} read`:'From the Journal',excerpt:guide.excerpt}))}
  />;
}
