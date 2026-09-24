'use client';
import {useEffect,useState} from 'react';

const photos=[
  'An open mountain trail beneath Himalayan snow peaks and a deep blue sky',
  'First sunlight touching a snowy mountain range above the forest',
  'Trekkers resting together on a hillside beneath the Himalayas',
  'Layers of Himalayan peaks in the soft evening light',
];
export default function HomeSlideshow(){
  const [active,setActive]=useState(0),[paused,setPaused]=useState(false),[reduced,setReduced]=useState(false);
  useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(media.matches);update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
  useEffect(()=>{if(paused||reduced)return;const timer=setInterval(()=>{if(!document.hidden)setActive(index=>(index+1)%photos.length);},6500);return()=>clearInterval(timer);},[paused,reduced]);
  return <><div className="home-slideshow">{photos.map((alt,index)=><img key={alt} className={`home-slide ${index===active?'is-active':''}`} src={`/images/trek-memories/home-slide-${index+1}.jpg`} alt={alt} aria-hidden={index!==active} width="2048" height="1536" fetchPriority={index===0?'high':'low'}/>)}</div><div className="home-slide-controls" aria-label="Mountain photographs">{photos.map((alt,index)=><button key={alt} type="button" aria-label={`Show photo ${index+1}: ${alt}`} aria-pressed={active===index} onClick={()=>{setActive(index);setPaused(true);}}><span/></button>)}{!reduced&&<button className="home-slide-pause" type="button" aria-label={paused?'Play slideshow':'Pause slideshow'} onClick={()=>setPaused(!paused)}>{paused?'▶':'Ⅱ'}</button>}</div></>;
}
