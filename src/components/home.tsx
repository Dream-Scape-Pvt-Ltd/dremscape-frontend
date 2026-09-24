'use client';

import TrailDrawing from '@/components/trail-drawing';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { asset } from '@/lib/assets';
import { type Trip } from '@/lib/catalog';
import {filterHomeTrips} from '@/lib/home-filters';
import HomeSlideshow from './home-slideshow';
import JourneySelect from './journey-select';
import TrekFilm from './trek-film';
import SiteHeader from './site-header';
import SiteFooter from './site-footer';
import PhotoShowcase from './photo-showcase';
import JourneyCard from './journey-card';
import InquiryForm from './inquiry-form';
import {journalPosts} from '@/lib/editorial-content';

function Icon({name='heroContext-imgSvg',className=''}:{name?:string;className?:string}) {return <img className={`icon ${className}`} src={asset(name)} width="18" height="18" alt="" />;}
function Eyebrow({children}:{children:ReactNode}) {return <p className="eyebrow"><span />{children}</p>;}
function Photo({name,alt,className=''}:{name:string;alt:string;className?:string}) {return <img src={asset(name)} alt={alt} className={className} loading="lazy" />;}
const defaultDestinations = [
  {name:'Everest & Khumbu',slug:'everest',image:'222-78-imgNepalEverestBaseCampAndAmaDablamPeak',tag:'FLAGSHIP SANCTUARY',description:'Everest Base Camp · Gokyo Ri · Cho La · Ama Dablam'},
  {name:'Annapurna & Mustang',slug:'annapurna',image:'222-78-imgAnnapurnaRangeAndHighGlacialLakesNepal',tag:'GLACIAL LAKES & ANCIENT CAVES',description:'Thorong La Pass · Tilicho Lake · Upper Mustang · Poon Hill'},
  {name:'Manaslu & Langtang',slug:'manaslu',image:'222-78-imgManasluAndLangtangSacredValleyPeaksNepal',tag:'WILD CIRCUIT & SACRED VALLEYS',description:'Larkya La · Tsum Valley · Kyanjin Gompa · Gosaikunda'},
];
const defaultArticles=journalPosts.map(p=>({...p,tag:p.category,date:p.reading+' read'}));

