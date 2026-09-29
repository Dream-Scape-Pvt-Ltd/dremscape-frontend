'use client';

import {useEffect, useState} from 'react';
import type {Agent, Inquiry, Tag} from '@/types/inquiry';
import {TRIP_STYLES} from '@/lib/trip-preferences';
import {date, label} from '../admin-utils';
import {interestLabel, statuses} from './crm-utils';
import {TagChip} from './lead-tags';
import styles from '@/app/admin/admin.module.css';

/** Extra inquiry-list filters, sent to /api/admin/inquiries as query params. */
export type InquiryFilters = {
  owner: '' | 'me' | 'unassigned';
  tag: string;
  trip_style: string;
  inquiry_type: string;
  sla_breached: boolean;
  created_after: string;
  created_before: string;
};
export const emptyFilters: InquiryFilters = {owner: '', tag: '', trip_style: '', inquiry_type: '', sla_breached: false, created_after: '', created_before: ''};

export function filterParams(filters: InquiryFilters, params: URLSearchParams) {
  if (filters.owner) params.set('assigned_agent', filters.owner);
  if (filters.sla_breached) params.set('sla_breached', 'true');
  for (const key of ['tag', 'trip_style', 'inquiry_type', 'created_after', 'created_before'] as const) {
    if (filters[key]) params.set(key, filters[key]);
  }
  return params;
}

const inquiryTypes: Record<string, string> = {
  GENERAL: 'General', JOURNEY: 'Trek inquiry', TAILOR_MADE: 'Tailor-made', PARTNER_DMC: 'B2B partner', EXISTING_TRAVELLER: 'Existing traveller',
};

