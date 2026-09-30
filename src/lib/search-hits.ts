import {asset} from './assets';
import {isExpedition} from './catalog';
import {difficulty,money} from './format';
import type {SearchResults} from './search';
import {fallbackTrekImage} from './trek-images';
import {destinationHref,storyHref,trekHref} from './links';

export type SearchHit={type:'trek'|'expedition'|'destination'|'story';href:string;title:string;meta:string;image?:string};

/** Flatten search results into display rows: a few of each kind, treks first. */
export function toHits(result:SearchResults,{preview=false,limits={trips:5,destinations:3,guides:2}}:{preview?:boolean;limits?:{trips:number;destinations:number;guides:number}}={}):SearchHit[]{
  return [
    ...result.trips.slice(0,limits.trips).map(t=>({type:isExpedition(t)?'expedition' as const:'trek' as const,href:trekHref(t.id),title:t.title,meta:`${t.destination_name} · ${t.duration_days} days · ${difficulty(t.difficulty_grade)}${preview?' · route idea only':` · from ${money(t.starting_price_usd)}`}`,image:t.image?asset(t.image):fallbackTrekImage(t.slug,t.destination_slug)})),
    ...result.destinations.slice(0,limits.destinations).map(d=>({type:'destination' as const,href:destinationHref(d.id,d.slug),title:d.name,meta:d.short&&d.short!==d.name?d.short:(d.country||'Destination').replaceAll('_',' '),image:d.image?asset(d.image):undefined})),
    ...result.guides.slice(0,limits.guides).map(g=>({type:'story' as const,href:storyHref(g.id),title:g.title,meta:g.category||'From the journal',image:g.image||undefined})),
  ];
}
