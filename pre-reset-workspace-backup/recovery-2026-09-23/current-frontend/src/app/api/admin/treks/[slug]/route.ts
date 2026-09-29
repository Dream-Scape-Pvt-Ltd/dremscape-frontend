import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore, readInput, BackendError} from '@/lib/backend';

type Context = {params: Promise<{slug: string}>};

async function routeData(params: Context['params']) {
  const {slug} = await params;
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new BackendError('Invalid trek identifier.', 400);
  }
  const {headers} = await staffAccess();
  return {slug, headers};
}

export async function GET(_request: Request, {params}: Context) {
  try {
    const {slug, headers} = await routeData(params);
    const data = await backend(`trips/${slug}/`, {headers});
    return NextResponse.json({data}, {headers: noStore});
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, {params}: Context) {
  try {
    const input = await readInput(request);
    const {slug, headers} = await routeData(params);
    const data = await backend(`trips/${slug}/`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(input)
    });
    return NextResponse.json({data}, {headers: noStore});
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: Request, {params}: Context) {
  try {
    const {slug, headers} = await routeData(params);
    const data = await backend(`trips/${slug}/`, {
      method: 'DELETE',
      headers
    });
    return NextResponse.json({success: true, data}, {headers: noStore});
  } catch (error) {
    return apiError(error);
  }
}
