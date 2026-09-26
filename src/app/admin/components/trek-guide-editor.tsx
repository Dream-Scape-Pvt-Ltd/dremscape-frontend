'use client';

import {useEffect, useMemo, useState, type FormEvent, type KeyboardEvent} from 'react';
import styles from './destination-editor.module.css';
import extra from './trek-guide-editor.module.css';

/**
 * Admin editor for the public Guides page: the people who lead treks. Not to
 * be confused with the journal studio, whose articles are "travel guides".
 */
type Option = {slug: string; name: string};
type GuideRow = {
  slug: string; name: string; role: string; photo_url: string; years_experience: number | null;
  languages: string[]; regions: Option[]; is_published: boolean; display_order: number;
};
type Draft = {
  slug: string; name: string; role: string; photo_url: string; bio: string; years_experience: string;
  languages: string[]; certifications: string[]; regions: string[]; treks_led: string[];
  is_published: boolean; display_order: string;
};
const blank: Draft = {slug:'',name:'',role:'',photo_url:'',bio:'',years_experience:'',languages:[],certifications:[],regions:[],treks_led:[],is_published:false,display_order:'0'};
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// Development backends return photos on their own host; strip it so the preview loads here.
const photoUrl = (value: string) => value.trim().replace(/^https?:\/\/(?:127\.0\.0\.1|localhost):\d+(?=\/(?:images|media)\/)/, '');

function errorMessage(value: unknown, fallback: string) {
  if (!value || typeof value !== 'object') return fallback;
  const result = value as {error?: string; fields?: Record<string, string | string[]>};
  const fields = result.fields && Object.entries(result.fields).map(([key, messages]) => `${key.replaceAll('_', ' ')}: ${Array.isArray(messages) ? messages.join(', ') : messages}`).join(' · ');
  return [result.error, fields].filter(Boolean).join(' — ') || fallback;
}
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(errorMessage(body, 'The request could not be completed.'));
  return body.data as T;
}

/** A list of short entries (languages, certifications): type and press Enter or comma to add. */
function TagInput({label, values, onChange, placeholder}: {label: string; values: string[]; onChange: (next: string[]) => void; placeholder: string}) {
  const [text, setText] = useState('');
  function add() {
    const entry = text.trim().replace(/,$/, '').trim();
    if (entry && !values.includes(entry)) onChange([...values, entry]);
    setText('');
  }
  function onKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') { event.preventDefault(); add(); }
    else if (event.key === 'Backspace' && !text && values.length) onChange(values.slice(0, -1));
  }
  return <label>{label}
    <span className={extra.tags}>
      {values.map(value => <span className={extra.tag} key={value}>{value}<button type="button" aria-label={`Remove ${value}`} onClick={() => onChange(values.filter(v => v !== value))}>×</button></span>)}
      <input value={text} onChange={event => setText(event.target.value)} onKeyDown={onKey} onBlur={add} placeholder={values.length ? '' : placeholder} maxLength={120}/>
    </span>
    <small>Press Enter after each one.</small>
  </label>;
}

/** Tick-box list for choosing regions or treks. */
function Checklist({legend, options, selected, onChange, empty}: {legend: string; options: Option[]; selected: string[]; onChange: (next: string[]) => void; empty: string}) {
  return <fieldset className={extra.checklist}><legend>{legend}</legend>
    {options.length ? options.map(option => <label key={option.slug}><input type="checkbox" checked={selected.includes(option.slug)} onChange={event => onChange(event.target.checked ? [...selected, option.slug] : selected.filter(slug => slug !== option.slug))}/><span>{option.name}</span></label>) : <p>{empty}</p>}
  </fieldset>;
}

