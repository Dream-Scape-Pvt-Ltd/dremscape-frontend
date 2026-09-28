'use client';
import {useEffect,useRef,useState} from 'react';

const photos=[
  'An open mountain trail beneath Himalayan snow peaks and a deep blue sky',
  'First sunlight touching a snowy mountain range above the forest',
  'Trekkers resting together on a hillside beneath the Himalayas',
  'Layers of Himalayan peaks in the soft evening light',
];
const SWIPE_PX=45;
const next=(delta:number)=>(index:number)=>(index+delta+photos.length)%photos.length;
export default function HomeSlideshow({image,imageAlt}:{image?:string;imageAlt?:string}){
  const [active,setActive]=useState(0),[paused,setPaused]=useState(false),[reduced,setReduced]=useState(false);
  const slideshow=useRef<HTMLDivElement>(null);
  useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(media.matches);update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
  // Restart the countdown whenever the photo changes, so a swipe or tap gets a full turn on screen.
  useEffect(()=>{if(paused||reduced)return;const timer=setTimeout(()=>{if(!document.hidden)setActive(next(1));},6500);return()=>clearTimeout(timer);},[active,paused,reduced]);
  // Swipe anywhere on the hero to change photo. Vertical movement is left to page scrolling.
  useEffect(()=>{
    const hero=slideshow.current?.closest<HTMLElement>('.home-hero');
    if(!hero)return;
    let start:{x:number;y:number}|null=null;
    const down=(e:TouchEvent)=>{start=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null;};
    const up=(e:TouchEvent)=>{
      if(!start)return;
      const dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;
      start=null;
      if(Math.abs(dx)>=SWIPE_PX&&Math.abs(dx)>Math.abs(dy)*1.3)setActive(next(dx<0?1:-1));
    };
    const cancel=()=>{start=null;};
    hero.addEventListener('touchstart',down,{passive:true});hero.addEventListener('touchend',up,{passive:true});hero.addEventListener('touchcancel',cancel,{passive:true});
    return()=>{hero.removeEventListener('touchstart',down);hero.removeEventListener('touchend',up);hero.removeEventListener('touchcancel',cancel);};
  },[]);
  return <><div ref={slideshow} className="home-slideshow">{photos.map((alt,index)=><img key={alt} className={`home-slide ${index===active?'is-active':''}`} src={index===0&&image?image:`/images/trek-memories/home-slide-${index+1}.jpg`} alt={index===0&&image?imageAlt||alt:alt} aria-hidden={index!==active} width="2048" height="1536" fetchPriority={index===0?'high':'low'} draggable={false}/>)}</div><div className="home-slide-controls" aria-label="Mountain photographs">{photos.map((alt,index)=><button key={alt} type="button" aria-label={`Show photo ${index+1}: ${alt}`} aria-pressed={active===index} onClick={()=>{setActive(index);setPaused(true);}}><span/></button>)}{!reduced&&<button className="home-slide-pause" type="button" aria-label={paused?'Play slideshow':'Pause slideshow'} onClick={()=>setPaused(!paused)}>{paused?'▶':'Ⅱ'}</button>}</div></>;
}
