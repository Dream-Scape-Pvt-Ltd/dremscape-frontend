import type {Trip} from './catalog.ts';

// These are travel groupings, not Nepal's current administrative divisions.
// Keep the route examples here so the homepage, destination page and catalogue agree.
export const nepalZones = [
  {value:'eastern',label:'Eastern Nepal',short:'Eastern',routes:'Everest · Kanchenjunga · Makalu',intro:'Follow high mountain trails through Sherpa country, glacial valleys and the quieter eastern Himalaya.',highlights:['Everest & Khumbu','Gokyo Valley','Kanchenjunga'],areas:[{label:'Everest & Khumbu',query:'Everest'},{label:'Gokyo Valley',query:'Gokyo'},{label:'Namche, Tengboche & Khumjung',query:'Khumbu'},{label:'Kanchenjunga & Taplejung',query:'Kanchenjunga'},{label:'Makalu-Barun',query:'Makalu'},{label:'Arun Valley',query:'Arun Valley'}],image:'222-78-imgNepalEverestBaseCampAndAmaDablamPeak'},
  {value:'central',label:'Central Nepal',short:'Central',routes:'Langtang · Helambu · Ganesh Himal',intro:'Reach forested valleys, high lakes and village trails close to the Kathmandu Valley.',highlights:['Langtang Valley','Gosaikunda','Helambu'],areas:[{label:'Langtang Valley',query:'Langtang'},{label:'Gosaikunda',query:'Gosaikunda'},{label:'Helambu',query:'Helambu'},{label:'Ganesh Himal',query:'Ganesh Himal'},{label:'Kathmandu Valley hikes',query:'Kathmandu'},{label:'Rolwaling',query:'Rolwaling'},{label:'Panch Pokhari',query:'Panch Pokhari'}],image:'222-78-imgManasluAndLangtangSacredValleyPeaksNepal'},
  {value:'western',label:'Western Nepal',short:'Western',routes:'Annapurna · Manaslu · Mustang',intro:'Move between classic high passes, glacier-fed lakes and the dry, historic settlements of Mustang.',highlights:['Annapurna Circuit','Manaslu & Tsum','Upper Mustang'],areas:[{label:'Annapurna',query:'Annapurna'},{label:'Manaslu & Tsum Valley',query:'Manaslu'},{label:'Upper Mustang',query:'Mustang'},{label:'Jomsom & Muktinath',query:'Muktinath'},{label:'Dhaulagiri',query:'Dhaulagiri'}],image:'222-78-imgAnnapurnaRangeAndHighGlacialLakesNepal'},
  {value:'mid-western',label:'Mid-Western Nepal',short:'Mid-Western',routes:'Dolpo · Rara · Humla',intro:'Explore remote western valleys, the clear waters of Phoksundo and the forests around Rara.',highlights:['Shey Phoksundo','Upper Dolpo','Rara Lake'],areas:[{label:'Dolpo & Shey Phoksundo',query:'Dolpo'},{label:'Upper Dolpo',query:'Upper Dolpo'},{label:'Rara Lake',query:'Rara'},{label:'Jumla & Sinja Valley',query:'Jumla'},{label:'Humla & Limi Valley',query:'Humla'}],image:'151-31-imgDolpoAndSheyPhoksundoDeepWilderness'},
  {value:'far-western',label:'Far-Western Nepal',short:'Far-Western',routes:'Khaptad · Api Himal · Saipal',intro:'Find open meadows, forest trails and high, less-travelled landscapes in Nepal’s far west.',highlights:['Khaptad National Park','Badimalika','Api Himal & Darchula'],photoNote:'A region-specific, location-verified photo is still needed.',areas:[{label:'Khaptad National Park',query:'Khaptad'},{label:'Api Himal & Darchula',query:'Api Himal'},{label:'Saipal Himal',query:'Saipal'},{label:'Badimalika',query:'Badimalika'},{label:'Bajhang & Bajura trails',query:'Bajhang'}],image:'/images/trek-memories/mountain-amphitheatre.jpg'},
] as const;

export type NepalZone = typeof nepalZones[number]['value'];

export function zoneForPlace(value:string):NepalZone|'' {
  const place=value.toLowerCase();
  if(/saipal|api(?:\s|\-|$)|khaptad|far.west/.test(place))return 'far-western';
  if(/dolpo|dolpa|rara|humla|mugu|jumla|mid.west/.test(place))return 'mid-western';
  if(/mustang|lo.manthang|annapurna|manaslu|tsum|pokhara/.test(place))return 'western';
  if(/langtang|rolwaling|kathmandu|helambu|gosainkunda/.test(place))return 'central';
  if(/everest|khumbu|gokyo|kanchen|makalu|sagarmatha/.test(place))return 'eastern';
  if(/eastern nepal|^eastern$/.test(place))return 'eastern';
  if(/central nepal|^central$/.test(place))return 'central';
  if(/western nepal|^western$/.test(place))return 'western';
  return '';
}

export function zoneForTrip(trip:Pick<Trip,'slug'|'title'|'destination_slug'|'destination_name'> & Pick<Partial<Trip>,'primary_zone'>):NepalZone|'' {
  if(trip.primary_zone&&nepalZones.some(zone=>zone.value===trip.primary_zone))return trip.primary_zone as NepalZone;
  // The assigned CMS destination is the primary geographic home. Route names
  // are only a fallback for broad destinations such as "Nepal".
  return zoneForPlace(`${trip.destination_slug} ${trip.destination_name}`)||zoneForPlace(`${trip.slug} ${trip.title}`);
}
