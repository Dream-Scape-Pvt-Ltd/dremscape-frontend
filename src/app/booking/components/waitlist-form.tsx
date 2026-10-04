'use client';
import UiArrow from '@/components/ui-arrow';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import type { Journey, Departure } from '@/lib/journeys';
import { dateLabel, money, errorText } from '@/lib/format';
import JourneyShell from '@/components/journey-shell';
import PhoneField from '@/components/phone-field';

type Entry = { id: string; position: number; status: string; num_travelers: number };

/**
 * Shown instead of the booking form when a departure is full but still taking
 * waitlist requests. Collects only what a queue position needs — passports and
 * payment are gathered later, if a seat is actually offered.
 */
export default function WaitlistForm({ journey, departure }: { journey: Journey; departure: Departure }) {
  const [count, setCount] = useState(1),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [uncertain, setUncertain] = useState(false),
    [entry, setEntry] = useState<Entry | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || uncertain) return;
    setBusy(true);
    setError('');
    const form = new FormData(e.currentTarget);
    const customerPhone = form.get('customer_phone') as string;
    const customerDialCode = form.get('customer_phone_dial_code') as string;
    if (customerPhone && !customerDialCode) {
      setError('Please select your country code.');
      setBusy(false);
      return;
    }
    const phone = [customerDialCode, customerPhone].filter(Boolean).join(' ').trim();
    try {
      const r = await fetch('/api/bookings/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trek_slug: journey.slug,
          departure_id: departure.id,
          customer_name: form.get('customer_name'),
          customer_email: form.get('customer_email'),
          customer_phone: phone,
          num_travelers: count
        })
      });
      const body = await r.json();
      if (!r.ok || !body.entry?.id) {
        // Mirrors the booking form: an uncertain result blocks resubmission
        // rather than risking a duplicate queue entry.
        if (r.status >= 500 && r.status !== 503) setUncertain(true);
        throw new Error(errorText(body));
      }
      setEntry(body.entry);
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (e) {
      if (e instanceof TypeError) setUncertain(true);
      setError(e instanceof Error ? e.message : 'We could not confirm your request.');
    } finally {
      setBusy(false);
    }
  }

  if (entry)
    return (
      <JourneyShell>
        <section className="utility-page container receipt" role="status">
          <p className="eyebrow">YOU ARE ON THE LIST</p>
          <h1>A seat may yet<br /><em>open up.</em></h1>
          <p className="waitlist-position">Position {entry.position}</p>
          <h2>{journey.title}</h2>
          <p>{dateLabel(departure.start_date)} to {dateLabel(departure.end_date)} · {entry.num_travelers} {entry.num_travelers === 1 ? 'traveller' : 'travellers'}</p>
          <p>This departure is full. If a place is released we will email you with a time-limited link to complete your booking, in the order the list was joined.</p>
          <div className="button-row">
            <Link className="button gold" href={`/treks/${journey.slug}`}>Other dates on this trek <UiArrow/></Link>
            <Link className="button outline-dark" href="/contact">Talk to the team</Link>
          </div>
        </section>
      </JourneyShell>
    );

  return (
    <JourneyShell>
      <section className="utility-page container">
        <Link className="text-link" href={`/treks/${journey.slug}`}>← Back to your trek</Link>
        <p className="eyebrow booking-kicker">THIS BATCH IS FULL</p>
        <h1>Join the waitlist<br /><em>for this departure.</em></h1>
        <div className="booking-layout">
          <form className="inquiry-form booking-form" onSubmit={submit}>
            <fieldset disabled={busy || uncertain}>
              <div className="booking-step"><span>01</span><h2>Your group</h2></div>
              <p>Every seat on this date is taken. Leave your details and we will contact you first if one is released.</p>
              <label>
                Number of travellers
                <input
                  type="number"
                  min={1}
                  max={journey.max_group_size}
                  value={count}
                  onChange={e => setCount(Math.max(1, Math.min(journey.max_group_size, Number(e.target.value) || 1)))}
                />
              </label>
              <div className="form-columns">
                <label>Contact name<input name="customer_name" autoComplete="name" required maxLength={255} /></label>
                <label>Contact email<input name="customer_email" type="email" autoComplete="email" required maxLength={254} /></label>
              </div>
              <PhoneField name="customer_phone" label="Contact phone" optionalHint />

              {error && <p className="form-error" role="alert">{error}</p>}
              {uncertain && <p className="form-error" role="alert">We could not confirm whether your request was saved. Please contact the team before trying again.</p>}
              <button className="button gold" type="submit" disabled={busy || uncertain}>
                {busy ? 'Adding you to the list…' : 'Join the waitlist'}
              </button>
              <p className="form-footnote">Joining the waitlist does not reserve a seat and takes no payment.</p>
            </fieldset>
          </form>
          <aside className="booking-summary waitlist-panel">
            <p className="eyebrow">THE DEPARTURE</p>
            <h2>{journey.title}</h2>
            <dl>
              <div><dt>Departs</dt><dd>{dateLabel(departure.start_date)}</dd></div>
              <div><dt>Returns</dt><dd>{dateLabel(departure.end_date)}</dd></div>
              <div><dt>Group size</dt><dd>{departure.max_seats} travellers</dd></div>
              <div><dt>Price per person</dt><dd>{money(departure.price_usd)}</dd></div>
            </dl>
            <small>Prices are confirmed only when a seat is offered and your booking is completed.</small>
          </aside>
        </div>
      </section>
    </JourneyShell>
  );
}
