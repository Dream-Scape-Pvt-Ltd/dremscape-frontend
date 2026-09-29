import type {Trip} from './catalog.ts';

// These are travel groupings, not Nepal's current administrative divisions.
// Keep the route examples here so the homepage, destination page and catalogue agree.
export const nepalZones = [
  {value:'eastern',label:'Eastern Nepal',short:'Eastern',routes:'Everest · Kanchenjunga · Makalu',image:'222-78-imgNepalEverestBaseCampAndAmaDablamPeak'},
  {value:'central',label:'Central Nepal',short:'Central',routes:'Langtang · Kathmandu Valley · Rolwaling',image:'222-78-imgManasluAndLangtangSacredValleyPeaksNepal'},
  {value:'western',label:'Western Nepal',short:'Western',routes:'Annapurna · Manaslu · Mustang',image:'222-78-imgAnnapurnaRangeAndHighGlacialLakesNepal'},
  {value:'mid-western',label:'Mid-Western Nepal',short:'Mid-Western',routes:'Dolpo · Rara · Humla',image:'151-31-imgDolpoAndSheyPhoksundoDeepWilderness'},
  {value:'far-western',label:'Far-Western Nepal',short:'Far-Western',routes:'Khaptad · Api · Saipal',image:'/images/trek-memories/mountain-amphitheatre.jpg'},
] as const;

export type NepalZone = typeof nepalZones[number]['value'];

export function zoneForPlace(value:string):NepalZone|'' {
  const place=value.toLowerCase();
  if(/saipal|api(?:\s|\-|$)|khaptad|far.west/.test(place))return 'far-western';
  if(/dolpo|dolpa|rara|humla|mugu|jumla|mid.west/.test(place))return 'mid-western';
  if(/mustang|lo.manthang|annapurna|manaslu|tsum|pokhara/.test(place))return 'western';
  if(/langtang|rolwaling|kathmandu|helambu|gosainkunda/.test(place))return 'central';
  if(/everest|khumbu|gokyo|kanchen|makalu|sagarmatha/.test(place))return 'eastern';
  return '';
}

export function zoneForTrip(trip:Trip):NepalZone|'' {
  // The route wins over a broad CMS destination such as “Dolpo & West Nepal”.
  return zoneForPlace(`${trip.slug} ${trip.title} ${trip.tags||''}`)||zoneForPlace(`${trip.destination_slug} ${trip.destination_name}`);
}
