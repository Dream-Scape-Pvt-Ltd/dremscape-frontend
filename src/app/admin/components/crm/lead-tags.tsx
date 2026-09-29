'use client';

import {FormEvent, useState} from 'react';
import type {Tag} from '@/types/inquiry';
import {api} from '../admin-utils';
import styles from '@/app/admin/admin.module.css';

const tagColors = ['#2F855A', '#2B6CB0', '#B7791F', '#C53030', '#6B46C1', '#6B7280'];

/** A tag chip tinted with its own colour. */
export function TagChip({tag, onRemove}: {tag: Tag; onRemove?: () => void}) {
  return (
    <span className={styles.chip} style={{background: `${tag.color}22`, color: tag.color, border: `1px solid ${tag.color}55`}}>
      {tag.name}
      {onRemove && <button type="button" className={styles.chipRemove} aria-label={`Remove tag ${tag.name}`} onClick={onRemove}>×</button>}
    </span>
  );
}

/** The drawer's tag row: remove a tag, attach an existing one, or create a new one. */
export default function LeadTags({reference, tags, allTags, onChange, onTagCreated}: {
  reference: string;
  tags: Tag[];
  allTags: Tag[];
  onChange: (tags: Tag[]) => void;
  onTagCreated: (tag: Tag) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(tagColors[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const available = allTags.filter(tag => !tags.some(item => item.id === tag.id));

  async function run(action: () => Promise<Tag[]>) {
    setBusy(true);
    setError('');
    try {
      onChange(await action());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update tags.');
    } finally {
      setBusy(false);
    }
  }
  const attach = (tagId: string) => run(() => api<Tag[]>(`/api/admin/inquiries/${reference}/tags`, {method: 'POST', body: JSON.stringify({tag_id: tagId})}));
  const detach = (tagId: string) => run(() => api<Tag[]>(`/api/admin/inquiries/${reference}/tags/${tagId}`, {method: 'DELETE'}));

  async function create(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    await run(async () => {
      const tag = await api<Tag>('/api/admin/tags', {method: 'POST', body: JSON.stringify({name: name.trim(), color})});
      onTagCreated(tag);
      return api<Tag[]>(`/api/admin/inquiries/${reference}/tags`, {method: 'POST', body: JSON.stringify({tag_id: tag.id})});
    });
    setName('');
    setAdding(false);
  }

  return (
    <div>
      <div className={styles.chipRow}>
        {tags.map(tag => <TagChip key={tag.id} tag={tag} onRemove={busy ? undefined : () => void detach(tag.id)} />)}
        {!adding && (
          <select
            aria-label="Add a tag"
            value=""
            disabled={busy}
            onChange={event => event.target.value === 'NEW' ? setAdding(true) : event.target.value && void attach(event.target.value)}
            className={styles.tagAddSelect}
          >
            <option value="">+ Tag</option>
            {available.map(tag => <option key={tag.id} value={tag.id}>{tag.name}</option>)}
            <option value="NEW">New tag…</option>
          </select>
        )}
      </div>
      {adding && (
        <form className={styles.addChipForm} onSubmit={create}>
          <input value={name} onChange={event => setName(event.target.value)} placeholder="Tag name" maxLength={50} autoFocus />
          <select value={color} onChange={event => setColor(event.target.value)} aria-label="Tag colour" style={{color}}>
            {tagColors.map(value => <option key={value} value={value} style={{color: value}}>●</option>)}
          </select>
          <button className={styles.primary} disabled={busy || !name.trim()}>Add</button>
          <button type="button" className={styles.secondary} onClick={() => setAdding(false)}>Cancel</button>
        </form>
      )}
      {error && <small style={{color: '#b3261e'}}>{error}</small>}
    </div>
  );
}
