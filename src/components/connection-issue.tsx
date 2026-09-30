'use client';

/** The "disconnected" mark shared by the connection banner and the error page. */
export function DisconnectedArt({size = 72}: {size?: number}) {
  return (
    <svg className="connection-art" width={size} height={size} viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <circle cx="36" cy="36" r="34" fill="currentColor" opacity=".1" />
      {/* Mountain ridge */}
      <path d="M12 50 L26 32 L33 40 L42 26 L60 50 Z" fill="currentColor" opacity=".22" />
      {/* Unplugged cable: two ends with a gap */}
      <path d="M8 58 H24 a4 4 0 0 0 4-4 v-2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <rect x="23" y="44" width="10" height="9" rx="2" fill="currentColor" />
      <path d="M26 44 v-4 M30 44 v-4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M64 58 H48 a4 4 0 0 1-4-4 v-2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <rect x="39" y="44" width="10" height="9" rx="2" fill="currentColor" />
      {/* Spark marks across the gap */}
      <path className="connection-spark" d="M36 34 v4 M31 36 l2 2 M41 36 l-2 2" stroke="#d9a441" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

/** Spinner-arrow refresh button used wherever a connection problem is shown. */
export function RefreshButton({busy, onClick, label = 'Refresh'}: {busy: boolean; onClick: () => void; label?: string}) {
  return (
    <button type="button" className="connection-refresh" onClick={onClick} disabled={busy} aria-busy={busy}>
      <svg className={busy ? 'is-spinning' : undefined} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12a9 9 0 1 1-2.64-6.36" />
        <path d="M21 3v6h-6" />
      </svg>
      {busy ? 'Checking…' : label}
    </button>
  );
}

export type BackendState = 'unknown' | 'up' | 'down' | 'unconfigured' | 'offline' | 'preview';

/** Asks the Next server whether the backend answers. Browser offline wins over everything. */
export async function checkBackend(): Promise<BackendState> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 'offline';
  try {
    const response = await fetch('/api/health', {cache: 'no-store', signal: AbortSignal.timeout(8000)});
    const body = await response.json().catch(() => null) as {backend?: BackendState} | null;
    return body?.backend === 'up' ? 'up' : body?.backend === 'unconfigured' ? 'unconfigured' : body?.backend === 'preview' ? 'preview' : 'down';
  } catch {
    return typeof navigator !== 'undefined' && navigator.onLine === false ? 'offline' : 'down';
  }
}

export const connectionCopy: Record<'down' | 'offline' | 'unconfigured', {title: string; body: string}> = {
  down: {
    title: 'We can’t reach our servers right now',
    body: 'Trek dates, prices and bookings may not load. This is usually brief. We’ll keep trying automatically.',
  },
  offline: {
    title: 'You’re offline',
    body: 'Your device isn’t connected to the internet. Check your connection and we’ll reconnect as soon as it’s back.',
  },
  unconfigured: {
    title: 'The booking service isn’t connected',
    body: 'The website can’t find its backend service. Please contact the Dreamscape team.',
  },
};
