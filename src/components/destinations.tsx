'use client';
import Link from 'next/link';
import {destinationHref} from '@/lib/links';
import {useEffect,useState} from 'react';
import {asset} from '@/lib/assets';
import {regions as defaultRegions} from '@/lib/destinations';
import type {Region} from '@/lib/destination-content';
import type {Trip} from '@/lib/catalog';
import SiteHeader from './site-header';
import SiteFooter from './site-footer';
import DestinationJourneys from './destination-journeys';
import JourneySelect from './journey-select';
import InquiryDialog from './inquiry-dialog';
import DestinationScope from './destination-scope';
import Breadcrumbs from './breadcrumbs';

function Arrow(){return <img className="icon" src={asset('heroContext-imgSvg')} alt="" width="18" height="18"/>;}
export default function Destinations({regions=defaultRegions,journeyDestinations,cover,title,description}:{regions?:readonly Region[];/** Destinations whose journeys are listed; defaults to the regions shown. */journeyDestinations?:string[];cover?:string;title?:string;description?:string}){
  const [region,setRegion]=useState(''),[search,setSearch]=useState('');
  const [inquiry,setInquiry]=useState<string|null>(null);
  const [trips,setTrips]=useState<Trip[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[demo,setDemo]=useState(true);
  async function load(){setLoading(true);setError('');try{const r=await fetch('/api/trips');const body=await r.json();if(!r.ok)throw new Error(body.error);setTrips(body.trips);setDemo(body.demo);}catch(e){setError(e instanceof Error?e.message:'Unable to load journeys.');}finally{setLoading(false);}}
  useEffect(()=>{window.scrollTo({top:0,behavior:'instant'});void load();const observer=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('photos-in-view',e.isIntersecting)));document.querySelectorAll('.story-photos').forEach(el=>observer.observe(el));return()=>observer.disconnect();},[]);
  const visible=regions.filter(r=>(!region||r.slug===region)&&(!search||`${r.name} ${r.highlights} ${r.description}`.toLowerCase().includes(search.toLowerCase().trim())));
  const journeySlugs=new Set(journeyDestinations||regions.map(r=>r.slug));
  const journeys=trips.filter(trip=>journeySlugs.has(trip.destination_slug));
  function reset(){setRegion('');setSearch('');}
  return <>
    <a className="skip-link" href="#dest-main">Skip to content</a><SiteHeader page="destinations" onPlan={()=>setInquiry('Nepal')}/>
    <main id="dest-main" className="dest-page">
      <section className="dest-hero"><img className="dest-hero-photo" src={cover||"/images/trek-memories/mountain-amphitheatre.jpg"} width="2048" height="1536" alt="A clear blue sky above a snow-covered mountain amphitheatre in Nepal" fetchPriority="high"/><div className="dest-hero-shade"/><div className="container dest-hero-copy"><Breadcrumbs tone="light" items={[{label:'Destinations',href:'/destinations'},{label:'Nepal'}]}/><p className="eyebrow">NEPAL · SACRED SANCTUARIES & HIGH TRAILS</p><h1>{title||"Nepal"}<br/><em>Feel the Himalaya.</em></h1><p>{description||"Quiet valleys. Legendary peaks. A thousand ways to feel alive."}</p><div className="region-pills" role="group" aria-label="Quick region selection"><button aria-pressed={!region} onClick={()=>setRegion('')}>All Nepal</button>{regions.map(r=><button key={r.slug} aria-pressed={region===r.slug} onClick={()=>{setRegion(r.slug);setSearch('');document.getElementById('region-finder')?.scrollIntoView({behavior:'smooth'});}}>{r.short}</button>)}</div></div><div className="dest-hero-foot"><span>BEYOND THE HORIZON</span><span>27°N · 86°E / NEPAL</span></div></section>
      <div className="container dest-content">
        <DestinationScope/>
        <section className="region-finder" id="region-finder" aria-label="Find a destination"><div className="finder-title"><h2>Find a region</h2></div><div className="region-controls"><JourneySelect label="Region" value={region} onChange={setRegion} options={[{value:'',label:'All Nepal',detail:'Explore every region'},...regions.map(r=>({value:r.slug,label:r.name,detail:r.style,image:asset(r.image)}))]}/><label className="region-search"><span className="field-label">Something in mind?</span><input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Try Gokyo or Mustang" aria-label="Search destinations"/></label></div></section>
        <section className="sanctuaries section"><div className="sanctuary-heading"><h2>{regions.length} {regions.length===1?'region':'regions'} in Nepal</h2></div><div className="region-results"><p aria-live="polite">{visible.length} {visible.length===1?'region':'regions'} to explore</p>{(region||search)&&<button className="text-link" onClick={reset}>Clear filters ×</button>}</div>
          {visible.length?<div className="sanctuary-grid">{visible.map(r=><article className="sanctuary-card" key={r.slug}><div className="sanctuary-image"><img src={asset(r.image)} alt={`Mountain landscape of ${r.name}`} loading="lazy"/><span className="sanctuary-tag">{r.tag}</span><div><span>REGION {String(regions.indexOf(r)+1).padStart(2,'0')}</span><h3><Link href={destinationHref(r.id)}>{r.name} ↗</Link></h3></div></div><div className="sanctuary-body">{r.title&&<h4>{r.title}</h4>}{r.description&&<p>{r.description}</p>}{(r.style||r.base)&&<dl>{r.style&&<div><dt>Trail character</dt><dd>{r.style}</dd></div>}{r.base&&<div><dt>Along the way</dt><dd>{r.base}</dd></div>}</dl>}<div className="sanctuary-action">{r.highlights&&<span>{r.highlights}</span>}<Link href={destinationHref(r.id)}>See treks and expeditions <Arrow/></Link></div></div></article>)}</div>:<div className="status"><h3>No regions match just yet.</h3><p>Try a different region or a broader search.</p><button className="button green" onClick={reset}>Explore all regions</button></div>}
        </section>
      </div>
      
      <section className="section container" id="region-journeys"><div className="section-heading"><div><h2>Treks and expeditions in Nepal</h2></div><Link href="/treks" className="text-link">View all journeys <Arrow/></Link></div>
        {loading?<p className="status" role="status">Finding your next adventure…</p>:error?<div className="status" role="alert"><p>{error}</p><button className="button green" onClick={()=>void load()}>Try again</button></div>:<DestinationJourneys trips={journeys} place="Nepal"/>}
      </section>
      
      
    </main>
    <SiteFooter/>
    {inquiry!==null&&<InquiryDialog journey={inquiry} onClose={()=>setInquiry(null)}/>}
  </>;
}
