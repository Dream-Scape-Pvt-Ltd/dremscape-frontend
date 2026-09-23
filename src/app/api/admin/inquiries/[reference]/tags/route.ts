import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore, readInput, requiredText, BackendError} from '@/lib/backend';
import {projectTagArray} from '@/lib/admin';

type Context = {params: Promise<{reference: string}>};
function referenceIsValid(reference: string) { if (!/^[\w-]{1,100}$/.test(reference)) throw new BackendError('Invalid inquiry reference.', 400); }

export async function POST(request: Request, {params}: Context) {
  try {
    const {reference} = await params; referenceIsValid(reference);
    const input = await readInput(request);
    const tag_id = requiredText(input, 'tag_id', 36);

    const {headers} = await staffAccess();
    const data = await backend(`inquiries/${reference}/tags/`, {method: 'POST', headers, body: JSON.stringify({tag_id})});
    return NextResponse.json({data: projectTagArray(data)}, {headers: noStore});
  } catch (error) { return apiError(error); }
}
