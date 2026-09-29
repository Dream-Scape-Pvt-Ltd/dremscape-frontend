import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore} from '@/lib/backend';
import {listOf, projectTask} from '@/lib/crm';

/** The signed-in agent's open follow-ups, soonest first. */
export async function GET() {
  try {
    const {headers} = await staffAccess();
    const data = await backend('inquiries/tasks/mine/?status=OPEN&page_size=100', {headers});
    return NextResponse.json({data: listOf(data).map(projectTask)}, {headers: noStore});
  } catch (error) { return apiError(error); }
}
