'use client';
import Link from 'next/link';
import { useState, useEffect, type FormEvent } from 'react';
import JourneyShell from '@/components/journey-shell';
import ContactChannels from '@/app/contact/components/contact-channels';
import { money, dateLabel, errorText } from '@/lib/format';
import type { BookingReceipt } from '@/lib/booking';

export default function PaymentPage({ reference = '', confirmation = false }: { reference?: string; confirmation?: boolean }) {
  const [query, setQuery] = useState(reference),
    [receipt, setReceipt] = useState<BookingReceipt | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [login, setLogin] = useState(false);

  async function load(ref: string, signal?: AbortSignal) {
    setBusy(true);
    setError('');
    setReceipt(null);
    setLogin(false);
    try {
      const r = await fetch(`/api/bookings/${encodeURIComponent(ref.trim())}`, { signal });
      const b = await r.json();
      if (!r.ok) {
        setLogin(r.status === 401);
        throw new Error(errorText(b));
      }
      setReceipt(b.receipt);
    } catch (e) {
      if (!signal?.aborted) setError(e instanceof Error ? e.message : 'Could not load booking.');
    } finally {
      if (!signal?.aborted) setBusy(false);
    }
  }

  useEffect(() => {
    if (!reference) return;
    const c = new AbortController();
    void load(reference, c.signal);
    return () => c.abort();
  }, [reference]);

  function submit(e: FormEvent) {
    e.preventDefault();
    void load(query);
  }

  return (
    <JourneyShell page="payment">
      <section className="utility-page container">
        <p className="eyebrow">THE NEXT STEP IN YOUR JOURNEY</p>
        <h1>{confirmation ? 'Your booking details.' : 'Payments & next steps.'}</h1>
        <p>Keep the details clear, and your next chapter in view.</p>
        <div className="payment-layout">
          <div>
            <form className="booking-lookup" onSubmit={submit}>
              <label>
                Booking reference
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Enter your booking reference"
                  required
                  pattern="[A-Za-z0-9_-]+"
                  maxLength={100}
                />
              </label>
              <button className="button green" disabled={busy}>
                {busy ? 'Looking up…' : 'View booking'}
              </button>
            </form>
            {error && (
              <div className="quiet-panel" role="alert">
                <p>{error}</p>
                {login && <Link href="/contact" className="button gold">Request booking access</Link>}
              </div>
            )}
            {receipt && (
              <div className="payment-receipt">
                <span className="eyebrow">{receipt.booking_reference}</span>
                <h2>{receipt.trip_title}</h2>
                <p>{dateLabel(receipt.trip_start_date)} · {receipt.num_travelers} travellers</p>
                <dl>
                  {[
                    ['Status', receipt.status.replaceAll('_', ' ')],
                    ['Booking total', money(receipt.total_amount_usd)],
                    ['Initial payment amount', money(receipt.deposit_amount_usd)],
                    ['Amount paid', money(receipt.amount_paid_usd)],
                    ['Remaining balance', money(Math.max(0, Number(receipt.total_amount_usd) - Number(receipt.amount_paid_usd)))]
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
                <small>Amounts and status are retrieved from your booking record. A booking reference alone does not confirm payment.</small>
              </div>
            )}
            <div className="payment-unavailable">
              <span aria-hidden="true">↗</span>
              <h2>Let’s arrange the next step.</h2>
              <p>Online payment is not available on this website yet. Contact the team with your booking reference for confirmed payment instructions.</p>
              <p>No card details are collected or charges made on this page.</p>
              <Link href="/contact" className="button gold">Talk to the team</Link>
            </div>
          </div>
          <aside>
            <p className="eyebrow">A PERSON TO TALK TO</p>
            <h2>A question?<br /><em>We’re a hello away.</em></h2>
            <ContactChannels />
            <Link href="/terms-conditions" className="text-link">Read the booking notes ↗</Link>
          </aside>
        </div>
      </section>
    </JourneyShell>
  );
}
