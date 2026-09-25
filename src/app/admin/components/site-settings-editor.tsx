'use client';

import {useEffect, useState, type FormEvent} from 'react';
import type {SiteSettings} from '@/lib/site-settings';
import styles from './cms-fields.module.css';

const fields = [
  ['home_image_url','Homepage photo URL (blank uses the original)'],
  ['home_image_alt','Homepage photo description'],
  ['city','City'],['area','Neighbourhood'],['address','Office address'],
  ['map_query','Map search address or latitude,longitude'],
  ['directions_note','Arrival directions'],['map_zoom','Map zoom (1–20)'],
  ['journal_title','Journal headline'],['journal_description','Journal introduction'],
  ['featured_story_slug','Featured published story slug'],
] as const;

export default function SiteSettingsEditor() {
  const [data,setData]=useState<SiteSettings|null>(null);
  const [error,setError]=useState('');
  const [saved,setSaved]=useState(false);
  const [busy,setBusy]=useState(false);
  useEffect(()=>{
    const controller=new AbortController();
    fetch('/api/admin/site-settings',{signal:controller.signal}).then(async response=>{
      const body=await response.json();
      if(!response.ok)throw new Error(body.error||'Could not load settings.');
      setData(body.data);
    }).catch(reason=>{if(!controller.signal.aborted)setError(reason instanceof Error?reason.message:'Could not load settings.');});
    return ()=>controller.abort();
  },[]);
  async function save(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(!data||busy)return;
    setBusy(true);setSaved(false);setError('');
    try {
      const response=await fetch('/api/admin/site-settings',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const body=await response.json();
      if(!response.ok)throw new Error(body.error||'Could not save settings.');
      setData(body.data);setSaved(true);
    } catch(reason){setError(reason instanceof Error?reason.message:'Could not save settings.');}
    finally{setBusy(false);}
  }
  return <section className={styles.panel}>
    <p className={styles.eyebrow}>Website content</p>
    <h2>Photography, Location &amp; Journal</h2>
    <p className={styles.intro}>Changes are stored in the CMS and appear on the public site after refreshing the page.</p>
    {error&&<p className={styles.alert} role="alert">{error}</p>}
    {!data&&!error&&<p className={styles.empty} role="status">Loading settings…</p>}
    {data&&<form onSubmit={save} className={styles.form}><fieldset disabled={busy}><div className={styles.grid}>
      {fields.map(([key,label])=><label className={`${styles.field} ${['home_image_url','map_query','journal_description','directions_note'].includes(key)?styles.fieldWide:''}`} key={key}>
        {label}
        {['journal_description','directions_note'].includes(key)
          ? <textarea name={key} rows={3} maxLength={key==='journal_description'?400:500} value={String(data[key])} onChange={event=>{setSaved(false);setData({...data,[key]:event.target.value});}}/>
          : <input name={key} type={key==='map_zoom'?'number':'text'} min={key==='map_zoom'?1:undefined} max={key==='map_zoom'?20:undefined} maxLength={key==='home_image_url'?500:key==='journal_title'?120:key==='home_image_alt'?250:key==='area'?100:key==='city'?150:key==='featured_story_slug'?255:300} required={!['home_image_url','directions_note','featured_story_slug'].includes(key)} value={data[key]} onChange={event=>{setSaved(false);setData({...data,[key]:key==='map_zoom'?Number(event.target.value):event.target.value});}}/>}
      </label>)}
    </div><div className={styles.actions}><button className={styles.button} type="submit">{busy?'Saving…':'Save website settings'}</button></div></fieldset>{saved&&<p className={styles.success} role="status">Saved. Refresh the public page to see your changes.</p>}</form>}
  </section>;
}
