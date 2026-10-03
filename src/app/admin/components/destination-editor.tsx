'use client';

import {useEffect, useMemo, useState, type FormEvent} from 'react';
import styles from './destination-editor.module.css';

type Destination = {
  name: string; slug: string; country: string; region_name: string;
  hero_media: string; gallery_images: string[]; headline: string;
  description: string; highlights: string; trail_style: string;
  pace: string; base: string; mood: string; is_active: boolean;
  altitude_meters?: number|null;
};
const blank: Destination = {name:'',slug:'',country:'NEPAL',region_name:'',hero_media:'',gallery_images:[],headline:'',description:'',highlights:'',trail_style:'',pace:'',base:'',mood:'',is_active:true,altitude_meters:null};
const countries = [['NEPAL','Nepal'],['TIBET','Tibet'],['BHUTAN','Bhutan'],['INDIA','India'],['MULTI_COUNTRY','Multiple countries']] as const;
const countryName = (value:string) => countries.find(([code]) => code === value)?.[1] ?? value.replaceAll('_',' ');
const photoUrl = (value:string) => value.trim().replace(/^https?:\/\/(?:127\.0\.0\.1|localhost):\d+(?=\/images\/)/,'');
function errorMessage(value:unknown, fallback:string) {
  if(!value || typeof value !== 'object') return fallback;
  const result=value as {error?:string;fields?:Record<string,string|string[]>};
  const fields=result.fields && Object.entries(result.fields).map(([key,messages])=>`${key.replaceAll('_',' ')}: ${Array.isArray(messages)?messages.join(', '):messages}`).join(' · ');
  return [result.error,fields].filter(Boolean).join(' — ') || fallback;
}

