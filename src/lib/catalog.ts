export type Trip = { id?: string; slug: string; title: string; destination_name: string; destination_slug: string; category_name: string; category_slug: string; duration_days: number; starting_price_usd: string; altitude_max_meters: number; difficulty_grade: string; image?: string; tags?: string; overview?: string };
export const trips: Trip[] = [
  { slug:'everest-base-camp-cho-la', title:'Everest Base Camp & Cho La Pass', destination_name:'Everest & Khumbu', destination_slug:'everest', category_name:'Treks', category_slug:'treks', duration_days:16, starting_price_usd:'1890', altitude_max_meters:5545, difficulty_grade:'Challenging', image:'222-242-imgEverestBaseCampChoLaPassTrekkingRoute', tags:'Gokyo Lakes · High Pass · Sherpa Guide' },
  { slug:'annapurna-circuit-tilicho', title:'Annapurna Circuit & Tilicho Lake', destination_name:'Annapurna & Mustang', destination_slug:'annapurna', category_name:'Treks', category_slug:'treks', duration_days:14, starting_price_usd:'1540', altitude_max_meters:5416, difficulty_grade:'Challenging', image:'222-242-imgAnnapurnaCircuitAndTilichoLakeHighGlacialLake', tags:'Thorong La · Glacial Lake · Teahouses' },
  { slug:'manaslu-wild-circuit', title:'Manaslu Wild Circuit & Larkya', destination_name:'Manaslu & Langtang', destination_slug:'manaslu', category_name:'Treks', category_slug:'treks', duration_days:15, starting_price_usd:'1720', altitude_max_meters:5106, difficulty_grade:'Challenging', image:'222-242-imgManasluCircuitLarkyaPassRemoteHimalayas', tags:'Restricted Area · Larkya La · Wild Valley' },
  { slug:'upper-mustang', title:'Upper Mustang & Lo Manthang', destination_name:'Annapurna & Mustang', destination_slug:'annapurna', category_name:'Treks', category_slug:'treks', duration_days:12, starting_price_usd:'2150', altitude_max_meters:3840, difficulty_grade:'Moderate', image:'222-242-imgUpperMustangLoManthangWalledCityRedCliffs', tags:'Walled City · Caves · Tibetan Culture' },
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
