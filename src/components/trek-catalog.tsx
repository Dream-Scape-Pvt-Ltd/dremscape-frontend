'use client';
import {useEffect,useMemo,useState} from 'react';
import {trekHref} from '@/lib/links';
import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import JourneyShell from './journey-shell';
import JourneySelect from './journey-select';
import JourneyCard from './journey-card';
import SearchBackdrop from './search-backdrop';
import {asset} from '@/lib/assets';
import {filterTrips,isExpedition,trips as sampleTrips,type Trip} from '@/lib/catalog';
import {difficulty,difficultyLevels} from '@/lib/format';
import {matchTrips} from '@/lib/search';

type Kind=''|'treks'|'expeditions';
/** The trek collection: search first, then filters. Everything updates as you type or choose, and the address keeps the filters for sharing. */
export default function TrekCatalog() {
  const params=useSearchParams();
  const [search,setSearch]=useState(params.get('q')||''),[kind,setKind]=useState<Kind>((params.get('kind') as Kind)||'');
  const [duration,setDuration]=useState(params.get('duration')||''),[grade,setGrade]=useState(params.get('grade')||''),[sort,setSort]=useState('recommended'),[filtersOpen,setFiltersOpen]=useState(false);
  const [items,setItems]=useState<Trip[]>([]),[demo,setDemo]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState('');
  async function load(){setLoading(true);setError('');try{const r=await fetch('/api/trips');const data=await r.json();if(!r.ok)throw new Error(data.error);setItems(data.trips.length?data.trips:sampleTrips);setDemo(data.demo||!data.trips.length);}catch(e){setError(e instanceof Error?e.message:'Unable to load journeys.');}finally{setLoading(false);}}
  useEffect(()=>{void load();},[]);
  useEffect(()=>{
    const query=new URLSearchParams(Object.entries({q:search.trim(),kind,duration,grade}).filter(([,value])=>value));
    const url=`${location.pathname}${query.size?`?${query}`:''}`;
    const timer=setTimeout(()=>{if(url!==location.pathname+location.search)history.replaceState(history.state,'',url);},300);
    return()=>clearTimeout(timer);
  },[search,kind,duration,grade]);

  const counts={all:items.length,treks:items.filter(t=>!isExpedition(t)).length,expeditions:items.filter(isExpedition).length};
  const visible=useMemo(()=>matchTrips(filterTrips(items,'','',duration).filter(t=>(!grade||t.difficulty_grade===grade)&&(!kind||(kind==='expeditions')===isExpedition(t))),search).sort((a,b)=>sort==='price'?Number(a.starting_price_usd)-Number(b.starting_price_usd):sort==='duration'?a.duration_days-b.duration_days:0),[items,duration,grade,kind,search,sort]);
  const filtered=Boolean(duration||grade||search||kind);
  function clear(){setDuration('');setGrade('');setSearch('');setKind('');setSort('recommended');}
  return <JourneyShell>
    <SearchBackdrop/>
    <div className="container catalog-page">
      <h1 className="sr-only">Find your trek</h1>
      <section className="catalog-filter catalog-filter-first" aria-label="Search and filter treks">
        <label className="catalog-search"><span className="sr-only">Search treks and expeditions</span><svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg><input type="search" aria-label="Search treks" placeholder="Search Everest, peak climbing, 12 days under $2000…" value={search} onChange={e=>setSearch(e.target.value)} autoComplete="off" autoFocus/>{search&&<button type="button" className="catalog-search-clear" aria-label="Clear search" onClick={()=>setSearch('')}>×</button>}</label>
        <div className="catalog-quick">
          <div className="catalog-kind" role="group" aria-label="Category">{([['','All',counts.all],['treks','Treks',counts.treks],['expeditions','Expeditions',counts.expeditions]] as [Kind,string,number][]).map(([value,label,count])=><button type="button" key={label} aria-pressed={kind===value} onClick={()=>setKind(value)}>{value==='treks'?<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2 16 L7 9 L10 12 L13 7 L18 16Z"/></svg>:value==='expeditions'?<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2 17 L10 3 L18 17Z"/><path d="M10 3 V0.5 M10 0.5 L14 1.8 L10 3" className="flag"/></svg>:null}{label}{!loading&&<span className="catalog-kind-count">{count}</span>}</button>)}</div>
          
        </div>
        <button type="button" className="catalog-filters-toggle" aria-expanded={filtersOpen} aria-controls="catalog-selects" onClick={()=>setFiltersOpen(!filtersOpen)}>Filters &amp; sort{[duration,grade].filter(Boolean).length>0&&<span>{[duration,grade].filter(Boolean).length}</span>}<span aria-hidden="true" className="catalog-filters-caret">{filtersOpen?'−':'+'}</span></button>
        <div id="catalog-selects" className={`catalog-selects ${filtersOpen?'is-open':''}`}><JourneySelect label="Time on the trail" value={duration} onChange={setDuration} options={[{value:'',label:'Any duration'},{value:'short',label:'Up to 10 days'},{value:'medium',label:'11–16 days'},{value:'long',label:'17+ days'}]}/><JourneySelect label="Difficulty" value={grade} onChange={setGrade} options={[{value:'',label:'All levels'},...difficultyLevels]}/><JourneySelect label="Sort" value={sort} onChange={setSort} options={[{value:'recommended',label:search.trim()?'Best match':'Featured first'},{value:'price',label:'Price: low to high'},{value:'duration',label:'Shortest first'}]}/></div>
      </section>
      <section className="catalog-results catalog-results-live" aria-label="Treks">
        <div className="catalog-results-bar"><p aria-live="polite">{loading?'Loading journeys…':<><strong>{visible.length}</strong> {visible.length===1?'journey':'journeys'}{search.trim()?<> for “{search.trim()}”</>:filtered?' match your filters':' to explore'}</>}</p>{filtered&&<button type="button" className="text-link clear-filters" onClick={clear}>Clear all ×</button>}</div>
        {demo&&<p className="sample-notice">Sample routes for exploring the filters · Dates and availability are not confirmed. Ask our team to plan your journey.</p>}
        {loading?<div className="trip-grid catalogue-grid catalog-skeleton" aria-hidden="true">{[0,1,2].map(i=><div key={i}/>)}</div>:error?<div className="status" role="alert"><p>{error}</p><button className="button green" onClick={()=>void load()}>Try again</button></div>:visible.length?<div className="trip-grid catalogue-grid">{visible.map(trip=>demo?<Link className="sample-trek-card" href={trekHref(trip.id)} key={trip.slug}><img src={asset(trip.image||'/images/trek-memories/mountain-amphitheatre.jpg')} alt={trip.title} loading="lazy" width="640" height="420"/><div className="sample-trek-copy"><span>SAMPLE ROUTE · {trip.destination_name}</span><h3>{trip.title}</h3><p>{trip.duration_days} days · {difficulty(trip.difficulty_grade)}</p><span className="text-link">View route details ↗</span></div></Link>:<JourneyCard trip={trip} key={trip.slug}/>)}</div>:<div className="status">{kind==='expeditions'&&!counts.expeditions?<><h3>No expeditions are listed yet.</h3><p>Peak climbing trips will appear here once they are published. Tell the team which summit you have in mind and we’ll plan it with you.</p></>:<><h3>No journeys match{search.trim()?` “${search.trim()}”`:''} yet.</h3><p>Try a shorter search or fewer filters. The team can also plan a route just for you.</p></>}<div className="button-row"><button className="button green" onClick={clear}>Show all journeys</button><Link className="button gold" href="/contact">Ask the team ↗</Link></div></div>}
      </section>
    </div>
  </JourneyShell>;
}
