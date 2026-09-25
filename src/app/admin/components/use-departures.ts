'use client';
import {useEffect, useState} from 'react';
import styles from '@/app/admin/admin.module.css';
import type {AdminDeparture, CapacityState, DepartureStatus, WaitlistEntry} from './capacity-types';

type Page<T> = {count: number; next: string | null; previous: string | null; results: T[]};

type Api = <T>(path: string, options?: RequestInit) => Promise<T>;

export type DraftDeparture = {
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

export const emptyDraft: DraftDeparture = {
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

/** Which badge class a capacity state gets. Red reads as "act on this". */
export function stateBadge(state: CapacityState | undefined) {
  if (state === 'OVERSUBSCRIBED' || state === 'FULL') return styles.statBadgeRed;
  if (state === 'NEARLY_FULL') return styles.statBadgeGray;
  return styles.statBadgeGreen;
}

/**
 * One trek's departures plus every seat and waitlist action on them, shared by
 * the trek editor's section 05 and the trek list's Schedule pop-up.
 *
 * Rows come from the capacity endpoint so they carry the live counters
 * (utilisation, open leads, waitlist, capacity state). Writes go through the
 * trek's departure routes, and every write reloads: the write responses don't
 * include those counters, and a rejected write must restore the server's row.
 */
export function useDepartures({slug, api, onMessage, formatDate}: {
  slug: string;
  api: Api;
  onMessage: (text: string) => void;
  formatDate: (value?: string | null) => string;
}) {
  const [rows, setRows] = useState<AdminDeparture[] | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const page = await api<Page<AdminDeparture>>(`/api/admin/departures?trip=${encodeURIComponent(slug)}`);
      setRows(page.results);
    } catch (error) {
      onMessage(error instanceof Error ? error.message : 'Unable to load departures.');
    }
  };

  useEffect(() => {
    if (slug && slug !== 'new') void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  /** Runs one write with the busy flag held; resolves true when it succeeded. */
  async function write(action: () => Promise<void>, failure: string, reloadOnError = false) {
    setBusy(true);
    try {
      await action();
      await load();
      return true;
    } catch (error) {
      onMessage(error instanceof Error ? error.message : failure);
      if (reloadOnError) await load();
      return false;
    } finally {
      setBusy(false);
    }
  }

  const patch = (departure: AdminDeparture, changes: Partial<AdminDeparture | DraftDeparture>) =>
    write(async () => {
      await api(`/api/admin/treks/${slug}/departures/${departure.id}`, {
        method: 'PATCH',
        body: JSON.stringify(changes)
      });
    }, 'Unable to update this departure.', true);

  const create = (draft: DraftDeparture) =>
    write(async () => {
      await api(`/api/admin/treks/${slug}/departures`, {method: 'POST', body: JSON.stringify(draft)});
      onMessage('Departure scheduled.');
    }, 'Unable to schedule this departure.');

  const remove = async (departure: AdminDeparture) => {
    if (departure.booked_seats > 0) {
      onMessage('This departure has bookings and cannot be deleted. Cancel it instead.');
      return false;
    }
    return write(async () => {
      await api(`/api/admin/treks/${slug}/departures/${departure.id}`, {method: 'DELETE'});
      onMessage('Departure removed.');
    }, 'Unable to remove this departure.');
  };

  const fetchWaitlist = async (departure: AdminDeparture) => {
    try {
      return await api<WaitlistEntry[]>(`/api/admin/departures/${departure.id}/waitlist`);
    } catch (error) {
      onMessage(error instanceof Error ? error.message : 'Unable to load the waitlist.');
      return null;
    }
  };

  const promote = (departure: AdminDeparture) =>
    write(async () => {
      const offered = await api<WaitlistEntry[]>(`/api/admin/departures/${departure.id}/waitlist`, {method: 'POST'});
      onMessage(
        offered.length
          ? `${offered.length} traveller(s) offered a seat on the ${formatDate(departure.start_date)} departure.`
          : 'No seats are free to offer on this departure right now.'
      );
    }, 'Unable to promote from the waitlist.');

  return {rows, busy, load, patch, create, remove, fetchWaitlist, promote};
}
