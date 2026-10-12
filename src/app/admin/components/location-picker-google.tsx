'use client';
import {useEffect} from 'react';
import {APIProvider,AdvancedMarker,Map,useMap,useMapsLibrary} from '@vis.gl/react-google-maps';
import {GOOGLE_MAPS_KEY} from '@/lib/map-provider';
import {searchPlaces,type PlaceResult} from '@/lib/nominatim';
import {useGoogleHealth} from '@/components/maps/use-google-health';
import LocationSearch from './location-search';
import type {PickerBodyProps} from './location-picker';
import styles from './location-picker.module.css';

const mapId=process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID||'DEMO_MAP_ID';
// Map (with a Terrain toggle) and Satellite (with a Labels toggle) in Google's own switcher.
const MAP_TYPES={mapTypeIds:['roadmap','terrain','satellite','hybrid']};
const round=(value:number)=>Number(value.toFixed(7));

function Search({place,onPick}:{place:string;onPick:(place:PlaceResult)=>void}){
  const map=useMap();
  const places=useMapsLibrary('places');
  async function search(query:string){
    const box=map?.getBounds()?.toJSON();
    try{
      if(!places)throw new Error('Places library not loaded');
      const {places:found}=await places.Place.searchByText({textQuery:query,fields:['displayName','formattedAddress','location'],maxResultCount:5,...(box?{locationBias:box}:{})});
      return found.flatMap(p=>p.location?[{name:p.displayName||query,address:p.formattedAddress||'',point:{lat:round(p.location.lat()),lng:round(p.location.lng())}}]:[]);
    }catch{
      // Places quota reached or the API isn't enabled: OpenStreetMap search still works.
      return searchPlaces(query,box);
    }
  }
  function pick(result:PlaceResult){onPick(result);map?.panTo(result.point);if((map?.getZoom()??0)<13)map?.setZoom(13);}
  return <LocationSearch initial={place} search={search} onPick={pick}/>;
}

function Pins({draft,setDraft,nearby,onFail}:Pick<PickerBodyProps,'draft'|'setDraft'|'nearby'|'onFail'>){
  useGoogleHealth(onFail);
  const map=useMap();
  useEffect(()=>{if(!map)return;const click=map.addListener('click',(event:google.maps.MapMouseEvent)=>{if(event.latLng)setDraft({lat:round(event.latLng.lat()),lng:round(event.latLng.lng())});});return()=>click.remove();},[map,setDraft]);
  return <>
    {nearby.map(p=><AdvancedMarker key={p.day} position={p} title={`Day ${p.day}`} zIndex={1}><span className={styles.nearby}>{p.day}</span></AdvancedMarker>)}
    {draft&&<AdvancedMarker position={draft} draggable zIndex={2} title="Drag to adjust" onDragEnd={event=>{const p=event.latLng;if(p)setDraft({lat:round(p.lat()),lng:round(p.lng())});}}><span className={styles.pin}/></AdvancedMarker>}
  </>;
}

/** Location picker body on Google Maps; reports failures so the dialog can switch to OpenStreetMap. */
export default function LocationPickerGoogle({place,draft,setDraft,nearby,center,onFail}:PickerBodyProps){
  return <APIProvider apiKey={GOOGLE_MAPS_KEY} onError={()=>onFail('script failed to load')}>
    <Search place={place} onPick={result=>setDraft(result.point)}/>
    <div className={styles.frame}>
      <Map className={styles.map} mapId={mapId} defaultCenter={center} defaultZoom={draft||nearby.length?12:7} mapTypeId="terrain" mapTypeControl mapTypeControlOptions={MAP_TYPES} gestureHandling="greedy" streetViewControl={false} clickableIcons={false}>
        <Pins draft={draft} setDraft={setDraft} nearby={nearby} onFail={onFail}/>
      </Map>
    </div>
  </APIProvider>;
}
