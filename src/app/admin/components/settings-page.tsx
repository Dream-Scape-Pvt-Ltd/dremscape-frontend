'use client';

import {useState,type FormEvent} from 'react';
import NavigationMenuEditor from './navigation-menu-editor';
import SiteSettingsEditor from './site-settings-editor';
import {useSiteSettings,type SiteSettingsState} from './use-site-settings';
import type {SiteSettings} from '@/lib/site-settings-defaults';
import styles from './settings.module.css';

type Section='menus'|'content'|'contact'|'crm';
const sections:{id:Section;label:string;title:string;help:string}[]=[
  {id:'menus',label:'Header menus',title:'Header menus',help:'The menus across the top of the site, in order. Open one to edit its intro and the items listed under it.'},
  {id:'content',label:'Website content',title:'Website content',help:'Homepage, company, partner, gallery and journal copy and photos.'},
  {id:'contact',label:'Contact',title:'Contact details',help:'Shown in the footer, on the contact and partner pages and in the WhatsApp buttons.'},
  {id:'crm',label:'Response time',title:'Inquiry response time',help:'When an unanswered inquiry is flagged as overdue in the CRM.'},
];
type Status={tone:'ok'|'error';text:string}|null;

function SaveBar({busy,label,status}:{busy:boolean;label:string;status:Status}){
  return <div className={styles.saveBar}>
    <button type="submit" className={styles.primary} disabled={busy}>{busy?'Saving…':label}</button>
    {status&&<p className={status.tone==='ok'?styles.ok:styles.error} role={status.tone==='ok'?'status':'alert'}>{status.text}</p>}
  </div>;
}

function useSaver(){
  const [busy,setBusy]=useState(false);
  const [status,setStatus]=useState<Status>(null);
  async function run(task:()=>Promise<void>,done:string){
    setBusy(true);setStatus(null);
    try{await task();setStatus({tone:'ok',text:done});}
    catch(reason){setStatus({tone:'error',text:reason instanceof Error?reason.message:'The change could not be saved.'});}
    finally{setBusy(false);}
  }
  return {busy,status,setStatus,run};
}

const contactKeys=['contact_email','contact_whatsapp','city','area','address','map_query','map_zoom','map_provider','directions_note','youtube_channel'] as const;
type ContactDraft=Pick<SiteSettings,typeof contactKeys[number]>;

function ContactSection({site}:{site:SiteSettingsState}){
  const [draft,setDraft]=useState<ContactDraft>(()=>Object.fromEntries(contactKeys.map(key=>[key,site.settings![key]])) as ContactDraft);
  const saver=useSaver();
  const set=<K extends keyof ContactDraft>(key:K,value:ContactDraft[K])=>{saver.setStatus(null);setDraft({...draft,[key]:value});};
  const digits=draft.contact_whatsapp.replace(/\D/g,'');
  const whatsappOk=!draft.contact_whatsapp.trim()||/^\d{8,15}$/.test(digits);
  const youtubeOk=!draft.youtube_channel.trim()||/^@[\w.-]{3,30}$|^UC[\w-]{22}$/.test(draft.youtube_channel.trim());
  function save(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    void saver.run(()=>site.save({...site.settings!,...draft,contact_email:draft.contact_email.trim(),contact_whatsapp:draft.contact_whatsapp.trim(),youtube_channel:draft.youtube_channel.trim()}),'Contact details saved. The site updates within a minute.');
  }
  return <form onSubmit={save}><fieldset className={styles.plainFieldset} disabled={saver.busy}>
    <h3 className={styles.groupTitle}>How travellers reach you</h3>
    <div className={styles.fields}>
      <label>Email<input type="email" value={draft.contact_email} maxLength={254} required onChange={event=>set('contact_email',event.target.value)}/></label>
      <label>WhatsApp number<input value={draft.contact_whatsapp} maxLength={30} placeholder="+977 98…" aria-invalid={!whatsappOk} onChange={event=>set('contact_whatsapp',event.target.value)}/><small>{whatsappOk?'Include the country code. Leave empty to hide WhatsApp links.':'Enter 8–15 digits including the country code.'}</small></label>
    </div>
    <h3 className={styles.groupTitle}>Office</h3>
    <div className={styles.fields}>
      <label>City<input value={draft.city} maxLength={150} required onChange={event=>set('city',event.target.value)}/></label>
      <label>Neighbourhood<input value={draft.area} maxLength={100} required onChange={event=>set('area',event.target.value)}/></label>
      <label className={styles.wide}>Address<input value={draft.address} maxLength={300} required onChange={event=>set('address',event.target.value)}/></label>
      <label>Map search<input value={draft.map_query} maxLength={300} required onChange={event=>set('map_query',event.target.value)}/><small>An address or “latitude,longitude” for the map pin.</small></label>
      <label>Map zoom<input type="number" min={1} max={20} value={draft.map_zoom} required onChange={event=>set('map_zoom',Number(event.target.value))}/></label>
      <label>Trek route maps<select value={draft.map_provider} onChange={event=>set('map_provider',event.target.value as typeof draft.map_provider)}><option value="auto">Automatic: Google, free map if Google fails</option><option value="free">Always free map (OpenStreetMap)</option><option value="google">Always Google Maps</option></select><small>Automatic switches to OpenStreetMap when Google is unavailable or over its daily quota.</small></label>
      <label className={styles.wide}>Arrival directions<textarea rows={2} value={draft.directions_note} maxLength={500} onChange={event=>set('directions_note',event.target.value)}/></label>
    </div>
    <h3 className={styles.groupTitle}>Video</h3>
    <div className={styles.fields}>
      <label>YouTube channel<input value={draft.youtube_channel} maxLength={40} placeholder="@Dreamscapetreks" aria-invalid={!youtubeOk} onChange={event=>set('youtube_channel',event.target.value)}/><small>{youtubeOk?'A handle (@name) or channel ID (UC…). Leave empty to keep the current channel.':'Use a handle like @Dreamscapetreks or a channel ID starting with UC.'}</small></label>
    </div>
    <SaveBar busy={saver.busy||!whatsappOk||!youtubeOk} label="Save contact details" status={saver.status}/>
  </fieldset></form>;
}

