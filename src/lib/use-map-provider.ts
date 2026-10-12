'use client';
import {useCallback,useSyncExternalStore} from 'react';
import {GOOGLE_MAPS_KEY,MAP_PROVIDER_EVENT,browserStorage,readBlocked,resolveProvider,writeBlocked,type MapMode,type MapProvider} from './map-provider';

// Pages without storage still switch every map on the page once Google fails.
let blockedThisPage=false;
const subscribe=(onChange:()=>void)=>{
  window.addEventListener(MAP_PROVIDER_EVENT,onChange);window.addEventListener('storage',onChange);
  return()=>{window.removeEventListener(MAP_PROVIDER_EVENT,onChange);window.removeEventListener('storage',onChange);};
};
const snapshot=()=>blockedThisPage||readBlocked(browserStorage());

/** Which map to draw, plus `fallBack()` for when Google fails (quota cap, billing, key or network). */
export function useMapProvider(mode:MapMode='auto'):{provider:MapProvider;fallBack:(reason:string)=>void}{
  const blocked=useSyncExternalStore(subscribe,snapshot,()=>false);
  const fallBack=useCallback((reason:string)=>{
    if(blockedThisPage)return;
    blockedThisPage=true;writeBlocked(browserStorage());
    console.warn(`Google Maps unavailable (${reason}); using OpenStreetMap.`);
    window.dispatchEvent(new Event(MAP_PROVIDER_EVENT));
  },[]);
  // Forced Google ignores earlier visits' failures, but a failure on this page still needs somewhere to go.
  const provider=mode==='google'&&blocked&&blockedThisPage?'free':resolveProvider({mode,hasKey:Boolean(GOOGLE_MAPS_KEY),blocked});
  return {provider,fallBack};
}
