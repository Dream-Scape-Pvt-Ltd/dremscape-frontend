import {isExpedition,type Trip} from './catalog.ts';
import {editorialTagOptions} from './editorial-tags.ts';

/**
 * Site search tuned for a trekking catalogue. Visitors type partial names
 * ("ever"), typos ("annapurana"), shorthand ("EBC") and plain requirements
 * ("12 days under 2000"), so matching works on word prefixes and small edit
 * distances instead of whole-word full-text search.
 */

export type SearchDestination={id:string;slug:string;name:string;short?:string;country?:string;tag?:string;description?:string;highlights?:string;image?:string};
export type SearchGuide={id:string;slug:string;title:string;category?:string;excerpt?:string;image?:string};
export type SearchResults={
  query:string;
  trips:Trip[];
  destinations:SearchDestination[];
  guides:SearchGuide[];
  /** True when nothing matched every word and these are the closest partial matches. */
  partial:boolean;
};

const STOPWORDS=new Set(['a','an','and','the','in','of','to','for','with','at','on','me','my','i','want','show','find','trip','trips','tour','tours','journey','journeys']);
const SHORTHAND:Record<string,string[]>={
  ebc:['everest','base','camp'],abc:['annapurna','base','camp'],mbc:['manaslu','base','camp'],
  climb:['expedition'],climbing:['expedition'],mountaineering:['expedition'],peak:['expedition'],summit:['expedition'],
  hike:['trek'],hiking:['trek'],trekking:['trek'],treks:['trek'],
  beginner:['easy'],moderate:['normal'],hard:['difficult'],tough:['difficult'],strenuous:['difficult'],challenging:['difficult'],technical:['extreme'],extreme:['extreme'],
};
const GRADE_WORDS:Record<string,string>={EASY:'easy beginner gentle',NORMAL:'normal moderate',DIFFICULT:'difficult demanding strenuous challenging',EXTREME:'extreme technical alpine challenging'};