export default function InquiriesView({
  inquiries, loading, query, status, treks, tripFilter, filters, agents, tags,
  onQuery, onStatus, onTrip, onFilters, onSearch, onOpen, onBulkAssign,
}: {
  inquiries: Inquiry[];
  loading: boolean;
  query: string;
  status: string;
  treks: {slug: string; title: string}[];
  tripFilter: string;
  filters: InquiryFilters;
  agents: Agent[];
  tags: Tag[];
  onQuery: (value: string) => void;
  onStatus: (value: string) => void;
  onTrip: (value: string) => void;
  onFilters: (value: InquiryFilters) => void;
  onSearch: () => void;
  onOpen: (reference: string) => void;
  /** Resolves to a short result message for the bulk bar. */
  onBulkAssign: (references: string[], agentId: string) => Promise<string>;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAgent, setBulkAgent] = useState('');
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');
  const set = <K extends keyof InquiryFilters>(key: K, value: InquiryFilters[K]) => onFilters({...filters, [key]: value});
  const filtered = JSON.stringify(filters) !== JSON.stringify(emptyFilters) || status !== 'ALL' || tripFilter !== 'ALL';

  // A different set of results clears the selection. Keyed on the references,
  // since the parent passes a fresh empty array on every render while loading.
  const pageKey = inquiries.map(item => item.inquiry_number).join(',');
  useEffect(() => setSelected(new Set()), [pageKey]);

  const allSelected = inquiries.length > 0 && inquiries.every(item => selected.has(item.inquiry_number));
  function toggle(reference: string) {
    setSelected(current => {
      const next = new Set(current);
      if (next.has(reference)) next.delete(reference); else next.add(reference);
      return next;
    });
  }

  async function assignSelected() {
    if (!bulkAgent || !selected.size) return;
    setBulkBusy(true);
    setBulkMessage('');
    try {
      setBulkMessage(await onBulkAssign([...selected], bulkAgent));
      setSelected(new Set());
    } catch (error) {
      setBulkMessage(error instanceof Error ? error.message : 'Unable to assign these leads.');
    } finally {
      setBulkBusy(false);
    }
  }

  return (
    <section className={styles.panel}>
      <div className={styles.segmented} role="group" aria-label="Lead owner" style={{marginBottom: '12px'}}>
        {([['', 'All leads'], ['me', 'My leads'], ['unassigned', 'Unassigned']] as const).map(([value, text]) => (
          <button key={value} type="button" aria-pressed={filters.owner === value} className={filters.owner === value ? styles.segmentedActive : undefined} onClick={() => set('owner', value)}>
            {text}
          </button>
        ))}
      </div>
      <div className={styles.toolbar}>
        <label>
          <span className="sr-only">Search inquiries</span>
          <input
            value={query}
            onChange={event => onQuery(event.target.value)}
            onKeyDown={event => event.key === 'Enter' && onSearch()}
            placeholder="Search traveler, email, or reference"
          />
        </label>
        <select value={status} onChange={event => onStatus(event.target.value)} aria-label="Filter by status">
          {['ALL', ...statuses].map(value => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <select value={tripFilter} onChange={event => onTrip(event.target.value)} aria-label="Filter by tour">
          <option value="ALL">All tours</option>
          {treks.map(trek => (
            <option key={trek.slug} value={trek.slug}>{trek.title}</option>
          ))}
        </select>
        <button className={styles.primary} onClick={onSearch}>Search</button>
      </div>
      <div className={`${styles.toolbar} ${styles.crmFilters}`}>
        <select value={filters.trip_style} onChange={event => set('trip_style', event.target.value)} aria-label="Filter by trip style">
          <option value="">Any trip style</option>
          {Object.entries(TRIP_STYLES).map(([value, text]) => <option key={value} value={value}>{text}</option>)}
        </select>
        <select value={filters.inquiry_type} onChange={event => set('inquiry_type', event.target.value)} aria-label="Filter by inquiry type">
          <option value="">Any type</option>
          {Object.entries(inquiryTypes).map(([value, text]) => <option key={value} value={value}>{text}</option>)}
        </select>
        {tags.length > 0 && (
          <select value={filters.tag} onChange={event => set('tag', event.target.value)} aria-label="Filter by tag">
            <option value="">Any tag</option>
            {tags.map(tag => <option key={tag.id} value={tag.name}>{tag.name}</option>)}
          </select>
        )}
        <label className={styles.crmDate}>From<input type="date" value={filters.created_after} onChange={event => set('created_after', event.target.value)} /></label>
        <label className={styles.crmDate}>To<input type="date" value={filters.created_before} onChange={event => set('created_before', event.target.value)} /></label>
        <label className={styles.crmCheck}>
          <input type="checkbox" checked={filters.sla_breached} onChange={event => set('sla_breached', event.target.checked)} />
          SLA breached
        </label>
        {filtered && (
          <button type="button" className={styles.crmBackBtn} onClick={() => { onFilters(emptyFilters); onStatus('ALL'); onTrip('ALL'); }}>
            Clear filters
          </button>
        )}
      </div>

      {selected.size > 0 && (
        <div className={styles.crmBulkBar}>
          <strong>{selected.size} selected</strong>
          <select value={bulkAgent} onChange={event => setBulkAgent(event.target.value)} aria-label="Assign selected leads to">
            <option value="">Assign to…</option>
            {agents.map(agent => <option key={agent.id} value={agent.id}>{agent.full_name || agent.email}</option>)}
          </select>
          <button type="button" className={styles.primary} disabled={!bulkAgent || bulkBusy} onClick={() => void assignSelected()}>
            {bulkBusy ? 'Assigning…' : 'Assign'}
          </button>
          <button type="button" className={styles.secondary} onClick={() => setSelected(new Set())}>Clear</button>
        </div>
      )}
      {bulkMessage && <p className={styles.notice} role="status">{bulkMessage}</p>}

      {loading ? (
        <p className={styles.empty}>Loading inquiries…</p>
      ) : inquiries.length ? (
        <div className={styles.tableWrap}>
          <table className={styles.modernTable}>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    aria-label="Select all leads on this page"
                    checked={allSelected}
                    onChange={() => setSelected(allSelected ? new Set() : new Set(inquiries.map(item => item.inquiry_number)))}
                  />
                </th>
                <th>Traveler</th>
                <th>Trip interest</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Received</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map(item => (
                <tr key={item.inquiry_number}>
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`Select lead from ${item.full_name}`}
                      checked={selected.has(item.inquiry_number)}
                      onChange={() => toggle(item.inquiry_number)}
                    />
                  </td>
                  <td>
                    <strong className={styles.travelerName}>{item.full_name}</strong>
                    <small style={{fontSize: '11px', color: '#6d8276'}}>{item.email}</small>
                    {item.tags && item.tags.length > 0 && (
                      <span className={styles.crmRowTags}>{item.tags.map(tag => <TagChip key={tag.id} tag={tag} />)}</span>
                    )}
                  </td>
                  <td>
                    {/* trip_title is what the serializer actually sends. The old
                        item.trip / item.journey reads were stripped by the field
                        allowlist, so this column always fell through to the type. */}
                    <span>{interestLabel(item)}</span>
                    {item.departure_label && (
                      <small style={{display: 'block', fontSize: '11px', color: '#6d8276'}}>{item.departure_label}</small>
                    )}
                    {item.trip_style && (
                      <small style={{display: 'block', fontSize: '11px', color: '#6d8276'}}>{TRIP_STYLES[item.trip_style] ?? item.trip_style}</small>
                    )}
                  </td>
                  <td>
                    {item.assigned_agent_name || <small style={{color: '#b07a1f', fontWeight: 700}}>Unassigned</small>}
                  </td>
                  <td>
                    <em data-status={item.status}>{label(item.status)}</em>
                  </td>
                  <td>{item.sla_breached && <span className={styles.slaDot} title="SLA breached" />}{date(item.created_at)}</td>
                  <td>
                    <button onClick={() => onOpen(item.inquiry_number)} aria-label={`Open inquiry from ${item.full_name}`}>
                      →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className={styles.empty}>No inquiries match this view.</p>
      )}
    </section>
  );
}