export default function DestinationEditor() {
  const [rows,setRows]=useState<Destination[]>([]);
  const [draft,setDraft]=useState<Destination|null>(null);
  const [originalSlug,setOriginalSlug]=useState('');
  const [slugEdited,setSlugEdited]=useState(false);
  const [galleryText,setGalleryText]=useState('');
  const [search,setSearch]=useState('');
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const altitudeSupported=rows.some(row=>Object.hasOwn(row,'altitude_meters'));
  const editorialSupported=rows.some(row=>Object.hasOwn(row,'headline'));
  const visibleRows=useMemo(()=>rows.filter(row=>`${row.name} ${row.region_name} ${countryName(row.country)}`.toLowerCase().includes(search.toLowerCase().trim())),[rows,search]);

  async function load(signal?:AbortSignal) {
    const response=await fetch('/api/admin/destinations',{signal});
    const body=await response.json();
    if(!response.ok) throw new Error(errorMessage(body,'Could not load destinations.'));
    if(!Array.isArray(body.data)) throw new Error('The destination list was incomplete.');
    setRows(body.data);
    return body.data as Destination[];
  }
  useEffect(()=>{
    const controller=new AbortController();
    load(controller.signal).catch(reason=>{if(!controller.signal.aborted)setError(reason instanceof Error?reason.message:'Could not load destinations.');})
      .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return ()=>controller.abort();
  },[]);
  function edit(row?:Destination) {
    const next=row?{...blank,...row}:{...blank};
    setDraft(next);setOriginalSlug(row?.slug??'');setSlugEdited(Boolean(row));setGalleryText(next.gallery_images.join('\n'));setError('');setNotice('');
  }
  function update<K extends keyof Destination>(key:K,value:Destination[K]) {
    setDraft(current=>current?{...current,[key]:value}:current);
  }
  async function save(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(!draft||busy)return;
    setError('');setNotice('');
    const gallery=galleryText.split(/\r?\n/).map(url=>url.trim()).filter(Boolean);
    if(gallery.some(url=>!/^https?:\/\//i.test(url))){setError('Gallery photos need full http:// or https:// image URLs.');return;}
    if(gallery.length>12){setError('Add no more than 12 gallery photos.');return;}
    setBusy(true);
    try {
      const submitted={...draft,gallery_images:gallery};
      const response=await fetch('/api/admin/destinations',{method:originalSlug?'PATCH':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...submitted,...(originalSlug?{original_slug:originalSlug}:{})})});
      const body=await response.json();
      if(!response.ok)throw new Error(errorMessage(body,'Could not save this destination.'));
      const current=await load();
      const saved=current.find(row=>row.slug===draft.slug);
      if(!saved)throw new Error('The destination save was accepted, but it could not be found after reload. Keep this form open and check the CMS.');
      const checkedFields=(['name','slug','country','region_name','hero_media','is_active','headline','description','highlights','trail_style','pace','base','mood','gallery_images','altitude_meters'] as const);
      const missing=checkedFields.filter(key=>{
        const expected=submitted[key];
        if((expected===undefined||expected===null||expected===''||(Array.isArray(expected)&&!expected.length))&&saved[key]===undefined)return false;
        return JSON.stringify(saved[key])!==JSON.stringify(expected);
      });
      if(missing.length)throw new Error(`The CMS accepted the destination but did not keep these fields after reload: ${missing.map(key=>key.replaceAll('_',' ')).join(', ')}. The form remains open; these fields need backend support before they can be published.`);
      setDraft(null);setNotice(`${draft.name} saved and verified after reload. Refresh the public page to see the change.`);
    } catch(reason){setError(reason instanceof Error?reason.message:'Could not save this destination.');}
    finally{setBusy(false);}
  }
  return <section className={styles.editor} aria-label="Destinations CMS">
    <header className={styles.heading}><div><p className={styles.eyebrow}>Website content / destinations</p><h2>{draft?(originalSlug?`Edit ${draft.name}`:'New destination'):'Your destinations'}</h2><p>{draft?'Update the details travelers see on the destination page.':'Add a place under Bhutan by setting its country to Bhutan. Assign journeys to that place in Trip Management.'}</p></div>{draft?<button type="button" className={styles.secondaryButton} onClick={()=>{setDraft(null);setError('');}}>← All destinations</button>:<div className={styles.actions}><button type="button" className={styles.secondaryButton} onClick={()=>{edit();setDraft({...blank,country:'BHUTAN'});}}>+ Add Bhutan place</button><button type="button" className={styles.primaryButton} onClick={()=>edit()}>+ Add destination</button></div>}</header>
    {error&&<p className={styles.error} role="alert">{error}</p>}{notice&&<p className={styles.notice} role="status">{notice}</p>}
    {!draft&&<><div className={styles.toolbar}><label className={styles.search}><span className="sr-only">Search destinations</span><span aria-hidden="true">⌕</span><input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search destinations"/></label><span>{loading?'Loading…':`${visibleRows.length} destination${visibleRows.length===1?'':'s'}`}</span></div>
      {loading?<p className={styles.empty} role="status">Loading destinations…</p>:visibleRows.length?<div className={styles.grid}>{visibleRows.map(row=><article className={styles.card} key={row.slug}><div className={styles.cardImage}>{row.hero_media?<img src={photoUrl(row.hero_media)} alt="" loading="lazy"/>:<span>No cover photo</span>}</div><div className={styles.cardBody}><div className={styles.cardMeta}><span>{countryName(row.country)}</span><span className={row.is_active?styles.active:styles.inactive}>{row.is_active?'Published':'Hidden'}</span></div><h3>{row.name}</h3><p>{row.headline||row.region_name||'Add a destination headline'}</p><div className={styles.cardFooter}><span>{row.gallery_images?.length||0} gallery photos</span><button type="button" onClick={()=>edit(row)}>Edit destination ↗︎</button></div></div></article>)}</div>:<p className={styles.empty}>{rows.length?'No destinations match your search.':'No destinations yet. Add the first one to begin.'}</p>}</>}
    {draft&&<form onSubmit={save} className={styles.form}>{!editorialSupported&&<p className={styles.error} role="status">This backend currently saves the destination name, country, region label, cover URL and visibility. Story, gallery and altitude fields need your backend teammate’s update. If you enter unsupported details, the save check will name them and keep this form open.</p>}<fieldset disabled={busy} className={styles.formLayout}><div className={styles.formMain}>
      <div className={styles.panel}><p className={styles.sectionLabel}>01 / The essentials</p><div className={styles.twoColumns}>
        <label>Destination name<input required maxLength={255} value={draft.name} onChange={event=>{const name=event.target.value;setDraft(current=>current?{...current,name,slug:slugEdited?current.slug:name.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}:current);}}/></label>
        <label>Page address<input required readOnly={Boolean(originalSlug)} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxLength={255} value={draft.slug} onChange={event=>{setSlugEdited(true);update('slug',event.target.value);}}/><small>{originalSlug?'Existing page addresses stay fixed to protect links.':'Lowercase letters, numbers and hyphens.'}</small></label>
        <label>Country / collection<select value={draft.country} onChange={event=>update('country',event.target.value)}>{countries.map(([value,name])=><option value={value} key={value}>{name}</option>)}</select><small>A place set to Bhutan appears under the Bhutan destination page.</small></label>
        <label>Short region name<input maxLength={150} value={draft.region_name} onChange={event=>update('region_name',event.target.value)} placeholder="e.g. Everest"/></label>
        <label>Place altitude (m)<input type="number" min={0} max={9000} value={draft.altitude_meters??''} onChange={event=>update('altitude_meters',event.target.value===''?null:Number(event.target.value))} placeholder="e.g. 2250"/><small>{altitudeSupported?'Use a confirmed elevation for this place, not a whole-country estimate.':'The current backend does not confirm this field yet. Save and reload will warn if it is not kept.'}</small></label>
      </div><label className={styles.toggle}><input type="checkbox" checked={draft.is_active} onChange={event=>update('is_active',event.target.checked)}/><span><strong>Published</strong><small>Visible on the public website</small></span></label></div>
      <div className={styles.panel}><p className={styles.sectionLabel}>02 / Tell the story</p>
        <label>Headline<input maxLength={180} value={draft.headline} onChange={event=>update('headline',event.target.value)} placeholder="A short, memorable invitation"/></label>
        <label>Description<textarea rows={5} value={draft.description} onChange={event=>update('description',event.target.value)} placeholder="Introduce the landscape, culture and journey."/></label>
        <div className={styles.twoColumns}>
          <label>Highlights<input maxLength={400} value={draft.highlights} onChange={event=>update('highlights',event.target.value)} placeholder="Places and moments along the way"/></label>
          <label>Trail character<input maxLength={200} value={draft.trail_style} onChange={event=>update('trail_style',event.target.value)}/></label>
          <label>Pace<input maxLength={200} value={draft.pace} onChange={event=>update('pace',event.target.value)}/></label>
          <label>Base / starting place<input maxLength={150} value={draft.base} onChange={event=>update('base',event.target.value)}/></label>
        </div><label>Journey style<select value={draft.mood} onChange={event=>update('mood',event.target.value)}><option value="">Any style</option><option value="high-passes">High passes</option><option value="culture">Culture</option><option value="remote">Remote trails</option></select></label>
      </div></div><aside className={styles.formAside}><div className={styles.panel}><p className={styles.sectionLabel}>03 / Photography</p><div className={styles.preview}>{draft.hero_media?<img src={photoUrl(draft.hero_media)} alt="Cover preview"/>:<span>Cover preview</span>}</div>
        <label>Cover image URL<input type="url" maxLength={500} value={draft.hero_media} onChange={event=>update('hero_media',event.target.value)} placeholder="https://…"/><small>Use a public image URL. This photo appears across the destination pages.</small></label>
        <label>Gallery image URLs<textarea rows={6} value={galleryText} onChange={event=>setGalleryText(event.target.value)} placeholder={'https://…\nhttps://…'}/><small>One full URL per line, up to 12 photos. Order here controls display order.</small></label>
      </div><div className={styles.actions}><button type="submit" className={styles.primaryButton}>{busy?'Saving…':'Save destination'}</button><button type="button" className={styles.secondaryButton} onClick={()=>{setDraft(null);setError('');}}>Cancel</button></div></aside></fieldset></form>}
  </section>;
}
