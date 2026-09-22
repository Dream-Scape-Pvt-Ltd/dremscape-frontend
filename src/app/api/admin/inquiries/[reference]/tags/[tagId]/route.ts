import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore, BackendError} from '@/lib/backend';
import {projectTagArray} from '@/lib/admin';

type Context = {params: Promise<{reference: string; tagId: string}>};
function referenceIsValid(reference: string) { if (!/^[\w-]{1,100}$/.test(reference)) throw new BackendError('Invalid inquiry reference.', 400); }
function tagIdIsValid(tagId: string) { if (!/^[0-9a-fA-F-]{36}$/.test(tagId)) throw new BackendError('Invalid tag id.', 400); }

export async function DELETE(_request: Request, {params}: Context) {
  try {
    const {reference, tagId} = await params;
    referenceIsValid(reference);
    tagIdIsValid(tagId);
    const {headers} = await staffAccess();
    const data = await backend(`inquiries/${reference}/tags/${tagId}/`, {method: 'DELETE', headers});
    return NextResponse.json({data: projectTagArray(data)}, {headers: noStore});
  } catch (error) { return apiError(error); }
}
