import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore, assertSameOrigin, BackendError} from '@/lib/backend';
import {projectWaitlist} from '@/lib/admin';

type Context = {params: Promise<{departureId: string}>};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function routeData(params: Context['params']) {
  const {departureId} = await params;
  if (!uuidPattern.test(departureId)) throw new BackendError('Invalid departure identifier.', 400);
  const {headers} = await staffAccess();
  return {departureId, headers};
}

export async function GET(_request: Request, {params}: Context) {
  try {
    const {departureId, headers} = await routeData(params);
    const data = await backend(`bookings/waitlist/departures/${departureId}/`, {headers});
    return NextResponse.json({data: projectWaitlist(data)}, {headers: noStore});
  } catch (error) { return apiError(error); }
}

/** Offer currently free seats to the head of the queue. */
export async function POST(request: Request, {params}: Context) {
  try {
    assertSameOrigin(request);
    const {departureId, headers} = await routeData(params);
    const data = await backend(`bookings/waitlist/departures/${departureId}/promote/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({})
    });
    return NextResponse.json({data: projectWaitlist(data)}, {headers: noStore});
  } catch (error) { return apiError(error); }
}
