'use client';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {useEffect,useRef} from 'react';
import {searchPlaces} from '@/lib/nominatim';
import {addFreeTiles,roundCoordinate as round} from '@/components/maps/free-tiles';
import LocationSearch from './location-search';
import type {PickerBodyProps} from './location-picker';
import styles from './location-picker.module.css';

const pinIcon=()=>L.divIcon({className:'',html:`<span class="${styles.pin}"></span>`,iconSize:[28,28],iconAnchor:[14,34]});

/** Location picker body on OpenStreetMap (Leaflet) with Nominatim search. */
export default function LocationPickerFree({place,draft,setDraft,nearby,center}:PickerBodyProps){
  const node=useRef<HTMLDivElement>(null);
  const map=useRef<L.Map|null>(null);
  const pin=useRef<L.Marker|null>(null);
  const update=useRef(setDraft);
  useEffect(()=>{update.current=setDraft;});

  useEffect(()=>{
    if(!node.current)return;
    const m=L.map(node.current).setView([center.lat,center.lng],draft||nearby.length?12:7);
    addFreeTiles(L,m);
    for(const p of nearby)L.marker([p.lat,p.lng],{icon:L.divIcon({className:'',html:`<span class="${styles.nearby}">${p.day}</span>`,iconSize:[20,20]}),title:`Day ${p.day}`,interactive:false}).addTo(m);
    m.on('click',event=>update.current({lat:round(event.latlng.lat),lng:round(event.latlng.lng)}));
    map.current=m;
    return()=>{m.remove();map.current=null;pin.current=null;};
    // The map is built once per dialog; later draft changes only move the pin.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  useEffect(()=>{
    const m=map.current;if(!m)return;
    if(!draft){pin.current?.remove();pin.current=null;return;}
    if(pin.current){pin.current.setLatLng([draft.lat,draft.lng]);return;}
    const marker=L.marker([draft.lat,draft.lng],{icon:pinIcon(),draggable:true,title:'Drag to adjust',zIndexOffset:1000}).addTo(m);
    marker.on('dragend',()=>{const p=marker.getLatLng();update.current({lat:round(p.lat),lng:round(p.lng)});});
    pin.current=marker;
  },[draft]);

  async function search(query:string){
    const b=map.current?.getBounds();
    return searchPlaces(query,b?{north:b.getNorth(),south:b.getSouth(),east:b.getEast(),west:b.getWest()}:null);
  }
  return <>
    <p className={styles.notice}>Using OpenStreetMap: Google Maps is unavailable or over its daily limit.</p>
    <LocationSearch initial={place} search={search} onPick={result=>{setDraft(result.point);const m=map.current;m?.setView([result.point.lat,result.point.lng],Math.max(m.getZoom(),13));}}/>
    <div className={styles.frame}><div className={styles.map} ref={node}/></div>
  </>;
}
