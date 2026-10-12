/** Free place search on OpenStreetMap Nominatim; used when Google Places is unavailable. */
export type PlaceResult={name:string;address:string;point:{lat:number;lng:number}};
export type SearchBounds={north:number;south:number;east:number;west:number};

const ENDPOINT='https://nominatim.openstreetmap.org/search';
// Nominatim's usage policy allows at most one request per second.
const MIN_INTERVAL_MS=1100;
let last=0;

const round=(value:number)=>Number(value.toFixed(7));

export async function searchPlaces(query:string,bounds?:SearchBounds|null):Promise<PlaceResult[]>{
  const wait=last+MIN_INTERVAL_MS-Date.now();
  if(wait>0)await new Promise(resolve=>setTimeout(resolve,wait));
  last=Date.now();
  const params=new URLSearchParams({q:query,format:'jsonv2',limit:'5','accept-language':'en'});
  if(bounds)params.set('viewbox',[bounds.west,bounds.north,bounds.east,bounds.south].join(','));
  const response=await fetch(`${ENDPOINT}?${params}`,{headers:{Accept:'application/json'}});
  if(!response.ok)throw new Error(`Place search failed (${response.status})`);
  const rows=await response.json() as {name?:string;display_name?:string;lat?:string;lon?:string}[];
  return rows.flatMap(row=>{
    const lat=Number(row.lat),lng=Number(row.lon);
    if(!Number.isFinite(lat)||!Number.isFinite(lng))return [];
    const address=row.display_name||'';
    return [{name:row.name||address.split(',')[0]||query,address,point:{lat:round(lat),lng:round(lng)}}];
  });
}
