import type {Trip} from './catalog';
import {listJourneys} from './journeys';
import {listDestinationContent} from './destination-content';
import {listGuides} from './guides';
import {searchSite,type SearchDestination,type SearchGuide} from './search';

/**
 * The search index: the whole (small) catalogue, trimmed to the fields search
 * reads and cards show. Browsers load it once and search as visitors type. It
 * is kept here for a few minutes because every backend call counts against the
 * backend's per-IP rate limit, which all visitors of this server share.
 */
export type SearchIndex={trips:Trip[];destinations:SearchDestination[];guides:SearchGuide[];catalogUnavailable:boolean;demo:boolean};
const FRESH_MS=5*60_000;
let cached:{at:number;data:Promise<SearchIndex>}|null=null;

async function load():Promise<SearchIndex>{
  const [catalog,destinations,guides]=await Promise.all([
    listJourneys().catch(()=>null),
    listDestinationContent().catch(()=>[]),
    listGuides().catch(()=>[]),
  ]);
  return {
    trips:catalog?.trips||[],
    destinations:destinations.map(({id,slug,name,short,country,tag,description,highlights,image})=>({id,slug,name,short,country,tag,description,highlights,image})),
    guides:guides.map(({id,slug,title,category,excerpt,image})=>({id,slug,title,category,excerpt,image})),
    catalogUnavailable:!catalog,
    demo:Boolean(catalog?.demo),
  };
}
export function getSearchIndex(){
  if(!cached||Date.now()-cached.at>FRESH_MS){
    const data=load();
    cached={at:Date.now(),data};
    // A failed load should be retried on the next search, not served for five minutes.
    void data.then(result=>{if(result.catalogUnavailable&&cached?.data===data)cached=null;});
  }
  return cached.data;
}

export async function runSiteSearch(query:string){
  const {catalogUnavailable,demo,...data}=await getSearchIndex();
  return {...searchSite(query,data),catalogUnavailable,demo};
}
