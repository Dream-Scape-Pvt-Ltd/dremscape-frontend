import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore, readInput} from '@/lib/backend';
import {revenueEntryBody} from '@/lib/revenue';
import {projectRevenueEntries, projectRevenueEntry} from '@/lib/admin';

export async function GET() {
  try {
    const {headers} = await staffAccess();
    const data = await backend('inquiries/crm/revenue-entries/?page_size=50', {headers});
    return NextResponse.json({data: projectRevenueEntries(data)}, {headers: noStore});
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const body = revenueEntryBody(await readInput(request));
    const {headers} = await staffAccess();
    const data = await backend('inquiries/crm/revenue-entries/', {method: 'POST', headers, body: JSON.stringify(body)});
    return NextResponse.json({data: projectRevenueEntry(data)}, {status: 201, headers: noStore});
  } catch (error) { return apiError(error); }
}
