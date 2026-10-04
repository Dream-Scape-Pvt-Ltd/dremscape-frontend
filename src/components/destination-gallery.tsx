'use client';

import {useEffect,useMemo,useState} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import {asset} from '@/lib/assets';

export default function DestinationGallery({name,images}:{name:string;images:string[]}) {
  const photos=useMemo(()=>[...new Set(images.filter(Boolean))],[images]);
  const [active,setActive]=useState(0);
  const [paused,setPaused]=useState(false);
  const reducedMotion=useReducedMotion();
  const current=photos[Math.min(active,photos.length-1)];

  useEffect(()=>{
    if(photos.length<2||paused||reducedMotion)return;
    const timer=window.setTimeout(()=>setActive(index=>(index+1)%photos.length),6500);
    return ()=>window.clearTimeout(timer);
  },[active,paused,reducedMotion,photos.length]);

  if(!current)return null;
  return <div className="destination-gallery" aria-label={`${name} photo gallery`}>
    <div className="destination-gallery-stage">
      <AnimatePresence initial={false}>
        <motion.img key={current} src={asset(current)} alt={`A view of ${name}, photo ${active+1} of ${photos.length}`} width="1200" height="800" initial={reducedMotion?false:{opacity:0}} animate={{opacity:1}} exit={reducedMotion?undefined:{opacity:0}} transition={{duration:reducedMotion?0:.65}} loading="lazy"/>
      </AnimatePresence>
      {photos.length>1&&<div className="destination-gallery-controls"><span>{String(active+1).padStart(2,'0')} / {String(photos.length).padStart(2,'0')}</span><button type="button" onClick={()=>setActive(index=>(index+photos.length-1)%photos.length)} aria-label="Previous destination photo">←</button><button type="button" onClick={()=>setActive(index=>(index+1)%photos.length)} aria-label="Next destination photo">→</button></div>}
    </div>
    {photos.length>1&&<div className="destination-gallery-rail" role="group" aria-label="Choose a destination photo">{photos.map((photo,index)=><button key={photo} type="button" aria-label={`Show photo ${index+1}`} aria-pressed={active===index} onClick={()=>{setActive(index);setPaused(true);}}><img src={asset(photo)} alt="" loading="lazy" width="160" height="100"/></button>)}</div>}
  </div>;
}
