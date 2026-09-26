'use client';
import {useEffect,useState} from 'react';
import type {SearchIndex} from '@/lib/site-search';

let request:Promise<SearchIndex|null>|null=null;
function loadIndex(){
  request??=fetch('/api/search/index').then(r=>r.ok?r.json() as Promise<SearchIndex>:null).catch(()=>null).then(index=>{
    // Let a later search try again if this load failed.
    if(!index||index.catalogUnavailable)request=null;
    return index;
  });
  return request;
}

/** The search index, fetched once per visit and shared by every search box. Pass `enabled` to load it lazily. */
export function useSearchIndex(enabled=true){
  const [index,setIndex]=useState<SearchIndex|null>(null);
  useEffect(()=>{
    if(!enabled||index)return;
    let live=true;
    void loadIndex().then(result=>{if(live&&result)setIndex(result);});
    return()=>{live=false;};
  },[enabled,index]);
  return index;
}
