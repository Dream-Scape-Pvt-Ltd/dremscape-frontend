'use client';

import Image from 'next/image';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {memoryPhotos,memoryPhoto,type MemoryPhoto} from '@/lib/trek-memories';

export function MemoryImage({photo,priority=false,sizes='(max-width: 700px) 100vw, 50vw'}:{photo:MemoryPhoto;priority?:boolean;sizes?:string}){
  return <Image className="memory-photo" src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes={sizes} loading={priority?'eager':'lazy'} fetchPriority={priority?'high':undefined}/>;
}

export function MemoryReveal({children,className=''}:{children:ReactNode;className?:string}){
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{const node=ref.current;if(!node||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const rect=node.getBoundingClientRect();if(rect.top<innerHeight)return;node.dataset.enter='waiting';const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){delete node.dataset.enter;observer.disconnect();}},{threshold:.06});observer.observe(node);return()=>{observer.disconnect();delete node.dataset.enter;};},[]);
  return <div ref={ref} className={`memory-reveal ${className}`}>{children}</div>;
}

export function MemoryViewer({photos,index,onClose,onChange}:{photos:MemoryPhoto[];index:number;onClose:()=>void;onChange:(index:number)=>void}){
  const dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{const node=dialog.current;const previous=document.activeElement as HTMLElement|null;const overflow=document.body.style.overflow;node?.showModal();document.body.style.overflow='hidden';return()=>{node?.close();document.body.style.overflow=overflow;previous?.focus();};},[]);
  const photo=photos[index];
  const step=(d:number)=>onChange((index+d+photos.length)%photos.length);
  return <dialog ref={dialog} className="memory-viewer" aria-labelledby="memory-viewer-title" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}} onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();step(1);}if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}}}>
    <div className="memory-viewer-top"><span>DREAMSCAPE / TREK MEMORIES</span><button aria-label="Close memory" onClick={onClose}>Close <span aria-hidden="true">×</span></button></div>
    <img key={photo.id} className="memory-viewer-image" src={photo.src} alt={photo.alt} width={photo.width} height={photo.height}/>
    <div className="memory-viewer-bottom"><button aria-label="Previous memory" disabled={photos.length<2} onClick={()=>step(-1)}>←</button><div aria-live="polite"><p id="memory-viewer-title">{photo.title}</p><small>{String(index+1).padStart(2,'0')} / {photos.length} · From past treks</small></div><button aria-label="Next memory" disabled={photos.length<2} onClick={()=>step(1)}>→</button></div>
  </dialog>;
}

export function StoryPhoto({id}:{id:string}){
  const [open,setOpen]=useState(false);const photo=memoryPhoto(id);
  return <><figure className="story-memory"><button className="memory-open" onClick={()=>setOpen(true)} aria-label={`Enlarge ${photo.title}`}><MemoryImage photo={photo}/><span className="memory-expand" aria-hidden="true">↗</span></button><figcaption><span>{photo.title}</span><small>FROM THE TREK ARCHIVE</small></figcaption></figure>{open&&<MemoryViewer photos={[photo]} index={0} onClose={()=>setOpen(false)} onChange={()=>{}}/>}</>;
}

export default function TrekMemories(){
  const [filter,setFilter]=useState('All moments'),[expanded,setExpanded]=useState(false),[selected,setSelected]=useState<number|null>(null);
  const filtered=memoryPhotos.filter(p=>filter==='All moments'||p.group===filter);const visible=expanded?filtered:filtered.slice(0,6);
  return <section className="memory-archive container" id="trek-memories"><MemoryReveal><div className="memory-section-heading"><div><p className="eyebrow">THE PHOTOGRAPHS WE KEEP</p><h2>A little closer<br/>to the experience.</h2></div><p>Unposed pauses. Familiar faces. Small things along the way. Open a photograph and spend a moment on the trail.</p></div></MemoryReveal>
    <div className="memory-filters" role="group" aria-label="Memory categories">{['All moments','Shared trails','Along the way','Mountain light'].map(c=><button key={c} aria-pressed={filter===c} onClick={()=>{setFilter(c);setExpanded(false);}}>{c}</button>)}<span aria-live="polite">{filtered.length} photographs</span></div>
    <div className="memory-grid">{visible.map((p,i)=><MemoryReveal key={p.id}><button className="memory-tile" onClick={()=>setSelected(i)} aria-label={`Open memory: ${p.title}`}><MemoryImage photo={p} sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw"/><span className="memory-tile-caption"><span><small>{p.group}</small><strong>{p.title}</strong></span><span aria-hidden="true">↗</span></span></button></MemoryReveal>)}</div>
    {filtered.length>6&&<div className="memory-more"><button className="button outline-dark" aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}>{expanded?'Show fewer moments':`View all ${filtered.length} photographs`} <span aria-hidden="true">{expanded?'−':'+'}</span></button></div>}
    <p className="memory-source">Photographs from Dreamscape’s past treks. A collection of memories, told through the original images.</p>
    {selected!==null&&<MemoryViewer photos={filtered} index={selected} onChange={setSelected} onClose={()=>setSelected(null)}/>}
  </section>;
}
