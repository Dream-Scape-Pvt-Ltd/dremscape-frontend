import {connection} from 'next/server';
import {backendConfigured} from './backend';
import {allPages} from './journeys';
import {regions} from './destinations';
export type Region={slug:string;name:string;short:string;tag:string;image:string;galleryImages?:string[];title:string;description:string;highlights:string;style:string;pace:string;mood:string;base:string;country?:string};
type DestinationRecord={slug:string;name:string;country:string;region_name?:string;hero_media?:string;gallery_images?:string[];headline?:string;description?:string;highlights?:string;trail_style?:string;pace?:string;mood?:string;base?:string};
const countryFallbackImages:Record<string,string>={BHUTAN:'/images/trek-memories/sunlit-summits.jpg',INDIA:'/images/trek-memories/valley-tree.jpg',MULTI_COUNTRY:'/images/trek-memories/mountain-path.jpg',TIBET:'/images/trek-memories/prayer-flags-and-friends.jpg'};
const fallbackImage=(country:string)=>countryFallbackImages[country]||'/images/trek-memories/mountain-amphitheatre.jpg';
function photoUrl(value:unknown):string|undefined {
  if(typeof value!=='string')return undefined;
  const url=value.trim().replace(/^https?:\/\/(?:127\.0\.0\.1|localhost):\d+(?=\/images\/)/,'');
  return /^(https?:\/\/|\/images\/)/.test(url)?url:undefined;
}
export async function listDestinationContent():Promise<Region[]>{
  if(!backendConfigured())return regions.map(region=>({...region,country:'NEPAL'}));
  await connection();
  try {
    const records=await allPages<DestinationRecord>('destinations/');
    return records.map(record=>({slug:record.slug,name:record.name,short:record.region_name||record.name,country:record.country,tag:record.country.replaceAll('_',' '),image:photoUrl(record.hero_media)||fallbackImage(record.country),galleryImages:Array.isArray(record.gallery_images)?record.gallery_images.map(photoUrl).filter((url):url is string=>Boolean(url)):[],title:record.headline||'Your next chapter starts here.',description:record.description||`Discover ${record.name} with a journey shaped around you.`,highlights:record.highlights||'Talk to us about the places you would like to see.',style:record.trail_style||'A journey shaped around your interests',pace:record.pace||'Discuss the right pace with our team',mood:record.mood||'',base:record.base||record.region_name||record.name}));
  } catch {
    return regions.map(region=>({...region,country:'NEPAL'}));
  }
}
