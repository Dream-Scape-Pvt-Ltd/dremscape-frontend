import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore} from '@/lib/backend';
import {projectDepartures} from '@/lib/admin';

/** Cross-trip capacity board: the seat ledger plus live demand per departure. */
export async function GET(request: Request) {
  try {
    const {headers} = await staffAccess();
    const params = new URL(request.url).searchParams;
    const page = Math.max(1, Number(params.get('page') || 1));
    const query = new URLSearchParams({page: String(page), page_size: '50'});
    for (const key of ['trip', 'destination', 'status', 'capacity_state', 'start_after', 'start_before'] as const) {
      const value = params.get(key)?.trim();
      if (value && value !== 'ALL') query.set(key, value);
    }
    const data = await backend(`trips/departures/?${query}`, {headers});
    return NextResponse.json({data: projectDepartures(data)}, {headers: noStore});
  } catch (error) { return apiError(error); }
}
