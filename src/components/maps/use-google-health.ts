'use client';
import {useEffect,useRef} from 'react';
import {APILoadingStatus,useApiLoadingStatus,useMap} from '@vis.gl/react-google-maps';

const TILE_TIMEOUT_MS=10000;

/**
 * Report a Google map that can't serve tiles: auth/billing failure, Google's own error
 * overlay (shown when a quota cap is hit), or no tiles within the timeout.
 */
export function useGoogleHealth(onFail:(reason:string)=>void){
  const status=useApiLoadingStatus();
  const map=useMap();
  const report=useRef(onFail);
  useEffect(()=>{report.current=onFail;});

  useEffect(()=>{
    if(status===APILoadingStatus.FAILED)report.current('script failed to load');
    if(status===APILoadingStatus.AUTH_FAILURE)report.current('key, billing or quota rejected');
  },[status]);

  useEffect(()=>{
    if(!map)return;
    let loaded=false;
    const tiles=map.addListener('tilesloaded',()=>{loaded=true;});
    // Background tabs may hold tiles back; only a visible page counts as a timeout.
    const timer=window.setTimeout(()=>{if(!loaded&&document.visibilityState==='visible')report.current('tiles did not load');},TILE_TIMEOUT_MS);
    const node=map.getDiv();
    const check=()=>{if(node.querySelector('.gm-err-container,.gm-err-message'))report.current('Google error overlay');};
    const observer=new MutationObserver(check);
    observer.observe(node,{childList:true,subtree:true});
    check();
    return()=>{tiles.remove();window.clearTimeout(timer);observer.disconnect();};
  },[map]);
}
