import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore, readInput, emailInput, BackendError} from '@/lib/backend';
import {projectOutboundEmail, projectOutboundEmails} from '@/lib/admin';

const STATUSES = ['QUEUED', 'SENT', 'DELIVERED', 'BOUNCED', 'COMPLAINED', 'FAILED'];
const UUID = /^[0-9a-f-]{36}$/i;
const REFERENCE = /^[\w-]{1,100}$/;

export async function GET(request: Request) {
  try {
    const {searchParams} = new URL(request.url);
    const query = new URLSearchParams();
    const status = searchParams.get('status');
    if (status && STATUSES.includes(status)) query.set('status', status);
    const inquiry = searchParams.get('inquiry');
    if (inquiry && REFERENCE.test(inquiry)) query.set('inquiry', inquiry);
    const search = searchParams.get('search')?.trim().slice(0, 100);
    if (search) query.set('search', search);
    const page = Number(searchParams.get('page'));
    if (Number.isInteger(page) && page > 1) query.set('page', String(page));
    const {headers} = await staffAccess();
    const data = await backend<unknown>(`emails/?${query}`, {headers});
    return NextResponse.json({data: projectOutboundEmails(data)}, {headers: noStore});
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const input = await readInput(request, 100_000);
    const payload: Record<string, string> = {recipient: emailInput(input, 'recipient')};
    for (const [key, max] of [['template', 40], ['inquiry_number', 100], ['subject', 200], ['body_text', 20000]] as const) {
      const value = input[key];
      if (value === undefined || value === null || value === '') continue;
      if (typeof value !== 'string' || value.length > max) throw new BackendError(`Please check ${key.replaceAll('_', ' ')}.`, 400);
      payload[key] = value;
    }
    if (payload.template && !UUID.test(payload.template)) throw new BackendError('Invalid template.', 400);
    if (payload.inquiry_number && !REFERENCE.test(payload.inquiry_number)) throw new BackendError('Invalid inquiry reference.', 400);
    const {headers} = await staffAccess();
    const data = await backend<unknown>('emails/', {method: 'POST', headers, body: JSON.stringify(payload)});
    return NextResponse.json({data: projectOutboundEmail(data)}, {status: 201, headers: noStore});
  } catch (error) { return apiError(error); }
}
