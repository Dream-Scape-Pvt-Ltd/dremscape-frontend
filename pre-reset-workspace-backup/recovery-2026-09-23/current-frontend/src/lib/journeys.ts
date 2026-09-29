import type {Trip} from './catalog';
import {backend, backendConfigured, BackendError} from './backend';

export type Departure={id:string; start_date:string; end_date:string; price_usd:string; available_seats:number; status:string};
export type ItineraryDay={day_number:number; title:string; description:string; overnight_stay:string; elevation_meters:number|null; is_acclimatization_day:boolean};
export type Journey=Trip & {overview:string; min_group_size:number; max_group_size:number; best_seasons:string[]; inclusions:string[]; exclusions:string[]; packing_list:string[]; gallery_images:string[]; itinerary_days:ItineraryDay[]; departures:Departure[]};
type RawTrip=Trip & {destination?:{name:string;slug:string};category?:{name:string;slug:string}};
function publicImage(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const image = value.trim();
  return /^(https?:\/\/|\/)/.test(image) ? image : undefined;
}
export function normalizeTrip(raw:RawTrip):Trip {
  if (!raw || typeof raw.slug!=='string' || !/^[\w-]+$/.test(raw.slug) || typeof raw.title!=='string' || !Number.isFinite(raw.duration_days) || !Number.isFinite(Number(raw.starting_price_usd))) throw new BackendError('The journey data is incomplete. Please contact the team.');
  const trip={...raw, destination_name:raw.destination?.name??raw.destination_name, destination_slug:raw.destination?.slug??raw.destination_slug, category_name:raw.category?.name??raw.category_name, category_slug:raw.category?.slug??raw.category_slug, hero_image_url:publicImage(raw.hero_image_url), gallery_images:Array.isArray(raw.gallery_images)?raw.gallery_images.map(publicImage).filter((image):image is string=>Boolean(image)):[], image:publicImage(raw.hero_image_url)};
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
export async function getJourney(slug:string) {
  if(!/^[\w-]+$/.test(slug)) throw new BackendError('Journey not found.',404);
  if(!backendConfigured()) throw new BackendError('Journey not found.',404);
  const raw=await backend<Journey & RawTrip>(`trips/${encodeURIComponent(slug)}/`);

  if(!Array.isArray(raw.itinerary_days)||!Array.isArray(raw.departures)) throw new BackendError('The itinerary response is incomplete.');
  for(const key of ['inclusions','exclusions','best_seasons','packing_list'] as const)if(!Array.isArray(raw[key])||!raw[key].every(v=>typeof v==='string'))throw new BackendError('The itinerary response is incomplete.');
  if(typeof raw.overview!=='string')throw new BackendError('The itinerary response is incomplete.');
  // The detail serializer caps nested departures at ten. Read the complete dated list.
  const departures=await allPages<Departure>(`trips/${encodeURIComponent(slug)}/departures/`);
  return {journey:{...raw,...normalizeTrip(raw),departures} as Journey,demo:false};
}
export function bookable(departure:Departure) {
  return departure.available_seats>0 && ['LIMITED','GUARANTEED'].includes(departure.status) && departure.start_date>=new Date().toISOString().slice(0,10);
}
