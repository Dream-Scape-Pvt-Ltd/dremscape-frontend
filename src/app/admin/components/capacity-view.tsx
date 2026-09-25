'use client';
import {Fragment, useEffect, useMemo, useState} from 'react';
import styles from '@/app/admin/admin.module.css';
import {
  capacityStateLabel,
  departureStatuses,
  type AdminDeparture,
  type Agent,
  type CapacityState,
  type WaitlistEntry
} from './capacity-types';

type Page<T> = {count: number; next: string | null; previous: string | null; results: T[]};

type Props = {
  api: <T>(path: string, options?: RequestInit) => Promise<T>;
  agents: Agent[];
  onMessage: (text: string) => void;
  formatDate: (value?: string | null) => string;
};

/** Which badge class a capacity state gets. Red reads as "act on this". */
function stateBadge(state: CapacityState | undefined) {
  if (state === 'OVERSUBSCRIBED' || state === 'FULL') return styles.statBadgeRed;
  if (state === 'NEARLY_FULL') return styles.statBadgeGray;
  return styles.statBadgeGreen;
}

/**
 * Cross-trip capacity board.
 *
 * Every number here — seats, open leads, capacity state — is computed by the
 * backend, so this view and the public tour pages can never disagree about
 * whether a batch is full.
 */
