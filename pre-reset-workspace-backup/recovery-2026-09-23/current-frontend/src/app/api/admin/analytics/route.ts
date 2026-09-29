import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore} from '@/lib/backend';

export async function GET() {
  try {
    const {headers} = await staffAccess();
    const data = await backend('analytics/dashboard/', {headers});
    return NextResponse.json({data}, {headers: noStore});
  } catch (error) {
    return apiError(error);
  }
}
