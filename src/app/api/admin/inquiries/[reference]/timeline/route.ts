import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore, BackendError} from '@/lib/backend';
import {projectTimeline} from '@/lib/admin';

type Context = {params: Promise<{reference: string}>};
function referenceIsValid(reference: string) { if (!/^[\w-]{1,100}$/.test(reference)) throw new BackendError('Invalid inquiry reference.', 400); }

export async function GET(_request: Request, {params}: Context) {
  try {
    const {reference} = await params; referenceIsValid(reference);
    const {headers} = await staffAccess();
    const data = await backend(`inquiries/${reference}/timeline/`, {headers});
    return NextResponse.json({data: projectTimeline(data)}, {headers: noStore});
  } catch (error) { return apiError(error); }
}
