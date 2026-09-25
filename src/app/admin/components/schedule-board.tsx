'use client';
import {useEffect, useMemo, useState} from 'react';
import styles from '@/app/admin/admin.module.css';
import {
  capacityStateLabel,
  departureStatuses,
  type AdminDeparture,
  type DepartureStatus,
  type WaitlistEntry
} from './capacity-types';
import {emptyDraft, stateBadge, useDepartures, type DraftDeparture} from './use-departures';

export type ScheduleTrek = {
  title: string;
  slug: string;
  duration_days: number;
  max_group_size?: number;
  starting_price_usd?: string | number;
};

type Props = {
  trek: ScheduleTrek;
  api: <T>(path: string, options?: RequestInit) => Promise<T>;
  formatDate: (value?: string | null) => string;
  onClose: () => void;
};

type Filter = 'upcoming' | 'past' | 'all';
type Panel = {id: string; kind: 'edit' | 'waitlist'} | null;

/** Today as YYYY-MM-DD in local time, comparable with departure dates. */
function todayIso() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Parses YYYY-MM-DD as a local date, so the calendar day never shifts by time zone. */
function parseDay(value: string) {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function addDays(value: string, days: number) {
  const date = parseDay(value);
  date.setDate(date.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function spanDays(start: string, end: string) {
  return Math.round((parseDay(end).getTime() - parseDay(start).getTime()) / 86_400_000) + 1;
}

function money(value: string | number | undefined) {
  const amount = Number(value);
  return Number.isFinite(amount) ? `$${amount.toLocaleString(undefined, {maximumFractionDigits: 2})}` : '—';
}

function statusLabel(status: DepartureStatus) {
  return status.replaceAll('_', ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());
}

/** The editable fields of a departure, as the form holds them. */
function toDraft(row: AdminDeparture): DraftDeparture {
  return {
    start_date: row.start_date,
    end_date: row.end_date,
    price_usd: row.price_usd,
    max_seats: row.max_seats,
    reserved_seats: row.reserved_seats,
    few_seats_threshold: row.few_seats_threshold,
    status: row.status,
    status_locked: row.status_locked,
    waitlist_enabled: row.waitlist_enabled,
    is_guaranteed: row.is_guaranteed
  };
}

/** Client-side mirror of the backend's seat and date rules, for instant feedback. */
function validate(draft: DraftDeparture, booked: number) {
  if (!draft.start_date || !draft.end_date) return 'Pick both a start and an end date.';
  if (draft.end_date < draft.start_date) return 'The end date must be on or after the start date.';
  if (draft.price_usd === '' || Number(draft.price_usd) < 0) return 'Enter a price per person.';
  if (draft.max_seats < 1) return 'A departure needs at least one seat.';
  if (draft.reserved_seats + booked > draft.max_seats) {
    return booked
      ? `Held seats plus the ${booked} already booked can't exceed ${draft.max_seats} total seats.`
      : "Held seats can't exceed the total seats.";
  }
  return null;
}

/**
 * The trek list's Schedule pop-up: one trek's departures as cards, each with a
 * seat bar, live demand and its actions, plus a form to schedule a new date.
 */
export default function ScheduleBoard({trek, api, formatDate, onClose}: Props) {
  // The dashboard's notice bar sits behind the pop-up, so messages show here.
  const [flash, setFlash] = useState('');
  const onMessage = setFlash;
  const {rows, busy, load, patch, create, remove, fetchWaitlist, promote} =
    useDepartures({slug: trek.slug, api, onMessage, formatDate});

  useEffect(() => {
    if (!flash) return;
    const timer = window.setTimeout(() => setFlash(''), 6000);
    return () => window.clearTimeout(timer);
  }, [flash]);
  const [filter, setFilter] = useState<Filter>('upcoming');
  const [panel, setPanel] = useState<Panel>(null);
  const [newDraft, setNewDraft] = useState<DraftDeparture | null>(null);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[] | null>(null);

  const today = todayIso();
  const split = useMemo(() => {
    const list = rows || [];
    return {
      upcoming: list.filter(row => row.end_date >= today),
      past: list.filter(row => row.end_date < today),
      all: list
    };
  }, [rows, today]);
  const visible = split[filter];

  const totals = useMemo(() => {
    const live = split.upcoming.filter(row => row.status !== 'CANCELLED');
    return {
      departures: live.length,
      booked: live.reduce((sum, row) => sum + row.booked_seats, 0),
      free: live.reduce((sum, row) => sum + row.available_seats, 0),
      leads: live.reduce((sum, row) => sum + (row.open_inquiry_count || 0), 0),
      attention: live.filter(row => row.capacity_state === 'OVERSUBSCRIBED' || row.capacity_state === 'NEARLY_FULL').length
    };
  }, [split]);

  function startNew() {
    setPanel(null);
    setNewDraft({
      ...emptyDraft,
      max_seats: trek.max_group_size && trek.max_group_size > 0 ? trek.max_group_size : emptyDraft.max_seats,
      price_usd: trek.starting_price_usd !== undefined ? String(trek.starting_price_usd) : ''
    });
  }

  async function togglePanel(row: AdminDeparture, kind: 'edit' | 'waitlist') {
    if (panel?.id === row.id && panel.kind === kind) {
      setPanel(null);
      return;
    }
    setPanel({id: row.id, kind});
    if (kind === 'waitlist') {
      setWaitlist(null);
      setWaitlist(await fetchWaitlist(row));
    }
  }

  async function runPromote(row: AdminDeparture) {
    await promote(row);
    if (panel?.id === row.id && panel.kind === 'waitlist') setWaitlist(await fetchWaitlist(row));
  }

  return (
    <div className={styles.sbRoot}>
      <header className={styles.sbHeader}>
        <div className={styles.sbHeaderText}>
          <span className={styles.sbEyebrow}>Departure schedule</span>
          <h2>{trek.title}</h2>
          <div className={styles.sbChips}>
            <span>{trek.duration_days} days</span>
            {trek.max_group_size ? <span>Max group {trek.max_group_size}</span> : null}
            {trek.starting_price_usd !== undefined ? <span>From {money(trek.starting_price_usd)}</span> : null}
          </div>
        </div>
        <div className={styles.sbHeaderActions}>
          <button type="button" className={styles.sbGhostBtn} disabled={busy} onClick={() => void load()} title="Reload seats and demand">
            ↻ Refresh
          </button>
          <button type="button" className={styles.sbPrimaryBtn} onClick={startNew} disabled={Boolean(newDraft)}>
            + New departure
          </button>
          <button type="button" className={styles.sbCloseBtn} onClick={onClose} aria-label="Close">×</button>
        </div>
      </header>

      <div className={styles.sbContent}>
        {flash && (
          <div className={styles.sbFlash} role="status">
            <span>{flash}</span>
            <button type="button" aria-label="Dismiss message" onClick={() => setFlash('')}>×</button>
          </div>
        )}

        <div className={styles.sbStats}>
          {[
            ['Upcoming', totals.departures, ''],
            ['Seats booked', totals.booked, ''],
            ['Seats free', totals.free, ''],
            ['Open leads', totals.leads, ''],
            ['Need attention', totals.attention, totals.attention ? 'alert' : '']
          ].map(([label, value, tone]) => (
            <div key={String(label)} className={styles.sbStat} data-tone={tone || undefined}>
              <strong>{rows ? value : '–'}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {newDraft && (
          <div className={styles.sbFormCard}>
            <div className={styles.sbFormTitle}>
              <h3>Schedule a new departure</h3>
              <p>Seats and price start from the trek&apos;s defaults. The end date fills in from the trek length.</p>
            </div>
            <DepartureForm
              draft={newDraft}
              booked={0}
              durationDays={trek.duration_days}
              busy={busy}
              submitLabel="Schedule departure"
              onChange={setNewDraft}
              onCancel={() => setNewDraft(null)}
              onSubmit={async () => {
                if (await create(newDraft)) {
                  setNewDraft(null);
                  setFilter('upcoming');
                }
              }}
            />
          </div>
        )}

        <div className={styles.sbToolbar}>
          <div className={styles.sbSegmented} role="tablist" aria-label="Filter departures">
            {(['upcoming', 'past', 'all'] as Filter[]).map(value => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={filter === value}
                className={filter === value ? styles.sbSegmentActive : undefined}
                onClick={() => setFilter(value)}
              >
                {value === 'upcoming' ? 'Upcoming' : value === 'past' ? 'Past' : 'All'}
                <span>{rows ? split[value].length : ''}</span>
              </button>
            ))}
          </div>
          <div className={styles.sbLegend} aria-hidden="true">
            <span><i data-seg="booked" />Booked</span>
            <span><i data-seg="held" />Held back</span>
            <span><i data-seg="free" />Free</span>
          </div>
        </div>

        {!rows ? (
          <div className={styles.sbList}>
            {[0, 1, 2].map(i => <div key={i} className={styles.sbSkeleton} />)}
          </div>
        ) : !visible.length ? (
          <div className={styles.sbEmpty}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="3" y="4" width="18" height="17" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <strong>
              {filter === 'past' ? 'No past departures' : rows.length ? 'No upcoming departures' : 'No departures scheduled yet'}
            </strong>
            <p>
              {filter === 'past'
                ? 'Departures appear here once their end date has passed.'
                : 'Schedule a date so travellers can book this trek.'}
            </p>
            {filter !== 'past' && !newDraft && (
              <button type="button" className={styles.sbPrimaryBtn} onClick={startNew}>+ New departure</button>
            )}
          </div>
        ) : (
          <div className={styles.sbList}>
            {visible.map(row => (
              <DepartureCard
                key={row.id}
                row={row}
                panel={panel?.id === row.id ? panel.kind : null}
                busy={busy}
                waitlist={waitlist}
                durationDays={trek.duration_days}
                formatDate={formatDate}
                onToggle={kind => void togglePanel(row, kind)}
                onPromote={() => void runPromote(row)}
                onSave={async draft => {
                  const original = toDraft(row);
                  const changes = Object.fromEntries(
                    Object.entries(draft).filter(([key, value]) => original[key as keyof DraftDeparture] !== value)
                  ) as Partial<DraftDeparture>;
                  if (!Object.keys(changes).length) {
                    setPanel(null);
                    return;
                  }
                  if (await patch(row, changes)) {
                    setPanel(null);
                    onMessage('Departure updated.');
                  }
                }}
                onDelete={async () => {
                  if (window.confirm(`Delete the ${formatDate(row.start_date)} departure? This can't be undone.`) && await remove(row)) {
                    setPanel(null);
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DepartureCard({
  row, panel, busy, waitlist, durationDays, formatDate,
  onToggle, onPromote, onSave, onDelete
}: {
  row: AdminDeparture;
  panel: 'edit' | 'waitlist' | null;
  busy: boolean;
  waitlist: WaitlistEntry[] | null;
  durationDays: number;
  formatDate: (value?: string | null) => string;
  onToggle: (kind: 'edit' | 'waitlist') => void;
  onPromote: () => void;
  onSave: (draft: DraftDeparture) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState<DraftDeparture>(() => toDraft(row));
  const start = parseDay(row.start_date);
  const total = Math.max(row.max_seats, 1);
  const pct = (seats: number) => `${Math.min(100, (seats / total) * 100)}%`;
  const leads = row.open_inquiry_count ?? 0;
  const waiting = row.waitlisted_count ?? 0;

  return (
    <article
      className={styles.sbCard}
      data-state={row.capacity_state}
      data-cancelled={row.status === 'CANCELLED' || undefined}
      data-open={panel ? true : undefined}
    >
      <div className={styles.sbDate}>
        <span>{start.toLocaleString('en', {month: 'short'})}</span>
        <strong>{start.getDate()}</strong>
        <small>{start.getFullYear()}</small>
      </div>

      <div className={styles.sbBody}>
        <div className={styles.sbTitleRow}>
          <h4>{formatDate(row.start_date)} → {formatDate(row.end_date)}</h4>
          <span className={styles.sbStatus} data-status={row.status}>{statusLabel(row.status)}</span>
          {row.is_guaranteed && <span className={styles.sbTag}>Guaranteed</span>}
          {row.status_locked && <span className={styles.sbTag} title="Status is pinned and won't change as seats sell">Pinned</span>}
        </div>
        <p className={styles.sbMeta}>
          {spanDays(row.start_date, row.end_date)} days · {money(row.price_usd)} per person
          {!row.waitlist_enabled && ' · waitlist off'}
        </p>
        <div
          className={styles.sbSeatBar}
          role="img"
          aria-label={`${row.booked_seats} booked, ${row.reserved_seats} held back, ${row.available_seats} free of ${row.max_seats}`}
        >
          <i data-seg="booked" style={{width: pct(row.booked_seats)}} />
          <i data-seg="held" style={{width: pct(row.reserved_seats)}} />
        </div>
        <div className={styles.sbSeatText}>
          <span><b>{row.booked_seats}</b>/{row.max_seats} booked</span>
          {row.reserved_seats > 0 && <span><b>{row.reserved_seats}</b> held</span>}
          <span className={row.available_seats > 0 ? undefined : styles.sbSoldOut}><b>{row.available_seats}</b> free</span>
          <span className={styles.sbPct}>{row.utilization_pct ?? 0}% full</span>
        </div>
      </div>

      <div className={styles.sbSide}>
        <span className={stateBadge(row.capacity_state)}>
          {row.capacity_state ? capacityStateLabel[row.capacity_state] : '—'}
        </span>
        <div className={styles.sbCounters}>
          <span title="Open inquiries tied to this departure"><b>{leads}</b> leads</span>
          <span title="Travellers on the waitlist"><b>{waiting}</b> waiting</span>
        </div>
        <div className={styles.sbActions}>
          <button type="button" data-active={panel === 'waitlist' || undefined} onClick={() => onToggle('waitlist')}>
            Waitlist
          </button>
          <button
            type="button"
            onClick={onPromote}
            disabled={busy || row.available_seats <= 0 || !waiting}
            title={row.available_seats <= 0 ? 'No free seats to offer' : !waiting ? 'Nobody is waiting' : 'Offer free seats to the queue'}
          >
            Promote
          </button>
          <button
            type="button"
            data-primary
            data-active={panel === 'edit' || undefined}
            onClick={() => {
              if (panel !== 'edit') setDraft(toDraft(row));
              onToggle('edit');
            }}
          >
            Edit
          </button>
        </div>
      </div>

      {panel === 'edit' && (
        <div className={styles.sbPanel}>
          {row.booked_seats > 0 && (
            <p className={styles.sbNote}>
              {row.booked_seats} seat(s) are booked through the booking flow and can&apos;t be changed here.
              Lower the total only down to what&apos;s booked plus held.
            </p>
          )}
          <DepartureForm
            draft={draft}
            booked={row.booked_seats}
            durationDays={durationDays}
            busy={busy}
            submitLabel="Save changes"
            onChange={setDraft}
            onCancel={() => onToggle('edit')}
            onSubmit={() => onSave(draft)}
            onDelete={onDelete}
            deleteDisabledReason={row.booked_seats > 0 ? 'Has bookings — set the status to Cancelled instead' : undefined}
          />
        </div>
      )}

      {panel === 'waitlist' && (
        <div className={styles.sbPanel}>
          {!waitlist ? (
            <p className={styles.empty}>Loading waitlist…</p>
          ) : !waitlist.length ? (
            <p className={styles.empty}>Nobody is waiting on this departure.</p>
          ) : (
            <ol className={styles.sbWaitlist}>
              {waitlist.map(entry => (
                <li key={entry.id}>
                  <span className={styles.sbWaitPos}>{entry.position}</span>
                  <div>
                    <strong>{entry.customer_name}</strong>
                    <small>{entry.customer_email}{entry.customer_phone ? ` · ${entry.customer_phone}` : ''}</small>
                  </div>
                  <span>{entry.num_travelers} {entry.num_travelers === 1 ? 'traveller' : 'travellers'}</span>
                  <span className={entry.status === 'OFFERED' ? styles.statBadgeGreen : styles.statBadgeGray}>{entry.status}</span>
                  {entry.offer_expires_at && <small>offer expires {formatDate(entry.offer_expires_at)}</small>}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </article>
  );
}

function DepartureForm({
  draft, booked, durationDays, busy, submitLabel, onChange, onCancel, onSubmit, onDelete, deleteDisabledReason
}: {
  draft: DraftDeparture;
  booked: number;
  durationDays: number;
  busy: boolean;
  submitLabel: string;
  onChange: (draft: DraftDeparture) => void;
  onCancel: () => void;
  onSubmit: () => void;
  onDelete?: () => void;
  deleteDisabledReason?: string;
}) {
  const [touched, setTouched] = useState(false);
  const error = validate(draft, booked);
  const set = <K extends keyof DraftDeparture>(key: K, value: DraftDeparture[K]) => onChange({...draft, [key]: value});
  const free = Math.max(draft.max_seats - draft.reserved_seats - booked, 0);

  return (
    <form
      className={styles.sbForm}
      onSubmit={event => {
        event.preventDefault();
        setTouched(true);
        if (!error) onSubmit();
      }}
    >
      <div className={styles.sbFormGrid}>
        <label className={styles.formField}>
          <span className={styles.formLabel}>Start date</span>
          <input
            className={styles.formInput}
            type="date"
            value={draft.start_date}
            onChange={e => {
              const start = e.target.value;
              // Fill the end date from the trek length unless it was already set after the start.
              const end = start && (!draft.end_date || draft.end_date < start) && durationDays > 0
                ? addDays(start, durationDays - 1)
                : draft.end_date;
              onChange({...draft, start_date: start, end_date: end});
            }}
          />
        </label>
        <label className={styles.formField}>
          <span className={styles.formLabel}>End date</span>
          <input className={styles.formInput} type="date" value={draft.end_date} min={draft.start_date || undefined}
            onChange={e => set('end_date', e.target.value)} />
        </label>
        <label className={styles.formField}>
          <span className={styles.formLabel}>Price per person (USD)</span>
          <input className={styles.formInput} type="number" min={0} step="0.01" value={draft.price_usd}
            onChange={e => set('price_usd', e.target.value)} />
        </label>
        <label className={styles.formField}>
          <span className={styles.formLabel}>Status</span>
          <select className={styles.formSelect} value={draft.status}
            onChange={e => set('status', e.target.value as DepartureStatus)}>
            {departureStatuses.map(value => <option key={value} value={value}>{statusLabel(value)}</option>)}
          </select>
        </label>
        <label className={styles.formField}>
          <span className={styles.formLabel}>Total seats</span>
          <input className={styles.formInput} type="number" min={1} value={draft.max_seats}
            onChange={e => set('max_seats', Math.max(Number(e.target.value) || 0, 0))} />
        </label>
        <label className={styles.formField}>
          <span className={styles.formLabel}>Held back <small className={styles.formLabelHint}>staff / partners</small></span>
          <input className={styles.formInput} type="number" min={0} value={draft.reserved_seats}
            onChange={e => set('reserved_seats', Math.max(Number(e.target.value) || 0, 0))} />
        </label>
        <label className={styles.formField}>
          <span className={styles.formLabel}>&quot;Few seats left&quot; at</span>
          <input className={styles.formInput} type="number" min={0} value={draft.few_seats_threshold}
            onChange={e => set('few_seats_threshold', Math.max(Number(e.target.value) || 0, 0))} />
        </label>
        <div className={styles.formField}>
          <span className={styles.formLabel}>Bookable seats</span>
          <div className={styles.sbFreePreview}>
            <strong>{free}</strong> free{booked ? ` · ${booked} booked` : ''}
          </div>
        </div>
      </div>

      <div className={styles.sbToggles}>
        {([
          ['waitlist_enabled', 'Accept waitlist when full'],
          ['is_guaranteed', 'Guaranteed to run'],
          ['status_locked', 'Pin status (don’t auto-update)']
        ] as const).map(([key, label]) => (
          <label key={key} className={styles.miniToggleLabel}>
            <input type="checkbox" checked={draft[key]} onChange={e => set(key, e.target.checked)} />
            <span className={styles.miniToggleSlider} />
            <span className={styles.miniToggleText}>{label}</span>
          </label>
        ))}
      </div>

      {touched && error && <p className={styles.sbError} role="alert">{error}</p>}

      <div className={styles.sbFormFooter}>
        {onDelete && (
          <button
            type="button"
            className={styles.sbDangerLink}
            onClick={onDelete}
            disabled={busy || Boolean(deleteDisabledReason)}
            title={deleteDisabledReason || 'Remove this departure'}
          >
            Delete departure
          </button>
        )}
        <span />
        <button type="button" className={styles.sbGhostBtn} onClick={onCancel}>Cancel</button>
        <button type="submit" className={styles.sbPrimaryBtn} disabled={busy}>
          {busy ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
