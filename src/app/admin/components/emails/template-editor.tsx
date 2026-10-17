'use client';

import {useCallback, useEffect, useState, type FormEvent} from 'react';
import type {EmailTemplate} from '@/types/email';
import {api} from '../admin-utils';
import {textToHtml, VARIABLES} from './email-utils';
import adminStyles from '@/app/admin/admin.module.css';
import styles from './emails.module.css';

type Draft = {id?: string; slug: string; name: string; subject: string; body_text: string; is_active: boolean; is_system: boolean};
const blank: Draft = {slug: '', name: '', subject: '', body_text: '', is_active: true, is_system: false};

export default function TemplateEditor() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{tone: 'ok' | 'error'; text: string} | null>(null);

  const load = useCallback(async () => {
    try { setTemplates(await api<EmailTemplate[]>('/api/admin/email-templates')); }
    catch (reason) { setStatus({tone: 'error', text: reason instanceof Error ? reason.message : 'Templates could not be loaded.'}); }
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  function edit(template: EmailTemplate) {
    setStatus(null);
    setDraft({id: template.id, slug: template.slug, name: template.name, subject: template.subject, body_text: template.body_text, is_active: template.is_active, is_system: template.is_system});
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    setBusy(true); setStatus(null);
    const body = JSON.stringify({slug: draft.slug, name: draft.name, subject: draft.subject, body_text: draft.body_text, body_html: textToHtml(draft.body_text), is_active: draft.is_active});
    try {
      const saved = draft.id
        ? await api<EmailTemplate>(`/api/admin/email-templates/${draft.id}`, {method: 'PATCH', body})
        : await api<EmailTemplate>('/api/admin/email-templates', {method: 'POST', body});
      await load();
      edit(saved);
      setStatus({tone: 'ok', text: 'Template saved.'});
    } catch (reason) {
      setStatus({tone: 'error', text: reason instanceof Error ? reason.message : 'The template could not be saved.'});
    } finally { setBusy(false); }
  }

  async function remove() {
    if (!draft?.id || !window.confirm(`Delete the template "${draft.name}"?`)) return;
    setBusy(true); setStatus(null);
    try { await api(`/api/admin/email-templates/${draft.id}`, {method: 'DELETE'}); setDraft(null); await load(); }
    catch (reason) { setStatus({tone: 'error', text: reason instanceof Error ? reason.message : 'The template could not be deleted.'}); }
    finally { setBusy(false); }
  }

  const slugFromName = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);

  return <div className={styles.split}>
    <div className={styles.list}>
      <button type="button" className={adminStyles.primary} onClick={() => { setStatus(null); setDraft(blank); }}>New template</button>
      {templates.map(template => <button type="button" key={template.id} className={`${styles.listItem} ${draft?.id === template.id ? styles.listItemActive : ''}`} onClick={() => edit(template)}>
        <strong>{template.name}</strong>
        <div className={styles.hint}>{template.is_system ? 'Used automatically' : template.is_active ? 'Active' : 'Hidden'}</div>
      </button>)}
    </div>
    {draft ? <form className={styles.form} onSubmit={save}>
      <label>Name
        <input required maxLength={120} value={draft.name} onChange={event => setDraft({...draft, name: event.target.value, slug: draft.id ? draft.slug : slugFromName(event.target.value)})} />
      </label>
      <label>Subject
        <input required maxLength={200} value={draft.subject} onChange={event => setDraft({...draft, subject: event.target.value})} />
      </label>
      <label>Message
        <textarea required maxLength={20000} value={draft.body_text} onChange={event => setDraft({...draft, body_text: event.target.value})} />
        <span className={styles.hint}>Leave a blank line between paragraphs. Use placeholders to personalise it:</span>
      </label>
      <div className={styles.vars}>
        {VARIABLES.map(item => <button type="button" key={item.name} className={styles.var} title={item.label}
          onClick={() => setDraft({...draft, body_text: `${draft.body_text}{{${item.name}}}`})}>{`{{${item.name}}}`}</button>)}
      </div>
      {!draft.is_system && <label className={styles.row} style={{flexDirection: 'row'}}>
        <input type="checkbox" checked={draft.is_active} onChange={event => setDraft({...draft, is_active: event.target.checked})} /> Available when composing
      </label>}
      {draft.is_system && <p className={styles.hint}>This template is sent automatically to everyone who submits an inquiry. It can be edited but not deleted.</p>}
      <div className={styles.row}>
        <button type="submit" className={adminStyles.primary} disabled={busy}>{busy ? 'Saving…' : 'Save template'}</button>
        {draft.id && !draft.is_system && <button type="button" className={adminStyles.secondary} disabled={busy} onClick={() => void remove()}>Delete</button>}
        {status && <p className={status.tone === 'ok' ? styles.ok : styles.error} role={status.tone === 'ok' ? 'status' : 'alert'}>{status.text}</p>}
      </div>
    </form> : <div>{status ? <p className={styles.error} role="alert">{status.text}</p> : <p>Choose a template to edit, or create a new one.</p>}</div>}
  </div>;
}
