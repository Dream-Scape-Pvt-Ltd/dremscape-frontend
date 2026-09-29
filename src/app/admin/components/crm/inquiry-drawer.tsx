'use client';

import {FormEvent, useEffect, useState} from 'react';
import type {Agent, Inquiry, InquiryNote, InquiryStatus, LostReason, Tag} from '@/types/inquiry';
import {TRIP_STYLES, PRIVATE_PARTIES, COMFORT_LEVELS, SUPPORT_LEVELS} from '@/lib/trip-preferences';
import type {AdminDeparture} from '../capacity-types';
import {api, date, type Page} from '../admin-utils';
import {authorName, holdsSeats, interestLabel, lostReasonOptions, statuses, type BookingChoice} from './crm-utils';
import LeadTags from './lead-tags';
import {LeadFollowUps} from './follow-ups';
import ContactLog from './contact-log';
import styles from '@/app/admin/admin.module.css';

export default function InquiryDrawer({
  inquiry, notes, noteText, saving, agents, allTags, onClose, onStatus, onAssign, onTags, onTagCreated, onTasksChanged, onNoteText, onSubmit, onViewCustomer,
}: {
  inquiry: Inquiry; notes: InquiryNote[]; noteText: string; saving: boolean;
  agents: Agent[]; allTags: Tag[];
  onClose: () => void; onStatus: (value: InquiryStatus, lostReason?: LostReason | '', booking?: BookingChoice) => void;
  onAssign: (agentId: string | null) => void;
  onTags: (tags: Tag[]) => void; onTagCreated: (tag: Tag) => void; onTasksChanged: () => void;
  onNoteText: (value: string) => void; onSubmit: (event: FormEvent) => void;
  onViewCustomer: () => void;
}) {
  const [tab, setTab] = useState<'details' | 'follow-ups' | 'contact'>('details');
  const [pendingStatus, setPendingStatus] = useState<InquiryStatus | null>(null);
  const ownerId = typeof inquiry.assigned_agent === 'object' ? inquiry.assigned_agent?.id : inquiry.assigned_agent;
  const [lostReason, setLostReason] = useState<LostReason | ''>('');

  const needsLostReason = pendingStatus === 'CLOSED' && !inquiry.converted_booking_reference;

  function handleStatusChange(next: InquiryStatus) {
    if (next === 'CLOSED' && !inquiry.converted_booking_reference) {
      setPendingStatus(next);
      setLostReason('');
      return;
    }
    if (holdsSeats(next) && !holdsSeats(inquiry.status)) {
      setPendingStatus(next);
      return;
    }
    setPendingStatus(null);
    onStatus(next);
  }

  function confirmLostReason() {
    if (!pendingStatus || !lostReason) return;
    onStatus(pendingStatus, lostReason);
    setPendingStatus(null);
  }

  return (
    <aside className={styles.drawer} aria-label="Inquiry details">
      <button className={styles.close} onClick={onClose}>×</button>
      <p style={{fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1.4px', color: '#74897d', fontWeight: 800}}>{inquiry.inquiry_number}</p>
      <h2>{inquiry.full_name}</h2>
      <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
      {inquiry.phone && <a href={`tel:${inquiry.phone}`}>{inquiry.phone}</a>}
      <button type="button" className={styles.drawerHistoryBtn} onClick={onViewCustomer}>View customer history →</button>
      <LeadTags reference={inquiry.inquiry_number} tags={inquiry.tags || []} allTags={allTags} onChange={onTags} onTagCreated={onTagCreated} />

      <div className={styles.drawerTabs} role="tablist">
        {([['details', 'Details'], ['follow-ups', 'Follow-ups'], ['contact', 'Contact log']] as const).map(([value, text]) => (
          <button key={value} type="button" role="tab" aria-selected={tab === value} className={`${styles.drawerTab} ${tab === value ? styles.drawerTabActive : ''}`} onClick={() => setTab(value)}>{text}</button>
        ))}
      </div>
      {tab === 'follow-ups' && <LeadFollowUps reference={inquiry.inquiry_number} onChanged={onTasksChanged} />}
      {tab === 'contact' && <ContactLog reference={inquiry.inquiry_number} />}

      {tab === 'details' && (
      <>
          <dl>
            <div>
              <dt>Assigned to</dt>
              <dd>
                <select value={ownerId || ''} disabled={saving} onChange={event => onAssign(event.target.value || null)}>
                  <option value="">Unassigned</option>
                  {agents.map(agent => <option key={agent.id} value={agent.id}>{agent.full_name || agent.email}</option>)}
                </select>
              </dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <select value={inquiry.status} disabled={saving} onChange={event => handleStatusChange(event.target.value as InquiryStatus)}>
                  {statuses.map(value => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
                {pendingStatus && holdsSeats(pendingStatus) && (
                  <BookingPrompt
                    inquiry={inquiry}
                    saving={saving}
                    onConfirm={booking => { onStatus(pendingStatus, '', booking); setPendingStatus(null); }}
                    onCancel={() => setPendingStatus(null)}
                  />
                )}
                {needsLostReason && (
                  <div className={styles.lostReasonPrompt}>
                    <small>Why is this lead closing without a booking?</small>
                    <select value={lostReason} onChange={event => setLostReason(event.target.value as LostReason)}>
                      <option value="">Select a reason…</option>
                      {lostReasonOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <button type="button" className={styles.primary} disabled={!lostReason || saving} style={{marginTop: '6px'}} onClick={confirmLostReason}>
                      Confirm close
                    </button>
                  </div>
                )}
              </dd>
            </div>
            <div>
              <dt>Trip interest</dt>
              {/* trip_title is the field the serializer actually sends; trip and
                  journey are stripped by the staff field allowlist. */}
              <dd>{interestLabel(inquiry)}</dd>
            </div>
            <div>
              <dt>Departure</dt>
              <dd>{inquiry.departure_label || 'No fixed batch'}</dd>
            </div>
            <div>
              <dt>Preferred dates</dt>
              <dd>{inquiry.preferred_dates || 'Not specified'}</dd>
            </div>
            {/* Optional "Plan my trip" preferences, shown only when the traveller chose them. */}
            {inquiry.trip_style && (
              <div>
                <dt>Trip style</dt>
                <dd>
                  {TRIP_STYLES[inquiry.trip_style] ?? inquiry.trip_style}
                  {inquiry.private_party ? ` · ${PRIVATE_PARTIES[inquiry.private_party] ?? inquiry.private_party}` : ''}
                  {inquiry.group_size ? ` · ${inquiry.group_size} traveller${inquiry.group_size > 1 ? 's' : ''}` : ''}
                </dd>
              </div>
            )}
            {inquiry.children_ages && (
              <div>
                <dt>Children&apos;s ages</dt>
                <dd>{inquiry.children_ages}</dd>
              </div>
            )}
            {inquiry.comfort_level && (
              <div>
                <dt>Comfort level</dt>
                <dd>{COMFORT_LEVELS[inquiry.comfort_level] ?? inquiry.comfort_level}</dd>
              </div>
            )}
            {inquiry.support_level && (
              <div>
                <dt>Support needed</dt>
                <dd>{SUPPORT_LEVELS[inquiry.support_level] ?? inquiry.support_level}</dd>
              </div>
            )}
          </dl>
          {inquiry.converted_booking_reference && (
            <p style={{fontSize: '11px', color: '#24583f', fontWeight: 700}}>
              ✓ Converted to booking {inquiry.converted_booking_reference}
            </p>
          )}
          <section className={styles.message}>
            <h3>Traveler message</h3>
            <p>{inquiry.message || 'No message supplied.'}</p>
          </section>
          <section className={styles.notes}>
            <h3>Consultation notes</h3>
            {notes.map(note => (
              <article key={note.id}>
                <strong>{authorName(note.author)}</strong>
                <small>{date(note.created_at)}</small>
                <p>{note.note_text}</p>
              </article>
            ))}
            <form onSubmit={onSubmit}>
              <textarea
                value={noteText}
                onChange={event => onNoteText(event.target.value)}
                placeholder="Add an internal note"
                maxLength={5000}
              />
              <button className={styles.primary} disabled={saving || !noteText.trim()}>
                {saving ? 'Saving…' : 'Add note'}
              </button>
            </form>
          </section>
      </>
      )}
    </aside>
  );
}

/**
 * Asks which departure a lead is booked on and how many people are going.
 * Confirming adds them to that departure's booked seats, shown in the trek editor's Departures & Capacity section.
 */
export function BookingPrompt({inquiry, saving = false, onConfirm, onCancel}: {
  inquiry: Inquiry;
  saving?: boolean;
  onConfirm: (booking: BookingChoice) => void;
  onCancel: () => void;
}) {
  const [departures, setDepartures] = useState<AdminDeparture[] | null>(null);
  const [error, setError] = useState('');
  const [departureId, setDepartureId] = useState(inquiry.departure || '');
  const [travelers, setTravelers] = useState(inquiry.group_size || 1);

  useEffect(() => {
    if (!inquiry.trip_slug) {
      setError('This lead is not linked to a trek, so it cannot be booked on a departure.');
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    api<Page<AdminDeparture>>(`/api/admin/treks/${inquiry.trip_slug}/departures`)
      .then(page => setDepartures(page.results.filter(item => item.status !== 'CANCELLED' && item.end_date >= today)))
      .catch(err => setError(err instanceof Error ? err.message : 'Unable to load departures.'));
  }, [inquiry.trip_slug]);

  const chosen = departures?.find(item => item.id === departureId);
  const tooMany = chosen ? travelers > chosen.available_seats && departureId !== inquiry.departure : false;

  return (
    <div className={styles.lostReasonPrompt} onClick={event => event.stopPropagation()}>
      <small>Book on which departure?</small>
      {error ? (
        <p className={styles.empty} style={{margin: '6px 0'}}>{error}</p>
      ) : !departures ? (
        <p className={styles.empty} style={{margin: '6px 0'}}>Loading departures…</p>
      ) : (
        <>
          <select value={departureId} onChange={event => setDepartureId(event.target.value)}>
            <option value="">Select a departure…</option>
            {departures.map(item => (
              <option key={item.id} value={item.id}>
                {date(item.start_date)} – {date(item.end_date)} · {item.available_seats} left
              </option>
            ))}
          </select>
          <label style={{display: 'block', marginTop: '6px', fontSize: '11px'}}>
            Travellers
            <input
              type="number"
              min={1}
              value={travelers}
              onChange={event => setTravelers(Math.max(1, Number(event.target.value) || 1))}
              style={{width: '100%', marginTop: '4px'}}
            />
          </label>
          {tooMany && <small style={{color: '#b3261e'}}>Only {chosen?.available_seats} seat(s) left on this departure.</small>}
        </>
      )}
      <div style={{display: 'flex', gap: '6px', marginTop: '6px'}}>
        <button
          type="button"
          className={styles.primary}
          disabled={!departureId || tooMany || saving}
          onClick={() => onConfirm({departureId, travelersCount: travelers})}
        >
          Confirm booking
        </button>
        <button type="button" className={styles.secondary} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
