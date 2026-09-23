import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore, BackendError} from '@/lib/backend';

function dateIsValid(value: string) { if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new BackendError('Please provide a valid date (YYYY-MM-DD).', 400); }

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const dateFrom = params.get('date_from')?.trim();
    const dateTo = params.get('date_to')?.trim();
    const query = new URLSearchParams();
    if (dateFrom) { dateIsValid(dateFrom); query.set('date_from', dateFrom); }
    if (dateTo) { dateIsValid(dateTo); query.set('date_to', dateTo); }

    const {headers} = await staffAccess();
    const data = await backend(`inquiries/crm/funnel/?${query}`, {headers});
    return NextResponse.json({data}, {headers: noStore});
  } catch (error) { return apiError(error); }
}
