'use client';
import Link from 'next/link';
import {destinationHref,storyHref} from '@/lib/links';
import {useEffect,useMemo,useState,type ReactNode} from 'react';
import JourneyCard from './journey-card';
import SearchBackdrop from './search-backdrop';
import {asset} from '@/lib/assets';
import {isExpedition} from '@/lib/catalog';
import {searchSite,type SearchResults} from '@/lib/search';
import {useSearchIndex} from '@/hooks/useSearchIndex';

const examples=['Everest','Annapurna','Peak climbing','12 days under $2000','Easy trek','Bhutan'];
type Kind='all'|'treks'|'expeditions'|'destinations'|'stories';
const labels:Record<Kind,string>={all:'All',treks:'Treks',expeditions:'Expeditions',destinations:'Destinations',stories:'Stories'};
const icons:Partial<Record<Kind,ReactNode>>={
  treks:<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2 16 L7 9 L10 12 L13 7 L18 16Z"/></svg>,
  expeditions:<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2 17 L10 3 L18 17Z"/><path d="M10 3 V0.5 M10 0.5 L14 1.8 L10 3" className="flag"/></svg>,
};

/**
 * The search page. The server renders results for the address it was given;
 * after that every keystroke searches the local index, and the address follows
 * the query so results can still be shared or bookmarked. Choosing Treks or
 * Expeditions with an empty search lists that whole category.
 */
export default function SearchExperience({initialQuery,initial}:{initialQuery:string;initial:(SearchResults&{catalogUnavailable:boolean})|null}) {
  const [query,setQuery]=useState(initialQuery),[kind,setKind]=useState<Kind>('all');
  const index=useSearchIndex();
  const q=query.trim();
  const searching=q.length>=2;
  const result=useMemo(()=>{
    if(!searching)return null;
    if(index)return {...searchSite(q,index),catalogUnavailable:index.catalogUnavailable};
    return q===initialQuery?initial:null;
  },[q,searching,index,initial,initialQuery]);

  useEffect(()=>{const timer=setTimeout(()=>{const url=q?`/search?q=${encodeURIComponent(q)}`:'/search';if(url!==location.pathname+location.search)history.replaceState(history.state,'',url);},300);return()=>clearTimeout(timer);},[q]);

  // With no search, the category counts describe the whole collection.
  const pool=result?result.trips:index?.trips||[];
  const treks=pool.filter(t=>!isExpedition(t)),expeditions=pool.filter(isExpedition);
  const destinations=result?.destinations||(searching?[]:index?.destinations||[]),stories=result?.guides||(searching?[]:index?.guides||[]);
  const counts:Record<Kind,number>={all:treks.length+expeditions.length+destinations.length+stories.length,treks:treks.length,expeditions:expeditions.length,destinations:destinations.length,stories:stories.length};
  const browsing=!searching&&kind!=='all';
  const showing=searching||browsing;
  const show=(k:Kind)=>(kind==='all'||kind===k)&&counts[k]>0;

  return <div className="site-search-page">
    <SearchBackdrop/>
    <section className="utility-page site-search container">
      <h1>Search Dreamscape</h1>
      <form action="/search" className="site-search-form" role="search" onSubmit={e=>e.preventDefault()}><label htmlFor="site-search-input" className="sr-only">Search treks, expeditions, destinations and stories</label><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.7"/><path d="m16 16 4.5 4.5"/></svg><input id="site-search-input" name="q" type="search" value={query} onChange={e=>setQuery(e.target.value)} maxLength={200} placeholder="Try Everest, peak climbing or 12 days under $2000" autoComplete="off" autoFocus={!initialQuery}/>{query&&<button type="button" className="site-search-clear" aria-label="Clear search" onClick={()=>setQuery('')}>×</button>}</form>
      <div className="site-search-tabs" role="group" aria-label="Category">{(Object.keys(labels) as Kind[]).map(k=><button type="button" key={k} aria-pressed={kind===k} onClick={()=>setKind(k)}>{icons[k]}{labels[k]}{(index||result)&&k!=='all'&&<span>{counts[k]}</span>}</button>)}</div>
      {!showing&&<div className="site-search-examples" aria-label="Example searches"><span>Try</span>{examples.map(example=><button type="button" key={example} onClick={()=>setQuery(example)}>{example}</button>)}</div>}
      {q.length===1&&<p className="site-search-status" role="status">Keep typing…</p>}
      {searching&&!result&&<p className="site-search-status" role="status">Searching…</p>}
      {showing&&(result||index)&&<>
        <p className="site-search-status" aria-live="polite">{searching?(counts.all?<>{kind==='all'?counts.all:counts[kind]} {(kind==='all'?counts.all:counts[kind])===1?'result':'results'} for <strong>“{q}”</strong>{kind!=='all'&&<> in {labels[kind].toLowerCase()}</>}</>:<>Nothing found for <strong>“{q}”</strong></>):<>All {labels[kind].toLowerCase()}</>}</p>
        {result?.partial&&counts.all>0&&<p className="site-search-note">No journey matches every word, so these are the closest matches.</p>}
        {(result||index)?.catalogUnavailable&&<p className="site-search-note" role="alert">The journey collection is temporarily unavailable, so treks may be missing.</p>}
        {show('treks')&&<section className="site-search-group" aria-labelledby="results-treks"><h2 id="results-treks">Treks <span>{treks.length}</span></h2><div className="trip-grid catalogue-grid">{treks.map(t=><JourneyCard key={t.slug} trip={t}/>)}</div></section>}
        {show('expeditions')&&<section className="site-search-group" aria-labelledby="results-expeditions"><h2 id="results-expeditions">Expeditions <span>{expeditions.length}</span></h2><div className="trip-grid catalogue-grid">{expeditions.map(t=><JourneyCard key={t.slug} trip={t}/>)}</div></section>}
        {show('destinations')&&<section className="site-search-group" aria-labelledby="results-destinations"><h2 id="results-destinations">Destinations <span>{destinations.length}</span></h2><div className="site-search-places">{destinations.map(d=><Link key={d.slug} href={destinationHref(d.id,d.slug)} className="site-search-place">{d.image&&<img src={asset(d.image)} alt="" loading="lazy"/>}<div><span className="site-search-kicker">{(d.country||'Destination').replaceAll('_',' ').toLowerCase()}</span><strong>{d.name}</strong><p>{d.highlights||d.description}</p><span className="text-link">See treks and expeditions</span></div></Link>)}</div></section>}
        {show('stories')&&<section className="site-search-group" aria-labelledby="results-stories"><h2 id="results-stories">From the journal <span>{stories.length}</span></h2><div className="site-search-stories">{stories.map(g=><Link key={g.slug} href={storyHref(g.id)} className="quiet-panel"><span className="site-search-kicker">{g.category||'Journal'}</span><strong>{g.title}</strong><p>{g.excerpt}</p></Link>)}</div></section>}
        {(kind==='all'?!counts.all:!counts[kind])&&<div className="quiet-panel site-search-empty">{kind==='expeditions'?<><h2>No expeditions {searching?'match this search':'are listed yet'}.</h2><p>Peak climbing trips appear here once they are published. Tell the team which summit you have in mind and we’ll plan it with you.</p></>:<><h2>Let’s find it together.</h2><p>Try a region such as Everest or Annapurna, a kind of journey such as “peak climbing”, or a length and budget like “12 days under $2000”. If you have something specific in mind, the team can plan it with you.</p></>}<div className="button-row"><Link href="/treks" className="button green">Browse all treks</Link><Link href="/contact" className="button gold">Ask the team</Link></div></div>}
      </>}
    </section>
  </div>;
}
