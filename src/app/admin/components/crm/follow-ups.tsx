'use client';

import {FormEvent, useEffect, useState} from 'react';
import type {CrmTask} from '@/types/inquiry';
import {api} from '../admin-utils';
import styles from '@/app/admin/admin.module.css';

function dueLabel(value: string) {
  return new Intl.DateTimeFormat('en-US', {month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'}).format(new Date(value));
}
const isOverdue = (task: CrmTask) => task.status === 'OPEN' && new Date(task.due_at).getTime() < Date.now();
function endOfToday() {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return end.getTime();
}
/** Tomorrow at 10:00 local time, as a datetime-local value. */
function defaultDue() {
  const due = new Date();
  due.setDate(due.getDate() + 1);
  due.setHours(10, 0, 0, 0);
  return new Date(due.getTime() - due.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

/** Follow-ups on one lead: schedule the next one and tick them off. */
export function LeadFollowUps({reference, onChanged}: {reference: string; onChanged: () => void}) {
  const [tasks, setTasks] = useState<CrmTask[] | null>(null);
  const [title, setTitle] = useState('');
  const [due, setDue] = useState(defaultDue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setTasks(null);
    api<CrmTask[]>(`/api/admin/inquiries/${reference}/tasks`)
      .then(setTasks)
      .catch(err => setError(err instanceof Error ? err.message : 'Unable to load follow-ups.'));
  }, [reference]);

  async function add(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !due) return;
    setBusy(true);
    setError('');
    try {
      const task = await api<CrmTask>(`/api/admin/inquiries/${reference}/tasks`, {method: 'POST', body: JSON.stringify({title: title.trim(), due_at: new Date(due).toISOString()})});
      setTasks(items => [...(items || []), task].sort((a, b) => a.due_at.localeCompare(b.due_at)));
      setTitle('');
      setDue(defaultDue());
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to schedule the follow-up.');
    } finally {
      setBusy(false);
    }
  }

  async function complete(task: CrmTask) {
    setBusy(true);
    try {
      const saved = await api<CrmTask>(`/api/admin/tasks/${task.id}`, {method: 'PATCH', body: JSON.stringify({status: 'DONE'})});
      setTasks(items => items?.map(item => item.id === saved.id ? saved : item) ?? null);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update the follow-up.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      {tasks === null ? (
        !error && <p className={styles.empty}>Loading follow-ups…</p>
      ) : tasks.length > 0 && (
        <div className={styles.taskList}>
          {tasks.map(task => (
            <div key={task.id} className={styles.taskRow} data-status={task.status}>
              <span className={styles.taskRowTitle}>{task.title}</span>
              <span className={styles.taskRowDue} style={isOverdue(task) ? {color: '#b3261e', fontWeight: 700} : undefined}>
                {isOverdue(task) ? 'Overdue · ' : ''}{dueLabel(task.due_at)}
              </span>
              {task.status === 'OPEN' && (
                <button type="button" className={styles.taskDoneBtn} disabled={busy} onClick={() => void complete(task)}>✓ Done</button>
              )}
            </div>
          ))}
        </div>
      )}
      <form className={styles.taskForm} onSubmit={add}>
        <input type="text" value={title} onChange={event => setTitle(event.target.value)} placeholder="Next follow-up, e.g. Send itinerary" maxLength={255} />
        <input type="datetime-local" value={due} onChange={event => setDue(event.target.value)} aria-label="Follow-up due" />
        <button className={styles.primary} disabled={busy || !title.trim() || !due}>Add</button>
      </form>
      {error && <small style={{color: '#b3261e'}}>{error}</small>}
    </section>
  );
}

/** My overdue and due-today follow-ups, shown above the inquiry list. Hidden when there are none. */
export function TodayPanel({refreshKey, onOpen}: {refreshKey: number; onOpen: (reference: string) => void}) {
  const [tasks, setTasks] = useState<CrmTask[]>([]);

  useEffect(() => {
    api<CrmTask[]>('/api/admin/tasks').then(setTasks).catch(() => setTasks([]));
  }, [refreshKey]);

  async function complete(task: CrmTask) {
    try {
      await api(`/api/admin/tasks/${task.id}`, {method: 'PATCH', body: JSON.stringify({status: 'DONE'})});
      setTasks(items => items.filter(item => item.id !== task.id));
    } catch {
      // Leave it in the list; the drawer shows the error when opened.
    }
  }

  const due = tasks.filter(task => new Date(task.due_at).getTime() <= endOfToday());
  if (!due.length) return null;
  const overdue = due.filter(isOverdue).length;

  return (
    <section className={styles.panel} style={{marginBottom: '16px'}}>
      <div className={styles.panelHead}>
        <h2>Today&apos;s follow-ups</h2>
        <span className={styles.activityCountBadge}>{due.length} due{overdue ? ` · ${overdue} overdue` : ''}</span>
      </div>
      <div className={styles.taskList}>
        {due.map(task => (
          <div key={task.id} className={styles.taskRow}>
            <button type="button" className={styles.taskRowTitle} style={{textAlign: 'left', background: 'none', border: 0, cursor: 'pointer', padding: 0}} onClick={() => onOpen(task.inquiry_number)}>
              <strong>{task.inquiry_full_name || task.inquiry_number}</strong> · {task.title}
            </button>
            <span className={styles.taskRowDue} style={isOverdue(task) ? {color: '#b3261e', fontWeight: 700} : undefined}>
              {isOverdue(task) ? 'Overdue · ' : ''}{dueLabel(task.due_at)}
            </span>
            <button type="button" className={styles.taskDoneBtn} onClick={() => void complete(task)}>✓ Done</button>
          </div>
        ))}
      </div>
    </section>
  );
}
