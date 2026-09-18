'use client';

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { asset } from '@/lib/assets';
import { filterTrips, type Trip } from '@/lib/catalog';
import JourneySelect from './journey-select';
import TrekFilm from './trek-film';
import SiteHeader from './site-header';
import SiteFooter from './site-footer';
import JourneyCard from './journey-card';
import InquiryForm from './inquiry-form';
import {journalPosts} from '@/lib/editorial-content';

function Icon({name='heroContext-imgSvg',className=''}:{name?:string;className?:string}) {return <img className={`icon ${className}`} src={asset(name)} width="18" height="18" alt="" />;}
function Eyebrow({children}:{children:ReactNode}) {return <p className="eyebrow"><span />{children}</p>;}
function Photo({name,alt,className=''}:{name:string;alt:string;className?:string}) {return <img src={asset(name)} alt={alt} className={className} loading="lazy" />;}
const destinations = [
  {name:'Everest & Khumbu',slug:'everest',image:'222-78-imgNepalEverestBaseCampAndAmaDablamPeak',tag:'FLAGSHIP SANCTUARY',description:'Everest Base Camp · Gokyo Ri · Cho La · Ama Dablam'},
  {name:'Annapurna & Mustang',slug:'annapurna',image:'222-78-imgAnnapurnaRangeAndHighGlacialLakesNepal',tag:'GLACIAL LAKES & ANCIENT CAVES',description:'Thorong La Pass · Tilicho Lake · Upper Mustang · Poon Hill'},
  {name:'Manaslu & Langtang',slug:'manaslu',image:'222-78-imgManasluAndLangtangSacredValleyPeaksNepal',tag:'WILD CIRCUIT & SACRED VALLEYS',description:'Larkya La · Tsum Valley · Kyanjin Gompa · Gosaikunda'},
];
const articles=journalPosts.map(p=>({...p,tag:p.category,date:p.reading+' read'}));

