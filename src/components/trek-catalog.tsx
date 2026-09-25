'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import JourneyShell from './journey-shell';
import JourneySelect from './journey-select';
import JourneyCard from './journey-card';
import {asset} from '@/lib/assets';
import {filterTrips,trips as sampleTrips,type Trip} from '@/lib/catalog';
import {difficulty} from '@/lib/format';

export default function TrekCatalog() {
  const params=useSearchParams();
  const [region,setRegion]=useState(params.get('region')||''),[duration,setDuration]=useState(''),[grade,setGrade]=useState(''),[search,setSearch]=useState(params.get('q')||''),[sort,setSort]=useState('recommended');
  const [items,setItems]=useState<Trip[]>([]),[demo,setDemo]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState('');
  async function load(){setLoading(true);setError('');try{const r=await fetch('/api/trips');const data=await r.json();if(!r.ok)throw new Error(data.error);setItems(data.trips.length?data.trips:sampleTrips);setDemo(data.demo||!data.trips.length);}catch(e){setError(e instanceof Error?e.message:'Unable to load journeys.');}finally{setLoading(false);}}
  useEffect(()=>{void load();},[]);
  const regions=Array.from(new Map(items.map(t=>[t.destination_slug,t.destination_name])).entries());
  const grades=Array.from(new Set(items.map(t=>t.difficulty_grade)));
  const visible=filterTrips(items,region,'',duration).filter(t=>(!grade||t.difficulty_grade===grade)&&`${t.title} ${t.destination_name}`.toLowerCase().includes(search.trim().toLowerCase())).sort((a,b)=>sort==='price'?Number(a.starting_price_usd)-Number(b.starting_price_usd):sort==='duration'?a.duration_days-b.duration_days:0);
  function clear(){setRegion('');setDuration('');setGrade('');setSearch('');setSort('recommended');}
  return <JourneyShell>
    <section className="catalog-hero"><img src="/images/trek-memories/mountain-amphitheatre.jpg" alt="Snow-covered mountains beneath a clear Himalayan sky" fetchPriority="high"/><div className="container"><p className="eyebrow">NEPAL, ONE FOOTSTEP AT A TIME</p><h1>Your trail.<br/><em>Your kind of extraordinary.</em></h1><p>High passes or quiet valleys. A familiar dream or a new direction.<br/>Find a journey that feels like you.</p><span className="hero-coordinate">BEYOND THE HORIZON / THE JOURNEY COLLECTION</span></div></section>
    <div className="container">
      <section className="catalog-filter" aria-label="Filter treks"><label className="catalog-search"><span className="sr-only">Find your next journey</span><svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg><input type="search" aria-label="Search treks" placeholder="Try Everest, Mustang or Manaslu…" value={search} onChange={e=>setSearch(e.target.value)}/></label>
        <div className="catalog-suggestions" aria-label="Suggested regions">{['Everest','Annapurna','Mustang','Manaslu'].map(place=><button key={place} aria-pressed={search===place} onClick={()=>setSearch(search===place?'':place)}>{place}<span aria-hidden="true"> ↗</span></button>)}</div>
        <div className="catalog-selects"><JourneySelect label="Region" value={region} onChange={setRegion} options={[{value:'',label:'All Himalayan regions'},...regions.map(([value,label])=>({value,label}))]}/><JourneySelect label="Time on the trail" value={duration} onChange={setDuration} options={[{value:'',label:'Any duration'},{value:'short',label:'Up to 10 days'},{value:'medium',label:'11–16 days'},{value:'long',label:'17+ days'}]}/><JourneySelect label="Trail difficulty" value={grade} onChange={setGrade} options={[{value:'',label:'All levels'},...grades.map(value=>({value,label:difficulty(value)}))]}/></div>
      </section>
      <section className="section catalog-results"><div className="section-heading"><div><p className="eyebrow">MAKE ROOM FOR ADVENTURE</p><h2>Journeys to remember.</h2><p aria-live="polite">{loading?'Loading journeys…':`${visible.length} ${visible.length===1?'journey':'journeys'} to explore`}</p></div><div className="catalog-sort"><JourneySelect label="Sort journeys" value={sort} onChange={setSort} options={[{value:'recommended',label:'Featured first'},{value:'price',label:'Price: low to high'},{value:'duration',label:'Shortest first'}]}/></div></div>
        {demo&&<p className="sample-notice">Sample routes for exploring the filters · Dates and availability are not confirmed. Ask our team to plan your journey.</p>}{(region||duration||grade||search)&&<button className="text-link clear-filters" onClick={clear}>Clear all filters ×</button>}
        {loading?<p className="status" role="status">Finding your horizon…</p>:error?<div className="status" role="alert"><p>{error}</p><button className="button green" onClick={()=>void load()}>Try again</button></div>:visible.length?<div className="trip-grid catalogue-grid">{visible.map(trip=>demo?<Link className="sample-trek-card" href={`/treks/${trip.slug}`} key={trip.slug}><img src={asset(trip.image||'/images/trek-memories/mountain-amphitheatre.jpg')} alt={trip.title} loading="lazy" width="640" height="420"/><div className="sample-trek-copy"><span>SAMPLE ROUTE · {trip.destination_name}</span><h3>{trip.title}</h3><p>{trip.duration_days} days · {trip.difficulty_grade}</p><span className="text-link">View route details ↗</span></div></Link>:<JourneyCard trip={trip} key={trip.slug}/>)}</div>:<div className="status"><h3>No trails match just yet.</h3><p>Give yourself a little more room to explore.</p><button className="button green" onClick={clear}>Reset filters</button></div>}
      </section>
    </div>
    <section className="journey-invitation container"><span className="eyebrow">A JOURNEY MADE FOR YOU</span><h2>Some trails start<br/><em>with a conversation.</em></h2><p>Share your time, your interests, and the places you keep dreaming about.</p><a href="/contact" className="button gold">Let’s plan your journey ↗</a></section>
  </JourneyShell>;
}
