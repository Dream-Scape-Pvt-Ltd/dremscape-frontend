import JourneyShell from './journey-shell';

/**
 * Shown by the route-level loading.tsx files while a dynamic page fetches its
 * data, so navigation responds straight away instead of appearing frozen.
 */
export default function PageLoading({page, label = 'Loading…'}: {page?: string; label?: string}) {
  return (
    <JourneyShell page={page}>
      <div className="container utility-page page-loading" role="status" aria-live="polite">
        <span className="page-loading-bar" aria-hidden="true" />
        <p>{label}</p>
      </div>
    </JourneyShell>
  );
}
