import {trips as sampleTrips,type Trip} from './catalog';
import {backend, backendConfigured, BackendError} from './backend';
import {isUuid} from './links';

export type AvailabilityState='AVAILABLE'|'FEW_SEATS_LEFT'|'SOLD_OUT'|'WAITLIST'|'CANCELLED';
export type Departure={id:string; start_date:string; end_date:string; price_usd:string; max_seats:number; available_seats:number; availability_state:AvailabilityState; status:string; is_guaranteed:boolean; waitlist_enabled:boolean};
export type ItineraryDay={day_number:number; title:string; description:string; overnight_stay:string; elevation_meters:number|null; is_acclimatization_day:boolean};
export type JourneyGuide={id:string;slug:string;name:string;role:string;photo?:string};
export type Journey=Trip & {guides?:JourneyGuide[];overview:string; min_group_size:number; max_group_size:number; best_seasons:string[]; inclusions:string[]; exclusions:string[]; packing_list:string[]; gallery_images:string[]; itinerary_days:ItineraryDay[]; departures:Departure[]};
type RawTrip=Trip & {hero_image_url?:string;gallery_images?:string[];destination?:{id?:string;name:string;slug:string};category?:{name:string;slug:string;menu?:string}};
function publicImage(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const image = value.trim();
  return /^(https?:\/\/|\/)/.test(image) ? image : undefined;
}
export function normalizeTrip(raw:RawTrip):Trip {
  if (!raw || typeof raw.slug!=='string' || !/^[\w-]+$/.test(raw.slug) || typeof raw.title!=='string' || !Number.isFinite(raw.duration_days) || !Number.isFinite(Number(raw.starting_price_usd))) throw new BackendError('The journey data is incomplete. Please contact the team.');
  const trip={...raw, destination_name:raw.destination?.name??raw.destination_name, destination_slug:raw.destination?.slug??raw.destination_slug, destination_id:raw.destination?.id??raw.destination_id, category_name:raw.category?.name??raw.category_name, category_slug:raw.category?.slug??raw.category_slug, category_menu:raw.category?.menu??raw.category_menu, hero_image_url:publicImage(raw.hero_image_url), gallery_images:Array.isArray(raw.gallery_images)?raw.gallery_images.map(publicImage).filter((image):image is string=>Boolean(image)):[], image:publicImage(raw.hero_image_url)};
  if(![trip.destination_name,trip.destination_slug,trip.category_name,trip.category_slug,trip.difficulty_grade].every(v=>typeof v==='string')||raw.starting_price_usd==null||Number(raw.starting_price_usd)<0)throw new BackendError('The journey data is incomplete. Please contact the team.');
  return trip;
}
export async function allPages<T>(path:string):Promise<T[]> {
  const items:T[]=[];
  for(let page=1;page<=100;page++) {
    const data=await backend<{results:T[];next:string|null}>(`${path}?page_size=100&page=${page}`);
    if(!Array.isArray(data.results))throw new BackendError('The catalog response is incomplete.');
    items.push(...data.results);
    if(!data.next)return items;
  }
  throw new BackendError('The catalog is too large to load. Please contact the team.');
}
export async function listJourneys() {
  if (!backendConfigured()) return {trips:[] as Trip[], demo:false};
  // Follow numbered pages, never an arbitrary URL supplied by an upstream response.
  return {trips:(await allPages<RawTrip>('trips/')).map(normalizeTrip),demo:false};
}
function sampleJourney(ref:string): Journey | undefined {
  const trip=sampleTrips.find(item=>item.id===ref||item.slug===ref);
  if(!trip)return undefined;
  const slug=trip.slug;
  const gallery:Record<string,string[]>={
    'everest-base-camp-cho-la':['222-78-imgNepalEverestBaseCampAndAmaDablamPeak','222-370-imgHimalayanMountainPassTrekkerReflection'],
    'annapurna-circuit-tilicho':['222-78-imgAnnapurnaRangeAndHighGlacialLakesNepal','222-520-imgHimalayanAlpineLakeAndPeaks'],
    'manaslu-wild-circuit':['222-78-imgManasluAndLangtangSacredValleyPeaksNepal','222-370-imgTibetanPrayerFlagsFlyingOnMountainRidge'],
    'upper-mustang':['/images/treks/dhakmar-village.jpg','/images/treks/lo-manthang-caves.jpg','/images/treks/lo-manthang-panorama.jpg'],
  };
  type SampleDay=[title:string,overnight:string,description:string];
  const routeCopy:Record<string,{overview:string;days:SampleDay[]}>= {
    'upper-mustang':{
      overview:'Follow the Kali Gandaki valley into the wide, sculpted landscape of Upper Mustang. The route moves between red cliffs, old trading villages and the walled town of Lo Manthang. Time on the trail is balanced with time to look closer at the culture that makes this region distinctive.\n\nThis is a sample 12-day outline. Walking stages, permits, transport and accommodation will be confirmed with a Dreamscape guide before booking.',
      days:[
        ['Arrive in Kathmandu','Kathmandu','Meet the team, review the route and check your trekking gear.'],
        ['Travel west to Pokhara','Pokhara','Make your way to the lakeside gateway to the Annapurna region.'],
        ['Into the Kali Gandaki valley','Kagbeni','Travel toward Jomsom and continue to the village at the entrance to Upper Mustang.'],
        ['The first red cliffs','Chele','Walk into drier terrain and settle into the rhythm of the trail.'],
        ['Across the open valleys','Ghami','Follow a high desert path between villages and eroded rock formations.'],
        ['Villages and old monasteries','Tsarang','Continue through the Mustang landscape toward a historic settlement.'],
        ['Reach Lo Manthang','Lo Manthang','Approach the walled town and spend the afternoon exploring at an easy pace.'],
        ['A day around Lo Manthang','Lo Manthang','Leave room for nearby villages, local stories and the surrounding landscape.'],
        ['Begin the return trail','Ghami','Travel south through the wide valley with a different view of the cliffs.'],
        ['The route toward Chhusang','Chhusang','Continue between quiet settlements and the river valley.'],
        ['Return to Jomsom','Jomsom','Complete the Upper Mustang section and rest after the trail.'],
        ['Travel onward','Pokhara or Kathmandu','Return travel is arranged around conditions and your onward plans.'],
      ],
    },
    'everest-base-camp-cho-la':{
      overview:'A high Himalayan route linking Everest Base Camp, the Cho La crossing and the lakes of Gokyo. It is designed for trekkers who want more time in Khumbu, with rest days built into the climb.\n\nThis is a draft outline only. A guide will confirm the daily stages, weather window and acclimatization plan.',
      days:[
        ['Arrive in Kathmandu','Kathmandu','Meet the team and prepare for the journey into Khumbu.'],
        ['Travel to the trailhead','Phakding','Travel toward Lukla and begin a gentle first walk.'],
        ['Walk to Namche Bazaar','Namche Bazaar','Follow the valley and climb steadily into the mountain town.'],
        ['Acclimatization in Namche','Namche Bazaar','Walk higher during the day and return to sleep lower.'],
        ['Toward Tengboche','Tengboche','Continue between forests and mountain views.'],
        ['Into the upper valley','Dingboche','Walk above the tree line toward wider alpine country.'],
        ['Acclimatization in Dingboche','Dingboche','Keep the day flexible for a short hike and rest.'],
        ['The trail to Lobuche','Lobuche','Follow the glacial valley toward Everest Base Camp.'],
        ['Everest Base Camp','Gorak Shep','Continue to base camp when conditions permit.'],
        ['Kala Patthar and onward','Dzongla','Take in the high viewpoint before turning toward Cho La.'],
        ['Cross Cho La','Thagnak','Cross the pass with the guide if weather and trail conditions allow.'],
        ['Reach Gokyo','Gokyo','Move toward the lake basin and spend time beside the water.'],
        ['A day in Gokyo','Gokyo','Explore a viewpoint or take a slower day according to the group.'],
        ['Descend toward Dole','Dole','Begin the gradual return through the Khumbu valley.'],
        ['Back to Namche','Namche Bazaar','Reconnect with the main trail and familiar villages.'],
        ['Return to Lukla','Lukla','Complete the walking route.'],
        ['Travel to Kathmandu','Kathmandu','Return from the mountains as transport conditions allow.'],
        ['Flexible departure day','Kathmandu','Keep this day open for rest or travel changes.'],
      ],
    },
    'annapurna-circuit-tilicho':{
      overview:'Circle through changing Annapurna landscapes, with time for the Tilicho Lake side route before the Thorong La crossing. Villages, high valleys and big mountain views give each stage a different character.\n\nThis sample outline will be refined around road access, acclimatization and the conditions on the pass.',
      days:[
        ['Arrive in Kathmandu','Kathmandu','Meet the team and check equipment.'],['Travel to Pokhara','Pokhara','Head west toward the Annapurna gateway.'],['Toward the circuit','Dharapani','Begin the route through the Marsyangdi valley.'],['Walk to Chame','Chame','Continue between forests and mountain settlements.'],['Climb toward Pisang','Pisang','Walk into broader views of the Annapurna range.'],['Reach Manang','Manang','Continue at a measured pace into the upper valley.'],['Acclimatization in Manang','Manang','Take a short hike and allow time to adapt.'],['Toward Khangsar','Khangsar','Leave the main circuit for the Tilicho side route.'],['Tilicho approach','Tilicho Base Camp','Walk into more exposed alpine terrain.'],['Tilicho Lake day','Khangsar','Visit the lake if conditions permit and return to lower ground.'],['Rejoin the circuit','Yak Kharka','Continue steadily toward Thorong La.'],['At the foot of the pass','Thorong Phedi','Rest and prepare for an early crossing.'],['Cross Thorong La','Muktinath','Cross with your guide when weather and trail conditions are suitable.'],['Toward Kagbeni','Kagbeni','Follow the route into the Kali Gandaki valley.'],['Continue to Jomsom','Jomsom','Finish the main walking section.'],['Return to Pokhara','Pokhara','Travel back toward the lakeside city.'],['A flexible day','Pokhara','Leave time for rest or transport changes.'],['Return to Kathmandu','Kathmandu','Complete the journey and connect with onward travel.'],
      ],
    },
    'manaslu-wild-circuit':{
      overview:'Follow the Budhi Gandaki valley through villages and forests toward the high Larkya La crossing. The route rewards a steady pace and attention to the communities along the way.\n\nThis draft plan is for inspiration. Permits, daily distances and the crossing date will be confirmed with a guide.',
      days:[
        ['Arrive in Kathmandu','Kathmandu','Meet the team and review the route.'],['Travel to the trailhead','Machha Khola','Head toward the Budhi Gandaki valley.'],['Walk to Jagat','Jagat','Follow the river through changing terrain.'],['Continue to Deng','Deng','Move deeper into the mountain valley.'],['Toward Namrung','Namrung','Climb through forests and settled villages.'],['Walk to Lho','Lho','Continue toward broad views of the Manaslu range.'],['Reach Samagaun','Samagaun','Take a measured day as the altitude rises.'],['Acclimatization in Samagaun','Samagaun','Explore locally and return to rest.'],['Toward Samdo','Samdo','Walk into a higher, more open landscape.'],['Prepare for the pass','Dharamsala','Keep a short day before the crossing.'],['Cross Larkya La','Bhimthang','Cross with the guide if weather and trail conditions permit.'],['Descend toward Tilije','Tilije','Follow the valley down to lower villages.'],['Continue to Dharapani','Dharapani','Complete the walking section of the circuit.'],['Return to Kathmandu','Kathmandu','Travel back from the trailhead.'],['Flexible departure day','Kathmandu','Allow time for rest or changes to transport.'],
      ],
    },
  };
  const content=routeCopy[slug];
  // Approximate sleeping elevations for the labelled Everest preview only.
  // Reference: https://lovehimalayajourney.com/treks/everest-base-camp-gokyo-cho-la-trek
  const previewElevations:Record<string,number>={Kathmandu:1400,Phakding:2652,'Namche Bazaar':3440,Tengboche:3860,Dingboche:4410,Lobuche:4910,'Gorak Shep':5164,Dzongla:4835,Thagnak:4700,Gokyo:4790,Dole:4200,Lukla:2860};
  const itinerary_days=(content?.days||[]).map(([title,overnight_stay,description],index)=>({day_number:index+1,title,description,overnight_stay,elevation_meters:slug==='everest-base-camp-cho-la'?(previewElevations[overnight_stay]??null):null,is_acclimatization_day:/acclimatization/i.test(title)}));
  return {...trip,image:slug==='upper-mustang'?'/images/treks/lo-manthang.jpg':trip.image,overview:content?.overview||`A sample outline for ${trip.title}. Ask our team for the latest route plan.`,min_group_size:0,max_group_size:0,best_seasons:[],inclusions:['Local trekking guide','Accommodation along the route','Required local permits','Travel between the planned trail stages'],exclusions:['International flights','Travel insurance','Personal gear and purchases','Tips and extra drinks'],packing_list:['Comfortable, broken-in walking boots','Warm layers and waterproof outerwear','Sun protection','Reusable water bottle'],gallery_images:gallery[slug]||[],itinerary_days,departures:[]};
}
/** The published guides who lead a trek, as the trip detail returns them. Malformed rows are dropped. */
function journeyGuides(value:unknown):JourneyGuide[] {
  if(!Array.isArray(value))return [];
  return value.flatMap(item=>{
    const g=item as Record<string,unknown>;
    if(!isUuid(g?.id)||typeof g.slug!=='string'||typeof g.name!=='string'||!g.name.trim())return [];
    return [{id:g.id,slug:g.slug,name:g.name.trim(),role:typeof g.role==='string'?g.role.trim():'',photo:publicImage(g.photo_url)}];
  });
}
/** A trek by id (current addresses) or slug (old links being redirected); the backend accepts both. */
export async function getJourney(ref:string) {
  if(!/^[\w-]+$/.test(ref)) throw new BackendError('Journey not found.',404);
  if(!backendConfigured()) {
    const sample=sampleJourney(ref);
    if(sample)return {journey:sample,demo:true};
    throw new BackendError('Journey not found.',404);
  }
  // The detail serializer caps nested departures at ten, so read the complete
  // dated list too. Both accept the id or slug, so fetch them together.
  let raw:Journey & RawTrip, departures:Departure[];
  try {
    [raw,departures]=await Promise.all([
      backend<Journey & RawTrip>(`trips/${encodeURIComponent(ref)}/`),
      allPages<Departure>(`trips/${encodeURIComponent(ref)}/departures/`),
    ]);
  }
  catch(error) {
    // Keep known preview routes open while the CMS has no matching record yet.
    if(error instanceof BackendError && error.status===404) {
      const sample=sampleJourney(ref);
      if(sample)return {journey:sample,demo:true};
    }
    throw error;
  }

  if(!Array.isArray(raw.itinerary_days)||!Array.isArray(raw.departures)) throw new BackendError('The itinerary response is incomplete.');
  for(const key of ['inclusions','exclusions','best_seasons','packing_list'] as const)if(!Array.isArray(raw[key])||!raw[key].every(v=>typeof v==='string'))throw new BackendError('The itinerary response is incomplete.');
  if(typeof raw.overview!=='string')throw new BackendError('The itinerary response is incomplete.');
  return {journey:{...raw,...normalizeTrip(raw),departures,guides:journeyGuides((raw as {trek_guides?:unknown}).trek_guides)} as Journey,demo:false};
}
/**
 * A few other treks to suggest from a trek's page, same region first. Reads
 * single small pages rather than the whole catalogue.
 */
