'use client';
import {useEffect,useMemo,useState} from 'react';

import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import JourneyShell from './journey-shell';
import JourneySelect from './journey-select';
import JourneyCard from './journey-card';
import SearchBackdrop from './search-backdrop';

import {filterTrips,trips as sampleTrips,type Trip} from '@/lib/catalog';
import {journeyKind,matchesCollection,trekkingRegions,tourCategories,type JourneyKind} from '@/lib/navigation';
import {matchesTripMetrics} from '@/lib/trip-comparison';
import {difficulty,money} from '@/lib/format';
import {difficultyLevels} from '@/lib/format';
import {matchTrips} from '@/lib/search';

type Kind=JourneyKind;
/** The trek collection: search first, then filters. Everything updates as you type or choose, and the address keeps the filters for sharing. */
export default function TrekCatalog() {
  const params=useSearchParams();
  const [search,setSearch]=useState(params.get('q')||''),[kind,setKind]=useState<Kind>((params.get('kind') as Kind)||'');
  const [region,setRegion]=useState(params.get('region')||''),[tour,setTour]=useState(params.get('tour')||''),[country,setCountry]=useState(params.get('country')||'');
  const [budget,setBudget]=useState(params.get('budget')||''),[altitude,setAltitude]=useState(params.get('altitude')||''),[compared,setCompared]=useState<string[]>([]);
  const [duration,setDuration]=useState(params.get('duration')||''),[grade,setGrade]=useState(params.get('grade')||''),[sort,setSort]=useState('recommended'),[filtersOpen,setFiltersOpen]=useState(false);
  const [items,setItems]=useState<Trip[]>([]),[demo,setDemo]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState('');
  async function load(){setLoading(true);setError('');try{const r=await fetch('/api/trips');const data=await r.json();if(!r.ok)throw new Error(data.error);setItems(data.trips.length?data.trips:sampleTrips);setDemo(data.demo||!data.trips.length);}catch(e){setError(e instanceof Error?e.message:'Unable to load journeys.');}finally{setLoading(false);}}
  useEffect(()=>{void load();},[]);
  useEffect(()=>{
    const query=new URLSearchParams(Object.entries({q:search.trim(),kind,duration,grade,region,tour,country,budget,altitude}).filter(([,value])=>value));
    const url=`${location.pathname}${query.size?`?${query}`:''}`;
    const timer=setTimeout(()=>{if(url!==location.pathname+location.search)history.replaceState(history.state,'',url);},300);
    return()=>clearTimeout(timer);
  },[search,kind,duration,grade,region,tour,country,budget,altitude]);

  const counts={all:items.length,treks:items.filter(t=>journeyKind(t)==='treks').length,tours:items.filter(t=>journeyKind(t)==='tours').length,expeditions:items.filter(t=>journeyKind(t)==='expeditions').length};
  const visible=useMemo(()=>matchTrips(filterTrips(items,'','',duration).filter(t=>matchesTripMetrics(t,budget,altitude)&&(!grade||t.difficulty_grade===grade)&&matchesCollection(t,{kind,region,tour,country})),search).sort((a,b)=>sort==='price'?Number(a.starting_price_usd)-Number(b.starting_price_usd):sort==='duration'?a.duration_days-b.duration_days:0),[items,duration,grade,kind,region,tour,country,search,sort,budget,altitude]);
  const filtered=Boolean(duration||grade||search||kind||region||tour||country||budget||altitude);
  const collectionLabel=country?`${country.charAt(0).toUpperCase()+country.slice(1)} journeys`:tourCategories.find(t=>t.value===tour)?.label||trekkingRegions.find(r=>r.value===region)?.label||(kind==='tours'?'Tours':kind==='expeditions'?'Climbing journeys':'Trekking journeys');
  function clear(){setBudget('');setAltitude('');setDuration('');setGrade('');setSearch('');setKind('');setRegion('');setTour('');setCountry('');setSort('recommended');}
  return <JourneyShell>
    <SearchBackdrop/>
    <div className="container catalog-page">
      {region||tour||country||kind?<header className="collection-context"><p className="eyebrow">FIND YOUR NEXT JOURNEY</p><h1>{collectionLabel}</h1><p>{kind==='expeditions'?'Explore climbing trips in your chosen region.':kind==='tours'?'Explore Nepal’s wildlife, heritage and landscapes at your own pace.':'Browse the routes, then find the pace that feels right for you.'}</p></header>:<h1 className="sr-only">Find your trek</h1>}
      <section className="catalog-filter catalog-filter-first" aria-label="Search and filter treks">
        <label className="catalog-search"><span className="sr-only">Search treks and expeditions</span><svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg><input type="search" aria-label="Search treks" placeholder="Search Everest, peak climbing, 12 days under $2000…" value={search} onChange={e=>setSearch(e.target.value)} autoComplete="off" autoFocus/>{search&&<button type="button" className="catalog-search-clear" aria-label="Clear search" onClick={()=>setSearch('')}>×</button>}</label>
        <div className="catalog-quick">
          <div className="catalog-kind" role="group" aria-label="Category">{([['','All',counts.all],['treks','Treks',counts.treks],['tours','Tours',counts.tours],['expeditions','Climbing',counts.expeditions]] as [Kind,string,number][]).map(([value,label,count])=><button type="button" key={label} aria-pressed={kind===value} onClick={()=>{setKind(value);setTour('');}}>{value==='treks'?<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2 16 L7 9 L10 12 L13 7 L18 16Z"/></svg>:value==='expeditions'?<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2 17 L10 3 L18 17Z"/><path d="M10 3 V0.5 M10 0.5 L14 1.8 L10 3" className="flag"/></svg>:null}{label}{!loading&&<span className="catalog-kind-count">{count}</span>}</button>)}</div>
          
        </div>
        <button type="button" className="catalog-filters-toggle" aria-expanded={filtersOpen} aria-controls="catalog-selects" onClick={()=>setFiltersOpen(!filtersOpen)}>Filters &amp; sort{[duration,grade,budget,altitude].filter(Boolean).length>0&&<span>{[duration,grade,budget,altitude].filter(Boolean).length}</span>}<span aria-hidden="true" className="catalog-filters-caret">{filtersOpen?'−':'+'}</span></button>
        <div id="catalog-selects" className={`catalog-selects ${filtersOpen?'is-open':''}`}><JourneySelect label="Region" value={region} onChange={setRegion} options={[{value:'',label:'All regions'},...trekkingRegions]}/>{kind==='tours'&&<JourneySelect label="Tour style" value={tour} onChange={setTour} options={[{value:'',label:'All tours'},...tourCategories]}/>}<JourneySelect label="Time on the trail" value={duration} onChange={setDuration} options={[{value:'',label:'Any duration'},{value:'short',label:'Up to 10 days'},{value:'medium',label:'11–16 days'},{value:'long',label:'17+ days'}]}/><JourneySelect label="Difficulty" value={grade} onChange={setGrade} options={[{value:'',label:'All levels'},...difficultyLevels]}/><JourneySelect label="Budget · USD" value={budget} onChange={setBudget} options={[{value:"",label:"Any budget"},{value:"under-1500",label:"Under $1,500"},{value:"1500-2500",label:"$1,500–$2,500"},{value:"over-2500",label:"Above $2,500"}]}/><JourneySelect label="Maximum altitude" value={altitude} onChange={setAltitude} options={[{value:"",label:"Any altitude"},{value:"under-4000",label:"Below 4,000 m"},{value:"4000-5500",label:"4,000–5,500 m"},{value:"over-5500",label:"Above 5,500 m"}]}/><JourneySelect label="Sort" value={sort} onChange={setSort} options={[{value:'recommended',label:search.trim()?'Best match':'Recommended'},{value:'price',label:'Price: low to high'},{value:'duration',label:'Shortest first'}]}/></div>
      </section>
      <section className="catalog-results catalog-results-live" aria-label="Treks">
        <div className="catalog-results-bar"><p aria-live="polite">{loading?'Loading journeys…':<><strong>{visible.length}</strong> {visible.length===1?'journey':'journeys'}{search.trim()?<> for “{search.trim()}”</>:filtered?' match your filters':' to explore'}</>}</p>{filtered&&<button type="button" className="text-link clear-filters" onClick={clear}>Clear all ×</button>}</div>{(region||tour||country)&&<p className="collection-selection">Browsing: {collectionLabel}</p>}
        {demo&&<p className="sample-notice">Sample routes for exploring the filters · Dates and availability are not confirmed. Ask our team to plan your journey.</p>}
        {loading?<div className="trip-grid catalogue-grid catalog-skeleton" aria-hidden="true">{[0,1,2].map(i=><div key={i}/>)}</div>:error?<div className="status" role="alert"><p>{error}</p><button className="button green" onClick={()=>void load()}>Try again</button></div>:visible.length?<div className="trip-grid catalogue-grid">{visible.map(trip=><div className="catalog-card-item" key={trip.id}><JourneyCard trip={trip} preview={demo}/><button className="compare-trip" aria-pressed={compared.includes(trip.id)} disabled={!compared.includes(trip.id)&&compared.length>=3} onClick={()=>setCompared(current=>current.includes(trip.id)?current.filter(id=>id!==trip.id):[...current,trip.id])}>{compared.includes(trip.id)?"✓ Added to comparison":"Compare journey +"}</button></div>)}</div>:<div className="status">{kind==='expeditions'&&!counts.expeditions?<><h3>No expeditions are listed yet.</h3><p>Peak climbing trips will appear here once they are published. Tell the team which summit you have in mind and we’ll plan it with you.</p></>:<><h3>No journeys match{search.trim()?` “${search.trim()}”`:''} yet.</h3><p>Try a shorter search or fewer filters. The team can also plan a route just for you.</p></>}<div className="button-row"><button className="button green" onClick={clear}>Show all journeys</button><Link className="button gold" href="/contact">Ask the team ↗</Link></div></div>}
      </section>
      {compared.length>0&&<section className="trip-comparison" aria-label="Compare selected journeys"><div className="section-heading"><div><p className="eyebrow">SIDE BY SIDE</p><h2>Compare your journeys.</h2><p>Choose up to three routes.{demo?' Prices are indicative for sample routes.':''}</p></div><button className="text-link" onClick={()=>setCompared([])}>Clear comparison ×</button></div><div className="comparison-scroll"><table><caption className="sr-only">Duration, difficulty, altitude and price comparison</caption><thead><tr><th scope="col">Journey details</th>{items.filter(t=>compared.includes(t.id)).map(t=><th scope="col" key={t.id}>{t.title}</th>)}</tr></thead><tbody>{['Duration','Difficulty','Maximum altitude','Starting price'].map((label,i)=><tr key={label}><th scope="row">{label}</th>{items.filter(t=>compared.includes(t.id)).map(t=><td key={t.id}>{[`${t.duration_days} days`,difficulty(t.difficulty_grade),t.altitude_max_meters?`${t.altitude_max_meters.toLocaleString()} m`:'Ask our team',`${money(t.starting_price_usd)} USD / person`][i]}</td>)}</tr>)}</tbody></table></div></section>}
    </div>
  </JourneyShell>;
}
