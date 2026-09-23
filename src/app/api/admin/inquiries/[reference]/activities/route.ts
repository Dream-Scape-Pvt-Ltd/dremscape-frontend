import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore, readInput, BackendError} from '@/lib/backend';
import {projectActivities, projectActivity} from '@/lib/admin';

type Context = {params: Promise<{reference: string}>};
const channels = new Set(['CALL', 'EMAIL', 'WHATSAPP', 'NOTE']);
function referenceIsValid(reference: string) { if (!/^[\w-]{1,100}$/.test(reference)) throw new BackendError('Invalid inquiry reference.', 400); }

export async function GET(_request: Request, {params}: Context) {
  try {
    const {reference} = await params; referenceIsValid(reference);
    const {headers} = await staffAccess();
    const data = await backend(`inquiries/${reference}/activities/`, {headers});
    return NextResponse.json({data: projectActivities(data)}, {headers: noStore});
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request, {params}: Context) {
  try {
    const {reference} = await params; referenceIsValid(reference);
    const input = await readInput(request);
    const channel = input.channel;
    if (typeof channel !== 'string' || !channels.has(channel)) throw new BackendError('Please select a valid activity channel.', 400);
    const body = typeof input.body === 'string' ? input.body.slice(0, 5000) : '';

    const {headers} = await staffAccess();
    const data = await backend(`inquiries/${reference}/activities/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({channel, body}),
    });
    return NextResponse.json({data: projectActivity(data)}, {status: 201, headers: noStore});
  } catch (error) { return apiError(error); }
}
