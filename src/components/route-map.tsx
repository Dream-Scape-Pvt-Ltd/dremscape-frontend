'use client';
import dynamic from 'next/dynamic';
import {useEffect,useRef,useState} from 'react';
import type {RoutePoint} from '@/lib/route-points';
import {useMapProvider} from '@/lib/use-map-provider';
import type {MapMode} from '@/lib/map-provider';
import styles from './route-map.module.css';

// Each provider's library downloads only when that provider is drawn.
const RouteMapGoogle=dynamic(()=>import('./maps/route-map-google'),{ssr:false});
const RouteMapFree=dynamic(()=>import('./maps/route-map-free'),{ssr:false});

/** Overnight stops on Google Maps, or OpenStreetMap when Google is unavailable or over its limit. Loads near the viewport. */
export default function RouteMap({points,mode='auto'}:{points:RoutePoint[];mode?:MapMode}){
  const frame=useRef<HTMLDivElement>(null);
  const [visible,setVisible]=useState(false);
  const {provider,fallBack}=useMapProvider(mode);
  useEffect(()=>{
    const node=frame.current;if(!node||visible)return;
    const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){setVisible(true);observer.disconnect();}},{rootMargin:'400px 0px'});
    observer.observe(node);return()=>observer.disconnect();
  },[visible]);
  if(points.length<2)return null;
  return <div id="route-map" className="journey-altitude"><p className="eyebrow">ROUTE MAP</p><figure className={styles.route}>
    <div className={styles.frame} ref={frame}>
      {visible&&(provider==='google'?<RouteMapGoogle key="google" points={points} onFail={fallBack}/>:<RouteMapFree key="free" points={points}/>)}
    </div>
    <figcaption className={styles.caption}>Approximate overnight stops, joined in day order. This is not a GPS track of the trail.</figcaption>
  </figure></div>;
}
