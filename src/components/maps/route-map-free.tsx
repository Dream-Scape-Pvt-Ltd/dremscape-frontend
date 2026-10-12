'use client';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {useEffect,useRef} from 'react';
import type {RoutePoint} from '@/lib/route-points';
import {addFreeTiles} from './free-tiles';
import styles from '../route-map.module.css';

function popup(point:RoutePoint){
  const box=document.createElement('div');box.className=styles.info;
  const title=document.createElement('strong');title.className=styles.infoTitle;title.textContent=`Day ${point.day}`;
  const stay=document.createElement('p');stay.textContent=`${point.stay}${point.rest?' · acclimatisation day':''}`;
  const link=document.createElement('a');link.href=`#day-${point.day}`;link.textContent=`View day ${point.day} itinerary`;
  box.append(title,stay,link);
  return box;
}

/** The trek route on OpenStreetMap tiles (Leaflet). */
export default function RouteMapFree({points}:{points:RoutePoint[]}){
  const node=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(!node.current)return;
    const map=L.map(node.current,{scrollWheelZoom:false});
    addFreeTiles(L,map);
    const path=points.map(p=>L.latLng(p.lat,p.lng));
    L.polyline(path,{color:'#245d42',opacity:.85,weight:3}).addTo(map);
    for(const p of points){
      const icon=L.divIcon({className:'',html:`<span class="${p.rest?`${styles.pin} ${styles.restPin}`:styles.pin}">${p.day}</span>`,iconSize:[26,26],iconAnchor:[13,13],popupAnchor:[0,-14]});
      L.marker([p.lat,p.lng],{icon,title:`Day ${p.day}: ${p.stay}`,keyboard:true}).bindPopup(()=>popup(p)).addTo(map);
    }
    map.fitBounds(L.latLngBounds(path).pad(.15),{maxZoom:13});
    return()=>{map.remove();};
  },[points]);
  return <div className={styles.map} ref={node}/>;
}
