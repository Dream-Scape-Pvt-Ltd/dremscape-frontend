'use client';
import UiArrow from '@/components/ui-arrow';
import Link from 'next/link';
import {usePhotoLightbox} from './photo-lightbox';
import {useEffect,useRef,useState} from 'react';
import {memoryPhotos} from '@/lib/trek-memories';
import {MemoryImage} from '@/components/trek-memories';

const photos=['together-in-the-mountains','a-pause-on-the-ridge','village-street','last-light','forest-footsteps'].map(id=>memoryPhotos.find(photo=>photo.id===id)!);

export default function MemoryCarousel(){
  const track=useRef<HTMLDivElement>(null);
  usePhotoLightbox(track);
  const [position,setPosition]=useState({index:0,end:false});
  useEffect(()=>{
    const node=track.current;if(!node)return;
    const update=()=>{const first=node.firstElementChild as HTMLElement;const step=first.offsetWidth+24;setPosition({index:Math.round(node.scrollLeft/step),end:node.scrollLeft>=node.scrollWidth-node.clientWidth-4});};
    update();node.addEventListener('scroll',update,{passive:true});const observer=new ResizeObserver(update);observer.observe(node);
    return()=>{node.removeEventListener('scroll',update);observer.disconnect();};
  },[]);
  function move(direction:number){const node=track.current;if(!node)return;const card=node.firstElementChild as HTMLElement;node.scrollBy({left:direction*(card.offsetWidth+24),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  return <section className="memory-carousel container" aria-labelledby="memory-carousel-title" aria-roledescription="carousel"><div className="carousel-heading"><div><p className="eyebrow">MEMORIES OF OLD TREKS</p><h2 id="memory-carousel-title">The moments<br/><em>between the milestones.</em></h2></div><div><p>From our own photo albums. The people, pauses and places that stay with us.</p><Link className="text-link" href="/blog">Explore the journal <UiArrow/></Link></div></div><div className="carousel-track" id="trek-memory-slides" ref={track} tabIndex={0} aria-label="Trek memories; use arrow keys or swipe to explore" onKeyDown={e=>{if(e.target!==e.currentTarget)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}}}>{photos.map((photo,index)=><figure className="carousel-slide" key={photo.id} role="group" aria-roledescription="slide" aria-label={`${index+1} of ${photos.length}: ${photo.title}`}><div><a className="carousel-photo-open" href={photo.src} data-pswp-width={photo.width} data-pswp-height={photo.height} data-cropped="true" data-caption={photo.title} aria-label={`Open photograph: ${photo.title}`}><MemoryImage photo={photo} sizes="(max-width: 600px) 85vw, (max-width: 900px) 60vw, 40vw"/><span className="showcase-open" aria-hidden="true"><UiArrow/></span></a></div><figcaption><span>{photo.group}</span><h3>{photo.title}</h3></figcaption></figure>)}</div><div className="carousel-controls"><span aria-live="polite">{String(position.index+1).padStart(2,'0')} <span aria-hidden="true">—</span> {String(photos.length).padStart(2,'0')}</span><div><button aria-label="Previous trek memories" aria-controls="trek-memory-slides" disabled={position.index===0} onClick={()=>move(-1)}>←</button><button aria-label="Next trek memories" aria-controls="trek-memory-slides" disabled={position.end} onClick={()=>move(1)}><UiArrow/></button></div></div></section>;
}


