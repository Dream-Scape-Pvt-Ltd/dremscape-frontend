import {isExpedition, type Trip} from './catalog.ts';
import {zoneForTrip} from './nepal-zones.ts';
import {legacyMatch} from './menu-items.ts';
import type {NavMenuData} from './nav-content.ts';

/** A catalogue collection: '' for everything, else a trek menu's slug (treks, tours, expeditions, …). */
export type JourneyKind = string;
export const trekkingRegions = [
  {value:'everest',label:'Everest Region',description:'Khumbu trails, lakes & high passes'},
  {value:'langtang',label:'Langtang Region',description:'Valley walks & mountain villages'},
  {value:'annapurna',label:'Annapurna Region',description:'Classic circuits & glacial lakes'},
  {value:'manaslu',label:'Manaslu Region',description:'Remote trails & the Tsum Valley'},
  {value:'mustang',label:'Mustang Region',description:'Red cliffs & ancient kingdoms'},
  {value:'off-the-beaten',label:'Off the Beaten Path',description:'Dolpo, Kanchenjunga & quieter trails'},
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
export function matchesCollection(trip:Trip,{kind='',zone='',region='',tour='',country='',category=''}:{kind?:string;zone?:string;region?:string;tour?:string;country?:string;category?:string}):boolean {
  if(kind&&journeyKind(trip)!==kind)return false;
  if(category){
    // A trek assigned to a menu category shows only there; older treks fall back to the keyword rules.
    if(trip.category_menu)return trip.category_slug===category&&matchesCollection(trip,{zone,region,tour,country});
    const legacy=legacyMatch[category];
    return Boolean(legacy)&&matchesCollection(trip,{zone,country,region:legacy.region||region,tour:legacy.tour||tour});
  }
  if(zone&&zoneForTrip(trip)!==zone)return false;
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
