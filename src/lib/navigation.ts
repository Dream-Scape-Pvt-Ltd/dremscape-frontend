import {isExpedition, type Trip} from './catalog.ts';
import {nepalZones,zoneForTrip} from './nepal-zones.ts';
import {legacyMatch} from './menu-items.ts';
import type {NavMenuData} from './nav-content.ts';

/** A catalogue collection: '' for everything, else a trek menu's slug (treks, tours, expeditions, …). */
export type JourneyKind = string;
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
/** Header menus, in the order and with the content set in admin → Settings → Header menus. */
export function navigationGroups(menus:NavMenuData[]){
  return menus.map(menu=>({
    id:menu.slug,label:menu.name,eyebrow:menu.eyebrow,title:menu.title,intro:menu.intro,image:menu.image,allLabel:menu.all_label,
    href:menu.menu_type==='CATEGORIES'?collectionHref(menu.slug):menu.href||'/',
    items:menu.menu_type==='CATEGORIES'
      ?menu.items.map(item=>({label:item.name,description:item.description,href:collectionHref(menu.slug,'category',item.slug)}))
      :menu.links,
  }));
}

/** A trek's collection: its menu when its category is in one, else the keyword rules the fixed menus used. */
export function journeyKind(trip:Trip):string {
  if(trip.category_menu)return trip.category_menu;
  if(isExpedition(trip))return 'expeditions';
  const category=`${trip.category_slug} ${trip.category_name}`;
  return /tour|cultur|sightseeing|wildlife|safari|heli|day.trip/i.test(category)?'tours':'treks';
}
export function climbingType(trip:Trip):ClimbingType {
  if(journeyKind(trip)!=='expeditions')return '';
  const category=`${trip.category_slug} ${trip.category_name}`.toLowerCase();
  return /peak/.test(category)?'peak':/expedition|mountaineer|climb/.test(category)?'expedition':'';
}
export function matchesCollection(trip:Trip,{kind='',zone='',region='',tour='',country='',category='',climb=''}:{kind?:string;zone?:string;region?:string;tour?:string;country?:string;category?:string;climb?:string}):boolean {
  if(kind&&journeyKind(trip)!==kind)return false;
  if(climb&&climbingType(trip)!==climb)return false;
  if(category){
    // A trek assigned to a menu category shows only there; older treks fall back to the keyword rules.
    if(trip.category_menu)return trip.category_slug===category&&matchesCollection(trip,{zone,region,tour,country,climb});
    const legacy=legacyMatch[category];
    return Boolean(legacy)&&matchesCollection(trip,{zone,country,climb,region:legacy.region||region,tour:legacy.tour||tour});
  }
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
