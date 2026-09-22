import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore} from '@/lib/backend';
import {projectAgents} from '@/lib/admin';

/** Staff who can own a CRM lead, for the assignee pickers. */
export async function GET() {
  try {
    const {headers} = await staffAccess();
    const data = await backend('users/agents/', {headers});
    return NextResponse.json({data: projectAgents(data)}, {headers: noStore});
  } catch (error) { return apiError(error); }
}
