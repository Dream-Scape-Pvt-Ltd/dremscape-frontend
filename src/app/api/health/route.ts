import {NextResponse} from 'next/server';
import {noStore} from '@/lib/backend';

/**
 * Is the Django backend reachable? Used by the site-wide connection banner.
 * A short timeout keeps the check fast: a hung backend counts as down.
 */
export async function GET() {
  const base = process.env.BACKEND_API_URL?.replace(/\/$/, '');
  const preview = process.env.NODE_ENV === 'development';
  if (!base) return NextResponse.json({backend: preview ? 'preview' : 'unconfigured'}, {headers: noStore});
  const started = Date.now();
  try {
    const response = await fetch(`${base}/trips/?page_size=1`, {cache:'no-store', signal: AbortSignal.timeout(5000), redirect: 'error'});
    // Any non-5xx answer means the service is up; a 5xx means it is running but broken.
    const up = response.status < 500;
    return NextResponse.json({backend: up ? 'up' : preview ? 'preview' : 'down', latency_ms: Date.now() - started}, {status: up || preview ? 200 : 503, headers: noStore});
  } catch {
    return NextResponse.json({backend: preview ? 'preview' : 'down'}, {status: preview ? 200 : 503, headers: noStore});
  }
}
