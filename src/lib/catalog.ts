export type Trip = { id: string; slug: string; title: string; destination_name: string; destination_slug: string; destination_id?: string; category_name: string; category_slug: string; duration_days: number; starting_price_usd: string; altitude_max_meters: number; difficulty_grade: string; image?: string; tags?: string; overview?: string };
// Sample route durations referenced from https://www.trekmenepal.com/; not live offers.
export const trips: Trip[] = [
  { id:'79006b58-9d9b-45ec-8587-0cf901ebbde3', slug:'everest-base-camp-cho-la', title:'Everest Base Camp & Cho La Pass', destination_name:'Everest & Khumbu', destination_slug:'everest', destination_id:'0eba86c7-e013-4985-a889-6280fe218961', category_name:'Treks', category_slug:'treks', duration_days:18, starting_price_usd:'1890', altitude_max_meters:5545, difficulty_grade:'DIFFICULT', image:'222-242-imgEverestBaseCampChoLaPassTrekkingRoute', tags:'Gokyo Lakes · High Pass · Sherpa Guide' },
  { id:'23a06875-99e9-42e5-8971-0a7551dca5f0', slug:'annapurna-circuit-tilicho', title:'Annapurna Circuit & Tilicho Lake', destination_name:'Annapurna & Mustang', destination_slug:'annapurna', destination_id:'4ba82287-556d-4e1f-ae33-40e660c34e1f', category_name:'Treks', category_slug:'treks', duration_days:18, starting_price_usd:'1540', altitude_max_meters:5416, difficulty_grade:'DIFFICULT', image:'222-242-imgAnnapurnaCircuitAndTilichoLakeHighGlacialLake', tags:'Thorong La · Glacial Lake · Teahouses' },
  { id:'0c40fcea-b944-4990-a151-5bdce75f16f5', slug:'manaslu-wild-circuit', title:'Manaslu Wild Circuit & Larkya', destination_name:'Manaslu & Langtang', destination_slug:'manaslu', destination_id:'afe3c47a-61a8-4523-93fd-cf80b2aee1d0', category_name:'Treks', category_slug:'treks', duration_days:15, starting_price_usd:'1720', altitude_max_meters:5106, difficulty_grade:'DIFFICULT', image:'222-242-imgManasluCircuitLarkyaPassRemoteHimalayas', tags:'Restricted Area · Larkya La · Wild Valley' },
  { id:'63deae1a-5467-4613-8381-4d2fb6a921e1', slug:'upper-mustang', title:'Upper Mustang & Lo Manthang', destination_name:'Annapurna & Mustang', destination_slug:'annapurna', destination_id:'4ba82287-556d-4e1f-ae33-40e660c34e1f', category_name:'Treks', category_slug:'treks', duration_days:12, starting_price_usd:'2150', altitude_max_meters:3840, difficulty_grade:'NORMAL', image:'222-242-imgUpperMustangLoManthangWalledCityRedCliffs', tags:'Walled City · Caves · Tibetan Culture' },
];
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