export default function CapacityView({api, agents, onMessage, formatDate}: Props) {
  const [rows, setRows] = useState<AdminDeparture[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [stateFilter, setStateFilter] = useState<'ALL' | CapacityState>('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [startAfter, setStartAfter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [assignTarget, setAssignTarget] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (stateFilter !== 'ALL') query.set('capacity_state', stateFilter);
      if (statusFilter !== 'ALL') query.set('status', statusFilter);
      if (startAfter) query.set('start_after', startAfter);
      const page = await api<Page<AdminDeparture>>(`/api/admin/departures?${query}`);
      setRows(page.results);
    } catch (error) {
      onMessage(error instanceof Error ? error.message : 'Unable to load departure capacity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateFilter, statusFilter, startAfter]);

  const totals = useMemo(() => {
    const list = rows || [];
    return {
      departures: list.length,
      booked: list.reduce((sum, row) => sum + row.booked_seats, 0),
      available: list.reduce((sum, row) => sum + row.available_seats, 0),
      leads: list.reduce((sum, row) => sum + (row.open_inquiry_count || 0), 0),
      attention: list.filter(row => row.capacity_state === 'OVERSUBSCRIBED' || row.capacity_state === 'NEARLY_FULL').length
    };
  }, [rows]);

  async function openWaitlist(departure: AdminDeparture) {
    if (expanded === departure.id) {
      setExpanded(null);
      setWaitlist(null);
      return;
    }
    setExpanded(departure.id);
    setWaitlist(null);
    try {
      setWaitlist(await api<WaitlistEntry[]>(`/api/admin/departures/${departure.id}/waitlist`));
    } catch (error) {
      onMessage(error instanceof Error ? error.message : 'Unable to load the waitlist.');
    }
  }

  async function promote(departure: AdminDeparture) {
    setBusy(true);
    try {
      const offered = await api<WaitlistEntry[]>(`/api/admin/departures/${departure.id}/waitlist`, {method: 'POST'});
      onMessage(
        offered.length
          ? `${offered.length} traveller(s) offered a seat on ${departure.trip_title}.`
          : 'No seats are free to offer on this departure right now.'
      );
      if (expanded === departure.id) {
        setWaitlist(await api<WaitlistEntry[]>(`/api/admin/departures/${departure.id}/waitlist`));
      }
      await load();
    } catch (error) {
      onMessage(error instanceof Error ? error.message : 'Unable to promote from the waitlist.');
    } finally {
      setBusy(false);
    }
  }

  async function assignBatch(departure: AdminDeparture, agentId: string) {
    setBusy(true);
    try {
      const result = await api<{matched: number; reassigned: number}>('/api/admin/inquiries/bulk-assign', {
        method: 'POST',
        body: JSON.stringify({departure: departure.id, agent_id: agentId})
      });
      onMessage(`${result.reassigned} of ${result.matched} lead(s) on this departure reassigned.`);
      setAssignTarget(null);
      await load();
    } catch (error) {
      onMessage(error instanceof Error ? error.message : 'Unable to reassign this batch.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <h2>Departure Capacity</h2>
        <button type="button" className={styles.primary} onClick={() => void load()} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className={styles.toolbar}>
        <select value={stateFilter} onChange={e => setStateFilter(e.target.value as 'ALL' | CapacityState)}>
          <option value="ALL">All capacity states</option>
          {(Object.keys(capacityStateLabel) as CapacityState[]).map(state => (
            <option key={state} value={state}>{capacityStateLabel[state]}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="ALL">All departure statuses</option>
          {departureStatuses.map(value => (
            <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>
          ))}
        </select>
        <label>
          Departing on or after
          <input type="date" value={startAfter} onChange={e => setStartAfter(e.target.value)} />
        </label>
      </div>

      <div className={styles.capacityStats}>
        {[
          ['Departures', totals.departures],
          ['Seats booked', totals.booked],
          ['Seats available', totals.available],
          ['Open leads', totals.leads],
          ['Need attention', totals.attention]
        ].map(([label, value]) => (
          <div key={String(label)} className={styles.statCard}>
            <span className={styles.statLabel}>{label}</span>
            <strong style={{fontSize: '24px', color: '#133e2f'}}>{value}</strong>
          </div>
        ))}
      </div>

      {loading && !rows ? (
        <p className={styles.empty}>Loading departure capacity…</p>
      ) : !rows?.length ? (
        <p className={styles.empty}>No departures match these filters.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.modernTable}>
            <thead>
              <tr>
                <th>Tour &amp; Batch</th>
                <th>Seats</th>
                <th>Utilisation</th>
                <th>Open leads</th>
                <th>Waitlist</th>
                <th>Capacity</th>
                <th>Status</th>
                <th style={{textAlign: 'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <Fragment key={row.id}>
                  <tr>
                    <td>
                      <span style={{fontWeight: 600, color: '#133e2f', display: 'block'}}>{row.trip_title}</span>
                      <small style={{fontSize: '11px', color: '#6d8276'}}>
                        {formatDate(row.start_date)} → {formatDate(row.end_date)}
                      </small>
                    </td>
                    <td>
                      <strong style={{color: '#133e2f', fontSize: '13px'}}>
                        {row.booked_seats}/{row.max_seats}
                      </strong>
                      <small style={{display: 'block', fontSize: '10px', color: '#8aa093'}}>
                        {row.available_seats} free
                        {row.reserved_seats > 0 ? ` · ${row.reserved_seats} held` : ''}
                      </small>
                    </td>
                    <td>{row.utilization_pct ?? 0}%</td>
                    <td>{row.open_inquiry_count ?? 0}</td>
                    <td>{row.waitlisted_count ?? 0}</td>
                    <td>
                      <span className={stateBadge(row.capacity_state)}>
                        {row.capacity_state ? capacityStateLabel[row.capacity_state] : '—'}
                      </span>
                    </td>
                    <td>
                      <span className={row.status === 'CANCELLED' ? styles.statusPillInactive : styles.statusPillActive}>
                        {row.status.replaceAll('_', ' ')}
                      </span>
                      {row.status_locked && (
                        <small style={{display: 'block', fontSize: '10px', color: '#8aa093'}}>pinned</small>
                      )}
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
                          className={styles.actionBtnToggle}
                          onClick={() => setAssignTarget(assignTarget === row.id ? null : row.id)}
                          disabled={!(row.open_inquiry_count ?? 0)}
                          title="Assign every open lead on this batch to one agent"
                        >
                          Assign batch
                        </button>
                      </div>
                      {assignTarget === row.id && (
                        <select
                          defaultValue=""
                          disabled={busy}
                          onChange={e => e.target.value && void assignBatch(row, e.target.value)}
                          style={{marginTop: '8px'}}
                        >
                          <option value="">Choose an agent…</option>
                          {agents.map(agent => (
                            <option key={agent.id} value={agent.id}>{agent.full_name || agent.email}</option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                  {expanded === row.id && (
                    <tr>
                      <td colSpan={8} style={{background: '#f7f9f6'}}>
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
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
