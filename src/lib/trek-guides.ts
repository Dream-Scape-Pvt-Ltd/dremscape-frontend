import {connection} from 'next/server';
import {backend,backendConfigured,BackendError} from './backend';
import {allPages} from './journeys';
import type {Trip} from './catalog';
import {isUuid} from './links';

/**
 * The people who lead Dreamscape treks. "Trek guide" keeps them apart from
 * the journal's travel guides (src/lib/guides.ts). Fields the team has not
 * filled in stay empty; pages leave them out.
 */
export type TrekGuideSummary={id:string;slug:string;name:string;role:string;photo?:string;yearsExperience:number|null;languages:string[];regions:{id:string;slug:string;name:string}[]};
export type TrekGuide=TrekGuideSummary&{bio:string;certifications:string[];treks:Trip[]};

type ApiRegion={id?:unknown;slug?:unknown;name?:unknown};
type ApiTrip={id:string;destination_id?:string;slug:string;title:string;duration_days:number;difficulty_grade:string;starting_price_usd:string;altitude_max_meters:number|null;hero_image_url?:string;destination_name:string;destination_slug:string;category_name:string;category_slug:string};
type ApiGuide={id?:unknown;slug:unknown;name:unknown;role?:unknown;photo_url?:unknown;years_experience?:unknown;languages?:unknown;regions?:ApiRegion[];bio?:unknown;certifications?:unknown;treks_led?:ApiTrip[]};

const SLUG=/^[\w-]+$/;
const text=(value:unknown)=>typeof value==='string'?value.trim():'';
const texts=(value:unknown)=>Array.isArray(value)?value.map(text).filter(Boolean):[];

/** Only site-relative or absolute http(s) photos; dev backends' localhost hosts are dropped so the path resolves here. */
export function photoUrl(value:unknown):string|undefined {
  const url=text(value).replace(/^https?:\/\/(?:127\.0\.0\.1|localhost):\d+(?=\/)/,'');
  return /^(https?:\/\/|\/(?!\/))/.test(url)?url:undefined;
}

export function adaptSummary(raw:ApiGuide):TrekGuideSummary {
  const slug=text(raw?.slug),name=text(raw?.name);
  if(!isUuid(raw?.id)||!SLUG.test(slug)||!name)throw new BackendError('The guide data is incomplete.');
  const years=typeof raw.years_experience==='number'&&Number.isFinite(raw.years_experience)?raw.years_experience:null;
  const regions=(Array.isArray(raw.regions)?raw.regions:[]).map(r=>({id:text(r?.id),slug:text(r?.slug),name:text(r?.name)})).filter(r=>isUuid(r.id)&&r.name);
  return {id:raw.id,slug,name,role:text(raw.role),photo:photoUrl(raw.photo_url),yearsExperience:years,languages:texts(raw.languages),regions};
}

export function adaptGuide(raw:ApiGuide):TrekGuide {
  const treks=(Array.isArray(raw.treks_led)?raw.treks_led:[]).filter(t=>t&&isUuid(t.id)&&typeof t.slug==='string'&&typeof t.title==='string').map(t=>({
    id:t.id,destination_id:isUuid(t.destination_id)?t.destination_id:undefined,slug:t.slug,title:t.title,destination_name:t.destination_name,destination_slug:t.destination_slug,category_name:t.category_name,category_slug:t.category_slug,
    duration_days:t.duration_days,starting_price_usd:t.starting_price_usd,altitude_max_meters:t.altitude_max_meters??0,difficulty_grade:t.difficulty_grade,image:photoUrl(t.hero_image_url),
  }));
  return {...adaptSummary(raw),bio:text(raw.bio),certifications:texts(raw.certifications),treks};
}

// Kept briefly: every backend call counts against the per-IP limit that all
// visitors of this server share. Admin saves clear it (clearTrekGuidesCache), so
// the expiry only matters for edits made outside the dashboard.
const FRESH_MS=60_000;
// Stored on globalThis so the admin API routes and the pages, which Next may
// bundle separately, share one cache.
type ListCache={at:number;data:Promise<TrekGuideSummary[]>}|null;
const store=globalThis as typeof globalThis&{__trekGuideList?:ListCache};

/** Forget the cached guide list; the next page view loads it fresh. */
export function clearTrekGuidesCache(){store.__trekGuideList=null;}

export async function listTrekGuides():Promise<TrekGuideSummary[]>{
  if(!backendConfigured())return [];
  await connection();
  const cached=store.__trekGuideList;
  if(cached&&Date.now()-cached.at<=FRESH_MS)return cached.data;
  const data=allPages<ApiGuide>('content/trek-guides/').then(rows=>rows.map(adaptSummary));
  store.__trekGuideList={at:Date.now(),data};
  // A failed load is retried on the next visit rather than served until it expires.
  data.catch(()=>{if(store.__trekGuideList?.data===data)store.__trekGuideList=null;});
  return data;
}

/** A guide by id (current addresses) or slug (old links being redirected); the backend accepts both. */
export async function getTrekGuide(ref:string):Promise<TrekGuide>{
  if(!SLUG.test(ref)||!backendConfigured())throw new BackendError('Guide not found.',404);
  await connection();
  return adaptGuide(await backend<ApiGuide>(`content/trek-guides/${encodeURIComponent(ref)}/`));
}
