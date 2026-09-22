'use client';
import {useEffect, useState} from 'react';
import styles from '@/app/admin/admin.module.css';
import {departureStatuses, type AdminDeparture, type DepartureStatus} from './capacity-types';

type Page<T> = {count: number; next: string | null; previous: string | null; results: T[]};

type Props = {
  slug: string;
  api: <T>(path: string, options?: RequestInit) => Promise<T>;
  onMessage: (text: string) => void;
};

type DraftDeparture = {
  start_date: string;
  end_date: string;
  price_usd: string;
  max_seats: number;
  reserved_seats: number;
  few_seats_threshold: number;
  status: DepartureStatus;
  status_locked: boolean;
  waitlist_enabled: boolean;
  is_guaranteed: boolean;
};

const emptyDraft: DraftDeparture = {
  start_date: '',
  end_date: '',
  price_usd: '',
  max_seats: 12,
  reserved_seats: 0,
  few_seats_threshold: 3,
  status: 'LIMITED',
  status_locked: false,
  waitlist_enabled: true,
  is_guaranteed: false
};

/**
 * Section 05 of the trek editor: the dated departures and their seat ledger.
 *
 * `booked_seats` is displayed but never editable here — it belongs to the
 * booking flow, which writes it under a database row lock. Capacity is
 * adjusted through max seats and the admin-held reserved block.
 */
export default function DeparturesEditor({slug, api, onMessage}: Props) {
  const [rows, setRows] = useState<AdminDeparture[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<DraftDeparture | null>(null);

  const load = async () => {
    try {
      const page = await api<Page<AdminDeparture>>(`/api/admin/treks/${slug}/departures`);
      setRows(page.results);
    } catch (error) {
      onMessage(error instanceof Error ? error.message : 'Unable to load departures.');
    }
  };

  useEffect(() => {
    if (slug && slug !== 'new') void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function patch(departure: AdminDeparture, changes: Partial<AdminDeparture>) {
    setBusy(true);
    try {
      const updated = await api<AdminDeparture>(`/api/admin/treks/${slug}/departures/${departure.id}`, {
        method: 'PATCH',
        body: JSON.stringify(changes)
      });
      setRows(prev => prev?.map(row => (row.id === updated.id ? updated : row)) || null);
    } catch (error) {
      onMessage(error instanceof Error ? error.message : 'Unable to update this departure.');
      // The server rejected the change, so pull back the authoritative row.
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function create() {
    if (!draft) return;
    setBusy(true);
    try {
      await api<AdminDeparture>(`/api/admin/treks/${slug}/departures`, {
        method: 'POST',
        body: JSON.stringify(draft)
      });
      setDraft(null);
      onMessage('Departure scheduled.');
      await load();
    } catch (error) {
      onMessage(error instanceof Error ? error.message : 'Unable to schedule this departure.');
    } finally {
      setBusy(false);
    }
  }

  async function remove(departure: AdminDeparture) {
    if (departure.booked_seats > 0) {
      onMessage('This departure has bookings and cannot be deleted. Cancel it instead.');
      return;
    }
    setBusy(true);
    try {
      await api(`/api/admin/treks/${slug}/departures/${departure.id}`, {method: 'DELETE'});
      onMessage('Departure removed.');
      await load();
    } catch (error) {
      onMessage(error instanceof Error ? error.message : 'Unable to remove this departure.');
    } finally {
      setBusy(false);
    }
  }

  if (slug === 'new') {
    return (
      <div className={styles.sectionCard}>
        <div className={styles.sectionCardHeader}>
          <span className={styles.sectionBadge}>05</span>
          <h3 className={styles.sectionCardTitle}>Departures &amp; Seats</h3>
        </div>
        <p className={styles.empty}>Save this trek first, then schedule its departure dates.</p>
      </div>
    );
  }

  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionCardHeader}>
        <span className={styles.sectionBadge}>05</span>
        <h3 className={styles.sectionCardTitle}>Departures &amp; Seats</h3>
      </div>

      {!rows ? (
        <p className={styles.empty}>Loading departures…</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.modernTable}>
            <thead>
              <tr>
                <th>Dates</th>
                <th>Price (USD)</th>
                <th>Capacity</th>
                <th>Held back</th>
                <th>Booked</th>
                <th>Available</th>
                <th>Status</th>
                <th>Flags</th>
                <th style={{textAlign: 'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id}>
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
                      title="Seats held back for staff, guides or agent allotment"
                    />
                  </td>
                  <td>
                    <strong style={{color: '#133e2f'}}>{row.booked_seats}</strong>
                    <small style={{display: 'block', fontSize: '10px', color: '#8aa093'}}>read-only</small>
                  </td>
                  <td>
                    <span className={row.available_seats > 0 ? styles.statBadgeGreen : styles.statBadgeRed}>
                      {row.available_seats}
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
                      <span className={styles.miniToggleText}>Pin status</span>
                    </label>
                    <label className={styles.miniToggleLabel} title="Accept waitlist requests when full">
                      <input
                        type="checkbox"
                        checked={row.waitlist_enabled}
                        disabled={busy}
                        onChange={e => void patch(row, {waitlist_enabled: e.target.checked})}
                      />
                      <span className={styles.miniToggleText}>Waitlist</span>
                    </label>
                    <label className={styles.miniToggleLabel} title="Runs regardless of how many travellers join">
                      <input
                        type="checkbox"
                        checked={row.is_guaranteed}
                        disabled={busy}
                        onChange={e => void patch(row, {is_guaranteed: e.target.checked})}
                      />
                      <span className={styles.miniToggleText}>Guaranteed</span>
                    </label>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.actionBtnDelete}
                      disabled={busy || row.booked_seats > 0}
                      onClick={() => void remove(row)}
                      title={row.booked_seats > 0 ? 'Has bookings — cancel it instead' : 'Remove this departure'}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={9}><p className={styles.empty}>No departures scheduled yet.</p></td></tr>
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
          onClick={() => setDraft({...emptyDraft})}
        >
          + Add a departure date
        </button>
      )}
    </div>
  );
}
