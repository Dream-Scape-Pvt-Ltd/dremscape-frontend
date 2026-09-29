import {NextResponse} from 'next/server';
import {backend, apiError, noStore, readInput} from '@/lib/backend';
import {listOf, staffInquiry, uuidInput} from '@/lib/crm';

type Context = {params: Promise<{reference: string}>};
/** Attach a tag; answers with the lead's full tag list. */
export async function POST(request: Request, {params}: Context) {
  try {
    const tag_id = uuidInput((await readInput(request)).tag_id, 'tag');
    const {reference, headers} = await staffInquiry(params);
    const data = await backend(`inquiries/${reference}/tags/`, {method: 'POST', headers, body: JSON.stringify({tag_id})});
    return NextResponse.json({data: listOf(data).map(({id, name, color}) => ({id, name, color}))}, {headers: noStore});
  } catch (error) { return apiError(error); }
}
