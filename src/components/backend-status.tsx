'use client';
import {useCallback, useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import {DisconnectedArt, RefreshButton, checkBackend, connectionCopy, type BackendState} from './connection-issue';

const RETRY_SECONDS = 15;

/**
 * Site-wide connection banner. It checks the backend when a page loads, when
 * the tab comes back into view and when the browser goes on/offline. While
 * the backend is down it retries every 15 seconds and offers a Refresh button;
 * once it answers again the page data is reloaded and the banner says so.
 */
export default function BackendStatus() {
  const router = useRouter();
  const [state, setState] = useState<BackendState>('unknown');
  const [busy, setBusy] = useState(false);
  const [countdown, setCountdown] = useState(RETRY_SECONDS);
  const [stillDown, setStillDown] = useState(false);
  const [reconnected, setReconnected] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const wasDown = useRef(false);

  const run = useCallback(async (manual = false) => {
    setBusy(true);
    const next = await checkBackend();
    setBusy(false);
    setCountdown(RETRY_SECONDS);
    if (next === 'up') {
      if (wasDown.current) {
        wasDown.current = false;
        setReconnected(true);
        router.refresh();
      }
      setStillDown(false);
    } else if (next !== 'unknown') {
      wasDown.current = true;
      setDismissed(false);
      setStillDown(manual);
    }
    setState(next);
  }, [router]);

  // First check, plus re-checks when the tab returns or the network changes.
  useEffect(() => {
    void run();
    const onVisible = () => { if (document.visibilityState === 'visible') void run(); };
    const onNetwork = () => void run();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', onNetwork);
    window.addEventListener('offline', onNetwork);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', onNetwork);
      window.removeEventListener('offline', onNetwork);
    };
  }, [run]);

  // Automatic retry countdown while down (not when the service is simply unconfigured).
  const retrying = (state === 'down' || state === 'offline') && !busy;
  useEffect(() => {
    if (!retrying) return;
    const timer = window.setInterval(() => {
      setCountdown(value => {
        if (value <= 1) { void run(); return RETRY_SECONDS; }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [retrying, run]);

  useEffect(() => {
    if (!reconnected) return;
    const timer = window.setTimeout(() => setReconnected(false), 4000);
    return () => window.clearTimeout(timer);
  }, [reconnected]);

  if (reconnected && state === 'up') {
    return <div className="connection-toast" role="status"><span aria-hidden="true">●</span> Connection restored. You’re back online.</div>;
  }
  if (state === 'preview') {
    return dismissed?null:<div className="preview-chip" role="status"><span><strong>Design preview</strong><small>No live offers or seats</small></span><button type="button" aria-label="Dismiss preview notice" onClick={()=>setDismissed(true)}>×</button></div>;
  }
  if (dismissed || (state !== 'down' && state !== 'offline' && state !== 'unconfigured')) return null;

  const copy = connectionCopy[state];
  return (
    <div className="connection-banner" role="alert" data-state={state}>
      <DisconnectedArt size={64} />
      <div className="connection-copy">
        <p className="connection-status"><span className="connection-dot" aria-hidden="true" />{state === 'offline' ? 'No internet connection' : state === 'unconfigured' ? 'Service not connected' : 'Server not responding'}</p>
        <h2>{copy.title}</h2>
        <p>{copy.body}</p>
        {stillDown && <p className="connection-still" aria-live="polite">Still not responding. Please try again in a moment.</p>}
      </div>
      <div className="connection-actions">
        <RefreshButton busy={busy} onClick={() => void run(true)} />
        {state !== 'unconfigured' && <small aria-live="off">{busy ? 'Checking now…' : `Retrying in ${countdown}s`}</small>}
      </div>
      <button type="button" className="connection-dismiss" aria-label="Hide this message" onClick={() => setDismissed(true)}>×</button>
    </div>
  );
}
