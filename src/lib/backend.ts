import {NextResponse} from 'next/server';

export class BackendError extends Error {
  constructor(message: string, public status = 502, public fields?: unknown) { super(message); }
}
export function backendConfigured() { return Boolean(process.env.BACKEND_API_URL); }
export async function backend<T>(path: string, options: RequestInit = {}): Promise<T> {
  const base = process.env.BACKEND_API_URL?.replace(/\/$/, '');
  if (!base) throw new BackendError('Backend service is not configured. Please contact the team.', 503);
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  let response: Response;
  try {
    response = await fetch(`${base}/${path}`, {...options, headers, cache:'no-store', signal:AbortSignal.timeout(30000), redirect:'error'});
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