export default function TrekGuideEditor() {
  const [rows, setRows] = useState<GuideRow[]>([]);
  const [regions, setRegions] = useState<Option[]>([]);
  const [treks, setTreks] = useState<Option[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [originalSlug, setOriginalSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const visibleRows = useMemo(() => rows.filter(row => `${row.name} ${row.role}`.toLowerCase().includes(search.toLowerCase().trim())), [rows, search]);

  async function loadGuides() {
    const data = await request<GuideRow[]>('/api/admin/trek-guides');
    if (!Array.isArray(data)) throw new Error('The guide list was incomplete.');
    setRows(data);
  }
  useEffect(() => {
    let live = true;
    Promise.all([
      loadGuides(),
      request<{treks: {results?: {slug: string; title: string}[]}; destinations: {slug: string; name: string}[]}>('/api/admin/treks?page_size=100').then(data => {
        if (!live) return;
        setTreks((data.treks?.results || []).map(t => ({slug: t.slug, name: t.title})));
        setRegions((data.destinations || []).map(d => ({slug: d.slug, name: d.name})));
      }),
    ]).catch(reason => { if (live) setError(reason instanceof Error ? reason.message : 'Could not load guides.'); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, []);

  async function edit(row?: GuideRow) {
    setError(''); setNotice(''); setConfirmDelete(false);
    if (!row) { setDraft({...blank}); setOriginalSlug(''); setSlugEdited(false); return; }
    setBusy(true);
    try {
      // The list leaves out the bio, certifications and treks; load the full profile.
      const full = await request<GuideRow & {bio: string; certifications: string[]; treks_led: {slug: string}[]}>(`/api/admin/trek-guides/${row.slug}`);
      setDraft({
        slug: full.slug, name: full.name, role: full.role || '', photo_url: full.photo_url || '', bio: full.bio || '',
        years_experience: full.years_experience === null ? '' : String(full.years_experience),
        languages: full.languages || [], certifications: full.certifications || [],
        regions: (full.regions || []).map(r => r.slug), treks_led: (full.treks_led || []).map(t => t.slug),
        is_published: full.is_published, display_order: String(full.display_order ?? 0),
      });
      setOriginalSlug(full.slug); setSlugEdited(true);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not open this guide.'); }
    finally { setBusy(false); }
  }
  function update<K extends keyof Draft>(key: K, value: Draft[K]) { setDraft(current => current ? {...current, [key]: value} : current); }

  async function uploadPhoto(file: File | undefined) {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setError('Choose a JPEG, PNG or WebP photo.'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('Choose a photo under 10 MB.'); return; }
    setUploading(true); setError('');
    try {
      const form = new FormData(); form.append('files', file);
      const data = await request<{files: {url: string}[]}>('/api/admin/guides/media', {method: 'POST', body: form});
      if (!data.files?.[0]?.url) throw new Error('The upload did not return a photo address.');
      update('photo_url', data.files[0].url);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not upload the photo.'); }
    finally { setUploading(false); }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft || busy) return;
    const years = draft.years_experience.trim() === '' ? null : Number(draft.years_experience);
    if (years !== null && (!Number.isInteger(years) || years < 0 || years > 80)) { setError('Enter years of experience as a whole number up to 80.'); return; }
    setBusy(true); setError(''); setNotice('');
    const payload = {
      slug: draft.slug, name: draft.name.trim(), role: draft.role.trim(), photo_url: draft.photo_url.trim(), bio: draft.bio.trim(),
      years_experience: years, languages: draft.languages, certifications: draft.certifications, regions: draft.regions,
      treks_led: draft.treks_led, is_published: draft.is_published, display_order: Math.max(0, Number(draft.display_order) || 0),
    };
    try {
      await request(originalSlug ? `/api/admin/trek-guides/${originalSlug}` : '/api/admin/trek-guides', {method: originalSlug ? 'PATCH' : 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)});
      await loadGuides(); setDraft(null);
      setNotice(`${payload.name} saved.${payload.is_published ? ' It now appears on the Guides page.' : ' This profile is a draft and not visible to visitors.'}`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not save this guide.'); }
    finally { setBusy(false); }
  }

  async function remove(permanent: boolean) {
    if (!originalSlug || busy) return;
    setBusy(true); setError('');
    try {
      await request(`/api/admin/trek-guides/${originalSlug}${permanent ? '?permanent=true' : ''}`, {method: 'DELETE'});
      await loadGuides(); const name = draft?.name; setDraft(null); setConfirmDelete(false);
      setNotice(permanent ? `${name}’s profile was deleted.` : `${name} is now hidden from the Guides page.`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not update this guide.'); }
    finally { setBusy(false); }
  }

  return <section className={styles.editor} aria-label="Guides">
    <header className={styles.heading}><div><h2>{draft ? (originalSlug ? `Edit ${draft.name}` : 'New guide') : 'Guides'}</h2><p>{draft ? 'These details appear on the public Guides page and the guide’s profile.' : 'The people who lead your treks, shown on the public Guides page.'}</p></div>
      {draft ? <button type="button" className={styles.secondaryButton} onClick={() => { setDraft(null); setError(''); }}>Back to all guides</button> : <button type="button" className={styles.primaryButton} onClick={() => void edit()}>Add guide</button>}</header>
    {error && <p className={styles.error} role="alert">{error}</p>}{notice && <p className={styles.notice} role="status">{notice}</p>}

    {!draft && <><div className={styles.toolbar}><label className={styles.search}><span className="sr-only">Search guides</span><span aria-hidden="true">⌕</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search guides"/></label><span>{loading ? 'Loading…' : `${visibleRows.length} guide${visibleRows.length === 1 ? '' : 's'}`}</span></div>
      {loading ? <p className={styles.empty} role="status">Loading guides…</p>
      : visibleRows.length ? <div className={styles.grid}>{visibleRows.map(row => <article className={styles.card} key={row.slug}>
          <div className={`${styles.cardImage} ${extra.portrait}`}>{row.photo_url ? <img src={photoUrl(row.photo_url)} alt="" loading="lazy"/> : <span>No photo yet</span>}</div>
          <div className={styles.cardBody}><div className={styles.cardMeta}><span>Order {row.display_order}</span><span className={row.is_published ? styles.active : styles.inactive}>{row.is_published ? 'Published' : 'Draft'}</span></div>
            <h3>{row.name}</h3><p>{[row.role, row.years_experience !== null ? `${row.years_experience} years` : '', row.languages.join(', ')].filter(Boolean).join(' · ') || 'No details yet'}</p>
            <div className={styles.cardFooter}><span>{row.regions.map(r => r.name).join(', ') || 'No regions'}</span><button type="button" onClick={() => void edit(row)}>Edit</button></div></div>
        </article>)}</div>
      : <p className={styles.empty}>{rows.length ? 'No guides match this search.' : 'No guides yet. Add the first guide to start the Guides page.'}</p>}</>}

    {draft && <form onSubmit={save} className={styles.form}><fieldset disabled={busy} className={styles.formLayout}><div className={styles.formMain}>
      <div className={styles.panel}><p className={styles.sectionLabel}>Profile</p><div className={styles.twoColumns}>
        <label>Full name<input required maxLength={150} value={draft.name} onChange={event => { const name = event.target.value; setDraft(current => current ? {...current, name, slug: slugEdited ? current.slug : slugify(name)} : current); }}/></label>
        <label>Page address<input required readOnly={Boolean(originalSlug)} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxLength={160} value={draft.slug} onChange={event => { setSlugEdited(true); update('slug', event.target.value); }}/><small>{originalSlug ? 'Fixed once saved, so older links keep working.' : 'Lowercase letters, numbers and hyphens. Visitors open the profile by its id.'}</small></label>
        <label>Role<input maxLength={120} value={draft.role} onChange={event => update('role', event.target.value)} placeholder="e.g. Lead trekking guide"/></label>
        <label>Years guiding<input type="number" min={0} max={80} inputMode="numeric" value={draft.years_experience} onChange={event => update('years_experience', event.target.value)}/></label>
      </div>
      <label>About this guide<textarea rows={7} value={draft.bio} onChange={event => update('bio', event.target.value)} placeholder="Where they grew up, the routes they know best, what trekkers remember about them."/><small>Leave a blank line between paragraphs.</small></label>
      <div className={styles.twoColumns}>
        <TagInput label="Languages" values={draft.languages} onChange={value => update('languages', value)} placeholder="English, Nepali…"/>
        <TagInput label="Certifications" values={draft.certifications} onChange={value => update('certifications', value)} placeholder="Licensed trekking guide, Wilderness first aid…"/>
      </div></div>
      <div className={styles.panel}><p className={styles.sectionLabel}>Where they lead</p><div className={styles.twoColumns}>
        <Checklist legend="Regions" options={regions} selected={draft.regions} onChange={value => update('regions', value)} empty="No destinations yet."/>
        <Checklist legend="Treks they lead" options={treks} selected={draft.treks_led} onChange={value => update('treks_led', value)} empty="No treks yet."/>
      </div></div>
    </div><aside className={styles.formAside}>
      <div className={styles.panel}><p className={styles.sectionLabel}>Photo</p>
        <div className={`${styles.preview} ${extra.portraitPreview}`}>{draft.photo_url ? <img src={photoUrl(draft.photo_url)} alt="Photo preview"/> : <span>No photo yet</span>}</div>
        <label>Upload a photo<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={event => { void uploadPhoto(event.target.files?.[0]); event.target.value = ''; }}/><small>{uploading ? 'Uploading…' : 'A portrait works best. JPEG, PNG or WebP, up to 10 MB.'}</small></label>
        {draft.photo_url && <button type="button" className={styles.secondaryButton} onClick={() => update('photo_url', '')}>Remove photo</button>}
      </div>
      <div className={styles.panel}><p className={styles.sectionLabel}>Publishing</p>
        <label className={styles.toggle}><input type="checkbox" checked={draft.is_published} onChange={event => update('is_published', event.target.checked)}/><span><strong>Published</strong><small>Visible on the public Guides page</small></span></label>
        <label>Display order<input type="number" min={0} max={999} value={draft.display_order} onChange={event => update('display_order', event.target.value)}/><small>Lower numbers appear first.</small></label>
      </div>
      <div className={styles.actions}><button type="submit" className={styles.primaryButton}>{busy ? 'Saving…' : 'Save guide'}</button><button type="button" className={styles.secondaryButton} onClick={() => { setDraft(null); setError(''); }}>Cancel</button></div>
      {originalSlug && <div className={`${styles.panel} ${extra.danger}`}>
        {draft.is_published && <button type="button" className={styles.secondaryButton} onClick={() => void remove(false)}>Hide from the Guides page</button>}
        {confirmDelete ? <p>Delete {draft.name}’s profile for good? <button type="button" className={extra.dangerButton} onClick={() => void remove(true)}>Delete profile</button><button type="button" className={styles.secondaryButton} onClick={() => setConfirmDelete(false)}>Keep it</button></p>
          : <button type="button" className={extra.dangerLink} onClick={() => setConfirmDelete(true)}>Delete profile…</button>}
      </div>}
    </aside></fieldset></form>}
  </section>;
}
