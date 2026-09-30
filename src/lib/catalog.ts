export type Trip = { id: string; slug: string; title: string; destination_name: string; destination_slug: string; destination_id?: string; destination_country?: string; category_name: string; category_slug: string; duration_days: number; starting_price_usd: string; altitude_max_meters: number; difficulty_grade: string; image?: string; tags?: string; editorial_tags?: string[]; primary_zone?: string; is_active?: boolean; overview?: string };
// Sample route durations referenced from https://www.trekmenepal.com/; not live offers.
export const trips: Trip[] = [
  { id:'79006b58-9d9b-45ec-8587-0cf901ebbde3', slug:'everest-base-camp-cho-la', title:'Everest Base Camp & Cho La Pass', destination_name:'Everest & Khumbu', destination_slug:'everest', destination_id:'0eba86c7-e013-4985-a889-6280fe218961', category_name:'Treks', category_slug:'treks', duration_days:18, starting_price_usd:'1890', altitude_max_meters:5545, difficulty_grade:'DIFFICULT', image:'222-242-imgEverestBaseCampChoLaPassTrekkingRoute', tags:'Gokyo Lakes · High Pass · Sherpa Guide' },
  { id:'23a06875-99e9-42e5-8971-0a7551dca5f0', slug:'annapurna-circuit-tilicho', title:'Annapurna Circuit & Tilicho Lake', destination_name:'Annapurna & Mustang', destination_slug:'annapurna', destination_id:'4ba82287-556d-4e1f-ae33-40e660c34e1f', category_name:'Treks', category_slug:'treks', duration_days:18, starting_price_usd:'1540', altitude_max_meters:5416, difficulty_grade:'DIFFICULT', image:'222-242-imgAnnapurnaCircuitAndTilichoLakeHighGlacialLake', tags:'Thorong La · Glacial Lake · Teahouses' },
  { id:'0c40fcea-b944-4990-a151-5bdce75f16f5', slug:'manaslu-wild-circuit', title:'Manaslu Wild Circuit & Larkya', destination_name:'Manaslu & Langtang', destination_slug:'manaslu', destination_id:'afe3c47a-61a8-4523-93fd-cf80b2aee1d0', category_name:'Treks', category_slug:'treks', duration_days:15, starting_price_usd:'1720', altitude_max_meters:5106, difficulty_grade:'DIFFICULT', image:'222-242-imgManasluCircuitLarkyaPassRemoteHimalayas', tags:'Restricted Area · Larkya La · Wild Valley' },
  { id:'63deae1a-5467-4613-8381-4d2fb6a921e1', slug:'upper-mustang', title:'Upper Mustang & Lo Manthang', destination_name:'Annapurna & Mustang', destination_slug:'annapurna', destination_id:'4ba82287-556d-4e1f-ae33-40e660c34e1f', category_name:'Treks', category_slug:'treks', duration_days:12, starting_price_usd:'2150', altitude_max_meters:3840, difficulty_grade:'NORMAL', image:'222-242-imgUpperMustangLoManthangWalledCityRedCliffs', tags:'Walled City · Caves · Tibetan Culture' },
];
/** Local-only route ideas fill out the design preview; they are not published offers. */
export const regionalPreviewTrips:Trip[]=[
  // Route length and altitude are reference facts; price is an illustrative design value.
  { id:'8c41a397-eef2-4bbb-97f0-b5e8a8426d8d', slug:'annapurna-base-camp-preview', title:'Annapurna Base Camp', destination_name:'Annapurna', destination_slug:'annapurna', category_name:'Treks', category_slug:'treks', duration_days:14, starting_price_usd:'1240', altitude_max_meters:4130, difficulty_grade:'NORMAL', image:'222-78-imgAnnapurnaRangeAndHighGlacialLakesNepal', tags:'Annapurna Sanctuary · Mountain villages · Base camp' },
  { id:'916f46e9-329a-4af2-8b3a-718ce06f4c1e', slug:'langtang-valley-kyanjin-gompa', title:'Langtang Valley & Kyanjin Gompa', destination_name:'Langtang Valley', destination_slug:'langtang', category_name:'Treks', category_slug:'treks', duration_days:10, starting_price_usd:'980', altitude_max_meters:4773, difficulty_grade:'NORMAL', image:'222-78-imgManasluAndLangtangSacredValleyPeaksNepal', tags:'Langtang · Kyanjin Gompa · Valley trails' },
  { id:'a0a01925-12ab-4ec7-83f4-6afe9d23f307', slug:'rara-lake-jumla-trail', title:'Rara Lake & Jumla Trail', destination_name:'Rara & Jumla', destination_slug:'rara-jumla', category_name:'Treks', category_slug:'treks', duration_days:12, starting_price_usd:'1420', altitude_max_meters:3710, difficulty_grade:'NORMAL', image:'151-31-imgDolpoAndSheyPhoksundoDeepWilderness', tags:'Rara Lake · Forest paths · Remote villages' },
  { id:'4b9c919f-82cb-48d2-917b-9468dd5196a8', slug:'khaptad-meadows-trail', title:'Khaptad Meadows & Forest Trail', destination_name:'Khaptad National Park', destination_slug:'khaptad', category_name:'Treks', category_slug:'treks', duration_days:7, starting_price_usd:'760', altitude_max_meters:3200, difficulty_grade:'EASY', image:'/images/trek-memories/mountain-amphitheatre.jpg', tags:'Khaptad · Alpine meadows · Forest walks' },
];
/** Tour concepts are placeholders for the layout, not published routes or confirmed prices. */
export const tourPreviewTrips:Trip[]=[
  {id:'b913a14c-c19c-4b98-a040-cf683cad4433',slug:'kathmandu-valley-heritage-day-preview',title:'Kathmandu Valley Heritage Day',destination_name:'Kathmandu Valley',destination_slug:'kathmandu',category_name:'Culture & Sightseeing',category_slug:'culture-sightseeing',duration_days:1,starting_price_usd:'95',altitude_max_meters:0,difficulty_grade:'EASY',image:'/images/trek-memories/blue-doorway.jpg',tags:'Heritage · Local streets · Day tour'},
  {id:'f91e032e-5612-45bf-bdf1-8b62d22e5c16',slug:'chitwan-nature-escape-preview',title:'Chitwan Nature Escape',destination_name:'Chitwan',destination_slug:'chitwan',category_name:'Wildlife Tours',category_slug:'wildlife-tours',duration_days:3,starting_price_usd:'390',altitude_max_meters:0,difficulty_grade:'EASY',image:'/images/trek-memories/forest-light.jpg',tags:'Wildlife · Forest · Nature'},
  {id:'af2b48c8-13c7-4c84-b039-5c818e882c4c',slug:'nepal-comfort-journey-preview',title:'Nepal at Your Pace',destination_name:'Kathmandu & Pokhara',destination_slug:'pokhara',category_name:'Luxury Tours',category_slug:'luxury-tours',duration_days:7,starting_price_usd:'1840',altitude_max_meters:0,difficulty_grade:'EASY',image:'222-520-imgHimalayanAlpineLakeAndPeaks',tags:'Luxury · Scenic stays · Flexible pace'},
];
/** Climbing layout examples. Their duration is illustrative; no dates, prices or seats are confirmed. */
export const expeditionPreviewTrips:Trip[]=[
  {id:'d07ead85-cb24-49fc-8d5c-bc6cc0a26aa6',slug:'everest-expedition-preview',title:'Everest Expedition · Preview',destination_name:'Everest & Khumbu',destination_slug:'everest',category_name:'Mountain Expedition',category_slug:'mountain-expedition',duration_days:45,starting_price_usd:'0',altitude_max_meters:0,difficulty_grade:'DIFFICULT',image:'222-78-imgNepalEverestBaseCampAndAmaDablamPeak',tags:'Illustrative expedition concept · Route to be confirmed'},
  {id:'ff365865-921d-4679-97e8-89789ea35691',slug:'annapurna-expedition-preview',title:'Annapurna Expedition · Preview',destination_name:'Annapurna',destination_slug:'annapurna',category_name:'Mountain Expedition',category_slug:'mountain-expedition',duration_days:40,starting_price_usd:'0',altitude_max_meters:0,difficulty_grade:'DIFFICULT',image:'222-78-imgAnnapurnaRangeAndHighGlacialLakesNepal',tags:'Illustrative expedition concept · Route to be confirmed'},
];
const previewEditorialTags:Record<string,string[]>={
  'everest-base-camp-cho-la':['popular-trek','high-altitude','base-camp'],
  'annapurna-circuit-tilicho':['popular-trek','high-altitude','circuit'],
  'manaslu-wild-circuit':['restricted-area','high-altitude','circuit','remote-wilderness'],
  'upper-mustang':['restricted-area','monsoon-rainshadow','cultural'],
  'annapurna-base-camp-preview':['popular-trek','base-camp'],
  'langtang-valley-kyanjin-gompa':['family-suitable','cultural'],
  'rara-lake-jumla-trail':['off-the-beaten-path','remote-wilderness'],
  'khaptad-meadows-trail':['short-trek','family-suitable','off-the-beaten-path'],
};
export const previewTrips:Trip[]=[...trips,...regionalPreviewTrips,...tourPreviewTrips,...expeditionPreviewTrips].map(trip=>({...trip,editorial_tags:previewEditorialTags[trip.slug]||[]}));
export function filterTrips(items: Trip[], destination: string, category: string, duration: string) {
  return items.filter(t => (!destination || t.destination_slug.includes(destination)) && (!category || t.category_slug === category || (category === 'treks' && /trek/i.test(t.category_name))) && (!duration || (duration === 'short' ? t.duration_days <= 10 : duration === 'medium' ? t.duration_days > 10 && t.duration_days <= 16 : t.duration_days > 16)));
}
export function unwrapList<T>(body: unknown): T[] {
  const envelope = body as { success?: boolean; data?: unknown };
  if (envelope?.success === false) throw new Error('The catalog could not be loaded.');
  const data = envelope?.data ?? body;
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) return data.results;
  throw new Error('Unexpected catalog response.');
}
/** Peak climbing and mountaineering journeys are listed apart from treks. */
export function isExpedition(trip: Pick<Trip, 'category_name' | 'category_slug'>) {
  return /expedition|peak|climb|mountaineer|summit/i.test(`${trip.category_slug} ${trip.category_name}`);
}
