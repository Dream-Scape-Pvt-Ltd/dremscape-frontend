import Link from 'next/link';
import {connection} from 'next/server';
import JourneyShell from '@/components/journey-shell';
import {backend} from '@/lib/backend';
type Result={id:string;entity_type:'trip'|'destination'|'guide'|'faq';title:string;slug:string;snippet:string};
export default async function Page({searchParams}:{searchParams:Promise<{q?:string;page?:string}>}){
 await connection();const params=await searchParams,q=(params.q||'').trim(),page=Math.max(1,Math.min(10000,Number(params.page)||1));
 let result:{results:Result[];next:string|null;previous:string|null;count:number}|null=null,error='';
 if(q.length>=2&&q.length<=200){try{result=await backend(`search/?q=${encodeURIComponent(q)}&page=${page}&page_size=12`);}catch{error='Search is temporarily unavailable. Please try again.';}}
 return <JourneyShell><section className="utility-page container"><p className="eyebrow">FIND YOUR NEXT CHAPTER</p><h1>Explore Dreamscape.</h1><form action="/search" className="booking-lookup"><label>Search journeys, destinations and stories<input name="q" defaultValue={q} minLength={2} maxLength={200} required placeholder="Try Everest or culture"/></label><button className="button green">Search</button></form>{error&&<p role="alert">{error}</p>}{result&&<><p>{result.count} results for “{q}”</p><div className="search-results">{result.results.map(item=>{const href=item.entity_type==='trip'?`/treks/${item.slug}`:item.entity_type==='destination'?`/destinations/${item.slug}`:item.entity_type==='guide'?`/blog/${item.slug}`:null;return <article className="quiet-panel" key={`${item.entity_type}-${item.id}`}><p className="eyebrow">{item.entity_type==='guide'?'Journal':item.entity_type}</p><h2>{href?<Link href={href}>{item.title}</Link>:item.title}</h2><p>{item.snippet}</p></article>;})}</div><nav aria-label="Search pages">{result.previous&&<Link className="button outline-dark" href={`/search?q=${encodeURIComponent(q)}&page=${page-1}`}>Previous</Link>}{result.next&&<Link className="button green" href={`/search?q=${encodeURIComponent(q)}&page=${page+1}`}>Next</Link>}</nav></>}</section></JourneyShell>;
}
