'use client';

import Link from 'next/link';
import type {ReactNode} from 'react';
import {useEffect,useMemo,useState} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import type {Journey} from '@/lib/journeys';
import {asset} from '@/lib/assets';
import {guideHref} from '@/lib/links';
import {regionCollectionHref} from '@/lib/region-navigation';
import {difficulty,money} from '@/lib/format';
import JourneyShell from './journey-shell';
import InquiryDialog from './inquiry-dialog';
import BookingInquiryDialog from './booking-inquiry-dialog';
import DeparturePicker from './departure-picker';
import RouteProfile,{profilePoints} from './route-profile';
import Breadcrumbs from './breadcrumbs';
import TrekGuidePortrait from './trek-guide-portrait';
import {FALLBACK_PHOTO,fallbackTrekImage} from '@/lib/trek-images';

const PHOTO_INTERVAL=6500;
const highlightDescriptions:Record<string,string>={
  'Walled City':'Walk into Lo Manthang and take time with its lanes, courtyards and mountain setting.',
  Caves:'See the sculpted cliffs and cave landscape that give Mustang its singular character.',
  'Tibetan Culture':'Travel through villages where local customs are part of the journey.',
  'Gokyo Lakes':'Follow the trail toward glacial lakes beneath the great Himalayan peaks.',
  'High Pass':'Cross a dramatic mountain pass when conditions and your guide allow.',
  'Sherpa Guide':'Learn the trail through the insight of people who know these mountains.',
  'Thorong La':'A high crossing that rewards steady preparation and an early start.',
  'Glacial Lake':'Make room for a quieter day beside water and mountain light.',
  Teahouses:'End each walking day with the warmth of a trail-side lodge.',
  'Restricted Area':'Enter a less-travelled region with the right permits and local guidance.',
  'Larkya La':'The route rises toward one of the circuit’s defining mountain crossings.',
  'Wild Valley':'Walk through changing terrain at a pace that lets you notice it.',
};
const photoCredits:Record<string,{author:string;source:string;caption:string;license:string;licenseUrl:string}>={
  '/images/treks/lo-manthang.jpg':{author:'Safalphotos',source:'https://commons.wikimedia.org/wiki/File:Lo_Manthang,_Upper_Mustang,_Nepal.jpg',caption:'Lo Manthang, Upper Mustang',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/'},
  '/images/treks/dhakmar-village.jpg':{author:'Nir gurung',source:'https://commons.wikimedia.org/wiki/File:Dhakmar_village_mustang.jpg',caption:'Dhakmar village, Mustang',license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/'},
  '/images/treks/lo-manthang-caves.jpg':{author:'Raunak Maskay',source:'https://commons.wikimedia.org/wiki/File:Rocks,_Caves_at_Lo_Manthang(Upper_Mustang).jpg',caption:'Caves near Lo Manthang',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/'},
  '/images/treks/lo-manthang-panorama.jpg':{author:'Mohan K. Duwal',source:'https://commons.wikimedia.org/wiki/File:The_kingdom_of_Lo,_Lomangthang,_Upper_Mustang_(Pano).jpg',caption:'The kingdom of Lo',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/'},
};

export default function JourneyDetail({journey:t,demo,related}:{journey:Journey;demo:boolean;related?:ReactNode}) {
  const [inquiry,setInquiry]=useState(false);
  const [requestId,setRequestId]=useState<string|null>(null);
  const [picking,setPicking]=useState(false);
  const [activePhoto,setActivePhoto]=useState(0);
  const [paused,setPaused]=useState(false);
  const [hovering,setHovering]=useState(false);
  const reducedMotion=useReducedMotion();
  const photos=useMemo(()=>{
    const provided=Array.from(new Set([t.image,...(t.gallery_images||[])].filter((value):value is string=>Boolean(value))));
    return provided.length?provided:[fallbackTrekImage(t.slug,t.destination_slug)];
  },[t.image,t.gallery_images,t.slug,t.destination_slug]);
  const selectedPhoto=photos[Math.min(activePhoto,photos.length-1)];
  const credit=selectedPhoto?photoCredits[selectedPhoto]:undefined;
  const playing=photos.length>1&&!paused&&!hovering&&!reducedMotion;
  // Only highlights with written copy are shown; the section hides when there are none.
  const highlights=(t.tags||'').split('·').map(value=>value.trim()).filter(item=>highlightDescriptions[item]).slice(0,3);
  const compactRoute=t.slug==='everest-base-camp-cho-la';
  const profile=useMemo(()=>profilePoints(t.itinerary_days),[t.itinerary_days]);
  const departures=t.departures.filter(d=>d.available_seats>0&&['LIMITED','GUARANTEED'].includes(d.status)&&d.start_date>=new Date().toISOString().slice(0,10));

  // Shared links (and the old /booking URLs, which redirect here) open the request for that date.
  // The query is dropped once read, so closing the popup doesn't reopen it on the next render or refresh.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{const id=new URLSearchParams(window.location.search).get('departure');if(!id)return;if(departures.some(d=>d.id===id))setRequestId(id);const url=new URL(window.location.href);url.searchParams.delete('departure');window.history.replaceState(window.history.state,'',url.pathname+url.search+url.hash);},[]);
  const requested=demo?undefined:departures.find(d=>d.id===requestId);

  useEffect(()=>{if(!playing||reducedMotion)return;const timer=window.setTimeout(()=>setActivePhoto(index=>(index+1)%photos.length),PHOTO_INTERVAL);return()=>window.clearTimeout(timer);},[activePhoto,playing,photos.length,reducedMotion]);
  function movePhoto(step:number){setActivePhoto(index=>(index+step+photos.length)%photos.length);}

  const facts=[
    ['DURATION',`${t.duration_days} days`],
    ['REGION',t.destination_name],
    ['HIGHEST POINT',t.altitude_max_meters?`${t.altitude_max_meters.toLocaleString()} m`:'Ask the team'],
    ['DIFFICULTY',difficulty(t.difficulty_grade)],
    ['GROUP SIZE',demo?'Flexible · ask us':t.min_group_size&&t.max_group_size?`${t.min_group_size}–${t.max_group_size} travellers`:'Ask the team'],
    ['ACCOMMODATION',demo?'Local lodges · draft':'See itinerary'],
  ];

  // The two ways forward, shown under the trek facts and again after the itinerary.
  const actions=(place:'top'|'bottom')=><div className={`journey-actions journey-actions-${place}`}>
    <p className="journey-actions-price">{demo&&<small>Illustrative </small>}<small>From</small> <strong>{money(t.starting_price_usd)}</strong> <small>per person · {t.duration_days} days</small></p>
    <div className="journey-actions-buttons">
      <button type="button" className="button gold" onClick={()=>demo?setInquiry(true):setPicking(true)}>Book my trip <span className="ui-arrow" aria-hidden="true" /><small>{departures.length?`${departures.length} open ${departures.length===1?'date':'dates'}`:'See dates'}</small></button>
      <button type="button" className="button outline-dark" onClick={()=>setInquiry(true)}>Plan my trip <span className="ui-arrow" aria-hidden="true" /><small>Your dates, your pace</small></button>
    </div>
  </div>;

  return <JourneyShell>
    <div className="journey-detail-page">
      <div className="container journey-topline"><Breadcrumbs items={[{label:'Treks',href:'/treks?kind=treks'},{label:t.destination_name,href:regionCollectionHref(t)},{label:t.title}]}/><span>{t.destination_name} · Nepal</span></div>

      <div className="container journey-media-shell" onMouseEnter={()=>setHovering(true)} onMouseLeave={()=>setHovering(false)}>
        <section className={`trek-hero journey-stage ${!selectedPhoto?'trek-hero-plain':''}`} aria-label={`${t.title} photographs`}>
          <AnimatePresence initial={false}>
            {selectedPhoto&&<motion.img key={selectedPhoto} src={asset(selectedPhoto)} alt={`${demo?'Illustrative image for ':''}${t.title}, photograph ${activePhoto+1} of ${photos.length}`} width="1200" height="800" initial={reducedMotion?false:{opacity:0,scale:1.035}} animate={{opacity:1,scale:1}} exit={reducedMotion?undefined:{opacity:0}} transition={{duration:reducedMotion?0:.85,ease:[.2,.75,.2,1]}} fetchPriority={activePhoto===0?'high':undefined} onError={event=>{const image=event.currentTarget;const next=image.dataset.fallback==='region'?FALLBACK_PHOTO:fallbackTrekImage(t.slug,t.destination_slug);if(image.dataset.fallback==='house')return;image.dataset.fallback=next===FALLBACK_PHOTO?'house':image.dataset.fallback==='region'?'house':'region';image.src=asset(next);}}/>}
          </AnimatePresence>
          <div className="journey-stage-content"><span className="journey-stage-badge">DREAMSCAPE · {t.destination_name.toUpperCase()}</span><div className="journey-stage-foot"><div><small>THE TRAIL IN PICTURES</small><strong>{credit?.caption||t.title}</strong></div>{photos.length>1&&<div className="journey-stage-controls"><button type="button" onClick={()=>movePhoto(-1)} aria-label="Previous trek photo">←</button><span>{String(activePhoto+1).padStart(2,'0')} / {String(photos.length).padStart(2,'0')}</span><button type="button" onClick={()=>movePhoto(1)} aria-label="Next trek photo">→</button></div>}</div></div>
          {playing&&<div key={selectedPhoto} className="journey-stage-progress" aria-hidden="true"/>}
        </section>
        {photos.length>1&&<div className="journey-gallery-rail"><div className="journey-gallery-thumbnails" role="group" aria-label="Choose a trek photograph">{photos.map((photo,index)=><button type="button" key={photo} aria-label={`Show trek photo ${index+1}`} aria-pressed={activePhoto===index} onClick={()=>setActivePhoto(index)}><img src={asset(photo)} alt="" loading="lazy" width="512" height="279"/></button>)}</div>{!reducedMotion&&<button type="button" className="journey-gallery-play" onClick={()=>setPaused(value=>!value)} aria-label={paused?'Play slideshow':'Pause slideshow'}>{paused?'Play':'Pause'} <span aria-hidden="true">{paused?'▶':'Ⅱ'}</span></button>}</div>}
        {credit&&<p className="journey-photo-credit">Photo: <a href={credit.source} target="_blank" rel="noopener noreferrer">{credit.author}</a> · <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer">{credit.license}</a></p>}
      </div>

      <nav className="journey-quicknav" aria-label="Trek page sections"><div className="container">{!compactRoute&&<><a href="#overview">Overview</a>{highlights.length>0&&<a href="#highlights">Highlights</a>}</>}<a href="#itinerary">Day-by-day itinerary</a>{profile.length>1&&<a href="#altitude">Altitude</a>}{!compactRoute&&<a href="#included">Included &amp; excluded</a>}<a href="#book">Book or plan</a></div></nav>

      <div className="container journey-title-block"><div><p className="journey-kicker">{demo?'ROUTE PREVIEW':'EXPLORE WITH DREAMSCAPE'} <span aria-hidden="true">/</span> {t.destination_name.toUpperCase()}</p><h1>{t.title}</h1>{t.tags&&<p className="journey-subtitle">{t.tags}</p>}{!!t.guides?.length&&<p className="trek-led-by"><span>Led by</span>{t.guides.map(g=><Link key={g.slug} href={guideHref(g.id)}><TrekGuidePortrait name={g.name} photo={g.photo} size="small"/>{g.name}{g.role&&<small>{g.role}</small>}</Link>)}</p>}</div></div>

      <div className="container journey-detail-body">
        {demo&&<p className="journey-preview-note"><strong>Sample journey.</strong> The day plan, services and price below are illustrations. Our team will confirm the final route and quote before you book.</p>}
        <dl className="trek-facts journey-facts">{facts.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        {actions('top')}
        <div className="trek-layout journey-detail-layout"><article className="trek-story">
          {!compactRoute&&<section id="overview" className="journey-copy-section"><p className="eyebrow">THE EXPERIENCE</p><h2>A trail to remember.</h2><p className="preserve-lines journey-overview">{t.overview}</p>{t.best_seasons?.length>0&&<p className="season-note">Suggested seasons: {t.best_seasons.join(' · ')}</p>}</section>}
          {!compactRoute&&highlights.length>0&&<section id="highlights" className="journey-copy-section"><p className="eyebrow">WHY THIS ROUTE</p><h2>Moments along the way.</h2><div className="journey-highlight-grid">{highlights.map((item,index)=><div key={item}><span>0{index+1}</span><h3>{item}</h3><p>{highlightDescriptions[item]}</p></div>)}</div></section>}
          <section id="itinerary" className="journey-copy-section"><p className="eyebrow">DAY BY DAY {demo&&<span className="journey-draft-label">· SAMPLE PLAN</span>}</p><h2>The path ahead.</h2>{!compactRoute&&<p className="journey-section-intro">{demo?'This draft gives you a feel for the route. Your guide will adjust travel, walking stages and rest days to current conditions.':'Follow the route day by day, with room for the mountain conditions to guide the journey.'}</p>}{t.itinerary_days.length?<div className="itinerary-grid">{[...t.itinerary_days].sort((a,b)=>a.day_number-b.day_number).map(day=><article className="itinerary-day-card" key={day.day_number} id={`day-${day.day_number}`}><span className="day-number">DAY {String(day.day_number).padStart(2,'0')}</span><h3>{day.title}</h3>{day.overnight_stay&&<p className="itinerary-overnight">Overnight · {day.overnight_stay}</p>}<p className="preserve-lines">{day.description}</p>{day.elevation_meters&&<p className="day-meta">Approx. {day.elevation_meters.toLocaleString()} m</p>}{day.is_acclimatization_day&&<span className="itinerary-acclimatization">Acclimatization day</span>}</article>)}</div>:<div className="quiet-panel"><p>The detailed itinerary is being prepared. Ask the team for the current route and daily walking plan.</p><button className="text-link" onClick={()=>setInquiry(true)}>Ask for the itinerary ↗︎</button></div>}{profile.length>1&&<div id="altitude" className="journey-altitude"><p className="eyebrow">ALTITUDE BY DAY</p><RouteProfile points={profile}/></div>}</section>
          {!compactRoute&&<section id="included" className="journey-copy-section"><p className="eyebrow">BEFORE YOU GO</p><h2>What to expect.</h2>{demo&&<p className="journey-section-intro">These are example arrangements. The exact inclusions will appear in your confirmed proposal.</p>}<div className="inclusion-grid">{[[demo?'Possible inclusions':'Included',t.inclusions],[demo?'Usually arranged separately':'Not included',t.exclusions]].map(([title,list])=><div key={String(title)}><h3>{String(title)}</h3>{Array.isArray(list)&&list.length?<ul>{list.map((item,i)=><li key={i}>{item}</li>)}</ul>:<p>To be confirmed with your itinerary.</p>}</div>)}</div>{t.packing_list?.length>0&&<details className="packing-list"><summary>Suggested packing essentials <span aria-hidden="true">+</span></summary><ul>{t.packing_list.map((item,i)=><li key={i}>{item}</li>)}</ul></details>}</section>}
          <section id="book" className="journey-copy-section journey-book-section"><p className="eyebrow">READY WHEN YOU ARE</p><h2>Book or plan your trip.</h2><p className="journey-section-intro">Book a seat on a set departure, or plan a private trip on your own dates with our team.</p>{actions('bottom')}</section>
        </article></div>
      </div>
      {related}
    </div>
    {inquiry&&<InquiryDialog journey={t.title} tripId={demo?undefined:t.id} onClose={()=>setInquiry(false)}/>}
    {picking&&<DeparturePicker title={t.title} departures={departures} onChoose={id=>{setPicking(false);if(demo)setInquiry(true);else setRequestId(id);}} onPlan={()=>{setPicking(false);setInquiry(true);}} onClose={()=>setPicking(false)}/>}
    {requested&&<BookingInquiryDialog journey={t} departure={requested} onClose={()=>setRequestId(null)}/>}
  </JourneyShell>;
}
