'use client';

import Link from 'next/link';
import type {ReactNode} from 'react';
import {useEffect,useMemo,useState} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import type {Journey} from '@/lib/journeys';
import {asset} from '@/lib/assets';
import {difficulty,dateLabel,money} from '@/lib/format';
import JourneyShell from './journey-shell';
import InquiryDialog from './inquiry-dialog';

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
  const [activePhoto,setActivePhoto]=useState(0);
  const [paused,setPaused]=useState(false);
  const [hovering,setHovering]=useState(false);
  const reducedMotion=useReducedMotion();
  const photos=useMemo(()=>Array.from(new Set([t.image,...(t.gallery_images||[])].filter((value):value is string=>Boolean(value)))),[t.image,t.gallery_images]);
  const selectedPhoto=photos[Math.min(activePhoto,photos.length-1)];
  const credit=selectedPhoto?photoCredits[selectedPhoto]:undefined;
  const playing=photos.length>1&&!paused&&!hovering&&!reducedMotion;
  const highlights=(t.tags||'Mountain landscapes · Local culture · Time on the trail').split('·').map(value=>value.trim()).filter(Boolean).slice(0,3);
  const compactRoute=t.slug==='everest-base-camp-cho-la';
  const departures=t.departures.filter(d=>d.available_seats>0&&['LIMITED','GUARANTEED'].includes(d.status)&&d.start_date>=new Date().toISOString().slice(0,10));

  useEffect(()=>{if(!playing)return;const timer=window.setTimeout(()=>setActivePhoto(index=>(index+1)%photos.length),PHOTO_INTERVAL);return()=>window.clearTimeout(timer);},[activePhoto,playing,photos.length]);
  function movePhoto(step:number){setActivePhoto(index=>(index+step+photos.length)%photos.length);}

  const facts=[
    ['DURATION',`${t.duration_days} days`],
    ['REGION',t.destination_name],
    ['HIGHEST POINT',t.altitude_max_meters?`${t.altitude_max_meters.toLocaleString()} m`:'Ask the team'],
    ['DIFFICULTY',difficulty(t.difficulty_grade)],
    ['GROUP SIZE',demo?'Flexible · ask us':t.min_group_size&&t.max_group_size?`${t.min_group_size}–${t.max_group_size} travellers`:'Ask the team'],
    ['ACCOMMODATION',demo?'Local lodges · draft':'See itinerary'],
  ];

  return <JourneyShell>
    <div className="journey-detail-page">
      <div className="container journey-topline"><nav className="journey-breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/treks">Treks</Link><span>/</span><span>{t.title}</span></nav><span>{t.destination_name} · Nepal</span></div>

      <div className="container journey-media-shell" onMouseEnter={()=>setHovering(true)} onMouseLeave={()=>setHovering(false)}>
        <section className={`trek-hero journey-stage ${!selectedPhoto?'trek-hero-plain':''}`} aria-label={`${t.title} photographs`}>
          <AnimatePresence initial={false}>
            {selectedPhoto&&<motion.img key={selectedPhoto} src={asset(selectedPhoto)} alt={`${t.title}, photograph ${activePhoto+1} of ${photos.length}`} initial={reducedMotion?false:{opacity:0,scale:1.035}} animate={{opacity:1,scale:1}} exit={reducedMotion?undefined:{opacity:0}} transition={{duration:reducedMotion?0:.85,ease:[.2,.75,.2,1]}} fetchPriority={activePhoto===0?'high':undefined}/>}
          </AnimatePresence>
          <div className="journey-stage-content"><span className="journey-stage-badge">DREAMSCAPE · {t.destination_name.toUpperCase()}</span><div className="journey-stage-foot"><div><small>THE TRAIL IN PICTURES</small><strong>{credit?.caption||t.title}</strong></div>{photos.length>1&&<div className="journey-stage-controls"><button type="button" onClick={()=>movePhoto(-1)} aria-label="Previous trek photo">←</button><span>{String(activePhoto+1).padStart(2,'0')} / {String(photos.length).padStart(2,'0')}</span><button type="button" onClick={()=>movePhoto(1)} aria-label="Next trek photo">→</button></div>}</div></div>
          {playing&&<div key={selectedPhoto} className="journey-stage-progress" aria-hidden="true"/>}
        </section>
        {photos.length>1&&<div className="journey-gallery-rail"><div className="journey-gallery-thumbnails" role="group" aria-label="Choose a trek photograph">{photos.map((photo,index)=><button type="button" key={photo} aria-label={`Show trek photo ${index+1}`} aria-pressed={activePhoto===index} onClick={()=>setActivePhoto(index)}><img src={asset(photo)} alt="" loading="lazy"/></button>)}</div>{!reducedMotion&&<button type="button" className="journey-gallery-play" onClick={()=>setPaused(value=>!value)} aria-label={paused?'Play slideshow':'Pause slideshow'}>{paused?'Play':'Pause'} <span aria-hidden="true">{paused?'▶':'Ⅱ'}</span></button>}</div>}
        {credit&&<p className="journey-photo-credit">Photo: <a href={credit.source} target="_blank" rel="noopener noreferrer">{credit.author}</a> · <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer">{credit.license}</a></p>}
      </div>

      <nav className="journey-quicknav" aria-label="Trek page sections"><div className="container">{!compactRoute&&<><a href="#overview">Overview</a><a href="#highlights">Highlights</a></>}<a href="#itinerary">Day-by-day itinerary</a>{!compactRoute&&<a href="#included">Included &amp; excluded</a>}<a href="#departures">Dates &amp; rates</a></div></nav>

      <div className="container journey-title-block"><div><p className="journey-kicker">{demo?'ROUTE PREVIEW':'EXPLORE WITH DREAMSCAPE'} <span aria-hidden="true">/</span> {t.destination_name.toUpperCase()}</p><h1>{t.title}</h1><p className="journey-subtitle">{t.tags||'A journey beyond the familiar.'}</p></div><button type="button" className="journey-title-action" onClick={()=>setInquiry(true)}>Ask about this trek <span aria-hidden="true">↗</span></button></div>

      <div className="container journey-detail-body">
        {demo&&<p className="journey-preview-note"><strong>Sample journey.</strong> The day plan, services and price below are illustrations. Our team will confirm the final route and quote before you book.</p>}
        <dl className="trek-facts journey-facts">{facts.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        <div className="trek-layout journey-detail-layout"><article className="trek-story">
          {!compactRoute&&<section id="overview" className="journey-copy-section"><p className="eyebrow">THE EXPERIENCE</p><h2>A trail to remember.</h2><p className="preserve-lines journey-overview">{t.overview}</p>{t.best_seasons?.length>0&&<p className="season-note">Suggested seasons: {t.best_seasons.join(' · ')}</p>}</section>}
          {!compactRoute&&<section id="highlights" className="journey-copy-section"><p className="eyebrow">WHY THIS ROUTE</p><h2>Moments along the way.</h2><div className="journey-highlight-grid">{highlights.map((item,index)=><div key={item}><span>0{index+1}</span><h3>{item}</h3><p>{highlightDescriptions[item]||`A closer look at ${item.toLowerCase()} along the route.`}</p></div>)}</div></section>}
          <section id="itinerary" className="journey-copy-section"><p className="eyebrow">DAY BY DAY {demo&&<span className="journey-draft-label">· SAMPLE PLAN</span>}</p><h2>The path ahead.</h2>{!compactRoute&&<p className="journey-section-intro">{demo?'This draft gives you a feel for the route. Your guide will adjust travel, walking stages and rest days to current conditions.':'Follow the route day by day, with room for the mountain conditions to guide the journey.'}</p>}{t.itinerary_days.length?<div className="itinerary-grid">{[...t.itinerary_days].sort((a,b)=>a.day_number-b.day_number).map(day=><article className="itinerary-day-card" key={day.day_number}><span className="day-number">DAY {String(day.day_number).padStart(2,'0')}</span><h3>{day.title}</h3>{day.overnight_stay&&<p className="itinerary-overnight">Overnight · {day.overnight_stay}</p>}<p className="preserve-lines">{day.description}</p>{day.elevation_meters&&<p className="day-meta">Approx. {day.elevation_meters.toLocaleString()} m</p>}{day.is_acclimatization_day&&<span className="itinerary-acclimatization">Acclimatization day</span>}</article>)}</div>:<div className="quiet-panel"><p>The detailed itinerary is being prepared. Ask the team for the current route and daily walking plan.</p><button className="text-link" onClick={()=>setInquiry(true)}>Ask for the itinerary ↗</button></div>}</section>
          {!compactRoute&&<section id="included" className="journey-copy-section"><p className="eyebrow">BEFORE YOU GO</p><h2>What to expect.</h2>{demo&&<p className="journey-section-intro">These are example arrangements. The exact inclusions will appear in your confirmed proposal.</p>}<div className="inclusion-grid">{[[demo?'Possible inclusions':'Included',t.inclusions],[demo?'Usually arranged separately':'Not included',t.exclusions]].map(([title,list])=><div key={String(title)}><h3>{String(title)}</h3>{Array.isArray(list)&&list.length?<ul>{list.map((item,i)=><li key={i}>{item}</li>)}</ul>:<p>To be confirmed with your itinerary.</p>}</div>)}</div>{t.packing_list?.length>0&&<details className="packing-list"><summary>Suggested packing essentials <span aria-hidden="true">+</span></summary><ul>{t.packing_list.map((item,i)=><li key={i}>{item}</li>)}</ul></details>}</section>}
          <section id="departures" className="journey-copy-section"><p className="eyebrow">TRAVEL WHEN IT FITS</p><h2>Dates &amp; rates.</h2>{departures.length?<div className="departure-list">{departures.map(d=><div key={d.id}><div><strong>{dateLabel(d.start_date)}</strong><p>to {dateLabel(d.end_date)}</p><small>{d.available_seats} seats available</small></div><div><strong>{money(d.price_usd)}</strong><small>per person</small></div><Link className="button green" href={`/booking?trek=${t.slug}&departure=${d.id}`}>Choose date ↗</Link></div>)}</div>:<div className="quiet-panel"><p>No bookable dates are listed yet. Tell us when you hope to travel and we’ll suggest a plan.</p><button className="button green" onClick={()=>setInquiry(true)}>Ask about dates ↗</button></div>}</section>
        </article><aside className="trek-reserve journey-reserve"><span className="eyebrow">YOUR JOURNEY</span><p className="reserve-price">{demo&&<small>Illustrative from</small>}{money(t.starting_price_usd)}<small>USD per person{demo?' · final quote on request':''}</small></p><hr/><p>{t.duration_days} days in {t.destination_name}.</p><button className="button gold" onClick={()=>setInquiry(true)}>{demo?'Request a real quote':'Plan this journey'} <span aria-hidden="true">↗</span></button><a className="button outline-dark" href="#itinerary">See day-by-day plan ↓</a><small>No commitment. Start with a conversation.</small></aside></div>
      </div>
      {related}
    </div>
    {inquiry&&<InquiryDialog journey={t.title} tripId={demo?undefined:t.id} onClose={()=>setInquiry(false)}/>}
  </JourneyShell>;
}
