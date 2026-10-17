'use client';

import {useEffect, useState, type FormEvent} from 'react';
import type {EmailTemplate} from '@/types/email';
import {api} from '../admin-utils';
import {hasPlaceholder, VARIABLES} from './email-utils';
import adminStyles from '@/app/admin/admin.module.css';
import styles from './emails.module.css';

export type ComposeDefaults = {recipient?: string; inquiry_number?: string};

export default function Compose({defaults, onSent}: {defaults?: ComposeDefaults; onSent?: () => void}) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [templateId, setTemplateId] = useState('');
  const [recipient, setRecipient] = useState(defaults?.recipient || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{tone: 'ok' | 'error'; text: string} | null>(null);
  const inquiry = defaults?.inquiry_number || '';
  const template = templates.find(item => item.id === templateId);

  useEffect(() => {
    api<EmailTemplate[]>('/api/admin/email-templates')
      .then(rows => setTemplates(rows.filter(row => row.is_active && row.slug !== 'inquiry-received')))
      .catch(reason => setStatus({tone: 'error', text: reason instanceof Error ? reason.message : 'Templates could not be loaded.'}));
  }, []);

  function pick(id: string) {
    setTemplateId(id);
    const chosen = templates.find(item => item.id === id);
    setSubject(chosen?.subject || '');
    setMessage(chosen?.body_text || '');
    setStatus(null);
  }

  function review(event: FormEvent) {
    event.preventDefault();
    setStatus(null);
    setConfirming(true);
  }

  async function send() {
    setBusy(true);
    try {
      // An unedited template goes as-is so its designed HTML is kept; edits send the text.
      const edited = !template || template.subject !== subject || template.body_text !== message;
      await api('/api/admin/emails', {method: 'POST', body: JSON.stringify({
        recipient: recipient.trim(), inquiry_number: inquiry || undefined, template: templateId || undefined,
        ...(edited ? {subject, body_text: message} : {}),
      })});
      setStatus({tone: 'ok', text: `Email to ${recipient.trim()} is queued. Check the Sent tab for delivery status.`});
      setTemplateId(''); setSubject(''); setMessage('');
      if (!defaults?.recipient) setRecipient('');
      onSent?.();
    } catch (reason) {
      setStatus({tone: 'error', text: reason instanceof Error ? reason.message : 'The email could not be sent. Check the Sent tab before trying again.'});
    } finally { setBusy(false); setConfirming(false); }
  }

  const unfilled = !inquiry && hasPlaceholder(subject, message);

  return <form className={styles.form} onSubmit={review}>
    <label>Template
      <select value={templateId} onChange={event => pick(event.target.value)}>
        <option value="">Write from scratch</option>
        {templates.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
    </label>
    <label>To
      <input type="email" required value={recipient} onChange={event => setRecipient(event.target.value)} placeholder="name@example.com" />
    </label>
    <label>Subject
      <input required maxLength={200} value={subject} onChange={event => setSubject(event.target.value)} />
    </label>
    <label>Message
      <textarea required maxLength={20000} value={message} onChange={event => setMessage(event.target.value)} />
      <span className={styles.hint}>
        {inquiry ? `Placeholders are filled from inquiry ${inquiry}.` : 'Placeholders are only filled when the email is sent from an inquiry.'}
      </span>
    </label>
    <div className={styles.vars} aria-label="Placeholders">
      {VARIABLES.map(item => <button type="button" key={item.name} className={styles.var} title={item.label}
        onClick={() => setMessage(current => `${current}{{${item.name}}}`)}>{`{{${item.name}}}`}</button>)}
    </div>
    {unfilled && <p className={styles.error} role="alert">This message contains placeholders, but no inquiry is attached, so they will be blank.</p>}
    <div className={styles.row}>
      <button type="submit" className={adminStyles.primary} disabled={busy}>Review and send</button>
      {status && <p className={status.tone === 'ok' ? styles.ok : styles.error} role={status.tone === 'ok' ? 'status' : 'alert'}>{status.text}</p>}
    </div>
    {confirming && <div className={adminStyles.modalBackdrop} role="dialog" aria-modal="true" aria-label="Confirm send">
      <div className={adminStyles.modal} style={{maxWidth: 480, width: '100%'}}>
        <h3>Send this email?</h3>
        <p>To <strong>{recipient}</strong></p>
        <p>{subject}</p>
        <div className={styles.row}>
          <button type="button" className={adminStyles.primary} disabled={busy} onClick={() => void send()}>{busy ? 'Sending…' : 'Send'}</button>
          <button type="button" className={adminStyles.secondary} disabled={busy} onClick={() => setConfirming(false)}>Back</button>
        </div>
      </div>
    </div>}
  </form>;
}
