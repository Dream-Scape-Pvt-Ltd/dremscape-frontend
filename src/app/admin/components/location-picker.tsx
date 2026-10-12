'use client';
import dynamic from 'next/dynamic';
import {useEffect,useState} from 'react';
import type {MapMode} from '@/lib/map-provider';
import {useMapProvider} from '@/lib/use-map-provider';
import styles from './location-picker.module.css';

export type LatLng={lat:number;lng:number};
type Nearby={day:number;lat:number;lng:number};
export type PickerBodyProps={place:string;draft:LatLng|null;setDraft:(point:LatLng)=>void;nearby:Nearby[];center:LatLng;onFail:(reason:string)=>void};

// Each provider's library downloads only when the dialog opens with it.
const GoogleBody=dynamic(()=>import('./location-picker-google'),{ssr:false});
const FreeBody=dynamic(()=>import('./location-picker-free'),{ssr:false});

const NEPAL={lat:28.3949,lng:84.124};
const format=(point:LatLng)=>`${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`;

/** Pick an itinerary day's overnight location on Google Maps, or OpenStreetMap when Google is unavailable. */
export default function LocationPicker({day,place,value,nearby,mode='auto',onChange}:{day:number;place:string;value:LatLng|null;nearby:Nearby[];mode?:MapMode;onChange:(point:LatLng|null)=>void}){
  const [open,setOpen]=useState(false);
  const [draft,setDraft]=useState<LatLng|null>(value);
  const {provider,fallBack}=useMapProvider(mode);
  useEffect(()=>{if(!open)return;const close=(event:KeyboardEvent)=>{if(event.key==='Escape')setOpen(false);};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[open]);
  const others=nearby.filter(p=>p.day!==day);
  const previous=[...others].filter(p=>p.day<day).sort((a,b)=>b.day-a.day)[0];
  const center=value||previous||others[0]||NEPAL;
  const body:PickerBodyProps={place,draft,setDraft,nearby:others,center,onFail:fallBack};
  return <div className={styles.field}>
    <div className={styles.summary}>
      {value?<><span className={styles.dot} aria-hidden="true"/><span>{format(value)}</span><a href={`https://www.openstreetmap.org/?mlat=${value.lat}&mlon=${value.lng}#map=14/${value.lat}/${value.lng}`} target="_blank" rel="noopener noreferrer">View ↗</a></>:<span className={styles.empty}>No location set</span>}
      <button type="button" className={styles.choose} onClick={()=>{setDraft(value);setOpen(true);}}>{value?'Change':'Choose on map'}</button>
      {value&&<button type="button" className={styles.clear} onClick={()=>onChange(null)}>Clear</button>}
    </div>
    {open&&<div className={styles.backdrop} role="dialog" aria-modal="true" aria-label={`Choose the overnight location for day ${day}`} onMouseDown={event=>{if(event.target===event.currentTarget)setOpen(false);}}>
      <div className={styles.dialog}>
        <header><div><h3>Day {day} overnight location</h3><p>Search for a place, or click the map. Drag the pin to fine-tune.</p></div><button type="button" className={styles.close} onClick={()=>setOpen(false)} aria-label="Close">×</button></header>
        {provider==='google'?<GoogleBody key="google" {...body}/>:<FreeBody key="free" {...body}/>}
        <footer><span>{draft?format(draft):'No pin placed yet'}</span><button type="button" className={styles.cancel} onClick={()=>setOpen(false)}>Cancel</button><button type="button" className={styles.save} disabled={!draft} onClick={()=>{onChange(draft);setOpen(false);}}>Use this location</button></footer>
      </div>
    </div>}
  </div>;
}
