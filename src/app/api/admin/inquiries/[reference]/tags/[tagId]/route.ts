import {NextResponse} from 'next/server';
import {backend, apiError, noStore, assertSameOrigin} from '@/lib/backend';
import {listOf, staffInquiry, uuidInput} from '@/lib/crm';

type Context = {params: Promise<{reference: string; tagId: string}>};
/** Detach a tag; answers with the lead's remaining tags. */
export async function DELETE(request: Request, {params}: Context) {
  try {
    assertSameOrigin(request);
    const tagId = uuidInput((await params).tagId, 'tag');
    const {reference, headers} = await staffInquiry(params);
    const data = await backend(`inquiries/${reference}/tags/${tagId}/`, {method: 'DELETE', headers});
    return NextResponse.json({data: listOf(data).map(({id, name, color}) => ({id, name, color}))}, {headers: noStore});
  } catch (error) { return apiError(error); }
}
