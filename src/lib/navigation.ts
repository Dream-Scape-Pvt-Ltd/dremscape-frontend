import {isExpedition, type Trip} from './catalog.ts';

export type JourneyKind = '' | 'treks' | 'tours' | 'expeditions';
export const trekkingRegions = [
  {value:'everest',label:'Everest Region',description:'Khumbu trails, lakes & high passes'},
  {value:'langtang',label:'Langtang Region',description:'Valley walks & mountain villages'},
  {value:'annapurna',label:'Annapurna Region',description:'Classic circuits & glacial lakes'},
  {value:'manaslu',label:'Manaslu Region',description:'Remote trails & the Tsum Valley'},
  {value:'mustang',label:'Mustang Region',description:'Red cliffs & ancient kingdoms'},
  {value:'off-the-beaten',label:'Off the Beaten Path',description:'Dolpo, Kanchenjunga & quieter trails'},
];
export const tourCategories = [
  {value:'wildlife',label:'Wildlife Tours',description:'Forests, wildlife & jungle stays'},
  {value:'luxury',label:'Luxury Tours',description:'Thoughtful journeys with extra comfort'},
  {value:'culture',label:'Culture & Sightseeing',description:'Heritage, local life & living traditions'},
  {value:'day',label:'Day Tours',description:'A different perspective in a single day'},
  {value:'heli',label:'Heli Tours',description:'The Himalaya from above'},
];
const collectionHref=(kind:string,key?:string,value?:string)=>`/treks?${new URLSearchParams({kind,...(key&&value?{[key]:value}:{})})}`;
export const navigationGroups = [
  {id:'treks',label:'Treks',eyebrow:'NEPAL, ONE TRAIL AT A TIME',title:'Find your mountain trail.',intro:'Choose a region and explore the journeys that take you there.',image:'222-78-imgNepalEverestBaseCampAndAmaDablamPeak',href:collectionHref('treks'),allLabel:'Explore all treks',items:trekkingRegions.map(r=>({...r,href:collectionHref('treks','region',r.value)}))},
  {id:'tours',label:'Tours',eyebrow:'A DIFFERENT WAY TO EXPLORE',title:'More than mountains.',intro:'Make time for Nepal’s wildlife, heritage and quieter moments.',image:'222-520-imgHimalayanAlpineLakeAndPeaks',href:collectionHref('tours'),allLabel:'Explore all tours',items:tourCategories.map(r=>({...r,href:collectionHref('tours','tour',r.value)}))},
  {id:'climbing',label:'Climbing',eyebrow:'A LITTLE HIGHER',title:'Your next summit.',intro:'Browse climbing journeys by region and talk through the route with our team.',image:'222-78-imgAnnapurnaRangeAndHighGlacialLakesNepal',href:collectionHref('expeditions'),allLabel:'Explore all climbing trips',items:trekkingRegions.filter(r=>['everest','annapurna'].includes(r.value)).map(r=>({...r,href:collectionHref('expeditions','region',r.value)}))},
  {id:'beyond-nepal',label:'Beyond Nepal',eyebrow:'BEYOND THE FAMILIAR',title:'Keep exploring.',intro:'Discover places and cultures beyond Nepal with a personally planned journey.',image:'/images/trek-memories/mountain-amphitheatre.jpg',href:'/destinations/beyond-nepal',allLabel:'Explore beyond Nepal',items:[{label:'Bhutan',description:'Valleys, monasteries & living traditions',href:'/treks?country=bhutan'},{label:'Tibet',description:'High plateaus & sacred landscapes',href:'/treks?country=tibet'},{label:'India',description:'Himalayan landscapes & cultural journeys',href:'/treks?country=india'}]},
  {id:'company',label:'Company',eyebrow:'ROOTED IN NEPAL · SINCE 2005',title:'The people behind your journey.',intro:'Get to know Dreamscape, our approach and the people beside you on the trail.',image:'/images/trek-memories/together-in-the-mountains.jpg',href:'/about',allLabel:'Get to know Dreamscape',items:[{label:'About Us',description:'Our story & where we come from',href:'/about'},{label:'Why Us',description:'How we shape your journey',href:'/about#our-approach'},{label:'Our Team',description:'The people behind the plans',href:'/about#our-team'},{label:'Our Guides',description:'Meet the people who lead the way',href:'/guides'},{label:'Testimonials',description:'Stories from our travellers',href:'/reviews'}]},
];

export function journeyKind(trip:Trip):Exclude<JourneyKind,''> {
  if(isExpedition(trip))return 'expeditions';
  const category=`${trip.category_slug} ${trip.category_name}`;
  return /tour|cultur|sightseeing|wildlife|safari|heli|day.trip/i.test(category)?'tours':'treks';
}
export function matchesCollection(trip:Trip,{kind='',region='',tour='',country=''}:{kind?:string;region?:string;tour?:string;country?:string}) {
  if(kind&&journeyKind(trip)!==kind)return false;
  // Titles take precedence over combined destination labels such as “Annapurna & Mustang”.
  const route=`${trip.slug} ${trip.title} ${trip.tags||''}`.toLowerCase();
  const place=`${route} ${trip.destination_slug}`;
  if(country&&!`${place} ${trip.destination_name.toLowerCase()}`.includes(country))return false;
  if(region==='off-the-beaten'&&!/dolpo|dolpa|kanchen|makalu|rolwaling|saipal|dhaulagiri|off.the.beaten/.test(place))return false;
  if(region&&region!=='off-the-beaten'){
    if(region==='annapurna'&&/mustang|lo.manthang/.test(route))return false;
    if(!place.includes(region))return false;
  }
  const tourText=`${place} ${trip.category_slug} ${trip.category_name}`;
  if(tour==='wildlife'&&!/wildlife|safari|jungle|chitwan|bardiya|bardia/.test(tourText))return false;
  if(tour==='luxury'&&!/luxury|premium|vip/.test(tourText))return false;
  if(tour==='culture'&&!/cultur|sightseeing|heritage/.test(tourText))return false;
  if(tour==='day'&&trip.duration_days!==1&&!/day.tour|day.trip/.test(tourText))return false;
  if(tour==='heli'&&!/heli/.test(tourText))return false;
  return true;
}
