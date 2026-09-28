'use client';

import Link from 'next/link';
import {guideHref} from '@/lib/links';
import {regionCollectionHref} from '@/lib/region-navigation';
import type {ReactNode} from 'react';
import {useEffect,useMemo,useState} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import type {Journey} from '@/lib/journeys';
import {asset} from '@/lib/assets';
import {difficulty,money} from '@/lib/format';
import JourneyShell from './journey-shell';
import InquiryDialog from './inquiry-dialog';
import BookingInquiryDialog from './booking-inquiry-dialog';
import DeparturePicker from './departure-picker';
import RouteProfile,{metres,profilePoints} from './route-profile';
import Breadcrumbs from './breadcrumbs';
import TrekGuidePortrait from './trek-guide-portrait';

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
  const photos=useMemo(()=>Array.from(new Set([t.image,...(t.gallery_images||[])].filter((value):value is string=>Boolean(value)))),[t.image,t.gallery_images]);
  const selectedPhoto=photos[Math.min(activePhoto,photos.length-1)];
  const credit=selectedPhoto?photoCredits[selectedPhoto]:undefined;
  const playing=photos.length>1&&!paused&&!hovering&&!reducedMotion;
  const highlights=(t.tags||'Mountain landscapes · Local culture · Time on the trail').split('·').map(value=>value.trim()).filter(Boolean).slice(0,3);
  const departures=t.departures.filter(d=>d.available_seats>0&&['LIMITED','GUARANTEED'].includes(d.status)&&d.start_date>=new Date().toISOString().slice(0,10));

  // Shared links (and the old /booking URLs, which redirect here) open the request for that date.
  // The query is dropped once read, so closing the popup doesn't reopen it on the next render or refresh.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{const id=new URLSearchParams(window.location.search).get('departure');if(!id)return;if(departures.some(d=>d.id===id))setRequestId(id);const url=new URL(window.location.href);url.searchParams.delete('departure');window.history.replaceState(window.history.state,'',url.pathname+url.search+url.hash);},[]);
  const requested=demo?undefined:departures.find(d=>d.id===requestId);

  useEffect(()=>{if(!playing)return;const timer=window.setTimeout(()=>setActivePhoto(index=>(index+1)%photos.length),PHOTO_INTERVAL);return()=>window.clearTimeout(timer);},[activePhoto,playing,photos.length]);
  function movePhoto(step:number){setActivePhoto(index=>(index+step+photos.length)%photos.length);}

  const profile=useMemo(()=>profilePoints(t.itinerary_days),[t.itinerary_days]);
  const highest=Math.max(t.altitude_max_meters||0,...profile.map(p=>p.elevation));
  const days=[...t.itinerary_days].sort((a,b)=>a.day_number-b.day_number);
  // Only routes with written highlights get that section; placeholder copy says nothing.
  const writtenHighlights=highlights.filter(item=>highlightDescriptions[item]);
  const openDates=departures.length?`${departures.length} open ${departures.length===1?'date':'dates'}`:'See dates';
  const facts:[string,string][]=[
    ['Duration',`${t.duration_days} days`],
    ['Difficulty',difficulty(t.difficulty_grade)],
    ['Highest point',highest?metres(highest):'Ask the team'],
    ['Group size',demo?'Flexible':t.min_group_size&&t.max_group_size?`${t.min_group_size}–${t.max_group_size} travellers`:'Ask the team'],
    ['Region',t.destination_name],
    ...(t.best_seasons?.length?[['Best seasons',t.best_seasons.map(season=>season.replace(/\s*\(.*\)/,'')).join(' and ')] as [string,string]]:[]),
  ];
  const bookButtons=<div className="trek-cta">
    <button type="button" className="button gold" onClick={()=>demo?setInquiry(true):setPicking(true)}>{demo?'Plan this journey':'Book my trip'}<small>{demo?'Ask for a tailored quote':openDates}</small></button>
    {!demo&&<button type="button" className="button outline-dark" onClick={()=>setInquiry(true)}>Plan my trip<small>Your dates, your pace</small></button>}
  </div>;

  return <JourneyShell>
    <div className="journey-detail-page trek-v2">
      <header className="container trek-head">
        <Breadcrumbs items={[{label:'Treks',href:'/treks?kind=treks'},{label:t.destination_name,href:regionCollectionHref(t)},{label:t.title}]}/>
        <div className="trek-head-grid">
          <div><h1>{t.title}</h1>{t.tags&&<p className="trek-tagline">{t.tags.split('·').map(v=>v.trim()).filter(Boolean).join(', ')}</p>}{!!t.guides?.length&&<p className="trek-led-by"><span>Led by</span>{t.guides.map(g=><Link key={g.slug} href={guideHref(g.id)}><TrekGuidePortrait name={g.name} photo={g.photo} size="small"/>{g.name}{g.role&&<small>{g.role}</small>}</Link>)}</p>}</div>
          <div className="trek-head-book"><p className="trek-price"><span>{demo?'Indicative price from':'From'}</span><strong>{money(t.starting_price_usd)}</strong><span>USD per person</span></p>{bookButtons}</div>
        </div>
      </header>

      {photos.length>0&&<div className="container journey-media-shell trek-photos" onMouseEnter={()=>setHovering(true)} onMouseLeave={()=>setHovering(false)}>
        <section className="trek-hero journey-stage" aria-label={`${t.title} photographs`}>
          <AnimatePresence initial={false}>
            {selectedPhoto&&<motion.img key={selectedPhoto} src={asset(selectedPhoto)} alt={`${t.title}, photograph ${activePhoto+1} of ${photos.length}`} initial={reducedMotion?false:{opacity:0,scale:1.035}} animate={{opacity:1,scale:1}} exit={reducedMotion?undefined:{opacity:0}} transition={{duration:reducedMotion?0:.85,ease:[.2,.75,.2,1]}} fetchPriority={activePhoto===0?'high':undefined}/>}
          </AnimatePresence>
          <div className="journey-stage-content"><span/><div className="journey-stage-foot"><div><strong>{credit?.caption||t.title}</strong></div>{photos.length>1&&<div className="journey-stage-controls"><button type="button" onClick={()=>movePhoto(-1)} aria-label="Previous trek photo">←</button><span>{activePhoto+1} of {photos.length}</span><button type="button" onClick={()=>movePhoto(1)} aria-label="Next trek photo">→</button></div>}</div></div>
          {playing&&<div key={selectedPhoto} className="journey-stage-progress" aria-hidden="true"/>}
        </section>
        {photos.length>1&&<div className="journey-gallery-rail"><div className="journey-gallery-thumbnails" role="group" aria-label="Choose a trek photograph">{photos.map((photo,index)=><button type="button" key={photo} aria-label={`Show trek photo ${index+1}`} aria-pressed={activePhoto===index} onClick={()=>setActivePhoto(index)}><img src={asset(photo)} alt="" loading="lazy"/></button>)}</div>{!reducedMotion&&<button type="button" className="journey-gallery-play" onClick={()=>setPaused(value=>!value)} aria-label={paused?'Play slideshow':'Pause slideshow'}>{paused?'Play':'Pause'}</button>}</div>}
        {credit&&<p className="journey-photo-credit">Photo: <a href={credit.source} target="_blank" rel="noopener noreferrer">{credit.author}</a>, <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer">{credit.license}</a></p>}
      </div>}

      <div className="container trek-body">
        <dl className="trek-facts-row">{facts.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        {demo&&<p className="trek-note"><strong>This is a sample journey.</strong> The day plan and services are illustrations; the team confirms the final route and quote before you book.</p>}

        <nav className="trek-jump" aria-label="On this page"><a href="#overview">Overview</a><a href="#itinerary">Day by day</a><a href="#altitude">Altitude</a><a href="#included">What’s included</a><a href="#book">Book or plan</a></nav>

        {<section id="overview" className="trek-section trek-overview">
          <h2>About this trek</h2>
          <div><p className="preserve-lines">{t.overview}</p>
          {writtenHighlights.length>0&&<ul className="trek-highlights">{writtenHighlights.map(item=><li key={item}><strong>{item}</strong> {highlightDescriptions[item]}</li>)}</ul>}</div>
        </section>}

        <section id="itinerary" className="trek-section">
          <div className="trek-section-head"><h2>Day by day</h2><p>{demo?'A draft outline. Your guide adjusts walking stages and rest days to the conditions.':'Each night is listed with its altitude. Rest days let your body adjust before you climb higher.'}</p></div>
          {days.length?<ol className="ascent-log">{days.map(day=>{const e=day.elevation_meters;return <li key={day.day_number} id={`day-${day.day_number}`} className={`${day.is_acclimatization_day?'is-rest':''} ${e&&e>=5000?'is-high':''}`}>
            <span className="ascent-day"><span className="sr-only">Day </span>{day.day_number}</span>
            {e?<span className="ascent-meter" aria-hidden="true"><i style={{width:`${Math.max(6,Math.round(e/highest*100))}%`}}/></span>:<span className="ascent-meter is-empty" aria-hidden="true"/>}
            <div className="ascent-copy">
              <h3>{day.title}</h3>
              <p className="ascent-meta">{day.overnight_stay&&<span>Overnight in {day.overnight_stay}</span>}{e?<span className="ascent-alt">{metres(e)}</span>:null}{day.is_acclimatization_day&&<span className="ascent-rest">Rest day to acclimatise</span>}</p>
              {day.description&&<p className="preserve-lines">{day.description}</p>}
            </div>
          </li>;})}</ol>:<div className="quiet-panel"><p>The detailed itinerary is being prepared. Ask the team for the current route and daily walking plan.</p><button className="text-link" onClick={()=>setInquiry(true)}>Ask for the itinerary</button></div>}
        </section>

        <section id="altitude" className="trek-altitude" aria-labelledby="altitude-heading">
          <p className="eyebrow">YOUR ROUTE, AT A GLANCE</p><h2 id="altitude-heading">Altitude by day</h2>
          <p>See where you stay each night and how the route changes in elevation.</p>{demo&&profile.length>0&&<p className="altitude-preview-note">Approximate preview elevations, to be confirmed with your final itinerary. <a href="https://lovehimalayajourney.com/treks/everest-base-camp-gokyo-cho-la-trek" target="_blank" rel="noopener noreferrer">Elevation reference ↗</a></p>}
          {profile.length?<RouteProfile points={profile}/>:<p className="quiet-panel">Daily altitudes will appear here when the detailed route is confirmed. Ask our team for the current elevation profile.</p>}
          {profile.length>0&&profile.length<days.length&&<p className="trek-note">Altitudes are available for {profile.length} of {days.length} days. Unlisted nights are not plotted.</p>}
        </section>

        {<section id="included" className="trek-section">
          <div className="trek-section-head"><h2>What’s included</h2>{demo&&<p>Example arrangements. Your confirmed proposal lists the exact services.</p>}</div>
          <div className="trek-included">{([[demo?'Usually included':'Included',t.inclusions,'is-in'],[demo?'Usually arranged separately':'Not included',t.exclusions,'is-out']] as [string,string[],string][]).map(([title,list,tone])=><div key={title} className={tone}><h3>{title}</h3>{list?.length?<ul>{list.map((item,i)=><li key={i}>{item}</li>)}</ul>:<p>Confirmed with your itinerary.</p>}</div>)}</div>
          {t.packing_list?.length>0&&<details className="packing-list"><summary>What to pack <span aria-hidden="true">+</span></summary><ul>{t.packing_list.map((item,i)=><li key={i}>{item}</li>)}</ul></details>}
        </section>}

        <section id="book" className="trek-section trek-book">
          <div><h2>Book or plan your trip</h2><p>Take a seat on a set departure, or plan a private trip on your own dates with our team. Nothing is charged until your trip is confirmed.</p></div>
          <div className="trek-book-side">{<p className="trek-price"><span>{demo?'Indicative price from':'From'}</span><strong>{money(t.starting_price_usd)}</strong><span>per person, {t.duration_days} days</span></p>}{bookButtons}</div>
        </section>
      </div>
      {related}
    </div>
    {inquiry&&<InquiryDialog journey={t.title} tripId={demo?undefined:t.id} onClose={()=>setInquiry(false)}/>}
    {picking&&<DeparturePicker title={t.title} departures={departures} onChoose={id=>{setPicking(false);if(demo)setInquiry(true);else setRequestId(id);}} onPlan={()=>{setPicking(false);setInquiry(true);}} onClose={()=>setPicking(false)}/>}
    {requested&&<BookingInquiryDialog journey={t} departure={requested} onClose={()=>setRequestId(null)}/>}
  </JourneyShell>;
}