export function normalize(value:string){return value.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
const words=(value:string)=>normalize(value).split(' ').filter(Boolean);

function editDistance(a:string,b:string,limit:number){
  if(Math.abs(a.length-b.length)>limit)return limit+1;
  let prev=Array.from({length:b.length+1},(_,i)=>i);
  for(let i=1;i<=a.length;i++){
    const row=[i];let best=i;
    for(let j=1;j<=b.length;j++){row[j]=Math.min(prev[j]+1,row[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));best=Math.min(best,row[j]);}
    if(best>limit)return limit+1;
    prev=row;
  }
  return prev[b.length];
}

/** How well one query word matches a field: exact > prefix > inside a word > typo. */
function wordScore(token:string,fieldWords:string[]){
  let best=0;
  const typoLimit=token.length>=7?2:token.length>=4?1:0;
  for(const word of fieldWords){
    if(word===token)return 3;
    if(word.startsWith(token))best=Math.max(best,2.2);
    else if(token.length>=3&&word.includes(token))best=Math.max(best,1.4);
    else if(typoLimit&&best<1&&(editDistance(token,word,typoLimit)<=typoLimit||editDistance(token,word.slice(0,token.length),typoLimit)<=typoLimit))best=1;
  }
  return best;
}

type Field=[text:string,weight:number];
/** Every query word must match some field; in `partial` mode the words that match still count. */
function scoreRecord(tokens:string[],fields:Field[],partial:boolean){
  const prepared=fields.map(([text,weight])=>[words(text),weight] as const);
  let total=0,matched=0;
  for(const token of tokens){
    let best=0;
    for(const [fieldWords,weight] of prepared)best=Math.max(best,wordScore(token,fieldWords)*weight);
    if(best>0){matched++;total+=best;}
    else if(!partial)return 0;
  }
  return matched?total*(matched/tokens.length):0;
}

type Constraints={maxPrice?:number;minPrice?:number;days?:number;maxDays?:number;minDays?:number};
/** Pull "12 days", "short", "under $2000" and "over 1500" out of the query so they filter rather than match text. */
export function parseQuery(raw:string):{tokens:string[];constraints:Constraints}{
  const constraints:Constraints={};
  let text=raw.toLowerCase().replace(/(\d),(\d)/g,'$1$2');
  text=text.replace(/(?:under|below|less than|max|<)\s*(?:usd|\$)?\s*(\d{3,6})\s*(?:usd|\$|dollars?)?/g,(_,n)=>{constraints.maxPrice=Number(n);return ' ';});
  text=text.replace(/(?:over|above|more than|min|>)\s*(?:usd|\$)?\s*(\d{3,6})\s*(?:usd|\$|dollars?)?/g,(_,n)=>{constraints.minPrice=Number(n);return ' ';});
  text=text.replace(/(\d{1,2})\s*-?\s*(?:days?|d|nights?)\b/g,(_,n)=>{constraints.days=Number(n);return ' ';});
  text=text.replace(/\b(?:short|quick)\b/g,()=>{constraints.maxDays=10;return ' ';}).replace(/\blong\b/g,()=>{constraints.minDays=15;return ' ';});
  const tokens=words(text).flatMap(token=>SHORTHAND[token]||[token]).filter(token=>!STOPWORDS.has(token));
  return {tokens:[...new Set(tokens)],constraints};
}

function tripFields(trip:Trip):Field[]{
  const kind=isExpedition(trip)?'expedition peak climbing':'trek trekking';
  const themes=editorialTagOptions.filter(tag=>trip.editorial_tags?.includes(tag.value)).map(tag=>tag.label).join(' ');
  return [[trip.title,4],[trip.slug.replace(/-/g,' '),3],[trip.destination_name,3],[trip.destination_slug.replace(/-/g,' '),2],[trip.tags||'',2.5],[themes,1.8],[`${trip.category_name} ${kind}`,2],[`${trip.difficulty_grade} ${GRADE_WORDS[trip.difficulty_grade]||''}`,1.5],[trip.overview||'',0.8]];
}
function meetsConstraints(trip:Trip,{maxPrice,minPrice,days,maxDays,minDays}:Constraints){
  const price=Number(trip.starting_price_usd);
  return (maxPrice===undefined||price<=maxPrice)&&(minPrice===undefined||price>=minPrice)&&(days===undefined||Math.abs(trip.duration_days-days)<=3)&&(maxDays===undefined||trip.duration_days<=maxDays)&&(minDays===undefined||trip.duration_days>=minDays);
}
function rank<T>(items:T[],score:(item:T)=>number){
  return items.map(item=>({item,score:score(item)})).filter(r=>r.score>0).sort((a,b)=>b.score-a.score).map(r=>r.item);
}

/** Search one list of treks, e.g. the catalogue's search box. An empty query keeps every trek. */
export function matchTrips(trips:Trip[],query:string){
  const {tokens,constraints}=parseQuery(query);
  const eligible=trips.filter(trip=>meetsConstraints(trip,constraints));
  if(!tokens.length)return eligible;
  return rank(eligible,trip=>scoreRecord(tokens,tripFields(trip),false));
}

export function searchSite(query:string,data:{trips:Trip[];destinations:SearchDestination[];guides:SearchGuide[]}):SearchResults{
  const {tokens,constraints}=parseQuery(query);
  const trips=data.trips.filter(trip=>meetsConstraints(trip,constraints));
  const constrained=Object.keys(constraints).length>0;
  if(!tokens.length)return {query,trips:constrained?trips:[],destinations:[],guides:[],partial:false};
  const run=(partial:boolean)=>({
    trips:rank(trips,trip=>scoreRecord(tokens,tripFields(trip),partial)),
    // Destinations and stories have no price or length, so a query with those only returns treks.
    destinations:constrained?[]:rank(data.destinations,d=>scoreRecord(tokens,[[d.name,4],[d.short||'',3.5],[d.slug.replace(/-/g,' '),3],[d.country||'',3],[d.highlights||'',2],[d.description||'',1]],partial)),
    guides:constrained?[]:rank(data.guides,g=>scoreRecord(tokens,[[g.title,3],[g.category||'',1.5],[g.excerpt||'',1]],partial)),
  });
  const exact=run(false);
  if(exact.trips.length||exact.destinations.length||exact.guides.length||tokens.length===1)return {query,...exact,partial:false};
  return {query,...run(true),partial:true};
}
