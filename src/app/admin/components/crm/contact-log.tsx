'use client';

import {FormEvent, useEffect, useState} from 'react';
import type {Activity, ActivityChannel} from '@/types/inquiry';
import {api} from '../admin-utils';
import styles from '@/app/admin/admin.module.css';

const channels: {value: ActivityChannel; label: string}[] = [
  {value: 'CALL', label: 'Call'},
  {value: 'EMAIL', label: 'Email'},
  {value: 'WHATSAPP', label: 'WhatsApp'},
];
const channelLabels: Record<string, string> = {CALL: 'Call', EMAIL: 'Email', WHATSAPP: 'WhatsApp', NOTE: 'Note', STATUS_CHANGE: 'Status', SYSTEM: 'System'};

function when(value: string) {
  return new Intl.DateTimeFormat('en-US', {month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'}).format(new Date(value));
}

/** Log calls, emails and WhatsApp messages, and see the lead's contact history. */
export default function ContactLog({reference}: {reference: string}) {
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [channel, setChannel] = useState<ActivityChannel | null>(null);
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setActivities(null);
    api<Activity[]>(`/api/admin/inquiries/${reference}/activities`)
      .then(items => setActivities([...items].sort((a, b) => b.created_at.localeCompare(a.created_at))))
      .catch(err => setError(err instanceof Error ? err.message : 'Unable to load the contact log.'));
  }, [reference]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!channel || !body.trim()) return;
    setBusy(true);
    setError('');
    try {
      const saved = await api<Activity>(`/api/admin/inquiries/${reference}/activities`, {method: 'POST', body: JSON.stringify({channel, body: body.trim()})});
      setActivities(items => [saved, ...(items || [])]);
      setBody('');
      setChannel(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to log this contact.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <div style={{display: 'flex', gap: '6px', marginTop: '14px'}}>
        {channels.map(item => (
          <button
            key={item.value}
            type="button"
            className={channel === item.value ? styles.primary : styles.secondary}
            onClick={() => setChannel(channel === item.value ? null : item.value)}
          >
            Log {item.value === 'WHATSAPP' ? item.label : item.label.toLowerCase()}
          </button>
        ))}
      </div>
      {channel && (
        <form className={styles.activityForm} onSubmit={submit}>
          <textarea
            value={body}
            onChange={event => setBody(event.target.value)}
            placeholder={channel === 'WHATSAPP' ? 'What was said on WhatsApp?' : `What happened on this ${channelLabels[channel].toLowerCase()}?`}
            maxLength={5000}
            rows={3}
            autoFocus
          />
          <button className={styles.primary} disabled={busy || !body.trim()}>{busy ? 'Saving…' : `Save ${channel === 'WHATSAPP' ? 'WhatsApp' : channelLabels[channel].toLowerCase()}`}</button>
        </form>
      )}
      {error && <small style={{color: '#b3261e'}}>{error}</small>}
      {activities === null ? (
        !error && <p className={styles.empty}>Loading contact log…</p>
      ) : activities.length > 0 && (
        <div className={styles.timelineList}>
          {activities.map(item => (
            <div key={item.id} className={styles.timelineEntry} data-channel={item.channel}>
              <div className={styles.timelineHead}>
                <span className={styles.timelineChannel}>{channelLabels[item.channel] ?? item.channel}</span>
                {item.author?.full_name && <span className={styles.timelineAuthor}>{item.author.full_name}</span>}
                <span className={styles.timelineTime}>{when(item.created_at)}</span>
              </div>
              <p className={styles.timelineBody}>{item.body}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
