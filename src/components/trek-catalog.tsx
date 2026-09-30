'use client';
import {useEffect,useMemo,useState} from 'react';

import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import JourneyShell from './journey-shell';
import JourneySelect from './journey-select';
import JourneyCard from './journey-card';
import SearchBackdrop from './search-backdrop';

import {expeditionPreviewTrips,filterTrips,type Trip} from '@/lib/catalog';
import {journeyKind,matchesCollection,trekkingRegions,tourCategories,climbingTypes,type JourneyKind,type ClimbingType} from '@/lib/navigation';
import {trekMenus} from '@/lib/nav-content';
import {useNavMenus} from './navigation-context';
import {nepalZones,zoneForPlace} from '@/lib/nepal-zones';
import {matchesTripMetrics} from '@/lib/trip-comparison';
import {difficulty,money} from '@/lib/format';
import {difficultyLevels} from '@/lib/format';
import {matchTrips} from '@/lib/search';
import {editorialTagOptions} from '@/lib/editorial-tags';

type Kind=JourneyKind;
/** The trek collection: search first, then filters. Everything updates as you type or choose, and the address keeps the filters for sharing. */
export default function TrekCatalog() {
  const params=useSearchParams();
  const requestedRegion=params.get('region')||'';
  const broadRegion=nepalZones.find(area=>area.value===requestedRegion);
  const initialZone=params.get('zone')||broadRegion?.value||(requestedRegion?zoneForPlace(requestedRegion):'');
  const initialArea=nepalZones.flatMap(area=>area.areas as readonly {label:string;query:string}[]).find(area=>area.query.toLowerCase()===requestedRegion.toLowerCase())?.query||requestedRegion;
  const [search,setSearch]=useState(params.get('q')||''),[kind,setKind]=useState<Kind>((params.get('kind') as Kind)||'');
  const [region,setRegion]=useState(broadRegion?'':initialArea),[zone,setZone]=useState(initialZone),[tour,setTour]=useState(params.get('tour')||''),[climb,setClimb]=useState<ClimbingType>((params.get('climb') as ClimbingType)||''),[tag,setTag]=useState(params.get('tag')||''),[country,setCountry]=useState(params.get('country')||''),[category,setCategory]=useState(params.get('category')||'');
  const menus=trekMenus(useNavMenus());
  const currentMenu=menus.find(menu=>menu.slug===(kind||'treks'));
  const categoryOptions=(currentMenu?.items||[]).map(item=>({value:item.slug,label:item.name,detail:item.description}));
  const [budget,setBudget]=useState(params.get('budget')||''),[altitude,setAltitude]=useState(params.get('altitude')||''),[compared,setCompared]=useState<string[]>([]);
  const [duration,setDuration]=useState(params.get('duration')||''),[grade,setGrade]=useState(params.get('grade')||''),[sort,setSort]=useState('recommended'),[filtersOpen,setFiltersOpen]=useState(false);
  const [items,setItems]=useState<Trip[]>([]),[demo,setDemo]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState('');
  async function load(){setLoading(true);setError('');try{const r=await fetch('/api/trips');const data=await r.json();if(!r.ok)throw new Error(r.status===429?'Live journeys are temporarily unavailable. Please try again later.':data.error||'Unable to load journeys.');setItems(data.trips);setDemo(Boolean(data.demo));}catch(e){setItems([]);setDemo(false);setError(e instanceof Error?e.message:'Unable to load journeys.');}finally{setLoading(false);}}
  useEffect(()=>{void load();},[]);
  useEffect(()=>{
    const query=new URLSearchParams(Object.entries({q:search.trim(),kind,duration,grade,zone,region,tour,climb,tag,country,category,budget,altitude}).filter(([,value])=>value));
    const url=`${location.pathname}${query.size?`?${query}`:''}`;
    const timer=setTimeout(()=>{if(url!==location.pathname+location.search)history.replaceState(history.state,'',url);},300);
    return()=>clearTimeout(timer);
  },[search,kind,duration,grade,zone,region,tour,climb,tag,country,category,budget,altitude]);

  const activeZone=nepalZones.find(area=>area.value===zone);
  const areaName=activeZone?.areas.find(area=>area.query.toLowerCase()===region.toLowerCase())?.label;
  const geographicallyMatched=items.filter(t=>matchesCollection(t,{zone,region,tour,country}));
  const countFor=(slug:string)=>geographicallyMatched.filter(t=>journeyKind(t)===slug).length;
  const cmsTourOptions=Array.from(new Map(items.filter(t=>journeyKind(t)==='tours').map(t=>[t.category_slug,{value:t.category_slug,label:t.category_name}])).values());
  const tourOptions=cmsTourOptions.length?[...cmsTourOptions,...tourCategories.filter(option=>option.value===tour&&!cmsTourOptions.some(item=>item.value===tour))]:tourCategories;
  const showThemes=Boolean(tag)||(kind!=='tours'&&items.some(t=>Boolean(t.editorial_tags?.length)));
  const showCategories=menus.filter(menu=>countFor(menu.slug)>0).length>1;
  const visible=useMemo(()=>matchTrips(filterTrips(items,'','',duration).filter(t=>matchesTripMetrics(t,demo?'':budget,altitude)&&(!grade||t.difficulty_grade===grade)&&(!tag||t.editorial_tags?.includes(tag))&&matchesCollection(t,{kind,zone,region,tour,climb,country,category})),search).sort((a,b)=>sort==='price'&&!demo?Number(a.starting_price_usd)-Number(b.starting_price_usd):sort==='duration'?a.duration_days-b.duration_days:0),[items,demo,duration,grade,kind,zone,region,tour,climb,tag,country,category,search,sort,budget,altitude]);
  const filtered=Boolean(duration||grade||search||kind||zone||region||tour||climb||tag||country||category||(!demo&&budget)||altitude);
  const collectionLabel=country?`${country.charAt(0).toUpperCase()+country.slice(1)} journeys`:climbingTypes.find(t=>t.value===climb)?.label||menus.flatMap(menu=>menu.items).find(item=>item.slug===category)?.name||tourOptions.find(t=>t.value===tour)?.label||areaName||trekkingRegions.find(r=>r.value===region)?.label||activeZone?.label||(kind&&currentMenu?currentMenu.name:'Trekking journeys');
  const selectedArea=zone&&search.trim()?nepalZones.find(z=>z.value===zone)?.areas.find(area=>area.query.toLowerCase()===search.trim().toLowerCase())?.label:'';
  const showClimbingPreview=process.env.NODE_ENV==='development'&&kind==='expeditions'&&(!climb||climb==='expedition')&&!country&&!zone&&!region&&!tour&&!search&&!tag&&!loading&&countFor('expeditions')===0;
  function clear(){setBudget('');setAltitude('');setDuration('');setGrade('');setSearch('');setKind('');setZone('');setRegion('');setTour('');setClimb('');setTag('');setCountry('');setCategory('');setSort('recommended');}
  return <JourneyShell>
    <SearchBackdrop/>
    <div className="container catalog-page">
      {zone||region||tour||climb||country||category||kind?<header className="collection-context"><p className="eyebrow">FIND YOUR NEXT JOURNEY</p><h1>{collectionLabel}</h1>{kind&&currentMenu?.intro?<p>{currentMenu.intro}</p>:<p>{kind==='expeditions'?'Explore peak climbs and mountain expeditions. Published CMS journeys appear in the results below.':kind==='tours'?'Explore Nepal’s wildlife, heritage and landscapes at your own pace.':'Browse the routes, then find the pace that feels right for you.'}</p>}</header>:<h1 className="sr-only">Find your trek</h1>}
      {kind==='expeditions'&&!climb&&<nav className="climbing-collections" aria-label="Climbing collections">{climbingTypes.map(type=><Link href={`/treks?kind=expeditions&climb=${type.value}`} key={type.value}><span className="eyebrow">CLIMBING</span><strong>{type.label}</strong><span>{type.value==='peak'?'Explore peak-climbing routes when the team publishes them.':'Explore mountain expeditions and their full route details.'}</span><span className="climbing-collections-arrow" aria-hidden="true">↗</span></Link>)}</nav>}
      <section className="catalog-filter catalog-filter-first" aria-label="Search and filter treks">
        <label className="catalog-search"><span className="sr-only">Search treks and expeditions</span><svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg><input type="search" aria-label="Search treks" placeholder="Search Everest, peak climbing or an easy trek…" value={search} onChange={e=>setSearch(e.target.value)} autoComplete="off"/>{search&&<button type="button" className="catalog-search-clear" aria-label="Clear search" onClick={()=>setSearch('')}>×</button>}</label>
        <div className="catalog-primary-region"><JourneySelect label="Explore a region" value={zone} onChange={value=>{setZone(value);setRegion('');setSearch('');}} options={[{value:'',label:'All Nepal regions'},...nepalZones.map(z=>({value:z.value,label:z.label,detail:z.routes}))]}/></div>
        {showCategories&&<div className="catalog-quick">
          <div className="catalog-kind" role="group" aria-label="Category">{([['','All',geographicallyMatched.length],...menus.map(menu=>[menu.slug,menu.name,countFor(menu.slug)])] as [Kind,string,number][]).map(([value,label,count])=><button type="button" key={value||'all'} aria-pressed={kind===value} onClick={()=>{setKind(value);setTour('');setClimb('');setTag('');setCategory('');}}>{value==='treks'?<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2 16 L7 9 L10 12 L13 7 L18 16Z"/></svg>:value==='expeditions'?<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2 17 L10 3 L18 17Z"/><path d="M10 3 V0.5 M10 0.5 L14 1.8 L10 3" className="flag"/></svg>:null}{label}{!loading&&<span className="catalog-kind-count">{count}</span>}</button>)}</div>
          
        </div>}
        <button type="button" className="catalog-filters-toggle" aria-expanded={filtersOpen} aria-controls="catalog-selects" onClick={()=>setFiltersOpen(!filtersOpen)}>More filters{[duration,grade,tag,...(demo?[]:[budget]),altitude].filter(Boolean).length>0&&<span>{[duration,grade,tag,...(demo?[]:[budget]),altitude].filter(Boolean).length}</span>}<span aria-hidden="true" className="catalog-filters-caret">{filtersOpen?'−':'+'}</span></button>
        <div id="catalog-selects" className={`catalog-selects ${filtersOpen?'is-open':''}`}>{activeZone&&<JourneySelect label={`Within ${activeZone.label}`} value={region} onChange={setRegion} options={[{value:'',label:`All ${activeZone.short} trails`},...activeZone.areas.map(area=>({value:area.query,label:area.label}))]}/>}{currentMenu&&categoryOptions.length>0&&<JourneySelect label={currentMenu.name} value={category} onChange={value=>{setCategory(value);setRegion('');setTour('');}} options={[{value:'',label:`All of ${currentMenu.name}`},...categoryOptions]}/>}{kind==='tours'&&!categoryOptions.length&&<JourneySelect label="Tour style" value={tour} onChange={setTour} options={[{value:'',label:'All tours'},...tourOptions]}/>} {kind==='expeditions'&&<JourneySelect label="Climbing type" value={climb} onChange={value=>setClimb(value as ClimbingType)} options={[{value:'',label:'All climbing'},...climbingTypes]}/>} {showThemes&&<JourneySelect label="Trek themes" value={tag} onChange={setTag} options={[{value:'',label:'All themes'},...editorialTagOptions]}/>}<JourneySelect label={kind==='tours'?'Trip length':'Time on the trail'} value={duration} onChange={setDuration} options={[{value:'',label:'Any duration'},{value:'short',label:'Up to 10 days'},{value:'medium',label:'11–16 days'},{value:'long',label:'17+ days'}]}/><JourneySelect label="Difficulty" value={grade} onChange={setGrade} options={[{value:'',label:'All levels'},...difficultyLevels]}/>{!demo&&<JourneySelect label="Budget · USD" value={budget} onChange={setBudget} options={[{value:"",label:"Any budget"},{value:"under-1500",label:"Under $1,500"},{value:"1500-2500",label:"$1,500–$2,500"},{value:"over-2500",label:"Above $2,500"}]}/>}<JourneySelect label="Maximum altitude" value={altitude} onChange={setAltitude} options={[{value:"",label:"Any altitude"},{value:"under-4000",label:"Below 4,000 m"},{value:"4000-5500",label:"4,000–5,500 m"},{value:"over-5500",label:"Above 5,500 m"}]}/><JourneySelect label="Sort" value={sort} onChange={setSort} options={[{value:'recommended',label:search.trim()?'Best match':'Recommended'},...(!demo?[{value:'price',label:'Price: low to high'}]:[]),{value:'duration',label:'Shortest first'}]}/></div>
      </section>
      <section className="catalog-results catalog-results-live" aria-label="Treks">
        <div className="catalog-results-bar"><p aria-live="polite">{loading?'Loading journeys…':error?'Live journeys unavailable':<><strong>{visible.length}</strong> {visible.length===1?'journey':'journeys'}{search.trim()?<> for “{search.trim()}”</>:filtered?' match your filters':' to explore'}</>}</p>{filtered&&<button type="button" className="text-link clear-filters" onClick={clear}>Clear all ×</button>}</div>{(zone||region||tour||climb||country||category)&&<p className="collection-selection">Browsing: {collectionLabel}</p>}
        {demo&&<p className="sample-notice">Design preview only · These routes are ideas, not confirmed offers. Dates, prices and seats are unavailable. Photos may not depict the named location.</p>}
        {loading?<div className="trip-grid catalogue-grid catalog-skeleton" aria-hidden="true">{[0,1,2].map(i=><div key={i}/>)}</div>:error?<div className="status" role="alert"><p>{error}</p><button className="button green" onClick={()=>void load()}>Try again</button></div>:visible.length?<div className="trip-grid catalogue-grid">{visible.map(trip=><div className="catalog-card-item" key={trip.id}><JourneyCard trip={trip} preview={demo}/><button className="compare-trip" aria-pressed={compared.includes(trip.id)} disabled={!compared.includes(trip.id)&&compared.length>=3} onClick={()=>setCompared(current=>current.includes(trip.id)?current.filter(id=>id!==trip.id):[...current,trip.id])}>{compared.includes(trip.id)?"✓ Added to comparison":"Compare journey +"}</button></div>)}</div>:<div className="status">{kind==='expeditions'&&!countFor('expeditions')?<><h3>No climbing journeys are published yet.</h3><p>Peak climbs and expeditions will appear in their sections after the team adds and publishes them in Trip Management.</p></>:zone&&region&&!search.trim()?<><h3>No published journeys for {areaName||region} yet.</h3><p>This area is ready to browse. Routes will appear when the team publishes them in the CMS. You can ask about a custom trek now.</p></>:zone&&search.trim()?<><h3>No published journeys for {selectedArea||`“${search.trim()}”`} yet.</h3><p>This area link is working, but trek listings for it haven’t been published in the catalogue yet. Ask the team about a custom route or browse all {collectionLabel.toLowerCase()}.</p></>:<><h3>No journeys match{search.trim()?` “${search.trim()}”`:''} yet.</h3><p>Try a shorter search or fewer filters. The team can also plan a route just for you.</p></>}<div className="button-row"><button className="button green" onClick={clear}>Show all journeys</button>{zone&&search.trim()&&<Link className="button green" href={`/treks?kind=treks&zone=${zone}`}>Browse all {collectionLabel.toLowerCase()} ↗</Link>}<Link className="button gold" href="/contact">Ask the team ↗</Link></div></div>}
      </section>
      {showClimbingPreview&&<section className="climbing-preview" aria-label="Expedition design examples"><div className="section-heading"><div><p className="eyebrow">LOCAL DESIGN PREVIEW</p><h2>Everest & Annapurna expedition ideas</h2><p>These two examples are here to shape the climbing pages. Their duration is illustrative; no route, price, date, seats or summit plan is confirmed. Copy either into a CMS draft to replace the placeholders.</p></div></div><div className="trip-grid catalogue-grid">{expeditionPreviewTrips.map(trip=><JourneyCard key={trip.id} trip={trip} preview/>)}</div></section>}
      <section className="catalog-tailor"><div><p className="eyebrow">YOUR DATES, YOUR TRAIL</p><h2>Want to make it your own?</h2><p>Start with a route you like, then tell us the places, pace and dates that suit you.</p></div><Link className="button gold" href="/tailor-made">Plan a tailor-made trip ↗</Link></section>
      {compared.length>0&&<section className="trip-comparison" aria-label="Compare selected journeys"><div className="section-heading"><div><p className="eyebrow">SIDE BY SIDE</p><h2>Compare your journeys.</h2><p>Choose up to three routes.{demo?' These are design previews, not bookable offers.':''}</p></div><button className="text-link" onClick={()=>setCompared([])}>Clear comparison ×</button></div><div className="comparison-scroll"><table><caption className="sr-only">Journey duration, difficulty and altitude comparison</caption><thead><tr><th scope="col">Journey details</th>{items.filter(t=>compared.includes(t.id)).map(t=><th scope="col" key={t.id}>{t.title}</th>)}</tr></thead><tbody>{(demo?['Duration','Difficulty','Maximum altitude']:['Duration','Difficulty','Maximum altitude','Starting price']).map((label,i)=><tr key={label}><th scope="row">{label}</th>{items.filter(t=>compared.includes(t.id)).map(t=><td key={t.id}>{[`${t.duration_days} ${t.duration_days===1?'day':'days'}`,difficulty(t.difficulty_grade),t.altitude_max_meters?`${t.altitude_max_meters.toLocaleString()} m`:'Not applicable',`${money(t.starting_price_usd)} USD / person`][i]}</td>)}</tr>)}</tbody></table></div></section>}
    </div>
  </JourneyShell>;
}
