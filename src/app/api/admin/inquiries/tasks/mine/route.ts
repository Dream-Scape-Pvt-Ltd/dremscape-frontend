import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore} from '@/lib/backend';
import {projectTasks} from '@/lib/admin';

export async function GET(request: Request) {
  try {
    const {headers} = await staffAccess();
    const params = new URL(request.url).searchParams;
    const statusFilter = params.get('status')?.trim();
    const query = new URLSearchParams();
    if (statusFilter) query.set('status', statusFilter);
    const data = await backend(`inquiries/tasks/mine/?${query}`, {headers});
    return NextResponse.json({data: projectTasks(data)}, {headers: noStore});
  } catch (error) { return apiError(error); }
}