export async function listRelatedJourneys(current:Trip,limit=3):Promise<Trip[]> {
  if(!backendConfigured()) return [];
  const page=(query:string)=>backend<{results:RawTrip[]}>(`trips/?${query}`).then(data=>Array.isArray(data.results)?data.results.map(normalizeTrip):[]);
  const [sameRegion,others]=await Promise.all([
    page(`destination=${encodeURIComponent(current.destination_slug)}&page_size=${limit+1}`),
    page(`page_size=${limit*2+1}`),
  ]);
  const seen=new Set([current.slug]);
  return [...sameRegion,...others].filter(trip=>!seen.has(trip.slug)&&Boolean(seen.add(trip.slug))).slice(0,limit);
}
export function upcoming(departure:Departure) {
  return departure.start_date>=new Date().toISOString().slice(0,10) && departure.status!=='CANCELLED';
}
export function bookable(departure:Departure) {
  return departure.available_seats>0 && ['LIMITED','GUARANTEED'].includes(departure.status) && upcoming(departure);
}
export function waitlistable(departure:Departure) {
  return !bookable(departure) && upcoming(departure) && departure.waitlist_enabled && departure.available_seats<=0;
}
export function availabilityLabel(departure:Departure) {
  switch(departure.availability_state) {
    case 'FEW_SEATS_LEFT': return `Only ${departure.available_seats} ${departure.available_seats===1?'spot':'spots'} remaining`;
    case 'WAITLIST': return 'Batch full — join waitlist';
    case 'SOLD_OUT': return 'Batch full';
    case 'CANCELLED': return 'Cancelled';
    default: return `${departure.available_seats} seats available`;
  }
}
