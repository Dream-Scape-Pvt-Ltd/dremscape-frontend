import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore, readInput, BackendError} from '@/lib/backend';
import {projectDeparture} from '@/lib/admin';

type Context = {params: Promise<{slug: string; departureId: string}>};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function routeData(params: Context['params']) {
  const {slug, departureId} = await params;
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new BackendError('Invalid trek identifier.', 400);
  }
  if (!uuidPattern.test(departureId)) {
    throw new BackendError('Invalid departure identifier.', 400);
  }
  const {headers} = await staffAccess();
  return {slug, departureId, headers};
}

export async function PATCH(request: Request, {params}: Context) {
  try {
    const input = await readInput(request);
    const {slug, departureId, headers} = await routeData(params);
    const data = await backend(`trips/${slug}/departures/${departureId}/`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(input)
    });
    return NextResponse.json({data: projectDeparture(data)}, {headers: noStore});
  } catch (error) { return apiError(error); }
}

export async function DELETE(_request: Request, {params}: Context) {
  try {
    const {slug, departureId, headers} = await routeData(params);
    await backend(`trips/${slug}/departures/${departureId}/`, {method: 'DELETE', headers});
    return NextResponse.json({data: {id: departureId}}, {headers: noStore});
  } catch (error) { return apiError(error); }
}
