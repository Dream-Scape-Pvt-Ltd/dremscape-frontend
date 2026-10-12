/** Admin setting: Google with a free fallback, or one provider always. */
export type MapMode='auto'|'google'|'free';
export type MapProvider='google'|'free';
type Store=Pick<Storage,'getItem'|'setItem'|'removeItem'>;

export const GOOGLE_MAPS_KEY=process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY||'';
export const MAP_PROVIDER_EVENT='dreamscape:map-provider';
const FLAG='dreamscape:google-maps-blocked-until';
// Long enough to stop retrying a capped key on every page, short enough to pick Google up after the daily quota resets.
export const BLOCK_MS=6*60*60*1000;

export const browserStorage=():Store|null=>{try{return typeof window==='undefined'?null:window.localStorage;}catch{return null;}};

export function readBlocked(store:Store|null,now=Date.now()):boolean{
  try{
    const until=Number(store?.getItem(FLAG));
    if(!until)return false;
    if(until>now)return true;
    store?.removeItem(FLAG);
  }catch{/* storage unavailable: treat as not blocked */}
  return false;
}
export function writeBlocked(store:Store|null,now=Date.now()){
  try{store?.setItem(FLAG,String(now+BLOCK_MS));}catch{/* storage unavailable: this page still falls back */}
}
export function resolveProvider({mode,hasKey,blocked}:{mode:MapMode;hasKey:boolean;blocked:boolean}):MapProvider{
  if(!hasKey||mode==='free')return 'free';
  if(mode==='google')return 'google';
  return blocked?'free':'google';
}
export function normaliseMapMode(value:unknown):MapMode{return value==='google'||value==='free'?value:'auto';}
