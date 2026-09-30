'use client';
import Link from 'next/link';
import {destinationHref} from '@/lib/links';
import {useEffect,useState} from 'react';
import {asset} from '@/lib/assets';
import {regions as defaultRegions} from '@/lib/destinations';
import type {Region} from '@/lib/destination-content';
import type {Trip} from '@/lib/catalog';
import {nepalZones,zoneForPlace} from '@/lib/nepal-zones';
import SiteHeader from './site-header';
import SiteFooter from './site-footer';
import DestinationJourneys from './destination-journeys';
import JourneySelect from './journey-select';
import InquiryDialog from './inquiry-dialog';
import DestinationScope from './destination-scope';
import Breadcrumbs from './breadcrumbs';

function Arrow(){return <img className="icon" src={asset('heroContext-imgSvg')} alt="" width="18" height="18"/>;}
export default function Destinations({regions=defaultRegions,journeyDestinations,cover,title,description}:{regions?:readonly Region[];/** Destinations whose journeys are listed; defaults to the regions shown. */journeyDestinations?:string[];cover?:string;title?:string;description?:string}){
  const [zone,setZone]=useState(''),[region,setRegion]=useState(''),[search,setSearch]=useState('');
  const [inquiry,setInquiry]=useState<string|null>(null);
  const [trips,setTrips]=useState<Trip[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[demo,setDemo]=useState(true);
  async function load(){setLoading(true);setError('');try{const r=await fetch('/api/trips');const body=await r.json();if(!r.ok)throw new Error(body.error);setTrips(body.trips);setDemo(body.demo);}catch(e){setError(e instanceof Error?e.message:'Unable to load journeys.');}finally{setLoading(false);}}
  useEffect(()=>{window.scrollTo({top:0,behavior:'instant'});void load();const observer=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('photos-in-view',e.isIntersecting)));document.querySelectorAll('.story-photos').forEach(el=>observer.observe(el));return()=>observer.disconnect();},[]);
  const visible=regions.filter(r=>(!zone||zoneForPlace(`${r.slug} ${r.name}`)===zone)&&(!region||r.slug===region)&&(!search||`${r.name} ${r.highlights} ${r.description}`.toLowerCase().includes(search.toLowerCase().trim())));
  const journeySlugs=new Set(journeyDestinations||regions.map(r=>r.slug));
  const journeys=trips.filter(trip=>journeySlugs.has(trip.destination_slug));
  function reset(){setZone('');setRegion('');setSearch('');}
  return <>
    <a className="skip-link" href="#dest-main">Skip to content</a><SiteHeader page="destinations" onPlan={()=>setInquiry('Nepal')}/>
    <main id="dest-main" className="dest-page">
      <section className="dest-hero"><img className="dest-hero-photo" src={cover||"/images/trek-memories/mountain-amphitheatre.jpg"} width="2048" height="1536" alt="A clear blue sky above a snow-covered mountain amphitheatre in Nepal" fetchPriority="high"/><div className="dest-hero-shade"/><div className="container dest-hero-copy"><Breadcrumbs tone="light" items={[{label:'Destinations',href:'/destinations'},{label:'Nepal'}]}/><p className="eyebrow">NEPAL · SACRED SANCTUARIES & HIGH TRAILS</p><h1>{title||"Nepal"}<br/><em>Feel the Himalaya.</em></h1><p>{description||"Quiet valleys. Legendary peaks. A thousand ways to feel alive."}</p><div className="region-pills" role="group" aria-label="Quick Nepal area selection"><button aria-pressed={!zone} onClick={()=>{setZone('');setRegion('');}}>All Nepal</button>{nepalZones.map(area=><button key={area.value} aria-pressed={zone===area.value} onClick={()=>{setZone(area.value);setRegion('');setSearch('');document.getElementById('region-finder')?.scrollIntoView({behavior:'smooth'});}}>{area.short}</button>)}</div></div><div className="dest-hero-foot"><span>BEYOND THE HORIZON</span><span>27°N · 86°E / NEPAL</span></div></section>
      <div className="container dest-content">
        <DestinationScope/>
        <section className="section nepal-region-overview" aria-labelledby="nepal-regions-title">
          <div className="section-heading"><div><p className="eyebrow">FIVE TREKKING REGIONS · ONE HIMALAYAN HOME</p><h2 id="nepal-regions-title">Explore Nepal, region by region.</h2></div></div>
          <div className="home-region-grid">{nepalZones.map(area=>{
            const areas=regions.filter(r=>zoneForPlace(`${r.slug} ${r.name}`)===area.value);
            const photoNote='photoNote' in area?area.photoNote:'';
            return <article className="home-region-card" key={area.value}>
              <img src={asset(area.image)} alt={photoNote?`Illustrative Nepal mountain scenery; not verified as a view from ${area.label}`:`${area.label}: ${area.routes}`} loading="lazy"/>
              <div><h3>{area.label}</h3><p>{area.intro}</p>
                <p className="nepal-region-highlights"><strong>Highlights</strong> · {area.highlights.join(' · ')}</p>
                {photoNote&&<p className="nepal-region-photo-note">{photoNote}</p>}
                {areas.length>0&&<p>{areas.map(r=>r.name).join(' · ')}</p>}
                <ul className="nepal-region-areas" aria-label={`${area.label} trekking areas`}>{area.areas.map(subregion=><li key={subregion.label}><Link href={`/treks?kind=treks&zone=${area.value}&q=${encodeURIComponent(subregion.query)}`}>{subregion.label}<span aria-hidden="true"> ↗</span></Link></li>)}</ul>
                <Link className="text-link" href={`/treks?kind=treks&zone=${area.value}`}>Explore {area.short} treks ↗</Link>
              </div>
            </article>;
          })}</div>
        </section>
        <section className="region-finder" id="region-finder" aria-label="Find a destination"><div className="finder-title"><h2>Find your area</h2></div><div className="region-controls"><JourneySelect label="Nepal area" value={zone} onChange={value=>{setZone(value);setRegion('');}} options={[{value:'',label:'Across Nepal',detail:'Explore every area'},...nepalZones.map(area=>({value:area.value,label:area.label,detail:area.routes}))]}/><JourneySelect label="Trekking area" value={region} onChange={setRegion} options={[{value:'',label:'All trekking areas'},...regions.filter(r=>!zone||zoneForPlace(`${r.slug} ${r.name}`)===zone).map(r=>({value:r.slug,label:r.name,detail:r.style,image:asset(r.image)}))]}/><label className="region-search"><span className="field-label">Something in mind?</span><input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Try Gokyo or Mustang" aria-label="Search destinations"/></label></div></section>
        <section className="sanctuaries section"><div className="sanctuary-heading"><h2>{zone?nepalZones.find(area=>area.value===zone)?.label:'Explore Nepal by area'}</h2></div><div className="region-results"><p aria-live="polite">{visible.length} {visible.length===1?'trekking area':'trekking areas'} to explore</p>{(zone||region||search)&&<button className="text-link" onClick={reset}>Clear filters ×</button>}</div>
          {visible.length?<div className="sanctuary-grid">{visible.map(r=><article className="sanctuary-card" key={r.slug}><div className="sanctuary-image"><img src={asset(r.image)} alt={`Mountain landscape of ${r.name}`} loading="lazy"/><span className="sanctuary-tag">{r.tag}</span><div><span>{nepalZones.find(area=>area.value===zoneForPlace(`${r.slug} ${r.name}`))?.label||'NEPAL'}</span><h3><Link href={destinationHref(r.id)}>{r.name} ↗</Link></h3></div></div><div className="sanctuary-body">{r.title&&<h4>{r.title}</h4>}{r.description&&<p>{r.description}</p>}{(r.style||r.base)&&<dl>{r.style&&<div><dt>Trail character</dt><dd>{r.style}</dd></div>}{r.base&&<div><dt>Along the way</dt><dd>{r.base}</dd></div>}</dl>}<div className="sanctuary-action">{r.highlights&&<span>{r.highlights}</span>}<Link href={destinationHref(r.id)}>See treks and expeditions <Arrow/></Link></div></div></article>)}</div>:<div className="status"><h3>{zone?'No published destination in this area yet.':'No areas match just yet.'}</h3><p>{zone?'Our team can plan a route here while the destination guide is being prepared.':'Try another area or a broader search.'}</p><div className="button-row"><button className="button green" onClick={reset}>Explore all Nepal</button>{zone&&<Link className="button gold" href={`/treks?kind=treks&zone=${zone}`}>Browse journeys ↗</Link>}</div></div>}
        </section>
      </div>
      
      <section className="section container" id="region-journeys"><div className="section-heading"><div><h2>Treks and expeditions in Nepal</h2></div><Link href="/treks" className="text-link">View all journeys <Arrow/></Link></div>
        {loading?<p className="status" role="status">Finding your next adventure…</p>:error?<div className="status" role="alert"><p>{error}</p><button className="button green" onClick={()=>void load()}>Try again</button></div>:<DestinationJourneys trips={journeys} place="Nepal" preview={demo}/>}
      </section>
      
      
    </main>
    <SiteFooter/>
    {inquiry!==null&&<InquiryDialog journey={inquiry} onClose={()=>setInquiry(null)}/>}
  </>;
}
