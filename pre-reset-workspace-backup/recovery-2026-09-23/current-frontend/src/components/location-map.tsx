'use client';
import {useEffect,useState} from 'react';

export default function LocationMap({query,area}:{query:string;area:string}){
  const [state,setState]=useState<'idle'|'loading'|'embedding'|'loaded'|'failed'>('idle');
  const encoded=encodeURIComponent(query);
  useEffect(()=>{
    if(state!=='loading'&&state!=='embedding')return;
    const controller=new AbortController();
    const timeout=setTimeout(()=>{controller.abort();setState('failed');},10000);
    if(state==='loading')fetch(`https://maps.google.com/maps?q=${encoded}&z=16&output=embed`,{mode:'no-cors',credentials:'omit',signal:controller.signal}).then(()=>{if(!controller.signal.aborted)setState('embedding');}).catch(()=>{if(!controller.signal.aborted)setState('failed');});
    return()=>{clearTimeout(timeout);controller.abort();};
  },[state,encoded]);
  return <div className="location-map-interactive">
    {(state==='embedding'||state==='loaded')&&<iframe title={`Map of ${query}`} src={`https://maps.google.com/maps?q=${encoded}&z=16&output=embed`} referrerPolicy="no-referrer-when-downgrade" onLoad={()=>setState('loaded')} onError={()=>setState('failed')} allowFullScreen/>}
    {state!=='loaded'&&<div className="location-map-preview"><div><span className="location-pin" aria-hidden="true">↗</span><p className="eyebrow">YOUR JOURNEY STARTS HERE</p><h3>{area}</h3><p>{state==='failed'?'The map could not load here. Open Google Maps for directions.':'A first conversation, before the first step.'}</p>{state==='idle'?<button className="button green" onClick={()=>setState('loading')}>View interactive map ↗</button>:state==='loading'||state==='embedding'?<p role="status">Loading map…</p>:<a className="button green" href={`https://www.google.com/maps/search/?api=1&query=${encoded}`} target="_blank" rel="noopener noreferrer">Open Google Maps ↗</a>}</div></div>}
    {state==='loaded'&&<a className="map-open-link" href={`https://www.google.com/maps/search/?api=1&query=${encoded}`} target="_blank" rel="noopener noreferrer">Open larger map ↗</a>}
  </div>;
}
