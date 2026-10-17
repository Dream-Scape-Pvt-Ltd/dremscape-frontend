'use client';

import {useCallback, useEffect, useState} from 'react';
import type {EmailStatus, OutboundEmail} from '@/types/email';
import {api, type Page} from '../admin-utils';
import {dateTime, KIND_LABEL, STATUS_LABEL, STATUS_TONE} from './email-utils';
import adminStyles from '@/app/admin/admin.module.css';
import styles from './emails.module.css';

export function StatusChip({status}: {status: EmailStatus}) {
  return <span className={`${styles.chip} ${styles[STATUS_TONE[status]]}`}>{STATUS_LABEL[status]}</span>;
}

/** Sent-mail log. Pass `inquiry` to show only the emails sent for one lead; `refreshKey` reloads after a send. */
export default function SentLog({inquiry, refreshKey = 0}: {inquiry?: string; refreshKey?: number}) {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [data, setData] = useState<Page<OutboundEmail> | null>(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState<OutboundEmail | null>(null);
  const [busyId, setBusyId] = useState('');

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (inquiry) params.set('inquiry', inquiry);
    if (status) params.set('status', status);
    if (query) params.set('search', query);
    if (page > 1) params.set('page', String(page));
    try { setData(await api<Page<OutboundEmail>>(`/api/admin/emails?${params}`)); setError(''); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'The sent emails could not be loaded.'); }
  }, [inquiry, status, query, page]);

  // Reload on filter changes and after a send; refresh quietly so delivery updates show up.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    const timer = setInterval(() => void load(), 30000);
    return () => clearInterval(timer);
  }, [load, refreshKey]);

  async function resend(email: OutboundEmail) {
    setBusyId(email.id);
    try { await api(`/api/admin/emails/${email.id}/resend`, {method: 'POST'}); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'The email could not be queued again.'); }
    finally { setBusyId(''); }
  }

  return <section>
    <form className={styles.toolbar} onSubmit={event => { event.preventDefault(); setPage(1); setQuery(search.trim()); }}>
      {!inquiry && <input type="search" placeholder="Search recipient or subject" value={search} onChange={event => setSearch(event.target.value)} aria-label="Search sent emails" />}
      <select value={status} onChange={event => { setPage(1); setStatus(event.target.value); }} aria-label="Filter by status">
        <option value="">All statuses</option>
        {(Object.keys(STATUS_LABEL) as EmailStatus[]).map(value => <option key={value} value={value}>{STATUS_LABEL[value]}</option>)}
      </select>
      {!inquiry && <button type="submit" className={adminStyles.secondary}>Search</button>}
    </form>
    {error && <p className={styles.error} role="alert">{error}</p>}
    {data && data.results.length === 0 && <p>No emails yet.</p>}
    {data && data.results.length > 0 && <table className={adminStyles.modernTable}>
      <thead><tr><th>Sent</th><th>To</th><th>Subject</th><th>Type</th><th>Status</th><th /></tr></thead>
      <tbody>{data.results.map(email => <tr key={email.id}>
        <td>{dateTime(email.sent_at || email.created_at)}</td>
        <td>{email.recipient}{email.inquiry_number && <div className={styles.hint}>{email.inquiry_number}</div>}</td>
        <td><button type="button" className={styles.link} onClick={() => setOpen(email)}>{email.subject}</button></td>
        <td>{KIND_LABEL[email.kind]}{email.sent_by_name && <div className={styles.hint}>{email.sent_by_name}</div>}</td>
        <td><StatusChip status={email.status} />{email.status === 'FAILED' && email.last_error && <div className={styles.hint}>{email.last_error}</div>}</td>
        <td>{email.status === 'FAILED' && <button type="button" className={adminStyles.secondary} disabled={busyId === email.id} onClick={() => void resend(email)}>{busyId === email.id ? 'Queuing…' : 'Send again'}</button>}</td>
      </tr>)}</tbody>
    </table>}
    {data && (data.previous || data.next) && <div className={styles.row} style={{marginTop: 12}}>
      <button type="button" className={adminStyles.secondary} disabled={!data.previous} onClick={() => setPage(page - 1)}>Previous</button>
      <span>Page {page}</span>
      <button type="button" className={adminStyles.secondary} disabled={!data.next} onClick={() => setPage(page + 1)}>Next</button>
    </div>}
    {open && <div className={adminStyles.modalBackdrop} role="dialog" aria-modal="true" aria-label="Email preview" onClick={() => setOpen(null)}>
      <div className={adminStyles.modal} onClick={event => event.stopPropagation()} style={{maxWidth: 640, width: '100%'}}>
        <h3>{open.subject}</h3>
        <p className={styles.hint}>To {open.recipient} · <StatusChip status={open.status} /> · {dateTime(open.sent_at || open.created_at)}</p>
        {/* Rendered in a sandboxed frame: the body is staff-authored HTML and must not run scripts. */}
        <iframe title="Email body" sandbox="" srcDoc={open.body_html} style={{width: '100%', height: 320, border: '1px solid #dfe7e2', borderRadius: 8}} />
        <div className={styles.row} style={{marginTop: 12}}><button type="button" className={adminStyles.secondary} onClick={() => setOpen(null)}>Close</button></div>
      </div>
    </div>}
  </section>;
}
