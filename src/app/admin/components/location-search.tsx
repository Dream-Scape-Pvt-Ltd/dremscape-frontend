'use client';
import {useState,type FormEvent} from 'react';
import type {PlaceResult} from '@/lib/nominatim';
import styles from './location-picker.module.css';

/** Search box shared by the Google and OpenStreetMap pickers; `search` decides the provider. */
export default function LocationSearch({initial,disabled,search,onPick}:{initial:string;disabled?:boolean;search:(query:string)=>Promise<PlaceResult[]>;onPick:(place:PlaceResult)=>void}){
  const [query,setQuery]=useState(initial);
  const [results,setResults]=useState<PlaceResult[]>([]);
  const [status,setStatus]=useState('');
  async function submit(event:FormEvent){
    event.preventDefault();
    if(disabled||!query.trim())return;
    setStatus('Searching…');setResults([]);
    try{
      const list=await search(query.trim());
      setResults(list);setStatus(list.length?'':'No places found. Click the map to place the pin instead.');
    }catch{setStatus('Place search is unavailable right now. Click the map to place the pin instead.');}
  }
  return <div className={styles.search}>
    <form onSubmit={submit}><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search a village, lodge or pass" aria-label="Search for a place"/><button type="submit" disabled={disabled}>Search</button></form>
    {status&&<p role="status">{status}</p>}
    {results.length>0&&<ul>{results.map((r,i)=><li key={i}><button type="button" onClick={()=>{onPick(r);setResults([]);}}><strong>{r.name}</strong><span>{r.address}</span></button></li>)}</ul>}
  </div>;
}
