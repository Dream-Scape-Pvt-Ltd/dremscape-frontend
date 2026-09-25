'use client';

import {startTransition, useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {DisconnectedArt, RefreshButton, checkBackend, connectionCopy, type BackendState} from '@/components/connection-issue';

/**
 * Route error boundary. Most page failures here are the backend being
 * unreachable, so it checks the connection and explains which it is, with a
 * Refresh that re-fetches the page's server data before re-rendering.
 */
export default function Error({error, reset}: {error: Error & {digest?: string}; reset: () => void}) {
  const router = useRouter();
  const [state, setState] = useState<BackendState>('unknown');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') console.error('Error boundary caught:', error);
    void checkBackend().then(setState);
  }, [error]);

  async function refresh() {
    setBusy(true);
    const next = await checkBackend();
    setState(next);
    setBusy(false);
    if (next === 'up') startTransition(() => { router.refresh(); reset(); });
  }

  const connection = state === 'down' || state === 'offline' || state === 'unconfigured' ? connectionCopy[state] : null;

  return (
    <main className="connection-page" role="alert">
      <div className="connection-page-card">
        <DisconnectedArt size={96} />
        <p className="connection-status"><span className="connection-dot" data-ok={state === 'up' || undefined} aria-hidden="true" />
          {state === 'unknown' ? 'Checking the connection…' : connection ? (state === 'offline' ? 'No internet connection' : 'Server not responding') : 'Connection is fine'}
        </p>
        <h1>{connection ? connection.title : 'This page didn’t load'}</h1>
        <p>{connection ? connection.body : 'Something went wrong while loading this page. Refreshing usually fixes it.'}</p>
        {process.env.NODE_ENV === 'development' && error.message && (
          <pre className="connection-debug">{error.message}{error.digest ? `\nError ID: ${error.digest}` : ''}</pre>
        )}
        <div className="connection-page-actions">
          <RefreshButton busy={busy} onClick={() => void refresh()} label="Refresh page" />
          <a className="connection-home" href="/">Return home</a>
        </div>
      </div>
    </main>
  );
}
