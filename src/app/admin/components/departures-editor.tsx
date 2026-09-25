'use client';
import {Fragment, useMemo, useState} from 'react';
import styles from '@/app/admin/admin.module.css';
import {
  capacityStateLabel,
  departureStatuses,
  type AdminDeparture,
  type DepartureStatus,
  type WaitlistEntry
} from './capacity-types';
import {emptyDraft, stateBadge, useDepartures, type DraftDeparture} from './use-departures';

type Props = {
  slug: string;
  api: <T>(path: string, options?: RequestInit) => Promise<T>;
  onMessage: (text: string) => void;
  formatDate: (value?: string | null) => string;
  /** Seat count a new departure starts with — the trek's max group size. */
  defaultSeats?: number;
};

/**
 * Section 05 of the trek editor: the dated departures, their seat ledger, and
 * live capacity — utilisation, open leads, waitlist and capacity state.
 *
 * `booked_seats` is displayed but never editable here — it belongs to the
 * booking flow, which writes it under a database row lock. Capacity is
 * adjusted through max seats and the admin-held reserved block. Every
 * capacity number is computed by the backend, so this view and the public
 * tour pages can never disagree about whether a batch is full.
 */
export default function DeparturesEditor({slug, api, onMessage, formatDate, defaultSeats}: Props) {
  const {rows, busy, load, patch, create: createDeparture, remove, fetchWaitlist, promote: promoteWaitlist} =
    useDepartures({slug, api, onMessage, formatDate});
  const [draft, setDraft] = useState<DraftDeparture | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[] | null>(null);

  const totals = useMemo(() => {
    const list = rows || [];
    return {
      booked: list.reduce((sum, row) => sum + row.booked_seats, 0),
      available: list.reduce((sum, row) => sum + row.available_seats, 0),
      leads: list.reduce((sum, row) => sum + (row.open_inquiry_count || 0), 0),
      waitlisted: list.reduce((sum, row) => sum + (row.waitlisted_count || 0), 0),
      attention: list.filter(row => row.capacity_state === 'OVERSUBSCRIBED' || row.capacity_state === 'NEARLY_FULL').length
    };
  }, [rows]);

  async function create() {
    if (draft && await createDeparture(draft)) setDraft(null);
  }

  async function openWaitlist(departure: AdminDeparture) {
    if (expanded === departure.id) {
      setExpanded(null);
      setWaitlist(null);
      return;
    }
    setExpanded(departure.id);
    setWaitlist(null);
    setWaitlist(await fetchWaitlist(departure));
  }

  async function promote(departure: AdminDeparture) {
    await promoteWaitlist(departure);
    if (expanded === departure.id) setWaitlist(await fetchWaitlist(departure));
  }

  if (slug === 'new') {
    return (
      <div className={styles.sectionCard}>
        <div className={styles.sectionCardHeader}>
          <span className={styles.sectionBadge}>05</span>
          <h3 className={styles.sectionCardTitle}>Departures &amp; Capacity</h3>
        </div>
        <p className={styles.empty}>Save this trek first, then schedule its departure dates.</p>
      </div>
    );
  }

  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionCardHeader}>
        <span className={styles.sectionBadge}>05</span>
        <h3 className={styles.sectionCardTitle}>Departures &amp; Capacity</h3>
        <button
          type="button"
          className={styles.actionBtnToggle}
          style={{marginLeft: 'auto'}}
          disabled={busy}
          onClick={() => void load()}
        >
          Refresh
        </button>
      </div>

      {rows && rows.length > 0 && (
        <div className={styles.capacityStats}>
          {[
            ['Seats booked', totals.booked],
            ['Seats available', totals.available],
            ['Open leads', totals.leads],
            ['Waitlisted', totals.waitlisted],
            ['Need attention', totals.attention]
          ].map(([label, value]) => (
            <div key={String(label)} className={styles.statCard}>
              <span className={styles.statLabel}>{label}</span>
              <strong style={{fontSize: '24px', color: '#133e2f'}}>{value}</strong>
            </div>
          ))}
        </div>
      )}

      {!rows ? (
        <p className={styles.empty}>Loading departures…</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.modernTable}>
            <thead>
              <tr>
                <th>Dates</th>
                <th>Price (USD)</th>
                <th>Total seats</th>
                <th>Held back</th>
                <th>Seats</th>
                <th>Leads / Waitlist</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Flags</th>
                <th style={{textAlign: 'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <Fragment key={row.id}>
                  <tr>
                    <td>
                      <input
                        type="date"
                        value={row.start_date}
                        disabled={busy}
                        onChange={e => void patch(row, {start_date: e.target.value})}
                      />
                      <input
                        type="date"
                        value={row.end_date}
                        disabled={busy}
                        onChange={e => void patch(row, {end_date: e.target.value})}
                        style={{marginTop: '6px'}}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        defaultValue={row.price_usd}
                        disabled={busy}
                        onBlur={e => e.target.value !== row.price_usd && void patch(row, {price_usd: e.target.value})}
                        style={{width: '100px'}}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        defaultValue={row.max_seats}
                        disabled={busy}
                        onBlur={e => Number(e.target.value) !== row.max_seats && void patch(row, {max_seats: Number(e.target.value)})}
                        style={{width: '72px'}}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        defaultValue={row.reserved_seats}
                        disabled={busy}
                        onBlur={e => Number(e.target.value) !== row.reserved_seats && void patch(row, {reserved_seats: Number(e.target.value)})}
                        style={{width: '72px'}}
                        title="Seats held back for staff, guides or partners"
                      />
                    </td>
                    <td>
                      <strong style={{color: '#133e2f', fontSize: '13px'}}>
                        {row.booked_seats}/{row.max_seats}
                      </strong>
                      <small style={{display: 'block', fontSize: '10px', color: '#8aa093'}}>
                        <span className={row.available_seats > 0 ? styles.statBadgeGreen : styles.statBadgeRed}>
                          {row.available_seats} free
                        </span>
                        {' · '}{row.utilization_pct ?? 0}% full
                      </small>
                    </td>
                    <td>
                      <span style={{display: 'block'}}>{row.open_inquiry_count ?? 0} leads</span>
                      <small style={{fontSize: '11px', color: '#6d8276'}}>{row.waitlisted_count ?? 0} waiting</small>
                    </td>
                    <td>
                      <span className={stateBadge(row.capacity_state)}>
                        {row.capacity_state ? capacityStateLabel[row.capacity_state] : '—'}
                      </span>
                    </td>
                    <td>
                      <select
                        value={row.status}
                        disabled={busy}
                        onChange={e => void patch(row, {status: e.target.value as DepartureStatus})}
                      >
                        {departureStatuses.map(value => (
                          <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <label className={styles.miniToggleLabel} title="Keep the chosen status even as seats change">
                        <input
                          type="checkbox"
                          checked={row.status_locked}
                          disabled={busy}
                          onChange={e => void patch(row, {status_locked: e.target.checked})}
                        />
                        <span className={styles.miniToggleSlider} />
                        <span className={styles.miniToggleText}>Pin status</span>
                      </label>
                      <label className={styles.miniToggleLabel} title="Accept waitlist requests when full">
                        <input
                          type="checkbox"
                          checked={row.waitlist_enabled}
                          disabled={busy}
                          onChange={e => void patch(row, {waitlist_enabled: e.target.checked})}
                        />
                        <span className={styles.miniToggleSlider} />
                        <span className={styles.miniToggleText}>Waitlist</span>
                      </label>
                      <label className={styles.miniToggleLabel} title="Runs regardless of how many travellers join">
                        <input
                          type="checkbox"
                          checked={row.is_guaranteed}
                          disabled={busy}
                          onChange={e => void patch(row, {is_guaranteed: e.target.checked})}
                        />
                        <span className={styles.miniToggleSlider} />
                        <span className={styles.miniToggleText}>Guaranteed</span>
                      </label>
                    </td>
                    <td>
                      <div className={styles.actionBtnGroup}>
                        <button
                          type="button"
                          className={styles.actionBtnToggle}
                          onClick={() => void openWaitlist(row)}
                        >
                          {expanded === row.id ? 'Hide waitlist' : 'Waitlist'}
                        </button>
                        <button
                          type="button"
                          className={styles.actionBtnEdit}
                          onClick={() => void promote(row)}
                          disabled={busy || row.available_seats <= 0}
                          title={row.available_seats <= 0 ? 'No free seats to offer' : 'Offer free seats to the queue'}
                        >
                          Promote
                        </button>
                        <button
                          type="button"
                          className={styles.actionBtnDelete}
                          disabled={busy || row.booked_seats > 0}
                          onClick={() => void remove(row)}
                          title={row.booked_seats > 0 ? 'Has bookings — cancel it instead' : 'Remove this departure'}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expanded === row.id && (
                    <tr>
                      <td colSpan={10} style={{background: '#f7f9f6'}}>
                        {!waitlist ? (
                          <p className={styles.empty}>Loading waitlist…</p>
                        ) : !waitlist.length ? (
                          <p className={styles.empty}>Nobody is waiting on this departure.</p>
                        ) : (
                          <ol style={{margin: 0, padding: '8px 0 8px 22px', fontSize: '12px'}}>
                            {waitlist.map(entry => (
                              <li key={entry.id} style={{padding: '4px 0'}}>
                                <strong>{entry.customer_name}</strong> · {entry.customer_email} ·{' '}
                                {entry.num_travelers} {entry.num_travelers === 1 ? 'traveller' : 'travellers'} ·{' '}
                                <span className={entry.status === 'OFFERED' ? styles.statBadgeGreen : styles.statBadgeGray}>
                                  {entry.status}
                                </span>
                                {entry.offer_expires_at && ` · offer expires ${formatDate(entry.offer_expires_at)}`}
                              </li>
                            ))}
                          </ol>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {!rows.length && (
                <tr><td colSpan={10}><p className={styles.empty}>No departures scheduled yet.</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {draft ? (
        <div className={styles.dayCard} style={{marginTop: '16px'}}>
          <div className={styles.formGrid}>
            <label className={styles.formField}>
              <span className={styles.formLabel}>Start date</span>
              <input className={styles.formInput} type="date" value={draft.start_date}
                onChange={e => setDraft({...draft, start_date: e.target.value})} />
            </label>
            <label className={styles.formField}>
              <span className={styles.formLabel}>End date</span>
              <input className={styles.formInput} type="date" value={draft.end_date}
                onChange={e => setDraft({...draft, end_date: e.target.value})} />
            </label>
            <label className={styles.formField}>
              <span className={styles.formLabel}>Price per person (USD)</span>
              <input className={styles.formInput} type="number" min={0} step="0.01" value={draft.price_usd}
                onChange={e => setDraft({...draft, price_usd: e.target.value})} />
            </label>
            <label className={styles.formField}>
              <span className={styles.formLabel}>Total seats</span>
              <input className={styles.formInput} type="number" min={1} value={draft.max_seats}
                onChange={e => setDraft({...draft, max_seats: Number(e.target.value) || 1})} />
            </label>
            <label className={styles.formField}>
              <span className={styles.formLabel}>Seats held back</span>
              <input className={styles.formInput} type="number" min={0} value={draft.reserved_seats}
                onChange={e => setDraft({...draft, reserved_seats: Number(e.target.value) || 0})} />
            </label>
            <label className={styles.formField}>
              <span className={styles.formLabel}>&quot;Few seats left&quot; at</span>
              <input className={styles.formInput} type="number" min={0} value={draft.few_seats_threshold}
                onChange={e => setDraft({...draft, few_seats_threshold: Number(e.target.value) || 0})} />
            </label>
          </div>
          <div style={{display: 'flex', gap: '12px', marginTop: '12px'}}>
            <button type="button" className={styles.primary} disabled={busy} onClick={() => void create()}>
              {busy ? 'Scheduling…' : 'Schedule departure'}
            </button>
            <button type="button" className={styles.actionBtnToggle} onClick={() => setDraft(null)}>Cancel</button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={styles.addDayDashedBtn}
          style={{marginTop: '16px'}}
          onClick={() => setDraft({...emptyDraft, max_seats: defaultSeats && defaultSeats > 0 ? defaultSeats : emptyDraft.max_seats})}
        >
          + Add a departure date
        </button>
      )}
    </div>
  );
}
