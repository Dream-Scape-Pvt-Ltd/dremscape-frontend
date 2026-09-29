/** Small helpers shared by the admin dashboard and its CRM components. */
export type Page<T> = {count: number; next: string | null; previous: string | null; results: T[]};

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  if (!(options?.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(path, {
    ...options,
    headers,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || 'The request could not be completed.');
  return body?.data as T;
}

export function date(value?: string | null) {
  return value ? new Intl.DateTimeFormat('en-US', {month: 'short', day: 'numeric', year: 'numeric'}).format(new Date(value)) : '—';
}

export function label(value?: string | null) {
  return value?.replaceAll('_', ' ') || '—';
}

export function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 10000) {
    return `$${(amount / 1000).toFixed(0)}k`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }
  return `$${amount.toLocaleString('en-US')}`;
}
