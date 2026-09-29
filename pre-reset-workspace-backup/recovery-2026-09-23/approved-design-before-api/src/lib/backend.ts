import {NextResponse} from 'next/server';

export class BackendError extends Error {
  constructor(message: string, public status = 502, public fields?: unknown) { super(message); }
}
export function backendConfigured() { return Boolean(process.env.BACKEND_API_URL); }
export async function backend<T>(path: string, options: RequestInit = {}): Promise<T> {
  const base = process.env.BACKEND_API_URL?.replace(/\/$/, '');
  if (!base) throw new BackendError('This preview is not connected to the team yet. Your request has not been sent.', 503);
  let response: Response;
  try {
    response = await fetch(`${base}/${path}`, {...options, headers: {'Content-Type':'application/json', ...options.headers}, cache:'no-store', signal:AbortSignal.timeout(15000), redirect:'error'});
  } catch { throw new BackendError(options.method === 'POST' ? 'We could not confirm whether your request was saved. Please contact the team before trying again.' : 'The service is temporarily unavailable. Please try again.'); }
  const body = await response.json().catch(() => null);
  if (!response.ok || body?.success === false) {
    const unavailable=options.method==='POST'?'We could not confirm whether your request was saved. Please contact the team before trying again.':'The service is temporarily unavailable. Please try again later.';
    throw new BackendError(response.status >= 500 ? unavailable : body?.error?.message || 'The request could not be completed.', response.ok ? 502 : response.status, response.status<500?body?.error?.details:undefined);
  }
  if (body?.success !== true || body.data == null) throw new BackendError('The server returned an unexpected response. We could not confirm the result.');
  return body.data as T;
}
export function apiError(error: unknown) {
  const known = error instanceof BackendError;
  return NextResponse.json({error:known ? error.message : 'The request could not be completed.', fields:known ? error.fields : undefined}, {status:known ? error.status : 500, headers:{'Cache-Control':'no-store'}});
}
export async function readInput(request: Request): Promise<Record<string, unknown>> {
  const origin=request.headers.get('origin');
  // Next may use its internal bind hostname in request.url. Match the browser-facing host.
  const protocol=request.headers.get('x-forwarded-proto') || new URL(request.url).protocol.slice(0,-1);
  const expectedOrigin=`${protocol}://${request.headers.get('host') || new URL(request.url).host}`;
  if (origin && origin !== expectedOrigin) throw new BackendError('Please submit this form from the Dreamscape website.',403);
  if (!request.headers.get('content-type')?.includes('application/json')) throw new BackendError('Please submit a valid form.',415);
  const text=await request.text();
  if (text.length>60000) throw new BackendError('The form is too large.',413);
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
