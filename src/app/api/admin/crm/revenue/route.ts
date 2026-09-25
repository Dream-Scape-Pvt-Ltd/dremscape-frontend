import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore, BackendError} from '@/lib/backend';

export async function GET(request: Request) {
  try {
    const months = new URL(request.url).searchParams.get('months') || '6';
    if (months !== '6' && months !== '12') throw new BackendError('Choose 6 or 12 months.', 400);
    const {headers} = await staffAccess();
    const data = await backend(`inquiries/crm/revenue/?months=${months}`, {headers});
    return NextResponse.json({data}, {headers: noStore});
  } catch (error) { return apiError(error); }
}
