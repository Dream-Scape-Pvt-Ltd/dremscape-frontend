'use client';
import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { dateLabel, money, errorText } from '@/lib/format';
import type { BookingReceipt } from '@/lib/booking';
import JourneyShell from '@/components/journey-shell';

export function AuthForm({ mode }: { mode: 'login' | 'register' | 'reset' }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [success, setSuccess] = useState('');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget)))
      });
      const body = await r.json();
      if (!r.ok || body.success !== true) throw new Error(errorText(body));
      if (mode === 'reset') setSuccess(body.message);
      else router.push('/account');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to complete your request.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <JourneyShell page="account">
      <section className="utility-page container auth-layout">
        <div>
          <p className="eyebrow">YOUR JOURNEY CONTINUES</p>
          <h1>{mode === 'register' ? 'A new chapter.' : mode === 'reset' ? 'Find your way back.' : 'Welcome back.'}</h1>
          <p>{mode === 'register' ? 'Create your Dreamscape account to keep your journeys together.' : mode === 'reset' ? 'Enter the email address you used to create your account.' : 'Sign in to see your booking references and current journey status.'}</p>
          <Link href="/treks" className="text-link">Explore the collection ↗</Link>
        </div>
        <form className="inquiry-form contact-form-panel" onSubmit={submit}>
          <h2>{mode === 'register' ? 'Explore journeys' : mode === 'reset' ? 'Reset password' : 'Sign in'}</h2>
          {success ? (
            <p className="form-success" role="status">{success}</p>
          ) : (
            <>
              <fieldset disabled={busy}>
                {mode === 'register' && (
                  <div className="form-columns">
                    <label>First name<input name="first_name" autoComplete="given-name" required maxLength={150} /></label>
                    <label>Last name<input name="last_name" autoComplete="family-name" required maxLength={150} /></label>
                  </div>
                )}
                <label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
                {mode !== 'reset' && (
                  <label>Password<input name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required maxLength={1024} /></label>
                )}
                {mode === 'register' && (
                  <label>Confirm password<input name="password_confirm" type="password" autoComplete="new-password" required maxLength={1024} /></label>
                )}
              </fieldset>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="button gold" disabled={busy}>
                {busy ? 'Please wait…' : mode === 'register' ? 'Create account' : mode === 'reset' ? 'Send reset instructions' : 'Sign in'}
              </button>
            </>
          )}
          <div className="auth-links">
            {mode === 'reset' && <Link href="/reset-password">I have a reset code</Link>}
            {mode === 'login' ? (
              <>
                <Link href="/treks">Create an account</Link>
                <Link href="/forgot-password">Forgot password?</Link>
              </>
            ) : (
              <Link href="/login">Back to sign in</Link>
            )}
          </div>
        </form>
      </section>
    </JourneyShell>
  );
}

export default function Account() {
  const [state, setState] = useState<{ name: string; bookings: BookingReceipt[]; next: boolean; previous: boolean } | null>(null),
    [page, setPage] = useState(1),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(''),
    [needsLogin, setNeedsLogin] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    setNeedsLogin(false);
    try {
      const r = await fetch(`/api/account?page=${page}`);
      const body = await r.json();
      if (!r.ok) {
        setNeedsLogin(r.status === 401);
        throw new Error(errorText(body));
      }
      setState(body);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load your journeys.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [page]);

  async function logout() {
    const r = await fetch('/api/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    if (r.ok) {
      setState(null);
      setNeedsLogin(true);
      setError('You are signed out.');
    } else {
      setError('Could not sign out. Please try again.');
    }
  }

  return (
    <JourneyShell page="account">
      <section className="utility-page container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">BEYOND THE HORIZON</p>
            <h1>Your journeys.</h1>
            <p>{state && !needsLogin ? `Welcome back${state.name ? ', ' + state.name : ''}. Your next chapter starts here.` : 'Bookings saved in this browser appear here. No account is needed to book.'}</p>
          </div>
          {state && !needsLogin && <button className="button outline-dark" onClick={() => void logout()}>Sign out</button>}
        </div>
        {loading ? (
          <p role="status">Loading your journeys…</p>
        ) : error ? (
          <div className="status" role="alert">
            <p>{error}</p>
            {needsLogin ? <Link className="button gold" href="/login">Sign in</Link> : <button className="button green" onClick={() => void load()}>Try again</button>}
          </div>
        ) : state?.bookings.length ? (
          <>
            <div className="account-bookings">
              {state.bookings.map(b => (
                <article key={b.booking_reference}>
                  <span className="eyebrow">{b.booking_reference}</span>
                  <h2>{b.trip_title}</h2>
                  <p>{dateLabel(b.trip_start_date)} · {b.num_travelers} travellers</p>
                  <dl>
                    <div><dt>Status</dt><dd>{b.status.replaceAll('_', ' ')}</dd></div>
                    <div><dt>Booking total</dt><dd>{money(b.total_amount_usd)}</dd></div>
                    <div><dt>Amount paid</dt><dd>{money(b.amount_paid_usd)}</dd></div>
                  </dl>
                  <Link href={`/booking/confirmation/${b.booking_reference}`} className="text-link">View booking details ↗</Link>
                </article>
              ))}
            </div>
            <div className="button-row">
              <button className="button outline-dark" disabled={!state.previous} onClick={() => setPage(page - 1)}>Previous</button>
              <span>Page {page}</span>
              <button className="button outline-dark" disabled={!state.next} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          </>
        ) : (
          <div className="status">
            <h2>A whole world ahead.</h2>
            <p>You don’t have any bookings yet. Find a trail that calls to you.</p>
            <Link className="button gold" href="/treks">Explore treks</Link>
          </div>
        )}
      </section>
    </JourneyShell>
  );
}
