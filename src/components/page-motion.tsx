'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';

export default function PageMotion(){
  const pathname=usePathname();
  useEffect(()=>{
    const preference=matchMedia('(prefers-reduced-motion: reduce)');
    const main=document.querySelector('main');if(!main||preference.matches)return;
    const animations=new Set<Animation>();const seen=new WeakSet<Element>();
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;observer.unobserve(entry.target);
      if(preference.matches)return;
      const siblings=entry.target.parentElement?Array.from(entry.target.parentElement.children):[];
      const delay=entry.target.matches('article,.trip-card,.collection-card,.sanctuary-card,.gallery-tile,.memory-tile')?Math.min(Math.max(siblings.indexOf(entry.target),0),3)*65:0;
      const animation=entry.target.animate([{opacity:.35,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],{duration:600,delay,easing:'cubic-bezier(.22,1,.36,1)'});
      animations.add(animation);animation.finished.then(()=>animations.delete(animation)).catch(()=>{});
    }),{threshold:.08});
    const scan=()=>main.querySelectorAll('.editorial-split,.editorial-three article,.contact-map-card,.collection-card,.sanctuary-card,.catalog-filter,.catalogue-grid .trip-card,.catalogue-grid .sample-trek-card,.journey-invitation,.carousel-heading,.payment-steps li,.payment-unavailable,.journal-grid .journal-card,.gallery-grid .gallery-tile,.memory-grid .memory-tile,.article-cover').forEach(node=>{if(seen.has(node))return;seen.add(node);if(node.getBoundingClientRect().top>=innerHeight)observer.observe(node);});
    scan();const mutations=new MutationObserver(scan);mutations.observe(main,{childList:true,subtree:true});
    const reduce=()=>{if(preference.matches){observer.disconnect();animations.forEach(animation=>animation.cancel());}};preference.addEventListener('change',reduce);
    return()=>{observer.disconnect();mutations.disconnect();animations.forEach(animation=>animation.cancel());preference.removeEventListener('change',reduce);};
  },[pathname]);
  return null;
}