export default function Home() {

  const [filmOpen,setFilmOpen]=useState(false);

  const [activeSection,setActiveSection]=useState('home');
  const [category,setCategory]=useState('treks');
  const [destination,setDestination]=useState('');
  const [duration,setDuration]=useState('');
  const [season,setSeason]=useState('Autumn (Oct – Dec)');
  const [party,setParty]=useState('2 trekkers');
  const [catalog,setCatalog]=useState<Trip[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [filters,setFilters]=useState({destination:'',category:'',duration:''});
  const [searched,setSearched]=useState(false);
  const [modal,setModal]=useState<{kind:'inquiry'|'article'|'info';title:string;message?:string}|null>(null);
  const dialog=useRef<HTMLDialogElement>(null);
  const lastFocus=useRef<HTMLElement|null>(null);

  async function loadCatalog() {
    setLoading(true);setError('');
    try {const response=await fetch('/api/trips');const data=await response.json();if(!response.ok) throw new Error(data.error);setCatalog(data.trips);}
    catch(e){setError(e instanceof Error?e.message:'Could not load journeys.');}
    finally {setLoading(false);}
  }
  useEffect(()=>{void loadCatalog();const onScroll=()=>{

    const sections=['home','destinations','about','journeys','journal','contact'];
    const current=sections.filter(id=>(document.getElementById(id)?.getBoundingClientRect().top??Infinity)<=180).at(-1);
    setActiveSection(current||'home');
  };onScroll();window.addEventListener('scroll',onScroll,{passive:true});
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:0.08});
    document.querySelectorAll('.reveal').forEach(el=>{el.classList.add('will-reveal');observer.observe(el);});
    const photos=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('photos-in-view',entry.isIntersecting)),{threshold:0.1});
    document.querySelectorAll('.story-photos,.collage').forEach(el=>photos.observe(el));
    return ()=>{window.removeEventListener('scroll',onScroll);observer.disconnect();photos.disconnect();};
  },[]);
  useEffect(()=>{if(modal){lastFocus.current=document.activeElement as HTMLElement;dialog.current?.showModal();document.body.style.overflow='hidden';}else{dialog.current?.close();document.body.style.overflow='';lastFocus.current?.focus();}return ()=>{document.body.style.overflow='';};},[modal]);
  function openInquiry(title='Plan your Himalayan journey',message='') {setModal({kind:'inquiry',title,message});}
  function chooseDestination(slug:string) {setDestination(slug);setCategory('treks');setDuration('');setFilters({destination:slug,category:'',duration:''});setSearched(true);document.getElementById('journeys')?.scrollIntoView({behavior:'smooth'});}
  function search(event:FormEvent) {event.preventDefault();setFilters({destination,category,duration});setSearched(true);document.getElementById('journeys')?.scrollIntoView({behavior:'smooth'});}
  const visible=filterTrips(catalog,filters.destination,filters.category,filters.duration);
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <SiteHeader activeSection={activeSection} onPlan={()=>openInquiry()} />
    <main id="main">
      <section className="hero" id="home">
        <img className="hero-image" src="/images/trek-memories/a-pause-on-the-ridge.jpg" width="2048" height="1536" alt="Trekkers resting on a ridge beneath clear Himalayan snow peaks" fetchPriority="high" />
        <div className="hero-shade" />
        <div className="container hero-content"><Eyebrow>Nepal, one extraordinary step at a time</Eyebrow><h1>Beyond the<br/><em>Horizon.</em></h1><p className="hero-description">Walk beneath the world’s highest peaks.<br/>Find connection in its quietest places.<br/><strong>This is Nepal. This is your journey.</strong></p><div className="hero-buttons"><button className="button gold" onClick={()=>openInquiry()}>Plan My Journey <Icon /></button><button className="explore-link" onClick={()=>setFilmOpen(true)}><span className="play"><Icon name="heroContext-imgSvg1" /></span><span>Explore Treks<small>A glimpse of the Himalaya</small></span></button></div></div>
        <div className="hero-caption"><span className="caption-line" /><div><strong>A world above the ordinary.</strong><span>The Himalayas, Nepal</span></div><a href="#planner" aria-label="Discover your journey">↓</a></div>
      </section>
      <section id="planner" className="planner container" aria-label="Find your journey">
        <div className="planner-heading"><div><span className="planner-kicker">THE MOUNTAINS ARE CALLING</span><h2>Where will your story begin?</h2></div><span>Made for your pace. Shaped by Nepal.</span></div>
        <div className="planner-tabs" role="group" aria-label="Journey type">{['Treks','Tours','Activities','Expeditions'].map((name,i)=><button key={name} aria-pressed={category===name.toLowerCase()} className={category===name.toLowerCase()?'active':''} onClick={()=>setCategory(name.toLowerCase())}><Icon name={`222-636-imgSvg${i||''}`} />{name}</button>)}</div>
        <form className="search-form" onSubmit={search}>
          <JourneySelect label="Destination / Region" value={destination} onChange={setDestination} options={[{value:'',label:'All Himalayan regions',detail:'Let the mountains inspire you',image:asset('heroContext-imgHimalayanAlpineSunriseWithPrayerFlagsAndSnowPeaks')},...destinations.map(d=>({value:d.slug,label:d.name,detail:d.description,image:asset(d.image)}))]} />
          <JourneySelect label="Season Window" value={season} onChange={setSeason} options={[{value:'Autumn (Oct – Dec)',label:'Autumn',detail:'Oct – Dec · Clear mountain skies'},{value:'Spring (Mar – May)',label:'Spring',detail:'Mar – May · Rhododendron trails'},{value:'Winter (Jan – Feb)',label:'Winter',detail:'Jan – Feb · Quiet, crisp days'},{value:'Summer (Jun – Sep)',label:'Summer',detail:'Jun – Sep · Rain-shadow escapes'}]} />
          <JourneySelect label="Duration" value={duration} onChange={setDuration} options={[{value:'',label:'Time to explore',detail:'I’m open to the possibilities'},{value:'short',label:'Up to 10 days',detail:'A shorter mountain escape'},{value:'medium',label:'11–16 days',detail:'Time for the classic trails'},{value:'long',label:'17+ days',detail:'Go deeper into the Himalaya'}]} />
          <JourneySelect label="Expedition Party" value={party} onChange={setParty} options={[{value:'Solo traveller',label:'Just me',detail:'One traveller, endless possibility'},{value:'2 trekkers',label:'Two travellers',detail:'An adventure to share'},{value:'3–6 trekkers',label:'A small group',detail:'3–6 friends on the trail'},{value:'7+ trekkers',label:'A bigger adventure',detail:'7+ travellers, planned together'}]} />
          <button className="button gold" type="submit"><Icon name="222-636-imgSvg4" />Explore Journeys</button>
        </form>
      </section>
      <section className="trust container reveal" aria-label="Our approach">{[['Rooted in Nepal','Local knowledge, personal connections'],['Your pace matters','Thoughtful days on the mountain'],['People before peaks','Respect for our mountain communities'],['Tread a little lighter','Care for the places we call home']].map(([title,text],i)=><div key={title}><span className="trust-icon"><Icon name={`222-3-imgSvg${i||''}`} /></span><h3>{title}</h3><p>{text}</p></div>)}</section>
      <section className="destinations container section reveal" id="destinations"><div className="destination-intro"><Eyebrow>Sacred sanctuaries</Eyebrow><h2>Where Will You Go Beyond The Horizon?</h2><p>From the soaring 8,000-metre giants of the Khumbu to pristine glacial sanctuaries and ancient high valleys, explore the authentic heart of Nepal where legends are carved into stone.</p><a className="button green compact" href="/destinations">View All Sanctuaries <Icon name="222-78-imgSvg" /></a></div><div className="destination-grid">{destinations.map((d,i)=><button className="destination-card" onClick={()=>chooseDestination(d.slug)} key={d.slug}><Photo name={d.image} alt={d.name+' mountain landscape'} /><span className={`badge ${i===0?'gold':''}`}>{d.tag}</span><span className="destination-copy"><strong>{d.name}</strong><span>{d.description}</span></span><span className="destination-arrow"><Icon name="222-78-imgSvg1" /></span></button>)}</div></section>
      <section id="about" className="story section"><div className="container story-grid reveal"><div><Eyebrow>Rooted in the Himalaya</Eyebrow><h2>More Than a Trek,<br/>It’s a Life Experience<br/><em>Beyond the Horizon.</em></h2><p>We honor high-altitude reverence: unhurried acclimatization curves, respectful village homestays, and elite Sherpa guides whose families have traversed these ridgelines for generations. No rushed itineraries, no compromises on altitude safety.</p><div className="story-values"><span>Local knowledge</span><span>Thoughtful journeys</span><span>Shared adventure</span></div><a className="button gold" href="/about">Discover Our Story <Icon /></a></div><div className="story-photos"><figure><Photo name="222-370-imgTrekkersSmilingWithHimalayanSnowPeaksBackground" alt="A trekking group together beneath the Himalayas" /><figcaption>Memories beyond the horizon</figcaption></figure><figure><Photo name="222-370-imgTibetanPrayerFlagsFlyingOnMountainRidge" alt="Prayer flags across a Himalayan ridge" /><figcaption>Rooted in the mountains</figcaption></figure></div></div></section>
      <section className="section container" id="journeys"><div className="section-heading reveal"><div><Eyebrow>Handpicked expeditions</Eyebrow><h2>{searched?'Find Your Himalayan Journey':'Featured Himalayan Journeys'}</h2></div><a className="text-link" href="/treks">View All Journeys <Icon /></a></div>
        <p className="catalog-note">Journey catalog from Dreamscape Treks.{searched&&` Planning for ${party} · ${season}. Season availability is confirmed by the team.`}</p>
        {loading?<p className="status" role="status">Finding your next adventure…</p>:error?<div className="status" role="alert"><p>{error}</p><button className="button green" onClick={()=>void loadCatalog()}>Try again</button></div>:visible.length===0?<div className="status"><h3>No journeys match these filters yet.</h3><p>Try another region or ask us to tailor a journey for you.</p><button className="button gold" onClick={()=>openInquiry('Create a custom journey',`I’m interested in ${category} for ${party} in ${season}.`)}>Build My Journey <Icon /></button></div>:<div className="trip-grid">{visible.map(trip=><JourneyCard key={trip.slug} trip={trip}/>)}</div>}
      </section>
      <section className="inspiration section"><div className="container inspiration-grid reveal"><div><Eyebrow>Alpine inspiration</Eyebrow><h2>Explore, Discover,<br/>Experience Beyond The Horizon</h2><p>Whether you dream of a remote ridge trek through Kangchenjunga or a luxury helitour over Everest, our mountain architects curate custom private itineraries mapped to your exact pace, interests, and comfort level.</p><div className="button-row"><a className="button green" href="#journal">Explore Travel Guides <Icon name="222-370-imgSvg" /></a><button className="button gold" onClick={()=>openInquiry()}>Build My Journey <Icon /></button></div></div><div className="collage">{[['222-370-imgTibetanPrayerFlagsFlyingOnMountainRidge','Prayer Flags · Renjo La'],['222-370-imgHimalayanMountainPassTrekkerReflection','Trekker at 5,000m'],['222-370-imgTrekkersSmilingWithHimalayanSnowPeaksBackground','Summit Dreams Realized']].map(([image,caption])=><figure key={image}><Photo name={image} alt={caption} /><figcaption>{caption}</figcaption></figure>)}</div></div></section>
      <section className="testimonials section"><div className="container reveal"><Eyebrow>The people behind the journeys</Eyebrow><h2>Every Journey Leaves a Story.</h2><p className="review-home-copy">The views bring us here. The experiences we share are what stay with us. Explore published traveller stories, or add a memory of your own.</p><a href="/reviews" className="button green">Read Traveller Stories ↗</a></div></section>
      <section className="section container reveal" id="journal"><div className="section-heading"><div><Eyebrow>From our past treks</Eyebrow><h2>Some trails stay with you.</h2></div><a className="text-link" href="/blog">Explore the journal ↗</a></div><div className="article-grid">{articles.map(article=><article className="article-card" key={article.title}><Photo name={article.image} alt={article.title} /><div><p className="article-tag">{article.tag}</p><h3>{article.title}</h3><p className="home-story-excerpt">{article.excerpt}</p><p className="article-date">{article.date}</p><a className="text-link" href={`/blog/${article.slug}`}>Read Story <Icon name="222-465-imgSvg" /></a></div></article>)}</div></section>
      <section className="newsletter-section section"><div className="newsletter container reveal"><Photo name="222-520-imgHimalayanAlpineLakeAndPeaks" alt="A still alpine lake reflecting Himalayan peaks" /><div className="newsletter-content"><Eyebrow>Himalayan dispatch</Eyebrow><h2>Stories for the<br/>Journey Ahead.</h2><p>Make room for a different perspective. Explore field notes, thoughtful journeys and the moments that stay with us.</p><a className="button gold" href="/blog">Explore the Journal <Icon /></a></div></div></section>
    </main>
    {filmOpen&&<TrekFilm onClose={()=>setFilmOpen(false)} onExplore={()=>{setFilmOpen(false);document.getElementById('journeys')?.scrollIntoView({behavior:'smooth'});}} />}
    <SiteFooter/>
    <dialog ref={dialog} onCancel={()=>setModal(null)} onClick={e=>{if(e.target===e.currentTarget)setModal(null);}} aria-labelledby="dialog-title"><div className="dialog-inner"><button className="close-dialog" aria-label="Close dialog" onClick={()=>setModal(null)}>×</button><Eyebrow>Dreamscape Treks</Eyebrow><h2 id="dialog-title">{modal?.title}</h2>
      {modal?.kind==='inquiry'?<InquiryForm initialMessage={modal.message}/>:<><p className="dialog-description">{modal?.message}</p><button className="button green" onClick={()=>openInquiry('Ask the Dreamscape team',`I would like to know more about ${modal?.title}.`)}>Ask the Team <Icon /></button></>}
    </div></dialog>
  </>;
}



