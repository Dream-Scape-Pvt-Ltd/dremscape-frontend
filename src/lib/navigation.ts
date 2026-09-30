import {isExpedition, type Trip} from './catalog.ts';
import {nepalZones,zoneForTrip} from './nepal-zones.ts';

export type JourneyKind = '' | 'treks' | 'tours' | 'expeditions';
export type ClimbingType = '' | 'peak' | 'expedition';
export const climbingTypes=[{value:'peak',label:'Peak Climbing',description:'Climbing journeys assigned to the Peak Climbing CMS category'},{value:'expedition',label:'Expedition Climbing',description:'Mountain expeditions assigned to an expedition CMS category'}] as const;
export const trekkingRegions = nepalZones.map(region=>({value:region.value,label:region.label,description:region.routes}));
export const tourCategories = [
  {value:'wildlife',label:'Wildlife Tours',description:'Forests, wildlife & jungle stays'},
  {value:'luxury',label:'Luxury Tours',description:'Thoughtful journeys with extra comfort'},
  {value:'culture',label:'Culture & Sightseeing',description:'Heritage, local life & living traditions'},
  {value:'day',label:'Day Tours',description:'A different perspective in a single day'},
  {value:'heli',label:'Heli Tours',description:'The Himalaya from above'},
];
const collectionHref=(kind:string,key?:string,value?:string)=>`/treks?${new URLSearchParams({kind,...(key&&value?{[key]:value}:{})})}`;
export const navigationGroups = [
  {id:'treks',label:'Treks',eyebrow:'NEPAL, ONE TRAIL AT A TIME',title:'Find your mountain trail.',intro:'Choose a region and explore the journeys that take you there.',image:'222-78-imgNepalEverestBaseCampAndAmaDablamPeak',href:collectionHref('treks'),allLabel:'Explore all treks',items:trekkingRegions.map(r=>({...r,href:collectionHref('treks','zone',r.value)}))},
  {id:'tours',label:'Tours',eyebrow:'A DIFFERENT WAY TO EXPLORE',title:'More than mountains.',intro:'Make time for Nepal’s wildlife, heritage and quieter moments.',image:'222-520-imgHimalayanAlpineLakeAndPeaks',href:collectionHref('tours'),allLabel:'Explore all tours',items:tourCategories.map(r=>({...r,href:collectionHref('tours','tour',r.value)}))},
  {id:'climbing',label:'Climbing',eyebrow:'A LITTLE HIGHER',title:'Your next summit.',intro:'Browse peak climbs and mountain expeditions, then talk through the route with our team.',image:'222-78-imgAnnapurnaRangeAndHighGlacialLakesNepal',href:collectionHref('expeditions'),allLabel:'Explore all climbing trips',items:climbingTypes.map(type=>({...type,href:collectionHref('expeditions','climb',type.value)}))},
  {id:'company',label:'Company',eyebrow:'ROOTED IN NEPAL · SINCE 2005',title:'The people behind your journey.',intro:'Get to know Dreamscape, our approach and the people beside you on the trail.',image:'/images/trek-memories/together-in-the-mountains.jpg',href:'/about',allLabel:'Get to know Dreamscape',items:[{label:'About Us',description:'Our story & where we come from',href:'/about'},{label:'Why Us',description:'How we shape your journey',href:'/about#our-approach'},{label:'Our Team',description:'The people behind the plans',href:'/about#our-team'},{label:'Our Guides',description:'Meet the people who lead the way',href:'/guides'},{label:'Testimonials',description:'Stories from our travellers',href:'/reviews'},{label:'FAQs',description:'Planning questions answered',href:'/faq'},{label:'Photo gallery',description:'Moments from the mountains',href:'/gallery'}]},
];

export function journeyKind(trip:Trip):Exclude<JourneyKind,''> {
  if(isExpedition(trip))return 'expeditions';
  const category=`${trip.category_slug} ${trip.category_name}`;
  return /tour|cultur|sightseeing|wildlife|safari|heli|day.trip/i.test(category)?'tours':'treks';
}
export function climbingType(trip:Trip):ClimbingType {
  if(journeyKind(trip)!=='expeditions')return '';
  const category=`${trip.category_slug} ${trip.category_name}`.toLowerCase();
  return /peak/.test(category)?'peak':/expedition|mountaineer|climb/.test(category)?'expedition':'';
}
export function matchesCollection(trip:Trip,{kind='',zone='',region='',tour='',country='',climb=''}:{kind?:string;zone?:string;region?:string;tour?:string;country?:string;climb?:string}) {
  if(kind&&journeyKind(trip)!==kind)return false;
  if(climb&&climbingType(trip)!==climb)return false;
  if(zone&&zoneForTrip(trip)!==zone)return false;
  // Titles take precedence over combined destination labels such as “Annapurna & Mustang”.
  const route=`${trip.slug} ${trip.title} ${trip.tags||''}`.toLowerCase();
  const place=`${route} ${trip.destination_slug}`;
  if(country){
    const countryMatches=trip.destination_country
      ?trip.destination_country.toLowerCase()===country.toLowerCase()
      :`${place} ${trip.destination_name.toLowerCase()}`.includes(country.toLowerCase());
    if(!countryMatches)return false;
  }
  const selectedRegion=region.toLowerCase();
  const areaZone=nepalZones.find(group=>group.areas.some(area=>area.query.toLowerCase()===selectedRegion))?.value;
  if(areaZone&&zoneForTrip(trip)!==areaZone)return false;
  if(selectedRegion==='off-the-beaten'&&!/dolpo|dolpa|kanchen|makalu|rolwaling|saipal|dhaulagiri|off.the.beaten/.test(place))return false;
  if(selectedRegion&&selectedRegion!=='off-the-beaten'){
    if(selectedRegion==='annapurna'&&/mustang|lo.manthang/.test(route))return false;
    if(!place.includes(selectedRegion))return false;
  }
  // A tour's assigned category, not a word in its title or destination,
  // determines its tour-style collection after an editor reassigns it.
  const tourText=`${trip.category_slug} ${trip.category_name}`.toLowerCase();
  if(tour&&!['wildlife','luxury','culture','day','heli'].includes(tour)&&trip.category_slug!==tour)return false;
  if(tour==='wildlife'&&!/wildlife|safari|jungle/.test(tourText))return false;
  if(tour==='luxury'&&!/luxury|premium|vip/.test(tourText))return false;
  if(tour==='culture'&&!/cultur|sightseeing|heritage/.test(tourText))return false;
  if(tour==='day'&&!/day.tour|day.trip/.test(tourText))return false;
  if(tour==='heli'&&!/heli/.test(tourText))return false;
  return true;
}