export default function Home({destinations=defaultDestinations,articles=defaultArticles,heroImage,heroAlt,heroCaption,heroLocation,destinationCountries={everest:"NEPAL",annapurna:"NEPAL",manaslu:"NEPAL"},finderDestinations='|Anywhere\nnepal|Nepal\nbeyond-nepal|Beyond Nepal',finderDifficulties='|Any difficulty\neasy|Easy\nmoderate|Moderate\nchallenging|Challenging',finderBudgets='|Any budget\nunder-1500|Under $1,500\n1500-2500|$1,500 – $2,500\nover-2500|Above $2,500'}:{destinations?:{name:string;slug:string;image:string;tag:string;description:string}[];articles?:{slug:string;title:string;image:string;tag:string;date:string;excerpt:string}[];heroImage?:string;heroAlt?:string;heroCaption?:string;heroLocation?:string;destinationCountries?:Record<string,string>;finderDestinations?:string;finderDifficulties?:string;finderBudgets?:string}) {

  const [filmOpen,setFilmOpen]=useState(false);

  const [activeSection,setActiveSection]=useState('home');
  const [destination,setDestination]=useState('');
  const [difficulty,setDifficulty]=useState('');
  const [budget,setBudget]=useState('');
  const [catalog,setCatalog]=useState<Trip[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [demo,setDemo]=useState(true);
  const [filters,setFilters]=useState({destination:'',difficulty:'',budget:''});
  const [searched,setSearched]=useState(false);
  const [modal,setModal]=useState<{kind:'inquiry'|'article'|'info';title:string;message?:string}|null>(null);
  const parseOptions=(value:string)=>value.split(/\r?\n/).map(row=>{const [optionValue,...label]=row.split('|');return optionValue!==undefined?{value:optionValue.trim(),label:label.join('|').trim()}:null;}).filter((option):option is {value:string;label:string}=>!!option&&!!option.label);
  const dialog=useRef<HTMLDialogElement>(null);
  const lastFocus=useRef<HTMLElement|null>(null);

  async function loadCatalog() {
    setLoading(true);setError('');
    try {const response=await fetch('/api/trips');const data=await response.json();if(!response.ok) throw new Error(data.error);setCatalog(data.trips);setDemo(data.demo);}
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
  function chooseDestination(slug:string) {setDestination(slug);setDifficulty('');setBudget('');setFilters({destination:slug,difficulty:'',budget:''});setSearched(true);document.getElementById('journeys')?.scrollIntoView({behavior:'smooth'});}
  function search(event:FormEvent) {event.preventDefault();setFilters({destination,difficulty,budget});setSearched(true);document.getElementById('journeys')?.scrollIntoView({behavior:'smooth'});}
  const visible=filterHomeTrips(catalog,filters,destinationCountries);
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <SiteHeader activeSection={activeSection} onPlan={()=>openInquiry()} />
    <main id="main">
      <section className="hero home-hero" id="home">
        <HomeSlideshow/>
        <div className="hero-shade" />
        <div className="container hero-content"><Eyebrow>Nepal, one extraordinary step at a time</Eyebrow><h1>Beyond the Horizon.</h1><p className="hero-description">Walk beneath the world’s highest peaks.<br/>Find connection in its quietest places.<br/><strong>This is Nepal. This is your journey.</strong></p><div className="hero-buttons"><button className="button gold" onClick={()=>openInquiry()}>Plan My Journey <Icon /></button><button className="explore-link" onClick={()=>setFilmOpen(true)}><span className="play"><Icon name="heroContext-imgSvg1" /></span><span>Explore Treks<small>A glimpse of the Himalaya</small></span></button></div></div>
        <div className="hero-caption"><span className="caption-line" /><div><strong>{heroCaption||"A world above the ordinary."}</strong><span>{heroLocation||"The Himalayas, Nepal"}</span></div><a href="#planner" aria-label="Discover your journey">↓</a></div>
      </section>
      <section id="planner" className="planner container simple-planner" aria-label="Find your journey">
        <div className="planner-heading"><h2>Where will your story begin?</h2><p>Find a journey at your pace.</p></div>
        <form className="search-form" onSubmit={search}>
          <JourneySelect label="Destination" value={destination} onChange={setDestination} options={parseOptions(finderDestinations)}/>
          <JourneySelect label="Difficulty" value={difficulty} onChange={setDifficulty} options={parseOptions(finderDifficulties)}/>
          <JourneySelect label="Budget · USD / person" value={budget} onChange={setBudget} options={parseOptions(finderBudgets)}/>
          <button className="button green" type="submit">Find my journey <span aria-hidden="true">↗</span></button>
        </form>
      </section>
      <section className="trust container reveal" aria-label="Our approach">{[['Rooted in Nepal','Local knowledge, personal connections'],['Your pace matters','Thoughtful days on the mountain'],['People before peaks','Respect for our mountain communities'],['Tread a little lighter','Care for the places we call home']].map(([title,text],i)=><div key={title}><span className="trust-icon"><Icon name={`222-3-imgSvg${i||''}`} /></span><h3>{title}</h3><p>{text}</p></div>)}</section>
      <section className="destinations container section reveal" id="destinations"><div className="destination-intro"><Eyebrow>Find your place</Eyebrow><h2>Find a place<br/>that stays with you.</h2><p>From the high trails of Khumbu to the villages of Mustang, every region offers a different way to experience Nepal.</p><a className="button green compact" href="/destinations">Explore Destinations <Icon name="222-78-imgSvg" /></a></div><div className="destination-grid">{destinations.map((d,i)=><button className="destination-card" onClick={()=>chooseDestination(d.slug)} key={d.slug}><Photo name={d.image} alt={d.name+' mountain landscape'} /><span className={`badge ${i===0?'gold':''}`}>{d.tag}</span><span className="destination-copy"><strong>{d.name}</strong><span>{d.description}</span></span><span className="destination-arrow"><Icon name="222-78-imgSvg1" /></span></button>)}</div></section>
      <section id="about" className="story section"><div className="container story-grid reveal"><div><Eyebrow>Our story · Since 2005</Eyebrow><h2>Rooted in Nepal.<br/><em>Built around people.</em></h2><p>Dreamscape Treks is a Nepal-based travel and adventure company creating personally planned journeys in Nepal, Tibet, Bhutan and India.</p><p>Established in 2005, we have spent more than two decades helping travellers experience the mountains, landscapes, cultures and communities of this remarkable region.</p><ul className="story-values" aria-label="Our approach"><li>We listen first</li><li>Experience in the field</li><li>Travel with respect</li></ul><a className="button gold" href="/about">Discover Our Story <Icon /></a></div><PhotoShowcase/></div></section>
      <section className="section container" id="journeys"><div className="section-heading reveal"><div><Eyebrow>Handpicked expeditions</Eyebrow><h2>{searched?'Find Your Himalayan Journey':'Featured Himalayan Journeys'}</h2></div><a className="text-link" href="/treks">View All Journeys <Icon /></a></div>
        {demo&&<p className="catalog-note">Sample itineraries · Contact us for current pricing and availability.</p>}
        {loading?<p className="status" role="status">Finding your next adventure…</p>:error?<div className="status" role="alert"><p>{error}</p><button className="button green" onClick={()=>void loadCatalog()}>Try again</button></div>:visible.length===0?<div className="status"><h3>No journeys match these filters yet.</h3><p>Try another region or ask us to tailor a journey for you.</p><button className="button gold" onClick={()=>openInquiry('Create a custom journey','I’m interested in a personally planned journey.')}>Build My Journey <Icon /></button></div>:<div className="trip-grid">{visible.map(trip=><JourneyCard key={trip.slug} trip={trip}/>)}</div>}
      </section>
      <section className="inspiration section"><div className="container inspiration-grid reveal"><div><Eyebrow>Alpine inspiration</Eyebrow><h2>A different pace.<br/>A new perspective.</h2><p>A quiet ridge, a village teahouse, or a morning above the clouds. Tell us what draws you to the mountains, and we’ll help you explore a route at your own pace.</p><div className="button-row"><a className="button green" href="#journal">Explore Travel Guides <Icon name="222-370-imgSvg" /></a><button className="button gold" onClick={()=>openInquiry()}>Build My Journey <Icon /></button></div></div><div><TrailDrawing/><div className="collage">{[['/images/trek-memories/prayer-flags-and-friends.jpg','A moment beneath the flags'],['/images/trek-memories/a-pause-on-the-ridge.jpg','A pause on the ridge'],['/images/trek-memories/together-in-the-mountains.jpg','The people beside you']].map(([image,caption])=><figure key={image}><Photo name={image} alt={caption} /><figcaption>{caption}</figcaption></figure>)}</div></div></div></section>
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
