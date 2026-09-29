import {NextResponse} from 'next/server';

export class BackendError extends Error {
  constructor(message: string, public status = 502, public fields?: unknown) { super(message); }
}
// Public reads that may use the caller's cache setting; everything else is always fetched fresh.
const cacheablePaths=['content/site-settings/','destinations/nav-menus/'];
// Every call reaches the API from this server's single IP. The shared token tells the
// backend this is the frontend: page reads skip its per-IP rate limit, and writes
// (logins, inquiries…) carry the visitor's IP so they are limited per visitor.
// Reading request headers is skipped for GETs so pages can stay statically rendered.
async function addInternalHeaders(headers: Headers, method: string) {
  const token = process.env.INTERNAL_API_TOKEN;
  if (!token) return;
  headers.set('X-Internal-Token', token);
  if (method.toUpperCase() === 'GET') return;
  try {
    const {headers: requestHeaders} = await import('next/headers');
    const incoming = await requestHeaders();
    const clientIp = incoming.get('x-forwarded-for')?.split(',').pop()?.trim() || incoming.get('x-real-ip');
    if (clientIp) headers.set('X-Client-IP', clientIp);
  } catch { /* Outside a request (build time): nothing to forward. */ }
}
export function backendConfigured() { return Boolean(process.env.BACKEND_API_URL); }
export async function backend<T>(path: string, options: RequestInit & {next?:{revalidate:number;tags?:string[]}} = {}): Promise<T> {
  const base = process.env.BACKEND_API_URL?.replace(/\/$/, '');
  if (!base) throw new BackendError('Backend service is not configured. Please contact the team.', 503);
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  await addInternalHeaders(headers, options.method || 'GET');
  let response: Response;
  try {
    const cacheablePublicRead=cacheablePaths.includes(path)&&!headers.has('Authorization')&&(options.method||'GET')==='GET';
    response = await fetch(`${base}/${path}`, {...options, headers, cache:cacheablePublicRead?options.cache||'no-store':'no-store', signal:AbortSignal.timeout(30000), redirect:'error'});
  } catch { throw new BackendError(options.method === 'POST' ? 'We could not confirm whether your request was saved. Please contact the team before trying again.' : 'The service is temporarily unavailable. Please try again.'); }
  if (response.ok && response.status === 204) return {} as T;
  const body = await response.json().catch(() => null);
  if (!response.ok || body?.success === false) {
    const unavailable=options.method==='POST'?'We could not confirm whether your request was saved. Please contact the team before trying again.':'The service is temporarily unavailable. Please try again later.';
    throw new BackendError(response.status >= 500 ? unavailable : body?.error?.message || 'The request could not be completed.', response.ok ? 502 : response.status, response.status<500?body?.error?.details:undefined);
  }
  if (body?.success !== true) throw new BackendError('The server returned an unexpected response. We could not confirm the result.');
  return (body.data ?? {success: true}) as T;
}
export function apiError(error: unknown) {
  const known = error instanceof BackendError;
  return NextResponse.json({error:known ? error.message : 'The request could not be completed.', fields:known ? error.fields : undefined}, {status:known ? error.status : 500, headers:{'Cache-Control':'no-store'}});
}
export function assertSameOrigin(request: Request) {
  const origin=request.headers.get('origin');
  const protocol=request.headers.get('x-forwarded-proto') || new URL(request.url).protocol.slice(0,-1);
  const expectedOrigin=`${protocol}://${request.headers.get('host') || new URL(request.url).host}`;
  if (origin && origin !== expectedOrigin) throw new BackendError('Please submit this form from the Dreamscape website.',403);
}
export async function readInput(request: Request, maxChars=60000): Promise<Record<string, unknown>> {
  assertSameOrigin(request);
  if (!request.headers.get('content-type')?.includes('application/json')) throw new BackendError('Please submit a valid form.',415);
  const text=await request.text();
  if (text.length>maxChars) throw new BackendError('The form is too large.',413);
  let data: unknown;
  try {data=JSON.parse(text);} catch {throw new BackendError('Please submit a valid form.',400);}
  if (!data || typeof data!=='object' || Array.isArray(data)) throw new BackendError('Please submit a valid form.',400);
  return data as Record<string,unknown>;
}
export function requiredText(data: Record<string,unknown>, key:string, max=255) {
  const value=data[key];
  if(typeof value!=='string' || !value.trim() || value.length>max) throw new BackendError(`Please check ${key.replaceAll('_',' ')}.`,400);
  return value.trim();
}
export function emailInput(data: Record<string,unknown>, key='email') {
  const value=requiredText(data,key,254);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new BackendError('Please enter a valid email address.',400);
  return value;
}
export const noStore = {'Cache-Control':'no-store'};
