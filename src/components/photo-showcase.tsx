'use client';
import {useRef,type PointerEvent} from 'react';
import {motion,useReducedMotion,useSpring} from 'motion/react';
import {memoryPhoto,type MemoryPhoto} from '@/lib/trek-memories';
import {MemoryImage} from '@/components/trek-memories';
import {usePhotoLightbox} from './photo-lightbox';

const photos=['a-pause-on-the-ridge','together-in-the-mountains','last-light'].map(memoryPhoto).map((photo,index)=>index===0?{...photo,src:'/images/trek-memories/home-slide-3.jpg'}:photo);
function PhotoCard({photo,index}:{photo:MemoryPhoto;index:number}){
  const reduced=useReducedMotion();
  const rotateX=useSpring(0,{stiffness:160,damping:22});
  const rotateY=useSpring(0,{stiffness:160,damping:22});
  function tilt(event:PointerEvent<HTMLAnchorElement>){
    if(reduced||event.pointerType!=='mouse')return;
    const rect=event.currentTarget.getBoundingClientRect();
    rotateX.set(-((event.clientY-rect.top)/rect.height-.5)*9);
    rotateY.set(((event.clientX-rect.left)/rect.width-.5)*9);
  }
  return <motion.div className={`showcase-position showcase-position-${index}`} style={{rotate:[-7,8,-4][index]}} initial={false} whileInView={reduced?{}:{y:[45,0],rotate:[0,[-7,8,-4][index]],scale:[.92,1]}} viewport={{once:true,amount:.25}} transition={{type:'spring',stiffness:75,damping:17,delay:index*.14}}>
    <motion.a className="showcase-print" href={photo.src} data-pswp-width={photo.width} data-pswp-height={photo.height} data-cropped="true" data-caption={`${photo.title} · Memories of old treks`} aria-label={`Open photograph: ${photo.title}`} style={{rotateX:reduced?0:rotateX,rotateY:reduced?0:rotateY}} whileHover={reduced?{}:{y:-12,scale:1.035}} whileFocus={reduced?{}:{y:-8,scale:1.02}} transition={{type:'spring',stiffness:230,damping:23}} onPointerMove={tilt} onPointerLeave={()=>{rotateX.set(0);rotateY.set(0);}}>
      <div className="showcase-photo"><MemoryImage photo={photo} sizes="(max-width:600px) 75vw, 36vw"/><span className="showcase-glint"/><span className="showcase-open" aria-hidden="true">↗</span></div><span className="showcase-caption"><small>0{index+1} / FIELD NOTES</small><strong>{photo.title}</strong></span>
    </motion.a>
  </motion.div>;
}
export default function PhotoShowcase(){
  const root=useRef<HTMLDivElement>(null);usePhotoLightbox(root);
  return <div className="photo-showcase" ref={root}><span className="showcase-kicker">COLLECT MOMENTS, NOT MILES</span>{photos.map((photo,index)=><PhotoCard key={photo.id} photo={photo} index={index}/>)}<p className="showcase-note">Real trails. Real memories.<span>Tap a photograph to step inside ↗</span></p></div>;
}

