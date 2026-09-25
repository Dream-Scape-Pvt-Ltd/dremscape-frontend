import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore, readInput, BackendError} from '@/lib/backend';
import {projectRevenueEntry} from '@/lib/admin';
import {revenueEntryBody} from '@/lib/revenue';

type Context = {params: Promise<{entryId: string}>};
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function entryId(params: Context['params']) {
  const {entryId} = await params;
  if (!uuidPattern.test(entryId)) throw new BackendError('Invalid revenue entry.', 400);
  return entryId;
}

export async function PATCH(request: Request, {params}: Context) {
  try {
    const id = await entryId(params);
    const body = revenueEntryBody(await readInput(request), true);
    if (!Object.keys(body).length) throw new BackendError('Nothing to update.', 400);
    const {headers} = await staffAccess();
    const data = await backend(`inquiries/crm/revenue-entries/${id}/`, {method: 'PATCH', headers, body: JSON.stringify(body)});
    return NextResponse.json({data: projectRevenueEntry(data)}, {headers: noStore});
  } catch (error) { return apiError(error); }
}

export async function DELETE(_request: Request, {params}: Context) {
  try {
    const id = await entryId(params);
    const {headers} = await staffAccess();
    await backend(`inquiries/crm/revenue-entries/${id}/`, {method: 'DELETE', headers});
    return NextResponse.json({success: true}, {headers: noStore});
  } catch (error) { return apiError(error); }
}
