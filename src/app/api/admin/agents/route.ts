import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore} from '@/lib/backend';
import {listOf} from '@/lib/crm';

/** Staff who can own a lead, for the assignee pickers. */
export async function GET() {
  try {
    const {headers} = await staffAccess();
    const agents = listOf(await backend('users/agents/', {headers})).map(({id, full_name, email}) => ({id, full_name, email}));
    return NextResponse.json({data: agents}, {headers: noStore});
  } catch (error) { return apiError(error); }
}
