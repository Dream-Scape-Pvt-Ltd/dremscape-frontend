'use client';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import type { Journey, Departure } from '@/lib/journeys';
import { passengerFields, type BookingReceipt } from '@/lib/booking';
import { dateLabel, money, errorText } from '@/lib/format';
import JourneyShell from '@/components/journey-shell';

export default function BookingForm({ journey, departure }: { journey: Journey; departure: Departure }) {
  const [count, setCount] = useState(1),
    [payment, setPayment] = useState('DEPOSIT_20'),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [uncertain, setUncertain] = useState(false),
    [receipt, setReceipt] = useState<BookingReceipt | null>(null);

  const estimate = Number(departure.price_usd) * count;

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || uncertain) return;
    setBusy(true);
    setError('');
    const form = new FormData(e.currentTarget);
    const passengers = Array.from({ length: count }, (_, i) =>
      Object.fromEntries(passengerFields.map(([key]) => [key, form.get(`traveller_${i}_${key}`)]))
    );
    try {
      const r = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trek_slug: journey.slug,
          departure_id: departure.id,
          customer_name: form.get('customer_name'),
          customer_email: form.get('customer_email'),
          customer_phone: form.get('customer_phone'),
          payment_type: payment,
          passengers
        })
      });
      const body = await r.json();
      if (!r.ok || !body.receipt?.booking_reference) {
        if (r.status >= 500 && r.status !== 503) setUncertain(true);
        throw new Error(errorText(body));
      }
      setReceipt(body.receipt);
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (e) {
      if (e instanceof TypeError) setUncertain(true);
      setError(e instanceof Error ? e.message : 'We could not confirm your request.');
    } finally {
      setBusy(false);
    }
  }

  if (receipt)
    return (
      <JourneyShell>
        <section className="utility-page container receipt" role="status">
          <p className="eyebrow">YOUR NEXT CHAPTER</p>
          <h1>Your booking request<br /><em>has been saved.</em></h1>
          <p className="receipt-reference">{receipt.booking_reference}</p>
          <h2>{receipt.trip_title}</h2>
          <p>{dateLabel(receipt.trip_start_date)} · {receipt.num_travelers} travellers</p>
          <dl>
            <div><dt>Current status</dt><dd>{receipt.status.replaceAll('_', ' ')}</dd></div>
            <div><dt>Booking total</dt><dd>{money(receipt.total_amount_usd)}</dd></div>
            <div><dt>Initial payment due</dt><dd>{money(receipt.deposit_amount_usd)}</dd></div>
            <div><dt>Amount paid</dt><dd>{money(receipt.amount_paid_usd)}</dd></div>
          </dl>
          <p>No payment has been collected on this website. Keep your reference and contact the team to arrange the next steps. This page does not confirm payment or email delivery.</p>
          <div className="button-row">
            <Link className="button gold" href="/contact">Contact the team ↗</Link>
            <Link className="button outline-dark" href="/account">My journeys</Link>
          </div>
          <small>Guest booking details are not stored in your browser. Save your reference before closing this page.</small>
        </section>
      </JourneyShell>
    );

  return (
    <JourneyShell>
      <section className="utility-page container">
        <Link className="text-link" href={`/treks/${journey.slug}`}>← Back to your trek</Link>
        <p className="eyebrow booking-kicker">A LITTLE CLOSER TO THE HIMALAYA</p>
        <h1>Make room<br /><em>for the extraordinary.</em></h1>
        <div className="booking-layout">
          <form className="inquiry-form booking-form" onSubmit={submit}>
            <fieldset disabled={busy || uncertain}>
              <div className="booking-step"><span>01</span><h2>Your group</h2></div>
              <p>You can book as a guest, or <Link href="/login">sign in</Link> first.</p>
              <label>
                Number of travellers
                <input
                  type="number"
                  min={1}
                  max={Math.min(departure.available_seats, journey.max_group_size)}
                  value={count}
                  onChange={e => setCount(Math.max(1, Math.min(Math.min(departure.available_seats, journey.max_group_size), Number(e.target.value) || 1)))}
                />
              </label>
              <div className="form-columns">
                <label>Contact name<input name="customer_name" autoComplete="name" required maxLength={255} /></label>
                <label>Contact email<input name="customer_email" type="email" autoComplete="email" required maxLength={254} /></label>
              </div>
              <label>Contact phone <small>(optional)</small><input name="customer_phone" type="tel" autoComplete="tel" maxLength={50} /></label>

              <div className="booking-step"><span>02</span><h2>Traveller details</h2></div>
              <p>These details go to the booking team for your traveller record. Use the names shown on your passports.</p>
              {Array.from({ length: count }, (_, i) => (
                <fieldset className="traveller-fields" key={i}>
                  <legend>Traveller {i + 1}</legend>
                  <div className="form-columns">
                    {passengerFields.map(([key, label, type]) => (
                      <label key={key}>
                        {label}
                        <input
                          name={`traveller_${i}_${key}`}
                          type={type}
                          required
                          max={key === 'date_of_birth' ? new Date().toISOString().slice(0, 10) : undefined}
                          maxLength={key.includes('phone') ? 50 : 100}
                          autoComplete="off"
                        />
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}

              <div className="booking-step"><span>03</span><h2>Review your request</h2></div>
              <fieldset className="payment-options">
                <legend>Preferred payment plan</legend>
                <label>
                  <input type="radio" name="payment" checked={payment === 'DEPOSIT_20'} onChange={() => setPayment('DEPOSIT_20')} />
                  20% deposit, balance later
                </label>
                <label>
                  <input type="radio" name="payment" checked={payment === 'FULL_100'} onChange={() => setPayment('FULL_100')} />
                  Full payment
                </label>
              </fieldset>
              <p>Your estimated total is <strong>{money(estimate)}</strong>. The backend confirms the final price and available seats when you submit. No card or payment details are collected here.</p>
              <label className="consent">
                <input type="checkbox" required />
                I have checked these details and understand this creates a booking request. Payment and final arrangements are handled with the team.
              </label>
            </fieldset>

            {error && <p className="form-error" role="alert">{error}</p>}
            {uncertain ? (
              <p>Please <Link href="/contact">contact the team</Link> before creating another request, to avoid a duplicate booking.</p>
            ) : (
              <button className="button gold" disabled={busy}>
                {busy ? 'Saving your request…' : 'Submit booking request ↗'}
              </button>
            )}
          </form>

          <aside className="booking-summary">
            <p className="eyebrow">YOUR JOURNEY</p>
            <h2>{journey.title}</h2>
            <p>{dateLabel(departure.start_date)}<br />to {dateLabel(departure.end_date)}</p>
            <hr />
            <dl>
              <div><dt>Travellers</dt><dd>{count}</dd></div>
              <div><dt>Per person</dt><dd>{money(departure.price_usd)}</dd></div>
              <div><dt>Estimated total</dt><dd>{money(estimate)}</dd></div>
              <div><dt>Estimated initial payment</dt><dd>{money(payment === 'DEPOSIT_20' ? estimate * .2 : estimate)}</dd></div>
            </dl>
            <small>All amounts in USD. Final amounts come from the booking service.</small>
            <Link href="/contact" className="text-link">A question before you go? ↗</Link>
          </aside>
        </div>
      </section>
    </JourneyShell>
  );
}
