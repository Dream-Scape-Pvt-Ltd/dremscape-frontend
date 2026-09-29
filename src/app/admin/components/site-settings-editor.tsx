'use client';

import {useState, type FormEvent} from 'react';
import type {SiteSettings} from '@/lib/site-settings-defaults';
import type {SiteSettingsState} from './use-site-settings';
import WebsiteContentFields from './website-content-fields';
import styles from './cms-fields.module.css';
import settingsStyles from './settings.module.css';

const fields = [
  ['home_title','Homepage headline'],['home_description','Homepage introduction'],['home_eyebrow','Homepage label'],['company_title','Company headline'],['company_accent','Company subtitle'],['gallery_title','Gallery headline'],['gallery_description','Gallery introduction'],
  ['home_image_url','Homepage photo URL (blank uses the original)'],
  ['home_image_alt','Homepage photo description'],
  ['journal_title','Journal headline'],['journal_description','Journal introduction'],
  ['featured_story_slug','Featured published story slug'],
] as const;
const textareas=['home_description','gallery_description','journal_description'];
const optional=['home_image_url','featured_story_slug'];
const maxLength:Record<string,number>={home_image_url:500,journal_title:120,home_image_alt:250,featured_story_slug:255,journal_description:400};

/** Admin → Settings → Website content: homepage, company, partner, gallery and journal copy. */
export default function SiteSettingsEditor({site}:{site:SiteSettingsState}) {
  const [data,setData]=useState<SiteSettings>(site.settings!);
  const [busy,setBusy]=useState(false);
  const [status,setStatus]=useState<{tone:'ok'|'error';text:string}|null>(null);
  const change=(next:SiteSettings)=>{setStatus(null);setData(next);};

  async function save(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(busy)return;
    setBusy(true);setStatus(null);
    const edited=Object.fromEntries([...fields.map(([key])=>key),'company_content','partner_content','gallery_images'].map(key=>[key,data[key as keyof SiteSettings]]));
    try{await site.save({...site.settings!,...edited});setStatus({tone:'ok',text:'Saved. The public pages update within a minute.'});}
    catch(reason){setStatus({tone:'error',text:reason instanceof Error?reason.message:'Could not save the website content.'});}
    finally{setBusy(false);}
  }
  return <form onSubmit={save} className={styles.form}><fieldset disabled={busy}>
    <div className={styles.grid}>
      {fields.map(([key,label])=><label className={`${styles.field} ${['home_image_url','journal_description'].includes(key)?styles.fieldWide:''}`} key={key}>
        {label}
        {textareas.includes(key)
          ? <textarea name={key} rows={3} maxLength={maxLength[key]||500} value={String(data[key])} onChange={event=>change({...data,[key]:event.target.value})}/>
          : <input name={key} type="text" maxLength={maxLength[key]||300} required={!optional.includes(key)} value={data[key]} onChange={event=>change({...data,[key]:event.target.value})}/>}
      </label>)}
    </div>
    <WebsiteContentFields data={data} onChange={change}/>
    <div className={settingsStyles.saveBar}>
      <button className={settingsStyles.primary} type="submit">{busy?'Saving…':'Save website content'}</button>
      {status&&<p className={status.tone==='ok'?settingsStyles.ok:settingsStyles.error} role={status.tone==='ok'?'status':'alert'}>{status.text}</p>}
    </div>
  </fieldset></form>;
}