function CrmSection({site}:{site:SiteSettingsState}){
  const [hours,setHours]=useState(site.slaHours?String(site.slaHours):'');
  const saver=useSaver();
  const value=hours.trim()?Number(hours):null;
  const valid=value===null||(Number.isInteger(value)&&value>=1&&value<=168);
  function save(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    void saver.run(()=>site.save(site.settings!,value),value?`Inquiries are now flagged after ${value} hour${value===1?'':'s'} without a reply.`:'Using the server default response time.');
  }
  return <form onSubmit={save}><fieldset className={styles.plainFieldset} disabled={saver.busy}>
    <div className={styles.fields}>
      <label>Flag as overdue after<span className={styles.suffixInput}><input type="number" min={1} max={168} value={hours} placeholder="4" aria-invalid={!valid} onChange={event=>{saver.setStatus(null);setHours(event.target.value);}}/><span>hours without a reply</span></span><small>{valid?'Leave empty to use the server default (4 hours unless configured otherwise).':'Enter a whole number from 1 to 168.'}</small></label>
    </div>
    <p className={styles.hint}>The CRM checks every 30 minutes and counts clock hours, including nights and weekends. Inquiries that are already flagged stay flagged.</p>
    <SaveBar busy={saver.busy||!valid} label="Save response time" status={saver.status}/>
  </fieldset></form>;
}

/** Admin → Settings. */
export default function SettingsPage(){
  const site=useSiteSettings();
  const [section,setSection]=useState<Section>('menus');
  const current=sections.find(s=>s.id===section)!;
  return <div className={styles.page}>
    <nav className={styles.sections} aria-label="Settings sections">
      {sections.map(s=><button key={s.id} type="button" aria-current={section===s.id?'page':undefined} onClick={()=>setSection(s.id)}>{s.label}</button>)}
    </nav>
    <section className={styles.card}>
      <header className={styles.head}><h2>{current.title}</h2><p>{current.help}</p></header>
      {site.loadError&&section!=='menus'&&<p className={styles.error} role="alert">{site.loadError}</p>}
      {!site.settings&&!site.loadError&&section!=='menus'&&<p className={styles.muted} role="status">Loading settings…</p>}
      {section==='menus'&&<NavigationMenuEditor/>}
      {site.settings&&section==='content'&&<SiteSettingsEditor site={site}/>}
      {site.settings&&section==='contact'&&<ContactSection site={site}/>}
      {site.settings&&section==='crm'&&<CrmSection site={site}/>}
    </section>
  </div>;
}
