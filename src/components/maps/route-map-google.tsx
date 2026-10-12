'use client';
import {useState} from 'react';
import {APIProvider,AdvancedMarker,InfoWindow,Map,Polyline} from '@vis.gl/react-google-maps';
import type {RoutePoint} from '@/lib/route-points';
import {GOOGLE_MAPS_KEY} from '@/lib/map-provider';
import {useGoogleHealth} from './use-google-health';
import styles from '../route-map.module.css';

const mapId=process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID||'DEMO_MAP_ID';
// Map (with a Terrain toggle) and Satellite (with a Labels toggle) in Google's own switcher.
const MAP_TYPES={mapTypeIds:['roadmap','terrain','satellite','hybrid']};

function bounds(points:RoutePoint[]){
  const lats=points.map(p=>p.lat),lngs=points.map(p=>p.lng);
  // Keep a little area around the stops so a single village doesn't zoom to street level.
  const pad=.01;
  return {north:Math.max(...lats)+pad,south:Math.min(...lats)-pad,east:Math.max(...lngs)+pad,west:Math.min(...lngs)-pad,padding:40};
}

function RouteMapView({points,onFail}:{points:RoutePoint[];onFail:(reason:string)=>void}){
  useGoogleHealth(onFail);
  const [open,setOpen]=useState<number|null>(null);
  const selected=points.find(p=>p.day===open);
  return <>
    <Polyline path={points.map(p=>({lat:p.lat,lng:p.lng}))} strokeColor="#245d42" strokeOpacity={.85} strokeWeight={3}/>
    {points.map(p=><AdvancedMarker key={p.day} position={{lat:p.lat,lng:p.lng}} title={`Day ${p.day}: ${p.stay}`} onClick={()=>setOpen(p.day)}>
      <span className={p.rest?`${styles.pin} ${styles.restPin}`:styles.pin}>{p.day}</span>
    </AdvancedMarker>)}
    {selected&&<InfoWindow position={{lat:selected.lat,lng:selected.lng}} pixelOffset={[0,-16]} onCloseClick={()=>setOpen(null)} headerContent={<strong className={styles.infoTitle}>Day {selected.day}</strong>}>
      <div className={styles.info}><p>{selected.stay}{selected.rest&&' · acclimatisation day'}</p><a href={`#day-${selected.day}`} onClick={()=>setOpen(null)}>View day {selected.day} itinerary</a></div>
    </InfoWindow>}
  </>;
}

/** The trek route on Google Maps; reports failures so the caller can switch to the free map. */
export default function RouteMapGoogle({points,onFail}:{points:RoutePoint[];onFail:(reason:string)=>void}){
  return <APIProvider apiKey={GOOGLE_MAPS_KEY} onError={()=>onFail('script failed to load')}>
    <Map className={styles.map} mapId={mapId} defaultBounds={bounds(points)} mapTypeId="terrain" mapTypeControl mapTypeControlOptions={MAP_TYPES} gestureHandling="cooperative" streetViewControl={false} fullscreenControl clickableIcons={false}>
      <RouteMapView points={points} onFail={onFail}/>
    </Map>
  </APIProvider>;
}
